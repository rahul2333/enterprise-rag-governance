from dataclasses import dataclass
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentChunk
from app.models.enums import DocumentClassification, IngestionStatus, UserRole
from app.models.user import User
from app.services.embedding_service import cosine_similarity, create_embedding, deserialize_embedding


@dataclass(frozen=True)
class RetrievedChunk:
    chunk: DocumentChunk
    document: Document
    score: float
    rank: int


def can_access_document(user: User, document: Document) -> bool:
    if user.role == UserRole.ADMIN:
        return True
    if document.classification == DocumentClassification.RESTRICTED:
        return document.access_group is not None and document.access_group == user.access_group
    if document.access_group is None:
        return True
    return document.access_group == user.access_group


def retrieve_relevant_chunks(db: Session, *, query: str, user: User, top_k: int = 5) -> list[RetrievedChunk]:
    query_embedding = create_embedding(query)
    statement = (
        select(DocumentChunk, Document)
        .join(Document, Document.id == DocumentChunk.document_id)
        .where(Document.ingestion_status == IngestionStatus.COMPLETED)
    )

    scored: list[tuple[float, DocumentChunk, Document]] = []
    for chunk, document in db.execute(statement).all():
        if not can_access_document(user, document):
            continue
        score = cosine_similarity(query_embedding, deserialize_embedding(chunk.embedding))
        if score > 0:
            scored.append((score, chunk, document))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [
        RetrievedChunk(chunk=chunk, document=document, score=round(float(score), 5), rank=index)
        for index, (score, chunk, document) in enumerate(scored[:top_k], start=1)
    ]
