
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db
from personalization.performance_tracker import PerformanceTracker
from personalization.recommendation_engine import RecommendationEngine
from personalization.adaptive_learning import AdaptiveLearning

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


@router.post("/performance")
def record_performance(
    request: PerformanceRequest,
    db: Session = Depends(get_db)
):
    try:
        result = performance_tracker.record_performance(
            db=db,
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
def get_performance(db: Session = Depends(get_db)):
    return {
        "performance_summary": performance_tracker.get_performance_summary(db=db),
        "weak_topics": performance_tracker.identify_weak_topics(db=db),
        "status": "success"
    }


@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    weak_topics = performance_tracker.identify_weak_topics(db=db)
    return {
        "weak_topics": weak_topics,
        "recommendations": recommendation_engine.recommend_lessons(weak_topics),
        "status": "success"
    }


@router.post("/adaptive-level")
def get_adaptive_level(request: AdaptiveRequest):
    return {
        "learning_adaptation": adaptive_learning.adapt_learning(
            topic=request.topic,
            average_score=request.average_score
        ),
        "status": "success"
    }
