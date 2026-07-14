import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.modules.sessions.models import session_concept_links


class Concept(Base):
    """Academic Domain: Course -> Chapter -> Lesson -> Concept -> Atomic
    Concept. Structurally owned by a Lesson."""

    __tablename__ = "concepts"
    __table_args__ = (UniqueConstraint("lesson_id", "position", name="uq_concepts_lesson_position"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="concepts")
    atomic_concepts: Mapped[list["AtomicConcept"]] = relationship(
        "AtomicConcept",
        back_populates="concept",
        cascade="all, delete-orphan",
        order_by="AtomicConcept.position",
    )
    sessions: Mapped[list["Session"]] = relationship(
        "Session",
        secondary=session_concept_links,
        back_populates="concepts",
    )
