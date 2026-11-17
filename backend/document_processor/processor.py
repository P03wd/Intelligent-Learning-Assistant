
import re
from pathlib import Path

import pymupdf
from docx import Document


SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def clean_text(text: str) -> str:
    """Clean extracted document text."""

    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def extract_pdf(file_path: Path) -> str:
    """Extract text from PDF documents."""

    extracted_text = []

    with pymupdf.open(file_path) as pdf:
        for page_number, page in enumerate(pdf, start=1):
            page_text = page.get_text()

            if page_text.strip():
                extracted_text.append(
                    f"\n[Page {page_number}]\n{page_text}"
                )

    return "\n".join(extracted_text)


def extract_docx(file_path: Path) -> str:
    """Extract paragraphs and tables from DOCX documents."""

    document = Document(file_path)

    extracted_text = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            extracted_text.append(paragraph.text)

    for table in document.tables:
        for row in table.rows:
            row_text = " | ".join(
                cell.text.strip() for cell in row.cells
            )

            if row_text.strip():
                extracted_text.append(row_text)

    return "\n".join(extracted_text)


def extract_txt(file_path: Path) -> str:
    """Extract text from TXT documents."""

    return file_path.read_text(
        encoding="utf-8-sig"
    )


def process_document(file_path: str) -> dict:
    """Extract and clean text from supported documents."""

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document not found: {path}"
        )

    extension = path.suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            "Unsupported file format. Upload PDF, DOCX or TXT."
        )

    if extension == ".pdf":
        raw_text = extract_pdf(path)

    elif extension == ".docx":
        raw_text = extract_docx(path)

    else:
        raw_text = extract_txt(path)

    cleaned_text = clean_text(raw_text)

    if not cleaned_text:
        raise ValueError(
            "No readable text found in the document."
        )

    return {
        "filename": path.name,
        "file_type": extension,
        "character_count": len(cleaned_text),
        "text": cleaned_text,
        "status": "processed"
    }
