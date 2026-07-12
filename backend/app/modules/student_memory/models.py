import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class NoteImportance(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class NoteSmartType(str, enum.Enum):
    CHEMISTRY_EQUATION = "chemistry-equation"
    PHYSICS_LAW = "physics-law"
    MATH_FORMULA = "math-formula"
    DEFINITION = "definition"
    QUESTION = "question"
    GENERAL = "general"


class StudentNote(Base):
    __tablename__ = "student_notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    subject_name: Mapped[str] = mapped_column(String(160), nullable=False)
    course_name: Mapped[str] = mapped_column(String(220), nullable=False)
    session_title: Mapped[str] = mapped_column(String(220), nullable=False)
    session_item_title: Mapped[str] = mapped_column(String(220), nullable=False)
    session_item_id: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    item_type: Mapped[str] = mapped_column(String(60), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[str] = mapped_column(Text, nullable=False, default="")
    importance: Mapped[NoteImportance] = mapped_column(
        Enum(
            NoteImportance,
            name="student_note_importance_enum",
            values_callable=lambda values: [value.value for value in values],
        ),
        nullable=False,
        default=NoteImportance.LOW,
        index=True,
    )
    smart_type: Mapped[NoteSmartType] = mapped_column(
        Enum(
            NoteSmartType,
            name="student_note_smart_type_enum",
            values_callable=lambda values: [value.value for value in values],
        ),
        nullable=False,
        default=NoteSmartType.GENERAL,
        index=True,
    )
    pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class StudentQuestionBookmark(Base):
    __tablename__ = "student_question_bookmarks"
    __table_args__ = (
        UniqueConstraint("student_id", "question_id", name="uq_student_question_bookmarks_student_question"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_bookmarked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
