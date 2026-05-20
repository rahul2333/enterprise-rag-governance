from typing import Any


def chat_result_to_contract(result: Any) -> dict[str, Any]:
    citations = [
        {
            **_object_dict(citation),
            "id": f"doc:{citation.document_id}:chunk:{citation.chunk_id}",
        }
        for citation in result.citations
    ]
    retrieved_sources = [
        {
            **source,
            "confidence_score": source["score"],
        }
        for source in result.retrieved_sources
    ]
    return {
        "session_id": result.session_id,
        "message_id": result.message_id,
        "answer": result.answer,
        "confidence_score": result.confidence_score,
        "citations": citations,
        "retrieved_sources": retrieved_sources,
        "retrieved_contexts": retrieved_sources,
        "flags": result.flags,
        "warnings": result.flags,
        "blocked": result.blocked,
    }


def review_item_to_contract(item: Any) -> dict[str, Any]:
    details = item.details_json or {}
    summary = details.get("summary") or details.get("finding_type") or item.reason
    return {
        "id": item.id,
        "status": item.status,
        "reason": item.reason,
        "severity": item.severity,
        "risk_level": item.severity,
        "owner": str(item.assigned_to_user_id) if item.assigned_to_user_id else None,
        "summary": str(summary),
        "assigned_to_user_id": item.assigned_to_user_id,
        "related_document_id": item.related_document_id,
        "related_chat_message_id": item.related_chat_message_id,
        "details_json": item.details_json,
        "created_at": item.created_at,
        "resolved_at": item.resolved_at,
    }


def audit_log_to_contract(log: Any, actor_email: str | None) -> dict[str, Any]:
    metadata = log.metadata_json or {}
    event_type = _enum_value(log.event_type)
    action = str(metadata.get("event_name") or event_type)
    return {
        "id": log.id,
        "user_id": log.user_id,
        "event_type": log.event_type,
        "action": action,
        "actor_email": actor_email,
        "resource_type": log.resource_type,
        "resource_id": log.resource_id,
        "risk_level": audit_risk_level(log.event_type, metadata),
        "details": metadata.get("details") or metadata.get("reason") or metadata_summary(metadata),
        "metadata_json": log.metadata_json,
        "created_at": log.created_at,
    }


def evaluation_to_summary_contract(evaluation: Any) -> dict[str, Any]:
    return {
        "id": evaluation.id,
        "name": evaluation.name,
        "dataset_size": 0,
        "groundedness": 0.0,
        "citation_coverage": 0.0,
        "refusal_accuracy": 0.0,
        "last_run_at": evaluation.created_at,
        "status": "not_started",
    }


def audit_risk_level(event_type: Any, metadata: dict[str, Any]) -> str:
    flags = {str(flag) for flag in metadata.get("flags", [])}
    if _enum_value(event_type) == "access_denied" or metadata.get("event_name") == "prompt_blocked":
        return "high"
    if "pii_exposure" in flags or "low_confidence" in flags:
        return "medium"
    return "low"


def metadata_summary(metadata: dict[str, Any]) -> str | None:
    if not metadata:
        return None
    interesting = {key: value for key, value in metadata.items() if key in {"event_name", "flags", "risks"}}
    return str(interesting or metadata)


def _object_dict(value: Any) -> dict[str, Any]:
    if hasattr(value, "__dict__"):
        return dict(value.__dict__)
    return dict(value)


def _enum_value(value: Any) -> str:
    return str(getattr(value, "value", value))
