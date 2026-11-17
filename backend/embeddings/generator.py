
from sentence_transformers import SentenceTransformer
import numpy as np

from config import EMBEDDING_MODEL


class EmbeddingGenerator:

    def __init__(self):
        print(f"Loading embedding model: {EMBEDDING_MODEL}")
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        print("Embedding model loaded successfully!")

    def generate_embeddings(self, texts: list[str]) -> np.ndarray:
        if not texts:
            dimension = self.get_embedding_dimension()
            return np.empty((0, dimension), dtype="float32")

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        return embeddings.astype("float32")

    def get_embedding_dimension(self) -> int:
        return self.model.get_embedding_dimension()
