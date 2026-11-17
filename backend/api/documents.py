
import uuid
from pathlib import Path
from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Document

from fastapi import APIRouter, UploadFile, File, HTTPException

from config import UPLOAD_DIR
from document_processor.processor import (
    process_document,
    SUPPORTED_EXTENSIONS,
)
from rag.knowledge_base import ingest_document

router = APIRouter(prefix="/documents", tags=["Documents"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are supported."
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 10 MB."
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    document_id = uuid.uuid4().hex
    saved_path = UPLOAD_DIR / f"{document_id}{extension}"

    try:
        saved_path.write_bytes(content)

        result = process_document(str(saved_path))

        # Automatically index the uploaded document.
        indexing_result = ingest_document(
            file_path=str(saved_path),
            document_id=document_id
        )
        db_document = Document(
            id=document_id,
            filename=original_name,
            file_type=result["file_type"],
            character_count=result["character_count"],
            total_chunks=indexing_result["total_chunks"]
        )

        db.add(db_document)
        db.commit()
        db.rollback()
        return {
            "document_id": document_id,
            "filename": original_name,
            "file_type": result["file_type"],
            "character_count": result["character_count"],
            "total_chunks": indexing_result["total_chunks"],
            "total_vectors": indexing_result["total_vectors"],
            "preview": result["text"][:500],
            "status": "uploaded and indexed successfully"
        }

    except (ValueError, FileNotFoundError) as error:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(error))

    except Exception:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Document processing or indexing failed."
        )

    finally:
        await file.close()
