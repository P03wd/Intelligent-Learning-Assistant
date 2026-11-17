
import re


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 150
) -> list[str]:

    if chunk_size <= 0:
        raise ValueError("Chunk size must be greater than zero.")

    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError(
            "Chunk overlap must be non-negative and smaller than chunk size."
        )

    if not text or not text.strip():
        return []

    text = text.strip()
    chunks = []
    start = 0

    while start < len(text):

        end = min(start + chunk_size, len(text))

        if end < len(text):
            search_start = start + chunk_size // 2

            # Prefer paragraph or sentence boundaries.
            boundaries = [
                text.rfind("\n\n", search_start, end),
                text.rfind("\n", search_start, end),
                text.rfind(". ", search_start, end),
                text.rfind(" ", search_start, end),
            ]

            best_boundary = max(boundaries)

            if best_boundary > search_start:
                end = best_boundary + 1

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = max(start + 1, end - chunk_overlap)

    return chunks
