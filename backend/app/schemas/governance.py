from datetime import datetime
from pydantic import BaseModel, Field

from app.models.enums import AuditEventType, ReviewStatus


class ReviewItemResponse(BaseModel):
    id: int
    status: ReviewStatus
    reason: str
    severity: str
    risk_level: str
    owner: str | None = None
    summary: str
    assigned_to_user_id: int | None
    related_document_id: int | None
    related_chat_message_id: int | None
    details_json: dict | None
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}


class ReviewItemUpdate(BaseModel):
    status: ReviewStatus


class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None
    event_type: AuditEventType
    action: str
    actor_email: str | None = None
    resource_type: str | None
    resource_id: str | None
    risk_level: str
    details: str | None = None
    metadata_json: dict | None
    created_at: datetime


class EvaluationScoreRequest(BaseModel):
    question: str = Field(min_length=2)
    answer: str = Field(min_length=1)
    expected_answer: str | None = None
    citations: list[str] = []


class EvaluationScoreResponse(BaseModel):
    metrics: dict[str, float | bool]


class EvaluationSummaryResponse(BaseModel):
    id: int | str
    name: str
    dataset_size: int
    groundedness: float
    citation_coverage: float
    refusal_accuracy: float
    last_run_at: datetime | str
    status: str
