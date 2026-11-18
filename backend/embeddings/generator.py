
from fastembed import TextEmbedding
import numpy as np

from config import EMBEDDING_MODEL


class EmbeddingGenerator:

    def __init__(self):
        print(f"Loading embedding model: {EMBEDDING_MODEL}")

        self.model = TextEmbedding(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        print("Embedding model loaded successfully!")

    def generate_embeddings(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, self.get_embedding_dimension()), dtype="float32")

        embeddings = list(self.model.embed(texts))

        return np.asarray(embeddings, dtype="float32")

    def get_embedding_dimension(self) -> int:
        return 384
