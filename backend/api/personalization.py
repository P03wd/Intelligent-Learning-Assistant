
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db
from models import User
from dependencies import get_current_user

from personalization.performance_tracker import PerformanceTracker
from personalization.recommendation_engine import RecommendationEngine
from personalization.adaptive_learning import AdaptiveLearning
from coding_assistant.service import CodingAssistant

router = APIRouter(prefix="/learning", tags=["Personalized Learning"])

performance_tracker = PerformanceTracker()
recommendation_engine = RecommendationEngine()
adaptive_learning = AdaptiveLearning()


class PerformanceRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=100)
    score: float = Field(ge=0)
    total_questions: int = Field(gt=0)


class AdaptiveRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=100)
    average_score: float = Field(ge=0, le=100)


class PracticeRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=100)
    language: str = Field(min_length=1, max_length=20)


@router.post("/performance")
def record_performance(
    request: PerformanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = performance_tracker.record_performance(
            db=db,
            user_id=current_user.id,
            topic=request.topic,
            score=request.score,
            total_questions=request.total_questions
        )
        return {
            "message": "Performance recorded successfully",
            "performance": result,
            "status": "success"
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/performance")
def get_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "performance_summary": performance_tracker.get_performance_summary(
            db=db,
            user_id=current_user.id
        ),
        "weak_topics": performance_tracker.identify_weak_topics(
            db=db,
            user_id=current_user.id
        ),
        "status": "success"
    }


@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    weak_topics = performance_tracker.identify_weak_topics(
        db=db,
        user_id=current_user.id
    )

    return {
        "weak_topics": weak_topics,
        "recommendations": recommendation_engine.recommend_lessons(weak_topics),
        "status": "success"
    }


@router.post("/adaptive-level")
def get_adaptive_level(
    request: AdaptiveRequest,
    current_user: User = Depends(get_current_user)
):
    return {
        "learning_adaptation": adaptive_learning.adapt_learning(
            topic=request.topic,
            average_score=request.average_score
        ),
        "status": "success"
    }


@router.post("/practice-questions")
def generate_practice_questions(
    request: PracticeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    weak_topics = performance_tracker.identify_weak_topics(
        db=db,
        user_id=current_user.id
    )

    selected_topic = next(
        (
            item for item in weak_topics
            if item["topic"].strip().lower() == request.topic.strip().lower()
        ),
        None
    )

    if selected_topic is None:
        raise HTTPException(
            status_code=400,
            detail="Practice questions can only be generated for your recorded weak topics."
        )

    adaptation = adaptive_learning.adapt_learning(
        topic=selected_topic["topic"],
        average_score=selected_topic["average_score"]
    )

    learning_level = adaptation["learning_level"]

    try:
        assistant = CodingAssistant()

        result = assistant.process_code(
            language=request.language,
            code="",
            task="practice",
            question=(
                f"Generate five personalized practice questions about "
                f"{selected_topic['topic']}. "
                f"The student's learning level is {learning_level}. "
                f"Adapt the difficulty to this level. "
                f"Include answers and clear explanations for every question. "
                f"Focus on improving this student's weak topic."
            )
        )

        return {
            "topic": selected_topic["topic"],
            "average_score": selected_topic["average_score"],
            "learning_level": learning_level,
            "practice_questions": result["response"],
            "status": "success"
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to generate practice questions right now. Please try again."
        )
