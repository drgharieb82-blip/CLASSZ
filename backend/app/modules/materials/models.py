import enum
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, Integer, String, Table, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

material_chapter_links = Table(
    "material_chapter_links",
    Base.metadata,
    Column("material_id", UUID(as_uuid=True), ForeignKey("materials.id", ondelete="CASCADE"), primary_key=True),
    Column("chapter_id", UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), primary_key=True),
)
material_lesson_links = Table(
    "material_lesson_links",
    Base.metadata,
    Column("material_id", UUID(as_uuid=True), ForeignKey("materials.id", ondelete="CASCADE"), primary_key=True),
    Column("lesson_id", UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), primary_key=True),
)
material_concept_links = Table(
    "material_concept_links",
    Base.metadata,
    Column("material_id", UUID(as_uuid=True), ForeignKey("materials.id", ondelete="CASCADE"), primary_key=True),
    Column("concept_id", UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="CASCADE"), primary_key=True),
)
material_atomic_concept_links = Table(
    "material_atomic_concept_links",
    Base.metadata,
    Column("material_id", UUID(as_uuid=True), ForeignKey("materials.id", ondelete="CASCADE"), primary_key=True),
    Column("atomic_concept_id", UUID(as_uuid=True), ForeignKey("atomic_concepts.id", ondelete="CASCADE"), primary_key=True),
)


class MaterialType(str, enum.Enum):
    video = "video"
    pdf = "pdf"
    image = "image"
    notes = "notes"
    attachment = "attachment"
    document = "document"
    audio = "audio"


class MaterialStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class MaterialAccessType(str, enum.Enum):
    view = "view"
    download = "download"


class Material(Base):
    """Course-scoped content library entity. References the real Academic
    Domain (chapters/lessons/concepts/atomic_concepts) via pure many-to-many
    link tables, mirroring the Session <-> Academic Domain pattern in
    sessions/models.py. Deliberately one-directional (no back_populates on
    the Chapter/Lesson/Concept/AtomicConcept side) so the frozen Academic
    Domain model files are never touched."""

    __tablename__ = "materials"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    type: Mapped[MaterialType] = mapped_column(Enum(MaterialType, name="material_type_enum"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[MaterialStatus] = mapped_column(
        Enum(MaterialStatus, name="material_status_enum"), nullable=False, default=MaterialStatus.draft
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    chapters: Mapped[list["Chapter"]] = relationship("Chapter", secondary=material_chapter_links)
    lessons: Mapped[list["Lesson"]] = relationship("Lesson", secondary=material_lesson_links)
    concepts: Mapped[list["Concept"]] = relationship("Concept", secondary=material_concept_links)
    atomic_concepts: Mapped[list["AtomicConcept"]] = relationship("AtomicConcept", secondary=material_atomic_concept_links)


class MaterialAccessLog(Base):
    __tablename__ = "material_access_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    access_type: Mapped[MaterialAccessType] = mapped_column(
        Enum(
            MaterialAccessType,
            name="material_access_type_enum",
            values_callable=lambda access_types: [access_type.value for access_type in access_types],
        ),
        nullable=False,
        default=MaterialAccessType.view,
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accessed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
