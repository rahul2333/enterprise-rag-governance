import re


def score_answer(
    *,
    question: str,
    answer: str,
    expected_answer: str | None = None,
    citations: list[str] | None = None,
) -> dict[str, float | bool]:
    citations = citations or []
    answer_terms = _terms(answer)
    question_terms = _terms(question)
    expected_terms = _terms(expected_answer or "")

    relevance = _overlap(answer_terms, question_terms)
    expected_overlap = _overlap(answer_terms, expected_terms) if expected_terms else 0.0
    citation_presence = bool(citations)
    groundedness = 1.0 if citation_presence and "I do not know" not in answer else 0.5 if citation_presence else 0.0

    return {
        "relevance": round(relevance, 4),
        "expected_overlap": round(expected_overlap, 4),
        "citation_presence": citation_presence,
        "groundedness": groundedness,
        "overall": round((relevance + expected_overlap + groundedness + (1.0 if citation_presence else 0.0)) / 4, 4),
    }


def _terms(text: str) -> set[str]:
    return {term.lower() for term in re.findall(r"[a-zA-Z0-9]{3,}", text)}


def _overlap(left: set[str], right: set[str]) -> float:
    if not left or not right:
        return 0.0
    return len(left & right) / len(right)
