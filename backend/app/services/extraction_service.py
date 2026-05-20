from pathlib import Path


def extract_text(path: str | Path, content_type: str | None = None) -> str:
    file_path = Path(path)
    suffix = file_path.suffix.lower()
    if suffix in {".txt", ".md"}:
        return file_path.read_text(encoding="utf-8", errors="ignore")
    if suffix == ".pdf":
        return _extract_pdf(file_path)
    if suffix == ".docx":
        return _extract_docx(file_path)
    if content_type and content_type.startswith("text/"):
        return file_path.read_text(encoding="utf-8", errors="ignore")
    raise ValueError(f"Unsupported extraction type for {suffix or content_type}")


def _extract_pdf(file_path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise ValueError("PDF extraction requires pypdf") from exc

    reader = PdfReader(str(file_path))
    pages: list[str] = []
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append(f"\n\n[page:{index}]\n{text}")
    return "\n".join(pages)


def _extract_docx(file_path: Path) -> str:
    try:
        from docx import Document as DocxDocument
    except ImportError as exc:
        raise ValueError("DOCX extraction requires python-docx") from exc

    document = DocxDocument(str(file_path))
    return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())


def page_number_for_chunk(chunk: str) -> int | None:
    marker = "[page:"
    if marker not in chunk:
        return None
    try:
        value = chunk.split(marker, 1)[1].split("]", 1)[0]
        return int(value)
    except (IndexError, ValueError):
        return None
