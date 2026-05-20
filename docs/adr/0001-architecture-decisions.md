# ADR 0001: Architecture Decisions

Status: Accepted

## Context

The project needs to demonstrate enterprise AI architecture rather than a narrow chatbot demo. It must be locally runnable, easy for reviewers to understand, and credible as a foundation for cloud deployment.

## Decision

Use:

- FastAPI for the backend API.
- React TypeScript for the frontend.
- PostgreSQL with pgvector for relational data and vector search.
- Redis and Celery for asynchronous ingestion.
- Docker Compose for local development.
- Alembic for database migrations.

## Consequences

- The stack is approachable for portfolio reviewers and maps well to common enterprise platforms.
- PostgreSQL keeps governance metadata and embeddings close together.
- Celery allows ingestion to scale separately from API traffic.
- The architecture can later migrate to Kubernetes or managed container services without changing the core boundaries.
