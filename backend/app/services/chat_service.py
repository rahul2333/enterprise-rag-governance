from dataclasses import dataclass
from time import perf_counter

from sqlalchemy.orm import Session

from app.models.chat import ChatMessage, ChatSession
from app.models.document import RetrievedContext
from app.models.enums import AuditEventType
from app.models.governance import AuditLog, ModelUsageCost, PiiFinding, ReviewItem
from app.models.user import User
from app.services.cost_service import LOCAL_MODEL_NAME, estimate_cost_usd, estimate_tokens
from app.services.pii_service import detect_pii
from app.services.prompt_guard_service import detect_prompt_injection
from app.services.retrieval_service import RetrievedChunk, retrieve_relevant_chunks


MIN_CONFIDENCE = 0.12


@dataclass(frozen=True)
class Citation:
    document_id: int
    document_title: str
    chunk_id: int
    chunk_index: int
    page_number: int | None
    confidence_score: float
    classification: str


@dataclass(frozen=True)
class ChatResult:
    session_id: int
    message_id: int
    answer: str
    confidence_score: float
    citations: list[Citation]
    retrieved_sources: list[dict]
    flags: list[str]
    blocked: bool = False


def answer_question(db: Session, *, user: User, question: str, session_id: int | None = None) -> ChatResult:
    start = perf_counter()
    flags: list[str] = []
    session = _get_or_create_session(db, user, session_id, question)
    user_message = ChatMessage(session_id=session.id, user_id=user.id, role="user", content=question)
    db.add(user_message)
    db.flush()

    prompt_risks = detect_prompt_injection(question)
    if prompt_risks:
        flags.append("prompt_injection")
        answer = "I cannot help with requests to bypass instructions, access controls, or secrets."
        assistant_message = _save_assistant_message(db, user, session, answer, 0.0, start)
        db.add(
            ReviewItem(
                reason="Prompt injection attempt blocked",
                severity="high",
                related_chat_message_id=assistant_message.id,
                details_json={"risks": [risk.__dict__ for risk in prompt_risks]},
            )
        )
        _audit(db, user, "prompt_blocked", assistant_message.id, {"risks": [risk.reason for risk in prompt_risks]})
        _record_cost(db, user, question, answer)
        db.commit()
        return ChatResult(
            session_id=session.id,
            message_id=assistant_message.id,
            answer=answer,
            confidence_score=0.0,
            citations=[],
            retrieved_sources=[],
            flags=flags,
            blocked=True,
        )

    retrieved = retrieve_relevant_chunks(db, query=question, user=user)
    answer, confidence = _build_grounded_answer(question, retrieved)
    if confidence < MIN_CONFIDENCE:
        flags.append("low_confidence")

    assistant_message = _save_assistant_message(db, user, session, answer, confidence, start)
    for item in retrieved:
        db.add(
            RetrievedContext(
                chat_message_id=assistant_message.id,
                document_chunk_id=item.chunk.id,
                similarity_score=item.score,
                rank=item.rank,
            )
        )

    answer_pii = detect_pii(answer)
    for finding in answer_pii:
        flags.append("pii_exposure")
        db.add(
            PiiFinding(
                chat_message_id=assistant_message.id,
                finding_type=finding.finding_type,
                severity=finding.severity,
                sample=finding.sample,
            )
        )
        db.add(
            ReviewItem(
                reason="Potential PII exposure in generated answer",
                severity=finding.severity,
                related_chat_message_id=assistant_message.id,
                details_json={"finding_type": finding.finding_type, "sample": finding.sample},
            )
        )

    if confidence < MIN_CONFIDENCE:
        db.add(
            ReviewItem(
                reason="Low-confidence grounded answer",
                severity="medium",
                related_chat_message_id=assistant_message.id,
                details_json={"confidence_score": confidence},
            )
        )

    _audit(db, user, "chat_query", assistant_message.id, {"confidence_score": confidence, "flags": flags})
    _record_cost(db, user, question, answer)
    db.commit()
    db.refresh(assistant_message)

    return ChatResult(
        session_id=session.id,
        message_id=assistant_message.id,
        answer=answer,
        confidence_score=confidence,
        citations=_citations(retrieved),
        retrieved_sources=_source_payloads(retrieved),
        flags=sorted(set(flags)),
    )


