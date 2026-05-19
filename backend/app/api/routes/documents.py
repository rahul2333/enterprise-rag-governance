from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models.enums import AuditEventType, DocumentClassification, UserRole
from app.models.user import User
from app.repositories.audit_repository import create_audit_log
from app.schemas.documents import DocumentResponse, DocumentUploadResponse
from app.services.document_service import create_document_upload, list_documents_for_user
from app.workers.tasks import process_document_upload

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DocumentResponse]:
    return list_documents_for_user(db, current_user)


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
    process_document_upload.delay(job.id)
    return DocumentUploadResponse(document=document, ingestion_job=job)
