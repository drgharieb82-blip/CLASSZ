from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.question_bank.schemas import QuestionRead
from app.modules.quiz_attempts.schemas import QuizAttemptRead


class QuestionResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    quiz_result_id: UUID
    question_id: UUID
    earned_points: int
    max_points: int
    is_correct: bool
    pending_manual_review: bool = False
    question: QuestionRead | None = None


class QuizResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    attempt_id: UUID
    score: int
    max_score: int
    percentage: float
    passed: bool
    graded_at: datetime
    attempt: QuizAttemptRead | None = None
    question_results: list[QuestionResultRead] = Field(default_factory=list)
