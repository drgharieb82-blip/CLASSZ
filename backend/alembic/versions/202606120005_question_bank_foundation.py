"""question bank foundation

Revision ID: 202606120005
Revises: 202606120004
Create Date: 2026-06-12 00:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120005"
down_revision: Union[str, None] = "202606120004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    question_type_enum = postgresql.ENUM(
        "MCQ",
        "TRUE_FALSE",
        "MULTIPLE_SELECT",
        "FILL_BLANK",
        "MATCHING",
        "ORDERING",
        "ESSAY",
        name="question_type_enum",
    )
    question_type_enum.create(op.get_bind(), checkfirst=True)
    question_type_column_enum = postgresql.ENUM(
        "MCQ",
        "TRUE_FALSE",
        "MULTIPLE_SELECT",
        "FILL_BLANK",
        "MATCHING",
        "ORDERING",
        "ESSAY",
        name="question_type_enum",
        create_type=False,
    )

    difficulty_enum = postgresql.ENUM("EASY", "MEDIUM", "HARD", name="question_difficulty_enum")
    difficulty_enum.create(op.get_bind(), checkfirst=True)
    difficulty_column_enum = postgresql.ENUM(
        "EASY",
        "MEDIUM",
        "HARD",
        name="question_difficulty_enum",
        create_type=False,
    )

    op.create_table(
        "question_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_question_categories_name"), "question_categories", ["name"], unique=True)

    op.create_table(
        "question_tags",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_question_tags_name"), "question_tags", ["name"], unique=True)

    op.create_table(
        "questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("question_type", question_type_column_enum, nullable=False),
        sa.Column("difficulty", difficulty_column_enum, nullable=False),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["question_categories.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_questions_category_id"), "questions", ["category_id"], unique=False)
    op.create_index(op.f("ix_questions_difficulty"), "questions", ["difficulty"], unique=False)
    op.create_index(op.f("ix_questions_is_active"), "questions", ["is_active"], unique=False)
    op.create_index(op.f("ix_questions_question_type"), "questions", ["question_type"], unique=False)

    op.create_table(
        "question_choices",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("choice_text", sa.Text(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_question_choices_question_id"), "question_choices", ["question_id"], unique=False)

    op.create_table(
        "question_media",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_url", sa.String(length=500), nullable=False),
        sa.Column("media_type", sa.String(length=80), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_question_media_question_id"), "question_media", ["question_id"], unique=False)

    op.create_table(
        "question_tag_links",
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["question_tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("question_id", "tag_id"),
    )


def downgrade() -> None:
    op.drop_table("question_tag_links")
    op.drop_index(op.f("ix_question_media_question_id"), table_name="question_media")
    op.drop_table("question_media")
    op.drop_index(op.f("ix_question_choices_question_id"), table_name="question_choices")
    op.drop_table("question_choices")
    op.drop_index(op.f("ix_questions_question_type"), table_name="questions")
    op.drop_index(op.f("ix_questions_is_active"), table_name="questions")
    op.drop_index(op.f("ix_questions_difficulty"), table_name="questions")
    op.drop_index(op.f("ix_questions_category_id"), table_name="questions")
    op.drop_table("questions")
    op.drop_index(op.f("ix_question_tags_name"), table_name="question_tags")
    op.drop_table("question_tags")
    op.drop_index(op.f("ix_question_categories_name"), table_name="question_categories")
    op.drop_table("question_categories")

    difficulty_enum = postgresql.ENUM(name="question_difficulty_enum")
    difficulty_enum.drop(op.get_bind(), checkfirst=True)
    question_type_enum = postgresql.ENUM(name="question_type_enum")
    question_type_enum.drop(op.get_bind(), checkfirst=True)
