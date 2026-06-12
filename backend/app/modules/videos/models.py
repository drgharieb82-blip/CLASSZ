import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class VideoProvider(str, enum.Enum):
    LOCAL = "LOCAL"
    BUNNY = "BUNNY"
    MUX = "MUX"


class Video(Base):
    __tablename__ = "videos"
    __table_args__ = (UniqueConstraint("lesson_block_id", name="uq_videos_lesson_block_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_block_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lesson_blocks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    provider: Mapped[VideoProvider] = mapped_column(
        Enum(
            VideoProvider,
            name="video_provider_enum",
            values_callable=lambda providers: [provider.value for provider in providers],
        ),
        nullable=False,
    )
    provider_video_id: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    lesson_block: Mapped["LessonBlock"] = relationship("LessonBlock", back_populates="video")
