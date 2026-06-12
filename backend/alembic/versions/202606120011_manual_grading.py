"""manual grading foundation

Revision ID: 202606120011
Revises: 202606120010
Create Date: 2026-06-12 00:11:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120011"
down_revision: Union[str, None] = "202606120010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    grade_status_enum = postgresql.ENUM("PENDING", "GRADED", "RETURNED", name="grade_status_enum")
    grade_status_enum.create(op.get_bind(), checkfirst=True)
    grade_status_column_enum = postgresql.ENUM(
        "PENDING",
        "GRADED",
        "RETURNED",
        name="grade_status_enum",
        create_type=False,
    )

    op.create_table(
        "manual_grades",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("grader_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assignment_submission_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("question_result_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("max_score", sa.Integer(), nullable=False),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("status", grade_status_column_enum, nullable=False),
        sa.Column("graded_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "assignment_submission_id IS NOT NULL OR question_result_id IS NOT NULL",
            name="ck_manual_grades_has_source",
        ),
        sa.ForeignKeyConstraint(["assignment_submission_id"], ["assignment_submissions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["grader_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["question_result_id"], ["question_results.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_manual_grades_assignment_submission_id"), "manual_grades", ["assignment_submission_id"], unique=True)
    op.create_index(op.f("ix_manual_grades_grader_id"), "manual_grades", ["grader_id"], unique=False)
    op.create_index(op.f("ix_manual_grades_question_result_id"), "manual_grades", ["question_result_id"], unique=True)
    op.create_index(op.f("ix_manual_grades_status"), "manual_grades", ["status"], unique=False)
    op.create_index(op.f("ix_manual_grades_student_id"), "manual_grades", ["student_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_manual_grades_student_id"), table_name="manual_grades")
    op.drop_index(op.f("ix_manual_grades_status"), table_name="manual_grades")
    op.drop_index(op.f("ix_manual_grades_question_result_id"), table_name="manual_grades")
    op.drop_index(op.f("ix_manual_grades_grader_id"), table_name="manual_grades")
    op.drop_index(op.f("ix_manual_grades_assignment_submission_id"), table_name="manual_grades")
    op.drop_table("manual_grades")

    grade_status_enum = postgresql.ENUM(name="grade_status_enum")
    grade_status_enum.drop(op.get_bind(), checkfirst=True)
