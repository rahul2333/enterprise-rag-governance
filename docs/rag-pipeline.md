# RAG Pipeline

Phase 1 prepares document and chunk schemas but does not yet generate embeddings.

Planned Phase 2 pipeline:

1. Extract text from PDF, TXT, Markdown, and DOCX.
2. Split text into governed chunks.
3. Embed chunks with an OpenAI-compatible embedding API or local fallback.
4. Store vectors in pgvector.
5. Apply access-control filters before retrieval.
6. Generate grounded answers with citations.
