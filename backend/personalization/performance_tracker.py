
from sqlalchemy.orm import Session
from sqlalchemy import func

from models import LearningPerformance


class PerformanceTracker:

    def record_performance(
        self,
        db: Session,
        user_id: int,
        topic: str,
        score: float,
        total_questions: int
    ) -> dict:

        if not topic or not topic.strip():
            raise ValueError("Topic cannot be empty.")

        if total_questions <= 0:
            raise ValueError("Total questions must be greater than zero.")

        if score < 0 or score > total_questions:
            raise ValueError("Score must be between zero and total questions.")

        percentage = (score / total_questions) * 100

        record = LearningPerformance(
            user_id=user_id,
            topic=topic.strip(),
            score=score,
            total_questions=total_questions,
            percentage=round(percentage, 2)
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "id": record.id,
            "user_id": record.user_id,
            "topic": record.topic,
            "score": record.score,
            "total_questions": record.total_questions,
            "percentage": record.percentage
        }

    def identify_weak_topics(
        self,
        db: Session,
        user_id: int,
        threshold: float = 60.0
    ) -> list:

        results = (
            db.query(
                func.lower(LearningPerformance.topic).label("topic"),
                func.avg(LearningPerformance.percentage).label("average_score"),
                func.count(LearningPerformance.id).label("attempts")
            )
            .filter(LearningPerformance.user_id == user_id)
            .group_by(func.lower(LearningPerformance.topic))
            .having(func.avg(LearningPerformance.percentage) < threshold)
            .all()
        )

        return [
            {
                "topic": row.topic,
                "average_score": round(float(row.average_score), 2),
                "attempts": row.attempts
            }
            for row in results
        ]

    def get_performance_summary(
        self,
        db: Session,
        user_id: int
    ) -> dict:

        results = (
            db.query(
                func.lower(LearningPerformance.topic).label("topic"),
                func.avg(LearningPerformance.percentage).label("average_score"),
                func.count(LearningPerformance.id).label("attempts")
            )
            .filter(LearningPerformance.user_id == user_id)
            .group_by(func.lower(LearningPerformance.topic))
            .all()
        )

        return {
            row.topic: {
                "average_score": round(float(row.average_score), 2),
                "attempts": row.attempts
            }
            for row in results
        }
