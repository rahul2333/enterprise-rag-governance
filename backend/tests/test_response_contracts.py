from datetime import UTC, datetime
from types import SimpleNamespace

from app.services.response_contract_service import (
    audit_log_to_contract,
    chat_result_to_contract,
    evaluation_to_summary_contract,
    review_item_to_contract,
)


def test_chat_contract_preserves_backend_and_frontend_field_names() -> None:
    result = SimpleNamespace(
        session_id=10,
        message_id=20,
        answer="Use approved managed storage. [doc:1 chunk:2]",
        confidence_score=0.81,
        citations=[
            SimpleNamespace(
                document_id=1,
                document_title="IT Security Policy",
                chunk_id=2,
                chunk_index=0,
                page_number=None,
                confidence_score=0.81,
                classification="internal",
            )
        ],
        retrieved_sources=[
            {
                "document_id": 1,
                "document_title": "IT Security Policy",
                "chunk_id": 2,
                "rank": 1,
                "score": 0.81,
                "snippet": "Personal cloud storage is not approved.",
                "classification": "internal",
                "page_number": None,
            }
        ],
        flags=["low_confidence"],
        blocked=False,
    )

    payload = chat_result_to_contract(result)

    assert payload["citations"][0]["id"] == "doc:1:chunk:2"
    assert payload["retrieved_sources"] == payload["retrieved_contexts"]
    assert payload["retrieved_contexts"][0]["confidence_score"] == 0.81
    assert payload["warnings"] == ["low_confidence"]
    assert payload["flags"] == ["low_confidence"]


def test_review_item_contract_matches_frontend_queue_shape() -> None:
    created_at = datetime.now(UTC)
    item = SimpleNamespace(
        id=7,
        status="open",
        reason="Potential PII exposure",
        severity="high",
        assigned_to_user_id=3,
        related_document_id=4,
        related_chat_message_id=None,
        details_json={"summary": "Email-like text found in an answer."},
        created_at=created_at,
        resolved_at=None,
    )

    payload = review_item_to_contract(item)

    assert payload["risk_level"] == "high"
    assert payload["owner"] == "3"
    assert payload["summary"] == "Email-like text found in an answer."
    assert payload["status"] == "open"


def test_audit_contract_derives_action_actor_and_risk_level() -> None:
    created_at = datetime.now(UTC)
    log = SimpleNamespace(
        id=11,
        user_id=5,
        event_type=SimpleNamespace(value="access_denied"),
        resource_type="chat_message",
        resource_id="20",
        metadata_json={"event_name": "prompt_blocked", "risks": ["reveal_system_prompt"]},
        created_at=created_at,
    )

    payload = audit_log_to_contract(log, "user@example.com")

    assert payload["action"] == "prompt_blocked"
    assert payload["actor_email"] == "user@example.com"
    assert payload["risk_level"] == "high"
    assert "risks" in payload["details"]


def test_evaluation_summary_contract_is_frontend_ready() -> None:
    created_at = datetime.now(UTC)
    evaluation = SimpleNamespace(id=2, name="Baseline", created_at=created_at)

    payload = evaluation_to_summary_contract(evaluation)

    assert payload["name"] == "Baseline"
    assert payload["dataset_size"] == 0
    assert payload["groundedness"] == 0.0
    assert payload["status"] == "not_started"
