
import os
from pathlib import Path

from dotenv import load_dotenv

# Locate project root
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(BASE_DIR / ".env")

# Application settings
APP_NAME = os.getenv(
    "APP_NAME",
    "ArchintX Intelligent Learning Assistant"
)

APP_ENV = os.getenv("APP_ENV", "development")

DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# AI configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )
# Security configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

# Embedding configuration
EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "sentence-transformers/all-MiniLM-L6-v2"
)

# Vector database configuration
VECTOR_DB_PATH = BASE_DIR / os.getenv(
    "VECTOR_DB_PATH",
    "vector_store"
)

# Uploaded documents directory
UPLOAD_DIR = BASE_DIR / "uploaded_documents"
