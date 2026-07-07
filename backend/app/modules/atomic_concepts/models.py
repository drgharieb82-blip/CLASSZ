import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.modules.sessions.models import session_atomic_concept_links


class AtomicConcept(Base):
    """Academic Domain: Course -> Chapter -> Lesson -> Concept -> Atomic
    Concept. The finest-grained node - structurally owned by a Concept."""

    __tablename__ = "atomic_concepts"
    __table_args__ = (UniqueConstraint("concept_id", "position", name="uq_atomic_concepts_concept_position"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    concept_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("concepts.id", ondelete="CASCADE"),
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

    concept: Mapped["Concept"] = relationship("Concept", back_populates="atomic_concepts")
    sessions: Mapped[list["Session"]] = relationship(
        "Session",
        secondary=session_atomic_concept_links,
        back_populates="atomic_concepts",
    )
