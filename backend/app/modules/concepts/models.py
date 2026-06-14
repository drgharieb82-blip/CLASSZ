import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ConceptStateStatus(str, enum.Enum):
    NEW = "new"
    LEARNING = "learning"
    REVIEW = "review"
    MASTERED = "mastered"


class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    outgoing_dependencies: Mapped[list["ConceptDependency"]] = relationship(
        "ConceptDependency",
        foreign_keys="ConceptDependency.source_concept_id",
        back_populates="source_concept",
        cascade="all, delete-orphan",
    )
    incoming_dependencies: Mapped[list["ConceptDependency"]] = relationship(
        "ConceptDependency",
        foreign_keys="ConceptDependency.target_concept_id",
        back_populates="target_concept",
        cascade="all, delete-orphan",
    )
    student_states: Mapped[list["StudentConceptState"]] = relationship("StudentConceptState", back_populates="concept", cascade="all, delete-orphan")


class ConceptDependency(Base):
    __tablename__ = "concept_dependencies"
    __table_args__ = (UniqueConstraint("source_concept_id", "target_concept_id", name="uq_concept_dependencies_source_target"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_concept_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    target_concept_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    relation_type: Mapped[str] = mapped_column(String(80), nullable=False, default="prerequisite")
    weight: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    source_concept: Mapped["Concept"] = relationship("Concept", foreign_keys=[source_concept_id], back_populates="outgoing_dependencies")
    target_concept: Mapped["Concept"] = relationship("Concept", foreign_keys=[target_concept_id], back_populates="incoming_dependencies")


class StudentConceptState(Base):
    __tablename__ = "student_concept_states"
    __table_args__ = (UniqueConstraint("student_id", "concept_id", name="uq_student_concept_states_student_concept"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    confidence_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    weakness_score: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    status: Mapped[ConceptStateStatus] = mapped_column(
        Enum(ConceptStateStatus, name="concept_state_status_enum", values_callable=lambda statuses: [status.value for status in statuses]),
        nullable=False,
        default=ConceptStateStatus.NEW,
        index=True,
    )
    last_practiced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    next_review_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    student: Mapped["Student"] = relationship("Student", back_populates="concept_states")
    concept: Mapped["Concept"] = relationship("Concept", back_populates="student_states")
