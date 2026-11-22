
from pathlib import Path

from document_processor.processor import process_document
from rag.chunker import chunk_text


def build_document_chunks(
    file_path: str,
    document_id: str = "",
    user_id: int = 0,
    chunk_size: int = 1000,
    chunk_overlap: int = 150
) -> dict:

    # Extract and clean document text.
    document = process_document(file_path)

    # Divide extracted text into meaningful chunks.
    chunks = chunk_text(
        document["text"],
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    # Attach source and ownership information to every chunk.
    chunk_records = []

    for index, content in enumerate(chunks):
        chunk_records.append({
            "document_id": document_id,
            "user_id": user_id,
            "filename": document["filename"],
            "file_type": document["file_type"],
            "chunk_index": index,
            "content": content
        })

    return {
        "document_id": document_id,
        "user_id": user_id,
        "filename": document["filename"],
        "file_type": document["file_type"],
        "character_count": document["character_count"],
        "total_chunks": len(chunk_records),
        "chunks": chunk_records,
        "status": "processed"
    }
