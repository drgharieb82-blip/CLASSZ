import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.modules.sessions.models import session_lesson_links


class Lesson(Base):
    """Academic Domain: Course -> Chapter -> Lesson -> Concept -> Atomic
    Concept. A Lesson is a curriculum topic, structurally owned by a Chapter -
    not to be confused with a Session (the Delivery Domain's schedulable
    class unit), which merely references lessons via session_lesson_links."""

    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("chapter_id", "position", name="uq_lessons_chapter_position"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    chapter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chapters.id", ondelete="CASCADE"),
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

    chapter: Mapped["Chapter"] = relationship("Chapter", back_populates="lessons")
    concepts: Mapped[list["Concept"]] = relationship(
        "Concept",
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="Concept.position",
    )
    sessions: Mapped[list["Session"]] = relationship(
        "Session",
        secondary=session_lesson_links,
        back_populates="lessons",
    )
