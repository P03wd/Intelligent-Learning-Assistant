
import json
import copy

import faiss
import numpy as np

from config import VECTOR_DB_PATH


class VectorStore:

    def __init__(self, dimension: int):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        self.metadata = []

    def add_documents(
        self,
        embeddings: np.ndarray,
        chunks: list[dict]
    ) -> None:

        if len(embeddings) != len(chunks):
            raise ValueError("Embedding and chunk counts must match.")

        if embeddings.ndim != 2 or embeddings.shape[1] != self.dimension:
            raise ValueError("Embedding dimensions do not match the index.")

        if len(chunks) == 0:
            return

        self.index.add(embeddings.astype("float32"))
        self.metadata.extend(chunks)

    def remove_last_documents(self, count: int) -> None:
        if count <= 0:
            return

        if count > len(self.metadata):
            raise ValueError("Cannot remove more vectors than available.")

        remaining_metadata = self.metadata[:-count]
        remaining_embeddings = self.index.reconstruct_n(
            0,
            self.index.ntotal - count
        )

        new_index = faiss.IndexFlatIP(self.dimension)

        if len(remaining_embeddings) > 0:
            new_index.add(remaining_embeddings)

        self.index = new_index
        self.metadata = remaining_metadata

    def remove_document(self, document_id: str) -> None:
        keep_indices = [
            i for i, item in enumerate(self.metadata)
            if item.get("document_id") != document_id
        ]

        if len(keep_indices) == len(self.metadata):
            return

        embeddings = self.index.reconstruct_n(
            0,
            self.index.ntotal
        )

        remaining_embeddings = embeddings[keep_indices]
        remaining_metadata = [
            self.metadata[i] for i in keep_indices
        ]

        new_index = faiss.IndexFlatIP(self.dimension)

        if len(remaining_embeddings) > 0:
            new_index.add(remaining_embeddings)

        self.index = new_index
        self.metadata = remaining_metadata

    def create_snapshot(self) -> tuple:
        embeddings = self.index.reconstruct_n(
            0,
            self.index.ntotal
        ).copy()

        metadata = copy.deepcopy(self.metadata)

        return embeddings, metadata

    def restore_snapshot(self, snapshot: tuple) -> None:
        embeddings, metadata = snapshot

        new_index = faiss.IndexFlatIP(self.dimension)

        if len(embeddings) > 0:
            new_index.add(embeddings.astype("float32"))

        self.index = new_index
        self.metadata = copy.deepcopy(metadata)

    def search(
        self,
        query_embedding: np.ndarray,
        top_k: int = 3,
        user_id: int | None = None
    ) -> list[dict]:

        if self.index.ntotal == 0:
            return []

        if query_embedding.shape != (1, self.dimension):
            raise ValueError("Query embedding has an invalid shape.")

        if user_id is None:
            raise ValueError("User ID is required for document retrieval.")

        # Search all vectors so another user's documents
        # cannot hide relevant results belonging to this user.
        scores, indices = self.index.search(
            query_embedding.astype("float32"),
            self.index.ntotal
        )

        results = []

        for score, index_id in zip(scores[0], indices[0]):
            if index_id < 0:
                continue

            result = self.metadata[int(index_id)].copy()

            # Return only documents belonging to this user.
            if result.get("user_id") != user_id:
                continue

            result["similarity_score"] = float(score)
            results.append(result)

            if len(results) >= top_k:
                break

        return results

    def save(self, name: str = "learning_assistant") -> None:

        VECTOR_DB_PATH.mkdir(parents=True, exist_ok=True)

        index_path = VECTOR_DB_PATH / f"{name}.faiss"
        metadata_path = VECTOR_DB_PATH / f"{name}.json"

        faiss.write_index(self.index, str(index_path))

        with metadata_path.open("w", encoding="utf-8") as file:
            json.dump(
                self.metadata,
                file,
                ensure_ascii=False,
                indent=2
            )

    def load(self, name: str = "learning_assistant") -> None:

        index_path = VECTOR_DB_PATH / f"{name}.faiss"
        metadata_path = VECTOR_DB_PATH / f"{name}.json"

        if not index_path.exists() or not metadata_path.exists():
            raise FileNotFoundError("Saved vector database not found.")

        loaded_index = faiss.read_index(str(index_path))

        with metadata_path.open("r", encoding="utf-8") as file:
            loaded_metadata = json.load(file)

        if loaded_index.d != self.dimension:
            raise ValueError("Saved index has an incompatible dimension.")

        if loaded_index.ntotal != len(loaded_metadata):
            raise ValueError("Vector index and metadata counts do not match.")

        self.index = loaded_index
        self.metadata = loaded_metadata
