import re
import shutil
from pathlib import Path
from uuid import uuid4
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.document import Document, IngestionJob
from app.models.enums import DocumentClassification, IngestionStatus
from app.models.user import User


FILENAME_SAFE_PATTERN = re.compile(r"[^A-Za-z0-9._-]+")


def sanitize_filename(filename: str) -> str:
    basename = Path(filename).name.strip().replace(" ", "_")
    sanitized = FILENAME_SAFE_PATTERN.sub("_", basename)
    return sanitized or f"upload-{uuid4().hex}"


def validate_upload(file: UploadFile, size_bytes: int) -> None:
    settings = get_settings()
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in settings.allowed_upload_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{suffix}'. Allowed: {sorted(settings.allowed_upload_extensions)}",
        )
    if size_bytes > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.max_upload_size_mb} MB upload limit",
        )


def create_document_upload(
    db: Session,
    *,
    file: UploadFile,
    uploader: User,
    title: str | None,
    classification: DocumentClassification,
    source_department: str | None,
    access_group: str | None,
    version: str,
) -> tuple[Document, IngestionJob]:
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = sanitize_filename(file.filename or "document")
    stored_name = f"{uuid4().hex}-{safe_name}"
    storage_path = settings.upload_dir / stored_name

    with storage_path.open("wb") as out_file:
        shutil.copyfileobj(file.file, out_file)

    file_size = storage_path.stat().st_size
    validate_upload(file, file_size)

    document = Document(
        title=title or Path(safe_name).stem,
        original_filename=safe_name,
        storage_path=str(storage_path),
        content_type=file.content_type or "application/octet-stream",
        file_size_bytes=file_size,
        uploader_id=uploader.id,
        classification=classification,
        source_department=source_department,
        access_group=access_group,
        version=version,
        ingestion_status=IngestionStatus.PENDING,
    )
    db.add(document)
    db.flush()

    job = IngestionJob(document_id=document.id, status=IngestionStatus.PENDING)
    db.add(job)
    db.commit()
    db.refresh(document)
    db.refresh(job)
    return document, job


def list_documents_for_user(db: Session, user: User) -> list[Document]:
    statement = select(Document).order_by(Document.created_at.desc())
    if user.role.value == "admin":
        return list(db.scalars(statement))
    statement = statement.where(
        (Document.classification != DocumentClassification.RESTRICTED)
        & ((Document.access_group.is_(None)) | (Document.access_group == user.access_group))
    )
    return list(db.scalars(statement))
