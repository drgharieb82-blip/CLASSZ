from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.atomic_concepts.schemas import AtomicConceptRead
from app.modules.chapters.schemas import ChapterRead
from app.modules.concepts.schemas import ConceptRead
from app.modules.lessons.schemas import LessonRead
from app.modules.materials.models import MaterialAccessType, MaterialStatus, MaterialType


class MaterialCreate(BaseModel):
    course_id: UUID
    session_id: UUID | None = None
    type: MaterialType
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    file_url: str | None = None
    video_url: str | None = None
    notes_content: str | None = None
    file_name: str | None = Field(default=None, max_length=255)
    file_size_bytes: int | None = Field(default=None, ge=0)
    mime_type: str | None = Field(default=None, max_length=120)
    chapter_ids: list[UUID] = Field(default_factory=list)
    lesson_ids: list[UUID] = Field(default_factory=list)
    concept_ids: list[UUID] = Field(default_factory=list)
    atomic_concept_ids: list[UUID] = Field(default_factory=list)


class MaterialUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    status: MaterialStatus | None = None
    file_url: str | None = None
    video_url: str | None = None
    notes_content: str | None = None
    session_id: UUID | None = None
    file_name: str | None = Field(default=None, max_length=255)


class MaterialLinksUpdate(BaseModel):
    """Replace-all semantics: the given id lists become the material's
    complete set of academic links for that level (not a merge/append)."""

    chapter_ids: list[UUID] = Field(default_factory=list)
    lesson_ids: list[UUID] = Field(default_factory=list)
    concept_ids: list[UUID] = Field(default_factory=list)
    atomic_concept_ids: list[UUID] = Field(default_factory=list)


class MaterialReorder(BaseModel):
    course_id: UUID
    ordered_ids: list[UUID] = Field(min_length=1)


class MaterialRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    course_id: UUID
    session_id: UUID | None
    type: MaterialType
    title: str
    description: str | None
    file_url: str | None
    video_url: str | None
    notes_content: str | None
    file_name: str | None
    file_size_bytes: int | None
    mime_type: str | None
    status: MaterialStatus
    position: int
    created_at: datetime
    updated_at: datetime
    chapters: list[ChapterRead] = Field(default_factory=list)
    lessons: list[LessonRead] = Field(default_factory=list)
    concepts: list[ConceptRead] = Field(default_factory=list)
    atomic_concepts: list[AtomicConceptRead] = Field(default_factory=list)


class MaterialAccessCreate(BaseModel):
    access_type: MaterialAccessType = MaterialAccessType.view


class MaterialAccessRead(BaseModel):
    material_id: UUID
    access_type: MaterialAccessType
    access_url: str
    expires_at: datetime
