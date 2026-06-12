"""scheduling progress

Revision ID: 202606120004
Revises: 202606120003
Create Date: 2026-06-12 00:04:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120004"
down_revision: Union[str, None] = "202606120003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "lessons",
        sa.Column("requires_previous_completion", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("lessons", sa.Column("is_locked", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column("lessons", "requires_previous_completion", server_default=None)
    op.alter_column("lessons", "is_locked", server_default=None)

    op.create_table(
        "lesson_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("percent_complete", sa.Integer(), nullable=False),
        sa.Column("last_position_seconds", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", "lesson_id", name="uq_lesson_progress_student_lesson"),
    )
    op.create_index(op.f("ix_lesson_progress_lesson_id"), "lesson_progress", ["lesson_id"], unique=False)
    op.create_index(op.f("ix_lesson_progress_student_id"), "lesson_progress", ["student_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_lesson_progress_student_id"), table_name="lesson_progress")
    op.drop_index(op.f("ix_lesson_progress_lesson_id"), table_name="lesson_progress")
    op.drop_table("lesson_progress")
    op.drop_column("lessons", "is_locked")
    op.drop_column("lessons", "requires_previous_completion")
