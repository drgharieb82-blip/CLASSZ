"""question bank live links

Revision ID: 202607100002
Revises: 202607100001
Create Date: 2026-07-10 10:00:02.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607100002"
down_revision: Union[str, None] = "202607100001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("questions", sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("questions", sa.Column("answer_data_json", sa.JSON(), nullable=True))
    op.create_index(op.f("ix_questions_course_id"), "questions", ["course_id"], unique=False)
    op.create_foreign_key(
        "fk_questions_course_id_courses",
        "questions",
        "courses",
        ["course_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_table(
        "question_chapter_links",
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("question_id", "chapter_id"),
    )
    op.create_table(
        "question_lesson_links",
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("question_id", "lesson_id"),
    )
    op.create_table(
        "question_concept_links",
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("question_id", "concept_id"),
    )
    op.create_table(
        "question_atomic_concept_links",
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("atomic_concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["atomic_concept_id"], ["atomic_concepts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("question_id", "atomic_concept_id"),
    )


def downgrade() -> None:
    op.drop_table("question_atomic_concept_links")
    op.drop_table("question_concept_links")
    op.drop_table("question_lesson_links")
    op.drop_table("question_chapter_links")
    op.drop_constraint("fk_questions_course_id_courses", "questions", type_="foreignkey")
    op.drop_index(op.f("ix_questions_course_id"), table_name="questions")
    op.drop_column("questions", "answer_data_json")
    op.drop_column("questions", "course_id")
