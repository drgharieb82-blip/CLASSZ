import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Enum, ForeignKey, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AntiCheatingEventType(str, enum.Enum):
    FOCUS_LOST = "FOCUS_LOST"
    FOCUS_RETURNED = "FOCUS_RETURNED"
    TAB_SWITCHED = "TAB_SWITCHED"
    COPY_ATTEMPT = "COPY_ATTEMPT"
    PASTE_ATTEMPT = "PASTE_ATTEMPT"
    FULLSCREEN_EXIT = "FULLSCREEN_EXIT"
    AUTO_SUBMIT = "AUTO_SUBMIT"


class AntiCheatingEvent(Base):
    __tablename__ = "anti_cheating_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("quiz_attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[AntiCheatingEventType] = mapped_column(
        Enum(
            AntiCheatingEventType,
            name="anti_cheating_event_type_enum",
            values_callable=lambda event_types: [event_type.value for event_type in event_types],
        ),
        nullable=False,
        index=True,
    )
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    attempt: Mapped["QuizAttempt"] = relationship("QuizAttempt")
