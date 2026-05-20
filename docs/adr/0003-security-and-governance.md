# ADR 0003: Security And Governance

Status: Accepted

## Context

Enterprise RAG systems need controls beyond standard authentication. They need classification, traceability, human review, cost visibility, evaluation, and AI security guardrails.

## Decision

Implement security and governance as first-class data and API concepts:

- JWT authentication and API-layer RBAC.
- Document classification and access-group metadata.
- Audit logs for user and system actions.
- Review items for risky prompts, low-confidence answers, PII, and restricted access attempts.
- Risk register, evaluation, and model cost tables.

## Consequences

- The schema is broader than a simple chatbot schema, but it clearly demonstrates enterprise architecture.
- Later phases can add working governance flows without disruptive database redesign.
- Backend authorization remains authoritative even when frontend pages become role-aware.
