from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.atomic_concepts.schemas import AtomicConceptRead
from app.modules.chapters.schemas import ChapterRead
from app.modules.concepts.schemas import ConceptRead
from app.modules.courses.schemas import CourseRead
from app.modules.lessons.schemas import LessonRead
from app.modules.materials.schemas import MaterialRead
from app.modules.session_blocks.models import BlockType
from app.modules.sessions.schemas import SessionRead
from app.modules.videos.schemas import VideoRead


class StudentSessionBlockRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    session_id: UUID
    block_type: BlockType
    position: int
    data_json: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class StudentSessionDetailRead(BaseModel):
    course: CourseRead
    chapters: list[ChapterRead] = Field(default_factory=list)
    lessons: list[LessonRead] = Field(default_factory=list)
    session: SessionRead
    blocks: list[StudentSessionBlockRead] = Field(default_factory=list)
    materials: list[MaterialRead] = Field(default_factory=list)
    videos: list[VideoRead] = Field(default_factory=list)
    concepts: list[ConceptRead] = Field(default_factory=list)
    atomic_concepts: list[AtomicConceptRead] = Field(default_factory=list)

