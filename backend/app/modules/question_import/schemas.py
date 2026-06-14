from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.question_import.models import ImportJobStatus, ImportSourceType


class ImportErrorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    job_id: UUID
    row_number: int
    field_name: str | None = None
    message: str
    created_at: datetime


class ImportSummaryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    job_id: UUID
    total_rows: int
    valid_rows: int
    invalid_rows: int
    committed_rows: int
    skipped_rows: int
    created_at: datetime
    updated_at: datetime


class ImportJobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    filename: str
    source_type: ImportSourceType
    status: ImportJobStatus
    raw_rows: list[dict] = Field(default_factory=list)
    preview_rows: list[dict] = Field(default_factory=list)
    created_question_ids: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    errors: list[ImportErrorRead] = Field(default_factory=list)
    summary: ImportSummaryRead | None = None


class ImportUploadResponse(BaseModel):
    job_id: UUID
    filename: str
    source_type: ImportSourceType
    total_rows: int


class ImportPreviewRequest(BaseModel):
    job_id: UUID


class ImportCommitRequest(BaseModel):
    job_id: UUID


class ImportPreviewResponse(BaseModel):
    job: ImportJobRead


class ImportCommitResponse(BaseModel):
    job: ImportJobRead
