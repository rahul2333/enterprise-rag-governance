from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.models.enums import ReviewStatus, UserRole
from app.models.evaluation import Evaluation
from app.models.governance import AuditLog, ReviewItem
from app.models.user import User
from app.schemas.governance import (
    AuditLogResponse,
    EvaluationScoreRequest,
    EvaluationScoreResponse,
    EvaluationSummaryResponse,
    ReviewItemResponse,
    ReviewItemUpdate,
)
from app.services.evaluation_service import score_answer
from app.services.response_contract_service import (
    audit_log_to_contract,
    evaluation_to_summary_contract,
    review_item_to_contract,
)


router = APIRouter(tags=["governance"])


@router.get("/review-queue", response_model=list[ReviewItemResponse])
@router.get("/review-items", response_model=list[ReviewItemResponse])
def list_review_queue(
    status_filter: ReviewStatus | None = None,
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.REVIEWER)),
    db: Session = Depends(get_db),
) -> list[ReviewItemResponse]:
    statement = select(ReviewItem).order_by(ReviewItem.created_at.desc())
    if status_filter:
        statement = statement.where(ReviewItem.status == status_filter)
    return [ReviewItemResponse(**review_item_to_contract(item)) for item in db.scalars(statement)]


@router.patch("/review-queue/{item_id}", response_model=ReviewItemResponse)
@router.patch("/review-items/{item_id}", response_model=ReviewItemResponse)
def update_review_item(
    item_id: int,
    payload: ReviewItemUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.REVIEWER)),
    db: Session = Depends(get_db),
) -> ReviewItemResponse:
    item = db.get(ReviewItem, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review item not found")
    item.status = payload.status
    item.assigned_to_user_id = item.assigned_to_user_id or current_user.id
    if payload.status == ReviewStatus.RESOLVED:
        item.resolved_at = datetime.now(UTC)
    db.commit()
    db.refresh(item)
    return ReviewItemResponse(**review_item_to_contract(item))


@router.get("/audit-logs", response_model=list[AuditLogResponse])
def list_audit_logs(
    limit: int = 100,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[AuditLogResponse]:
    limit = max(1, min(limit, 500))
    rows = db.execute(
        select(AuditLog, User.email)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
    ).all()
    return [AuditLogResponse(**audit_log_to_contract(log, actor_email)) for log, actor_email in rows]


@router.get("/evaluations", response_model=list[EvaluationSummaryResponse])
def list_evaluations(
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.REVIEWER)),
    db: Session = Depends(get_db),
) -> list[EvaluationSummaryResponse]:
    evaluations = db.scalars(select(Evaluation).order_by(Evaluation.created_at.desc())).all()
    return [EvaluationSummaryResponse(**evaluation_to_summary_contract(evaluation)) for evaluation in evaluations]


@router.post("/evaluations/score", response_model=EvaluationScoreResponse)
def score_evaluation_answer(
    payload: EvaluationScoreRequest,
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.REVIEWER)),
) -> EvaluationScoreResponse:
    return EvaluationScoreResponse(
        metrics=score_answer(
            question=payload.question,
            answer=payload.answer,
            expected_answer=payload.expected_answer,
            citations=payload.citations,
        )
    )
