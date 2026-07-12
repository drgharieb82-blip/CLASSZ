from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.atomic_concepts.schemas import AtomicConceptRead
from app.modules.chapters.schemas import ChapterRead
from app.modules.concepts.schemas import ConceptRead
from app.modules.lessons.schemas import LessonRead
from app.modules.session_blocks.schemas import SessionBlockRead
from app.modules.sessions.models import SessionStatus


class SessionBase(BaseModel):
    course_id: UUID
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    position: int = Field(ge=0)
    is_free_preview: bool = False
    release_at: datetime | None = None
    hide_at: datetime | None = None
    requires_previous_completion: bool = False
    is_locked: bool = False
    status: SessionStatus = SessionStatus.draft


class SessionCreate(BaseModel):
    course_id: UUID
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    is_free_preview: bool = False
    release_at: datetime | None = None
    hide_at: datetime | None = None
    requires_previous_completion: bool = False
    is_locked: bool = False
    chapter_ids: list[UUID] = Field(default_factory=list)
    lesson_ids: list[UUID] = Field(default_factory=list)
    concept_ids: list[UUID] = Field(default_factory=list)
    atomic_concept_ids: list[UUID] = Field(default_factory=list)


class SessionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    is_free_preview: bool | None = None
    release_at: datetime | None = None
    hide_at: datetime | None = None
    requires_previous_completion: bool | None = None
    is_locked: bool | None = None
    status: SessionStatus | None = None


class SessionRead(SessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    created_at: datetime
    chapters: list[ChapterRead] = Field(default_factory=list)
    lessons: list[LessonRead] = Field(default_factory=list)
    concepts: list[ConceptRead] = Field(default_factory=list)
    atomic_concepts: list[AtomicConceptRead] = Field(default_factory=list)


class SessionDetails(SessionRead):
    blocks: list[SessionBlockRead] = Field(default_factory=list)
