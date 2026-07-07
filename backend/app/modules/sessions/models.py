import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

# Session <-> Academic Domain link tables. All four follow the identical
# shape on purpose: a Session references any combination of chapters,
# lessons, concepts, and atomic concepts (e.g. a revision session spanning
# several chapters) - none of them are structural parents of Session.
session_chapter_links = Table(
    "session_chapter_links",
    Base.metadata,
    Column("session_id", UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), primary_key=True),
    Column("chapter_id", UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), primary_key=True),
)

session_lesson_links = Table(
    "session_lesson_links",
    Base.metadata,
    Column("session_id", UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), primary_key=True),
    Column("lesson_id", UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), primary_key=True),
)

session_concept_links = Table(
    "session_concept_links",
    Base.metadata,
    Column("session_id", UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), primary_key=True),
    Column("concept_id", UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="CASCADE"), primary_key=True),
)

session_atomic_concept_links = Table(
    "session_atomic_concept_links",
    Base.metadata,
    Column("session_id", UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), primary_key=True),
    Column("atomic_concept_id", UUID(as_uuid=True), ForeignKey("atomic_concepts.id", ondelete="CASCADE"), primary_key=True),
)


class Session(Base):
    """A Session is an orchestration layer in the Delivery Domain - the unit a
    student books/attends (Course -> Session 1, Session 2, ...). It belongs
    directly to a Course, not to a Chapter. It may freely reference any
    combination of chapters, lessons, concepts, and atomic concepts from the
    Academic Domain via many-to-many link tables - e.g. a revision session
    can span several chapters at once. The Session entity itself carries no
    academic content or FK columns - only these link tables."""

    __tablename__ = "sessions"
    __table_args__ = (UniqueConstraint("course_id", "position", name="uq_sessions_course_position"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    is_free_preview: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    release_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hide_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    requires_previous_completion: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    course: Mapped["Course"] = relationship("Course", back_populates="sessions")
    chapters: Mapped[list["Chapter"]] = relationship(
        "Chapter",
        secondary=session_chapter_links,
        back_populates="sessions",
    )
    lessons: Mapped[list["Lesson"]] = relationship(
        "Lesson",
        secondary=session_lesson_links,
        back_populates="sessions",
    )
    concepts: Mapped[list["Concept"]] = relationship(
        "Concept",
        secondary=session_concept_links,
        back_populates="sessions",
    )
    atomic_concepts: Mapped[list["AtomicConcept"]] = relationship(
        "AtomicConcept",
        secondary=session_atomic_concept_links,
        back_populates="sessions",
    )
    blocks: Mapped[list["SessionBlock"]] = relationship(
        "SessionBlock",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="SessionBlock.position",
    )
    progress_records: Mapped[list["SessionProgress"]] = relationship(
        "SessionProgress",
        back_populates="session",
        cascade="all, delete-orphan",
    )
