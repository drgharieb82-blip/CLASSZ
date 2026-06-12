import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Lesson(Base):
    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("chapter_id", "position", name="uq_lessons_chapter_position"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chapters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    is_free_preview: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    release_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hide_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    chapter: Mapped["Chapter"] = relationship("Chapter", back_populates="lessons")
    blocks: Mapped[list["LessonBlock"]] = relationship(
        "LessonBlock",
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="LessonBlock.position",
    )
