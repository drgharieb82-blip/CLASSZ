import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ImportJobStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PREVIEWED = "previewed"
    COMMITTED = "committed"
    FAILED = "failed"


class ImportSourceType(str, enum.Enum):
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"


def enum_values(values: type[enum.Enum]) -> list[str]:
    return [value.value for value in values]


class ImportJob(Base):
    __tablename__ = "question_import_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[ImportSourceType] = mapped_column(
        Enum(ImportSourceType, name="question_import_source_type_enum", values_callable=enum_values),
        nullable=False,
        index=True,
    )
    status: Mapped[ImportJobStatus] = mapped_column(
        Enum(ImportJobStatus, name="question_import_job_status_enum", values_callable=enum_values),
        nullable=False,
        default=ImportJobStatus.UPLOADED,
        index=True,
    )
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    raw_rows: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    preview_rows: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    created_question_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    errors: Mapped[list["ImportError"]] = relationship("ImportError", back_populates="job", cascade="all, delete-orphan")
    summary: Mapped["ImportSummary | None"] = relationship("ImportSummary", back_populates="job", cascade="all, delete-orphan", uselist=False)


class ImportError(Base):
    __tablename__ = "question_import_errors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("question_import_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    field_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    job: Mapped["ImportJob"] = relationship("ImportJob", back_populates="errors")


class ImportSummary(Base):
    __tablename__ = "question_import_summaries"

    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("question_import_jobs.id", ondelete="CASCADE"), primary_key=True)
    total_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    valid_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    invalid_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    committed_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skipped_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    job: Mapped["ImportJob"] = relationship("ImportJob", back_populates="summary")
