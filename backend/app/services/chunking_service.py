import re


WORD_PATTERN = re.compile(r"\S+")


def estimate_tokens(text: str) -> int:
    return len(WORD_PATTERN.findall(text))


def chunk_text(text: str, *, chunk_size: int = 220, overlap: int = 45) -> list[str]:
    words = WORD_PATTERN.findall(text)
    if not words:
        return []
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be non-negative and smaller than chunk_size")

    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap
    return chunks
