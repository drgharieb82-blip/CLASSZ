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


class SessionBlock(Base):
    __tablename__ = "session_blocks"
    __table_args__ = (UniqueConstraint("session_id", "position", name="uq_session_blocks_session_position"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="CASCADE"),
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

    session: Mapped["Session"] = relationship("Session", back_populates="blocks")
    video: Mapped["Video | None"] = relationship(
        "Video",
        back_populates="session_block",
        cascade="all, delete-orphan",
        uselist=False,
    )
