
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Document, User
from dependencies import get_current_user
from config import UPLOAD_DIR
from document_processor.processor import process_document, SUPPORTED_EXTENSIONS
from rag.knowledge_base import ingest_document, get_knowledge_base

router = APIRouter(prefix="/documents", tags=["Documents"])

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(400, detail="Unsupported file type.")

    content = await file.read()

    if not content:
        raise HTTPException(400, detail="Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, detail="File exceeds the 10 MB limit.")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    document_id = uuid.uuid4().hex
    saved_path = UPLOAD_DIR / f"{document_id}{extension}"
    indexed_chunk_count = 0

    try:
        saved_path.write_bytes(content)

        result = process_document(str(saved_path))

        indexing_result = ingest_document(
            file_path=str(saved_path),
            document_id=document_id,
            user_id=current_user.id
        )

        indexed_chunk_count = indexing_result["total_chunks"]

        db_document = Document(
            id=document_id,
            user_id=current_user.id,
            filename=original_name,
            file_type=result["file_type"],
            character_count=result["character_count"],
            total_chunks=indexed_chunk_count
        )

        db.add(db_document)

        try:
            db.commit()
        except Exception:
            db.rollback()

            if indexed_chunk_count > 0:
                _, vector_store = get_knowledge_base()
                vector_store.remove_last_documents(indexed_chunk_count)
                vector_store.save("learning_assistant")

            raise

        db.refresh(db_document)

        return {
            "document_id": document_id,
            "user_id": current_user.id,
            "filename": original_name,
            "file_type": result["file_type"],
            "character_count": result["character_count"],
            "total_chunks": indexed_chunk_count,
            "status": "success"
        }

    except HTTPException:
        db.rollback()
        saved_path.unlink(missing_ok=True)
        raise

    except ValueError as error:
        db.rollback()
        saved_path.unlink(missing_ok=True)
        raise HTTPException(400, detail=str(error))

    except Exception:
        db.rollback()
        saved_path.unlink(missing_ok=True)
        raise HTTPException(
            500,
            detail="Document processing or indexing failed."
        )

    finally:
        await file.close()
