from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.modules.chapters.schemas import ChapterDetails
from app.modules.sessions.schemas import SessionRead


class CourseBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=220, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None
    thumbnail_url: HttpUrl | None = None
    price: float | None = Field(default=None, ge=0)
    subject: str = Field(min_length=1, max_length=120)
    grade: str = Field(min_length=1, max_length=80)
    teacher_id: UUID
    is_published: bool = False


class CourseCreate(CourseBase):
    pass


class CourseRead(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    thumbnail_url: str | None = None
    price: float | None = None
    created_at: datetime
    updated_at: datetime


class CourseDetails(CourseRead):
    chapters: list[ChapterDetails] = Field(default_factory=list)
    sessions: list[SessionRead] = Field(default_factory=list)
