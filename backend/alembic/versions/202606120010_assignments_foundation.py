"""assignments foundation

Revision ID: 202606120010
Revises: 202606120009
Create Date: 2026-06-12 00:10:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120010"
down_revision: Union[str, None] = "202606120009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    submission_status_enum = postgresql.ENUM("SUBMITTED", name="assignment_submission_status_enum")
    submission_status_enum.create(op.get_bind(), checkfirst=True)
    submission_status_column_enum = postgresql.ENUM(
        "SUBMITTED",
        name="assignment_submission_status_enum",
        create_type=False,
    )

    op.create_table(
        "assignments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deadline_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("max_points", sa.Integer(), nullable=False),
        sa.Column("allow_multiple_submissions", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_assignments_chapter_id"), "assignments", ["chapter_id"], unique=False)
    op.create_index(op.f("ix_assignments_course_id"), "assignments", ["course_id"], unique=False)
    op.create_index(op.f("ix_assignments_lesson_id"), "assignments", ["lesson_id"], unique=False)

    op.create_table(
        "assignment_submissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assignment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("submission_text", sa.Text(), nullable=True),
        sa.Column("status", submission_status_column_enum, nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["assignment_id"], ["assignments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_assignment_submissions_assignment_id"), "assignment_submissions", ["assignment_id"], unique=False)
    op.create_index(op.f("ix_assignment_submissions_status"), "assignment_submissions", ["status"], unique=False)
    op.create_index(op.f("ix_assignment_submissions_student_id"), "assignment_submissions", ["student_id"], unique=False)

    op.create_table(
        "submission_files",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("submission_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_url", sa.String(length=500), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["submission_id"], ["assignment_submissions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_submission_files_submission_id"), "submission_files", ["submission_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_submission_files_submission_id"), table_name="submission_files")
    op.drop_table("submission_files")
    op.drop_index(op.f("ix_assignment_submissions_student_id"), table_name="assignment_submissions")
    op.drop_index(op.f("ix_assignment_submissions_status"), table_name="assignment_submissions")
    op.drop_index(op.f("ix_assignment_submissions_assignment_id"), table_name="assignment_submissions")
    op.drop_table("assignment_submissions")
    op.drop_index(op.f("ix_assignments_lesson_id"), table_name="assignments")
    op.drop_index(op.f("ix_assignments_course_id"), table_name="assignments")
    op.drop_index(op.f("ix_assignments_chapter_id"), table_name="assignments")
    op.drop_table("assignments")

    submission_status_enum = postgresql.ENUM(name="assignment_submission_status_enum")
    submission_status_enum.drop(op.get_bind(), checkfirst=True)
