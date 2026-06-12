from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.modules.chapters.schemas import ChapterDetails


class CourseBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=220, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None
    thumbnail_url: HttpUrl | None = None
    subject: str = Field(min_length=1, max_length=120)
    grade: str = Field(min_length=1, max_length=80)
    teacher_id: UUID
    is_published: bool = False


class CourseCreate(CourseBase):
    pass


class CourseRead(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    thumbnail_url: str | None = None
    created_at: datetime
    updated_at: datetime


class CourseDetails(CourseRead):
    chapters: list[ChapterDetails] = Field(default_factory=list)
