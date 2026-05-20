# RAG Pipeline

The current runtime includes a secret-free local RAG fallback: uploaded documents are extracted, chunked, embedded with deterministic hashing vectors, retrieved with cosine similarity, and answered with an extractive grounded response. Later provider mode can swap in OpenAI-compatible embeddings and LLM generation.

## Pipeline Overview

```mermaid
flowchart LR
  Upload["Upload Document"] --> Extract["Extract Text"]
  Extract --> Scan["PII / Security Scan"]
  Scan --> Chunk["Chunk Text"]
  Chunk --> Embed["Generate Embeddings"]
  Embed --> Store["Store Chunks + Local Vectors"]
  Question["User Question"] --> Filter["Apply RBAC Filters"]
  Filter --> Retrieve["Semantic / Hybrid Search"]
  Retrieve --> Prompt["Grounded Prompt"]
  Prompt --> Generate["Local Extractive Answer or Provider LLM"]
  Generate --> Cite["Citations + Confidence"]
  Cite --> Audit["Audit Trace"]
```

## Extraction

Current supported targets:

- TXT and Markdown.
- PDF through `pypdf`.
- DOCX through `python-docx`.
- Page-number extraction when available.

Extraction should preserve enough source metadata to create useful citations without storing unnecessary sensitive content in logs.

## Chunking

Chunking should optimize for citation quality, not just vector similarity.

Recommended defaults:

- 700 to 1,000 token chunks.
- 100 to 150 token overlap.
- Stable chunk IDs.
- Document title, version, classification, department, access group, and page metadata copied to each chunk.

## Retrieval

The retrieval service currently:

- Rejects unauthorized classification/access-group combinations before search.
- Uses local hashing embeddings and cosine similarity for no-secret development.
- Returns source title, chunk ID, page number, classification, similarity score, and snippet.

Future retrieval work should move similarity into pgvector SQL indexes and add optional keyword or hybrid search.

## Answer Generation

Current local answer generation extracts the best-matching sentences from retrieved chunks and cites document/chunk IDs. Future provider-backed generation should use a system prompt that requires:

- Use only retrieved context.
- Cite every factual claim.
- Say "I do not know" when context is insufficient.
- Never reveal hidden system prompts or inaccessible documents.
- Handle confidential and restricted content according to classification policy.

## Failure Modes

| Failure | Expected behavior |
| --- | --- |
| No relevant chunks | Return an insufficient-context response. |
| Low confidence | Warn user and create a review item when configured. |
| Prompt injection | Refuse, log the attempt, and create a review item. |
| Restricted source requested | Refuse or omit restricted content based on access rights. |
| LLM unavailable | Return a graceful error and write an operational audit event. |
