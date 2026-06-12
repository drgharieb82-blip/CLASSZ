"""quiz player attempts

Revision ID: 202606120007
Revises: 202606120006
Create Date: 2026-06-12 00:07:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120007"
down_revision: Union[str, None] = "202606120006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    attempt_status_enum = postgresql.ENUM("IN_PROGRESS", "SUBMITTED", name="quiz_attempt_status_enum")
    attempt_status_enum.create(op.get_bind(), checkfirst=True)
    attempt_status_column_enum = postgresql.ENUM(
        "IN_PROGRESS",
        "SUBMITTED",
        name="quiz_attempt_status_enum",
        create_type=False,
    )

    op.create_table(
        "quiz_attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quiz_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", attempt_status_column_enum, nullable=False),
        sa.ForeignKeyConstraint(["quiz_id"], ["quizzes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_quiz_attempts_quiz_id"), "quiz_attempts", ["quiz_id"], unique=False)
    op.create_index(op.f("ix_quiz_attempts_status"), "quiz_attempts", ["status"], unique=False)
    op.create_index(op.f("ix_quiz_attempts_student_id"), "quiz_attempts", ["student_id"], unique=False)

    op.create_table(
        "quiz_answers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("attempt_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("answer_data", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["attempt_id"], ["quiz_attempts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("attempt_id", "question_id", name="uq_quiz_answers_attempt_question"),
    )
    op.create_index(op.f("ix_quiz_answers_attempt_id"), "quiz_answers", ["attempt_id"], unique=False)
    op.create_index(op.f("ix_quiz_answers_question_id"), "quiz_answers", ["question_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_quiz_answers_question_id"), table_name="quiz_answers")
    op.drop_index(op.f("ix_quiz_answers_attempt_id"), table_name="quiz_answers")
    op.drop_table("quiz_answers")
    op.drop_index(op.f("ix_quiz_attempts_student_id"), table_name="quiz_attempts")
    op.drop_index(op.f("ix_quiz_attempts_status"), table_name="quiz_attempts")
    op.drop_index(op.f("ix_quiz_attempts_quiz_id"), table_name="quiz_attempts")
    op.drop_table("quiz_attempts")

    attempt_status_enum = postgresql.ENUM(name="quiz_attempt_status_enum")
    attempt_status_enum.drop(op.get_bind(), checkfirst=True)
