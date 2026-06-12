from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.lesson_blocks.schemas import LessonBlockRead


class LessonBase(BaseModel):
    chapter_id: UUID
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    position: int = Field(ge=0)
    is_free_preview: bool = False
    release_at: datetime | None = None
    hide_at: datetime | None = None


class LessonCreate(LessonBase):
    pass


class LessonRead(LessonBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class LessonDetails(LessonRead):
    blocks: list[LessonBlockRead] = Field(default_factory=list)
