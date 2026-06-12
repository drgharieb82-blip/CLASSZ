import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BlockType(str, enum.Enum):
    TEXT = "TEXT"
    PDF = "PDF"
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"
    ATTACHMENT = "ATTACHMENT"


class LessonBlock(Base):
    __tablename__ = "lesson_blocks"
    __table_args__ = (UniqueConstraint("lesson_id", "position", name="uq_lesson_blocks_lesson_position"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    block_type: Mapped[BlockType] = mapped_column(
        Enum(
            BlockType,
            name="block_type_enum",
            values_callable=lambda block_types: [block_type.value for block_type in block_types],
        ),
        nullable=False,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    data_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="blocks")
