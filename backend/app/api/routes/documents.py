from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models.document import Document, DocumentChunk
from app.models.enums import AuditEventType, DocumentClassification, UserRole
from app.models.user import User
from app.repositories.audit_repository import create_audit_log
from app.schemas.documents import DocumentChunkResponse, DocumentResponse, DocumentUploadResponse
from app.services.document_service import create_document_upload, list_documents_for_user
from app.services.ingestion_service import ingest_document_job
from app.services.retrieval_service import can_access_document
from app.workers.tasks import process_document_upload

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DocumentResponse]:
    return list_documents_for_user(db, current_user)


@router.get("/{document_id}/chunks", response_model=list[DocumentChunkResponse])
def list_document_chunks(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DocumentChunk]:
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if not can_access_document(current_user, document):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient document access")
    return list(
        db.scalars(
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index.asc())
        )
    )


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
    classification: DocumentClassification = Form(default=DocumentClassification.INTERNAL),
    source_department: str | None = Form(default=None),
    access_group: str | None = Form(default=None),
    version: str = Form(default="1.0"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> DocumentUploadResponse:
    document, job = create_document_upload(
        db,
        file=file,
        uploader=current_user,
        title=title,
        classification=classification,
        source_department=source_department,
        access_group=access_group,
        version=version,
    )
    create_audit_log(
        db,
        event_type=AuditEventType.DOCUMENT_UPLOAD,
        user_id=current_user.id,
        resource_type="document",
        resource_id=str(document.id),
        metadata={"classification": document.classification.value, "filename": document.original_filename},
    )
    try:
        process_document_upload.delay(job.id)
    except Exception:
        ingest_document_job(db, job)
        db.refresh(document)
        db.refresh(job)
    return DocumentUploadResponse(document=document, ingestion_job=job)
