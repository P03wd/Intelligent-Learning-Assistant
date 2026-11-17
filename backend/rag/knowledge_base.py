
from pathlib import Path

from config import VECTOR_DB_PATH
from embeddings.generator import EmbeddingGenerator
from rag.pipeline import build_document_chunks
from rag.vector_store import VectorStore


_embedding_generator = None
_vector_store = None


def get_knowledge_base():
    global _embedding_generator, _vector_store

    if _embedding_generator is None:
        _embedding_generator = EmbeddingGenerator()

    if _vector_store is None:
        dimension = _embedding_generator.get_embedding_dimension()
        _vector_store = VectorStore(dimension)

        index_path = VECTOR_DB_PATH / "learning_assistant.faiss"
        metadata_path = VECTOR_DB_PATH / "learning_assistant.json"

        if index_path.exists() and metadata_path.exists():
            _vector_store.load("learning_assistant")
            print("Existing knowledge base loaded.")

    return _embedding_generator, _vector_store


def ingest_document(
    file_path: str,
    document_id: str
) -> dict:

    embedding_generator, vector_store = get_knowledge_base()

    document_data = build_document_chunks(
        file_path=file_path,
        document_id=document_id
    )

    chunks = document_data["chunks"]
    texts = [chunk["content"] for chunk in chunks]

    embeddings = embedding_generator.generate_embeddings(texts)

    vector_store.add_documents(embeddings, chunks)

    vector_store.save("learning_assistant")

    return {
        "document_id": document_id,
        "filename": document_data["filename"],
        "total_chunks": document_data["total_chunks"],
        "total_vectors": vector_store.index.ntotal,
        "status": "indexed successfully"
    }


def search_knowledge_base(
    question: str,
    top_k: int = 3
) -> list[dict]:

    if not question or not question.strip():
        raise ValueError("Search question cannot be empty.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    embedding_generator, vector_store = get_knowledge_base()

    query_embedding = embedding_generator.generate_embeddings(
        [question.strip()]
    )

    return vector_store.search(
        query_embedding,
        top_k=top_k
    )
