from datetime import UTC, datetime

from app.core.database import SessionLocal
from app.models.document import Document, IngestionJob
from app.models.enums import IngestionStatus
from app.workers.celery_app import celery_app


@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def process_document_upload(self, job_id: int) -> dict[str, int | str]:
    db = SessionLocal()
    try:
        job = db.get(IngestionJob, job_id)
        if not job:
            return {"job_id": job_id, "status": "missing"}

        document = db.get(Document, job.document_id)
        job.status = IngestionStatus.PROCESSING
        job.attempts += 1
        job.started_at = datetime.now(UTC)
        if document:
            document.ingestion_status = IngestionStatus.PROCESSING
        db.commit()

        # Phase 1 records the queue boundary only. Phase 2 adds extraction, chunking, and embeddings.
        job.status = IngestionStatus.COMPLETED
        job.completed_at = datetime.now(UTC)
        if document:
            document.ingestion_status = IngestionStatus.COMPLETED
        db.commit()
        return {"job_id": job_id, "status": "completed"}
    except Exception as exc:
        db.rollback()
        job = db.get(IngestionJob, job_id)
        if job:
            job.status = IngestionStatus.FAILED
            job.error_message = str(exc)
            db.commit()
        raise
    finally:
        db.close()
