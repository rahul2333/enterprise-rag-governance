from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentChunk, IngestionJob, RetrievedContext
from app.models.enums import IngestionStatus
from app.models.governance import PiiFinding, ReviewItem
from app.services.chunking_service import chunk_text, estimate_tokens
from app.services.embedding_service import EMBEDDING_MODEL, create_embedding, serialize_embedding
from app.services.extraction_service import extract_text, page_number_for_chunk
from app.services.pii_service import detect_pii


def ingest_document_job(db: Session, job: IngestionJob) -> int:
    document = db.get(Document, job.document_id)
    if not document:
        raise ValueError(f"Document {job.document_id} is missing")

    job.status = IngestionStatus.PROCESSING
    job.attempts += 1
    job.started_at = datetime.now(UTC)
    job.error_message = None
    document.ingestion_status = IngestionStatus.PROCESSING
    db.commit()

    try:
        text = extract_text(document.storage_path, document.content_type)
        chunks = chunk_text(text)
        existing_chunk_ids = db.scalars(select(DocumentChunk.id).where(DocumentChunk.document_id == document.id)).all()
        if existing_chunk_ids:
            db.execute(delete(RetrievedContext).where(RetrievedContext.document_chunk_id.in_(existing_chunk_ids)))
        db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document.id))

        for finding in detect_pii(text):
            db.add(
                PiiFinding(
                    document_id=document.id,
                    finding_type=finding.finding_type,
                    severity=finding.severity,
                    sample=finding.sample,
                )
            )
            db.add(
                ReviewItem(
                    reason="Potential PII found in uploaded document",
                    severity=finding.severity,
                    related_document_id=document.id,
                    details_json={"finding_type": finding.finding_type, "sample": finding.sample},
                )
            )

        for index, chunk in enumerate(chunks):
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    chunk_index=index,
                    content=chunk,
                    page_number=page_number_for_chunk(chunk),
                    token_count=estimate_tokens(chunk),
                    embedding_model=EMBEDDING_MODEL,
                    embedding=serialize_embedding(create_embedding(chunk)),
                )
            )

        job.status = IngestionStatus.COMPLETED
        job.completed_at = datetime.now(UTC)
        document.ingestion_status = IngestionStatus.COMPLETED
        db.commit()
        return len(chunks)
    except Exception as exc:
        db.rollback()
        job = db.get(IngestionJob, job.id)
        document = db.get(Document, job.document_id) if job else None
        if job:
            job.status = IngestionStatus.FAILED
            job.error_message = str(exc)
        if document:
            document.ingestion_status = IngestionStatus.FAILED
        db.commit()
        raise
