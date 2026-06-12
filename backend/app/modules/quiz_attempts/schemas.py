from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.quiz_attempts.models import QuizAttemptStatus
from app.modules.quizzes.schemas import QuizRead


class QuizAttemptStart(BaseModel):
    quiz_id: UUID
    student_id: UUID


class QuizAnswerSubmit(BaseModel):
    question_id: UUID
    answer_data: dict[str, Any] = Field(default_factory=dict)


class QuizAnswerRead(QuizAnswerSubmit):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    attempt_id: UUID


class QuizAttemptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    quiz_id: UUID
    student_id: UUID
    started_at: datetime
    submitted_at: datetime | None
    status: QuizAttemptStatus
    quiz: QuizRead | None = None
    answers: list[QuizAnswerRead] = Field(default_factory=list)
