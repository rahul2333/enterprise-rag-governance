# Data Flow

This document captures the implemented local flows and future provider-facing flows for document ingestion, question answering, audit logging, and governance review.

## Document Ingestion Flow

```mermaid
sequenceDiagram
  participant Admin
  participant UI as React UI
  participant API as FastAPI
  participant DB as PostgreSQL
  participant Queue as Redis
  participant Worker as Celery Worker
  participant Store as Upload Volume

  Admin->>UI: Upload document + metadata
  UI->>API: POST /documents/upload
  API->>API: Validate JWT and admin role
  API->>API: Validate type, size, filename
  API->>Store: Persist uploaded file
  API->>DB: Create document + ingestion job
  API->>Queue: Enqueue ingestion job
  Worker->>DB: Update job status
  Worker->>Store: Read file
  Worker->>DB: Store chunks, local hashing embeddings, PII findings
```

## Retrieval And Answer Flow

```mermaid
sequenceDiagram
  participant User
  participant API
  participant Guard as Guardrails
  participant DB as PostgreSQL + pgvector
  participant LLM
  participant Audit

  User->>API: Ask question
  API->>Guard: Detect prompt-injection risk
  Guard-->>API: Allow or block
  API->>DB: Retrieve chunks filtered by role/access group/classification
  API->>API: Build local extractive grounded answer
  API-->>LLM: Optional future provider generation
  API->>Audit: Store trace, citations, latency, token cost
  API-->>User: Answer, citations, confidence, warnings
```

## Governance Event Flow

```mermaid
flowchart TD
  Event["Request, upload, answer, or scan finding"] --> Classify["Classify event type"]
  Classify --> Audit["Write audit log"]
  Classify --> Risk{"Risk detected?"}
  Risk -->|No| Done["No review item"]
  Risk -->|Yes| Review["Create review item"]
  Review --> Reviewer["Reviewer triage"]
  Reviewer --> Decision["Approve, dismiss, escalate, or remediate"]
  Decision --> Audit
```

## Data Retention Considerations

- Uploaded documents should have configurable retention and deletion workflows.
- Audit logs should be immutable or append-only in production deployments.
- Retrieved contexts should be retained long enough to support answer traceability.
- PII findings should store minimal evidence and avoid duplicating sensitive content.
- Evaluation outputs should identify dataset version and model configuration.
