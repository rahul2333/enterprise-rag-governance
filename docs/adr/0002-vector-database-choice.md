# ADR 0002: Vector Database Choice

Status: Accepted

## Context

The platform must filter retrieval by document classification, access group, uploader, version, and other governance metadata. A separate vector database can work well, but it adds synchronization and consistency concerns for a portfolio project.

## Decision

Use pgvector in PostgreSQL as the preferred vector database.

## Rationale

- Governance metadata, chunks, embeddings, and audit data can share transactional storage.
- Access-control filters can be expressed alongside vector search.
- Local development is simpler because Docker Compose only needs PostgreSQL plus Redis.
- The design remains portable enough to swap Qdrant or another vector store later if scale requires it.

## Consequences

- Vector indexing and query tuning become part of PostgreSQL operations.
- Large-scale semantic workloads may eventually need a dedicated vector service.
- For this portfolio scope, pgvector provides the strongest governance story with the least operational complexity.
