from fastapi import FastAPI
from api.personalization import router as personalization_router
from config import APP_NAME, APP_ENV, DEBUG
from api.documents import router as documents_router
from api.chat import router as chat_router
from api.coding import router as coding_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=APP_NAME,
    description=(
        "AI-powered learning assistant with RAG, "
        "coding assistance and personalized learning."
    ),
    version="1.0.0",
    debug=DEBUG
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(coding_router)
app.include_router(personalization_router)
@app.get("/")
def home():
    return {
        "message": "Welcome to ArchintX Intelligent Learning Assistant",
        "application": APP_NAME,
        "environment": APP_ENV,
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ArchintX AI Learning Assistant"
    }