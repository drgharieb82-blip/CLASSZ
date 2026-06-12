"""academic core

Revision ID: 202606120002
Revises: 202606120001
Create Date: 2026-06-12 00:02:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120002"
down_revision: Union[str, None] = "202606120001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    block_type_enum = postgresql.ENUM(
        "TEXT",
        "PDF",
        "IMAGE",
        "VIDEO",
        "ATTACHMENT",
        name="block_type_enum",
    )
    block_type_enum.create(op.get_bind(), checkfirst=True)
    block_type_column_enum = postgresql.ENUM(
        "TEXT",
        "PDF",
        "IMAGE",
        "VIDEO",
        "ATTACHMENT",
        name="block_type_enum",
        create_type=False,
    )

    op.create_table(
        "courses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=220), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("thumbnail_url", sa.String(length=500), nullable=True),
        sa.Column("subject", sa.String(length=120), nullable=False),
        sa.Column("grade", sa.String(length=80), nullable=False),
        sa.Column("teacher_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("is_published", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_courses_slug"), "courses", ["slug"], unique=True)
    op.create_index(op.f("ix_courses_teacher_id"), "courses", ["teacher_id"], unique=False)

    op.create_table(
        "chapters",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("course_id", "position", name="uq_chapters_course_position"),
    )
    op.create_index(op.f("ix_chapters_course_id"), "chapters", ["course_id"], unique=False)

    op.create_table(
        "lessons",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("is_free_preview", sa.Boolean(), nullable=False),
        sa.Column("release_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hide_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("chapter_id", "position", name="uq_lessons_chapter_position"),
    )
    op.create_index(op.f("ix_lessons_chapter_id"), "lessons", ["chapter_id"], unique=False)

    op.create_table(
        "lesson_blocks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("block_type", block_type_column_enum, nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("data_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lesson_id", "position", name="uq_lesson_blocks_lesson_position"),
    )
    op.create_index(op.f("ix_lesson_blocks_lesson_id"), "lesson_blocks", ["lesson_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_lesson_blocks_lesson_id"), table_name="lesson_blocks")
    op.drop_table("lesson_blocks")
    op.drop_index(op.f("ix_lessons_chapter_id"), table_name="lessons")
    op.drop_table("lessons")
    op.drop_index(op.f("ix_chapters_course_id"), table_name="chapters")
    op.drop_table("chapters")
    op.drop_index(op.f("ix_courses_teacher_id"), table_name="courses")
    op.drop_index(op.f("ix_courses_slug"), table_name="courses")
    op.drop_table("courses")

    block_type_enum = postgresql.ENUM(name="block_type_enum")
    block_type_enum.drop(op.get_bind(), checkfirst=True)
