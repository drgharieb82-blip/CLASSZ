from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.question_bank.schemas import QuestionRead


class QuizBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    course_id: UUID
    chapter_id: UUID | None = None
    session_id: UUID | None = None
    duration_minutes: int = Field(default=30, ge=0)
    passing_score: int = Field(default=70, ge=0, le=100)
    is_published: bool = False


class QuizCreate(QuizBase):
    pass


class QuizQuestionCreate(BaseModel):
    question_id: UUID
    position: int = Field(ge=0)
    points: int = Field(default=1, ge=0)


class QuizQuestionRead(QuizQuestionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    quiz_id: UUID
    question: QuestionRead | None = None


class QuizRead(QuizBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    questions: list[QuizQuestionRead] = Field(default_factory=list)
