from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.lessons.schemas import LessonDetails


class ChapterBase(BaseModel):
    course_id: UUID
    title: str = Field(min_length=1, max_length=200)
    position: int = Field(ge=0)


class ChapterCreate(ChapterBase):
    pass


class ChapterRead(ChapterBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class ChapterDetails(ChapterRead):
    lessons: list[LessonDetails] = Field(default_factory=list)
