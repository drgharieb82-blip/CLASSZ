from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.assignments.schemas import AssignmentSubmissionRead
from app.modules.grading.models import GradeStatus
from app.modules.results.schemas import QuestionResultRead


class ManualGradeAction(BaseModel):
    grader_id: UUID
    score: int = Field(default=0, ge=0)
    feedback: str | None = None


class ManualGradeReturn(BaseModel):
    grader_id: UUID
    feedback: str | None = None


class ManualGradeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    grader_id: UUID | None
    student_id: UUID
    assignment_submission_id: UUID | None
    question_result_id: UUID | None
    score: int
    max_score: int
    feedback: str | None
    status: GradeStatus
    graded_at: datetime | None
    assignment_submission: AssignmentSubmissionRead | None = None
    question_result: QuestionResultRead | None = None
    student_answer: dict[str, Any] | None = None
