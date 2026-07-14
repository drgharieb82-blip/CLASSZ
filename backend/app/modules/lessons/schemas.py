from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.concepts.schemas import ConceptDetails


class LessonBase(BaseModel):
    chapter_id: UUID
    title: str = Field(min_length=1, max_length=200)
    position: int = Field(ge=0)


class LessonCreate(BaseModel):
    chapter_id: UUID
    title: str = Field(min_length=1, max_length=200)


class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)


class LessonRead(LessonBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    created_at: datetime


class LessonDetails(LessonRead):
    concepts: list[ConceptDetails] = Field(default_factory=list)
