from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.modules.concepts.models import ConceptStateStatus


class ConceptBase(BaseModel):
    name: str
    slug: str
    subject: str
    description: str | None = None
    difficulty_level: int = 1
    course_id: UUID | None = None
    lesson_id: UUID | None = None


class ConceptCreate(ConceptBase):
    pass


class ConceptUpdate(BaseModel):
    name: str | None = None
    subject: str | None = None
    description: str | None = None
    difficulty_level: int | None = None
    course_id: UUID | None = None
    lesson_id: UUID | None = None


class ConceptRead(ConceptBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class ConceptDependencyCreate(BaseModel):
    source_concept_id: UUID
    target_concept_id: UUID
    relation_type: str = "prerequisite"
    weight: float = 1.0


class ConceptDependencyRead(ConceptDependencyCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class StudentConceptStateCreate(BaseModel):
    student_id: UUID
    concept_id: UUID
    mastery_score: int = 0
    confidence_score: int = 0
    weakness_score: int = 100
    status: ConceptStateStatus = ConceptStateStatus.NEW


class StudentConceptStateRead(StudentConceptStateCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    last_practiced_at: datetime | None = None
    next_review_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
