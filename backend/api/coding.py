
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from coding_assistant.service import CodingAssistant
from dependencies import get_current_user
from models import User


router = APIRouter(prefix="/coding", tags=["Coding Assistant"])


class CodingRequest(BaseModel):
    language: str = Field(min_length=1, max_length=20)
    task: str = Field(min_length=1, max_length=20)
    code: str = Field(default="", max_length=15000)
    question: str = Field(default="", max_length=2000)


@router.post("/assist")
def coding_assistance(
    request: CodingRequest,
    current_user: User = Depends(get_current_user)
):

    try:
        assistant = CodingAssistant()

        result = assistant.process_code(
            language=request.language,
            code=request.code,
            task=request.task,
            question=request.question
        )

        return result

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Coding assistance failed. Please try again."
        )
