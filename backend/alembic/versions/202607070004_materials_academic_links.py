"""Materials <-> Academic Domain link tables.

Revision ID: 202607070004
Revises: 202607070003
Create Date: 2026-07-07

Knowledge Graph Integration, Milestone 1: adds the real `materials` entity
plus material_chapter_links / material_lesson_links / material_concept_links
/ material_atomic_concept_links - the same many-to-many shape as the
session_*_links tables (202607070002 / 202607070003) - so a Material can
reference any combination of academic nodes without owning or duplicating
them. The Academic Domain tables themselves (chapters/lessons/concepts/
atomic_concepts) are untouched.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607070004"
down_revision: Union[str, None] = "202607070003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

material_type_enum = postgresql.ENUM("video", "pdf", "image", "notes", "attachment", name="material_type_enum")
material_status_enum = postgresql.ENUM("draft", "published", name="material_status_enum")


def upgrade() -> None:
    op.execute(sa.text("CREATE SEQUENCE IF NOT EXISTS seq_material_code START WITH 1"))

    op.create_table(
        "materials",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", material_type_enum, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("file_url", sa.String(length=500), nullable=True),
        sa.Column("video_url", sa.String(length=500), nullable=True),
        sa.Column("notes_content", sa.Text(), nullable=True),
        sa.Column("status", material_status_enum, nullable=False, server_default="draft"),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_code", name="uq_materials_public_code"),
    )
    op.create_index("ix_materials_course_id", "materials", ["course_id"], unique=False)

    op.create_table(
        "material_chapter_links",
        sa.Column("material_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["material_id"], ["materials.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("material_id", "chapter_id"),
    )
    op.create_table(
        "material_lesson_links",
        sa.Column("material_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["material_id"], ["materials.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("material_id", "lesson_id"),
    )
    op.create_table(
        "material_concept_links",
        sa.Column("material_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["material_id"], ["materials.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("material_id", "concept_id"),
    )
    op.create_table(
        "material_atomic_concept_links",
        sa.Column("material_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("atomic_concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["material_id"], ["materials.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["atomic_concept_id"], ["atomic_concepts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("material_id", "atomic_concept_id"),
    )


def downgrade() -> None:
    op.drop_table("material_atomic_concept_links")
    op.drop_table("material_concept_links")
    op.drop_table("material_lesson_links")
    op.drop_table("material_chapter_links")

    op.drop_index("ix_materials_course_id", table_name="materials")
    op.drop_table("materials")

    material_status_enum.drop(op.get_bind(), checkfirst=True)
    material_type_enum.drop(op.get_bind(), checkfirst=True)

    op.execute(sa.text("DROP SEQUENCE IF EXISTS seq_material_code"))
