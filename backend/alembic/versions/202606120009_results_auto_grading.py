"""results auto grading

Revision ID: 202606120009
Revises: 202606120008
Create Date: 2026-06-12 00:09:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120009"
down_revision: Union[str, None] = "202606120008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "quiz_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("attempt_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("max_score", sa.Integer(), nullable=False),
        sa.Column("percentage", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("passed", sa.Boolean(), nullable=False),
        sa.Column("graded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["attempt_id"], ["quiz_attempts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("attempt_id", name="uq_quiz_results_attempt_id"),
    )
    op.create_index(op.f("ix_quiz_results_attempt_id"), "quiz_results", ["attempt_id"], unique=False)

    op.create_table(
        "question_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quiz_result_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("earned_points", sa.Integer(), nullable=False),
        sa.Column("max_points", sa.Integer(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("pending_manual_review", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["quiz_result_id"], ["quiz_results.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("quiz_result_id", "question_id", name="uq_question_results_result_question"),
    )
    op.create_index(op.f("ix_question_results_question_id"), "question_results", ["question_id"], unique=False)
    op.create_index(op.f("ix_question_results_quiz_result_id"), "question_results", ["quiz_result_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_question_results_quiz_result_id"), table_name="question_results")
    op.drop_index(op.f("ix_question_results_question_id"), table_name="question_results")
    op.drop_table("question_results")
    op.drop_index(op.f("ix_quiz_results_attempt_id"), table_name="quiz_results")
    op.drop_table("quiz_results")
