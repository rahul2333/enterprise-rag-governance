from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=4000)
    session_id: int | None = None


class CitationResponse(BaseModel):
    id: str
    document_id: int
    document_title: str
    chunk_id: int
    chunk_index: int
    page_number: int | None
    confidence_score: float
    classification: str


class RetrievedSourceResponse(BaseModel):
    document_id: int
    document_title: str
    chunk_id: int
    rank: int
    score: float
    confidence_score: float
    snippet: str
    classification: str
    page_number: int | None


class ChatResponse(BaseModel):
    session_id: int
    message_id: int
    answer: str
    confidence_score: float
    citations: list[CitationResponse]
    retrieved_sources: list[RetrievedSourceResponse]
    retrieved_contexts: list[RetrievedSourceResponse]
    flags: list[str]
    warnings: list[str]
    blocked: bool = False
