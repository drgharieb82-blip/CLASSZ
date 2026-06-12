import enum
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GradeStatus(str, enum.Enum):
    PENDING = "PENDING"
    GRADED = "GRADED"
    RETURNED = "RETURNED"


class ManualGrade(Base):
    __tablename__ = "manual_grades"
    __table_args__ = (
        CheckConstraint(
            "assignment_submission_id IS NOT NULL OR question_result_id IS NOT NULL",
            name="ck_manual_grades_has_source",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grader_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assignment_submission_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assignment_submissions.id", ondelete="CASCADE"),
        nullable=True,
        unique=True,
        index=True,
    )
    question_result_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_results.id", ondelete="CASCADE"),
        nullable=True,
        unique=True,
        index=True,
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[GradeStatus] = mapped_column(
        Enum(
            GradeStatus,
            name="grade_status_enum",
            values_callable=lambda statuses: [status.value for status in statuses],
        ),
        nullable=False,
        default=GradeStatus.PENDING,
        index=True,
    )
    graded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    assignment_submission: Mapped["AssignmentSubmission | None"] = relationship("AssignmentSubmission")
    question_result: Mapped["QuestionResult | None"] = relationship("QuestionResult")
