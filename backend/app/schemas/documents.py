from datetime import datetime
from pydantic import BaseModel

from app.models.enums import DocumentClassification, IngestionStatus


class DocumentCreateMetadata(BaseModel):
    title: str | None = None
    classification: DocumentClassification = DocumentClassification.INTERNAL
    source_department: str | None = None
    access_group: str | None = None
    version: str = "1.0"


class DocumentResponse(BaseModel):
    id: int
    title: str
    original_filename: str
    content_type: str
    file_size_bytes: int
    classification: DocumentClassification
    source_department: str | None
    access_group: str | None
    version: str
    ingestion_status: IngestionStatus
    uploader_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class IngestionJobResponse(BaseModel):
    id: int
    document_id: int
    status: IngestionStatus
    attempts: int
    error_message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    document: DocumentResponse
    ingestion_job: IngestionJobResponse
