
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Document, User
from api.auth import get_current_user
from config import UPLOAD_DIR
from document_processor.processor import process_document, SUPPORTED_EXTENSIONS
from rag.knowledge_base import ingest_document, get_knowledge_base


router = APIRouter(prefix="/documents", tags=["Documents"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = Path(file.filename or "").name
    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload PDF, DOCX, or TXT files."
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds the 10 MB limit."
        )

    saved_path = None
    ingested = False
    document_id = str(uuid.uuid4())

    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        saved_path = UPLOAD_DIR / f"{document_id}{extension}"

        with open(saved_path, "wb") as buffer:
            buffer.write(content)

        processed_document = process_document(str(saved_path))
        extracted_text = processed_document["text"]

        if not extracted_text or not extracted_text.strip():
            raise ValueError("No readable text found in the uploaded file.")

        result = ingest_document(
            file_path=str(saved_path),
            document_id=document_id,
            user_id=current_user.id
        )

        ingested = True

        document = Document(
            id=document_id,
            user_id=current_user.id,
            filename=filename,
            file_type=extension.lstrip("."),
            character_count=len(extracted_text),
            total_chunks=result["total_chunks"]
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return {
            "document_id": document.id,
            "user_id": document.user_id,
            "filename": document.filename,
            "file_type": document.file_type,
            "character_count": document.character_count,
            "total_chunks": document.total_chunks,
            "status": "success"
        }

    except HTTPException:
        db.rollback()

        if ingested:
            try:
                _, vector_store = get_knowledge_base()
                vector_store.remove_document(document_id)
                vector_store.save("learning_assistant")
            except Exception:
                pass

        if saved_path and saved_path.exists():
            saved_path.unlink()

        raise

    except ValueError as error:
        db.rollback()

        if ingested:
            try:
                _, vector_store = get_knowledge_base()
                vector_store.remove_document(document_id)
                vector_store.save("learning_assistant")
            except Exception:
                pass

        if saved_path and saved_path.exists():
            saved_path.unlink()

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        db.rollback()

        if ingested:
            try:
                _, vector_store = get_knowledge_base()
                vector_store.remove_document(document_id)
                vector_store.save("learning_assistant")
            except Exception:
                pass

        if saved_path and saved_path.exists():
            saved_path.unlink()

        raise HTTPException(
            status_code=500,
            detail="Document upload failed. Please try again."
        )

    finally:
        await file.close()


@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    return [
        {
            "document_id": document.id,
            "filename": document.filename,
            "file_type": document.file_type,
            "character_count": document.character_count,
            "total_chunks": document.total_chunks,
            "uploaded_at": document.uploaded_at
        }
        for document in documents
    ]
