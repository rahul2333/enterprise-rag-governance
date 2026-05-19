from sqlalchemy.orm import Session

from app.models.enums import AuditEventType
from app.models.governance import AuditLog


def create_audit_log(
    db: Session,
    *,
    event_type: AuditEventType,
    user_id: int | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    metadata: dict | None = None,
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        event_type=event_type,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata_json=metadata,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
