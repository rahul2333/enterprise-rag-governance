from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import answer_question
from app.services.response_contract_service import chat_result_to_contract


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/query", response_model=ChatResponse)
def query_documents(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponse:
    result = answer_question(db, user=current_user, question=payload.question, session_id=payload.session_id)
    return ChatResponse(**chat_result_to_contract(result))