def _get_or_create_session(db: Session, user: User, session_id: int | None, question: str) -> ChatSession:
    if session_id:
        session = db.get(ChatSession, session_id)
        if session and session.user_id == user.id:
            return session
    session = ChatSession(user_id=user.id, title=question[:120])
    db.add(session)
    db.flush()
    return session


def _save_assistant_message(
    db: Session,
    user: User,
    session: ChatSession,
    answer: str,
    confidence: float,
    start: float,
) -> ChatMessage:
    message = ChatMessage(
        session_id=session.id,
        user_id=user.id,
        role="assistant",
        content=answer,
        confidence_score=round(confidence, 4),
        latency_ms=int((perf_counter() - start) * 1000),
    )
    db.add(message)
    db.flush()
    return message


def _build_grounded_answer(question: str, retrieved: list[RetrievedChunk]) -> tuple[str, float]:
    if not retrieved:
        return "I do not know based on the available documents.", 0.0

    supported = [item for item in retrieved if item.score >= MIN_CONFIDENCE]
    if not supported:
        return "I do not know based on the available documents.", retrieved[0].score

    answer_parts: list[str] = []
    for item in supported[:3]:
        sentence = _best_sentence(question, item.chunk.content)
        answer_parts.append(f"{sentence} [doc:{item.document.id} chunk:{item.chunk.id}]")
    confidence = sum(item.score for item in supported[:3]) / min(len(supported), 3)
    return " ".join(answer_parts), round(confidence, 4)


def _best_sentence(question: str, content: str) -> str:
    question_terms = {term.lower() for term in question.split() if len(term) > 2}
    sentences = [segment.strip() for segment in content.replace("\n", " ").split(".") if segment.strip()]
    if not sentences:
        return content[:500]
    return max(sentences, key=lambda sentence: len(question_terms & {term.lower().strip(",;:") for term in sentence.split()}))[
        :500
    ]


def _citations(retrieved: list[RetrievedChunk]) -> list[Citation]:
    return [
        Citation(
            document_id=item.document.id,
            document_title=item.document.title,
            chunk_id=item.chunk.id,
            chunk_index=item.chunk.chunk_index,
            page_number=item.chunk.page_number,
            confidence_score=item.score,
            classification=item.document.classification.value,
        )
        for item in retrieved
    ]


def _source_payloads(retrieved: list[RetrievedChunk]) -> list[dict]:
    return [
        {
            "document_id": item.document.id,
            "document_title": item.document.title,
            "chunk_id": item.chunk.id,
            "rank": item.rank,
            "score": item.score,
            "snippet": item.chunk.content[:700],
            "classification": item.document.classification.value,
            "page_number": item.chunk.page_number,
        }
        for item in retrieved
    ]


def _audit(db: Session, user: User, event_name: str, message_id: int, metadata: dict) -> None:
    db.add(
        AuditLog(
            user_id=user.id,
            event_type=AuditEventType.ACCESS_DENIED if event_name == "prompt_blocked" else AuditEventType.LOGIN,
            resource_type="chat_message",
            resource_id=str(message_id),
            metadata_json={"event_name": event_name, **metadata},
        )
    )


def _record_cost(db: Session, user: User, prompt: str, completion: str) -> None:
    prompt_tokens = estimate_tokens(prompt)
    completion_tokens = estimate_tokens(completion)
    db.add(
        ModelUsageCost(
            user_id=user.id,
            model_name=LOCAL_MODEL_NAME,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            estimated_cost_usd=estimate_cost_usd(prompt_tokens=prompt_tokens, completion_tokens=completion_tokens),
            department=user.department,
        )
    )
