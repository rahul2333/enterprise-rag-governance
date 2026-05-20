from app.core.database import SessionLocal
from app.models.document import IngestionJob
from app.models.enums import IngestionStatus
from app.services.ingestion_service import ingest_document_job
from app.workers.celery_app import celery_app


@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def process_document_upload(self, job_id: int) -> dict[str, int | str]:
    db = SessionLocal()
    try:
        job = db.get(IngestionJob, job_id)
        if not job:
            return {"job_id": job_id, "status": "missing"}

        chunk_count = ingest_document_job(db, job)
        return {"job_id": job_id, "status": "completed", "chunks": chunk_count}
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
