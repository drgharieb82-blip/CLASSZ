from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.quiz_attempts.models import QuizAttemptStatus
from app.modules.quizzes.schemas import QuizRead


class QuizAttemptStart(BaseModel):
    quiz_id: UUID
    student_id: UUID
    time_limit_minutes: int | None = Field(default=None, ge=1)
    ip_address: str | None = None
    user_agent: str | None = None
    device_fingerprint: str | None = None


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
    expires_at: datetime | None
    time_limit_minutes: int | None
    attempt_number: int
    ip_address: str | None
    user_agent: str | None
    device_fingerprint: str | None
    focus_loss_count: int
    is_auto_submitted: bool
    status: QuizAttemptStatus
    quiz: QuizRead | None = None
    answers: list[QuizAnswerRead] = Field(default_factory=list)
