"""Academic Domain: lessons, concepts, atomic_concepts + session academic link tables.

Revision ID: 202607070003
Revises: 202607070002
Create Date: 2026-07-07

Builds the real Academic Domain hierarchy: Course -> Chapter (existing) ->
Lesson -> Concept -> Atomic Concept. Each level gets a real public_code via
a dedicated Postgres sequence, following the exact pattern already completed
for courses/chapters/sessions (see migration 202607070001). Also adds
session_lesson_links, session_concept_links, session_atomic_concept_links -
the same many-to-many shape as session_chapter_links (202607070002) - so a
Session can reference any combination of academic nodes without owning them.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607070003"
down_revision: Union[str, None] = "202607070002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for seq_name in ("seq_lesson_code", "seq_concept_code", "seq_atomic_concept_code"):
        op.execute(sa.text(f"CREATE SEQUENCE IF NOT EXISTS {seq_name} START WITH 1"))

    op.create_table(
        "lessons",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("chapter_id", "position", name="uq_lessons_chapter_position"),
        sa.UniqueConstraint("public_code", name="uq_lessons_public_code"),
    )
    op.create_index("ix_lessons_chapter_id", "lessons", ["chapter_id"], unique=False)

    op.create_table(
        "concepts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lesson_id", "position", name="uq_concepts_lesson_position"),
        sa.UniqueConstraint("public_code", name="uq_concepts_public_code"),
    )
    op.create_index("ix_concepts_lesson_id", "concepts", ["lesson_id"], unique=False)

    op.create_table(
        "atomic_concepts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("concept_id", "position", name="uq_atomic_concepts_concept_position"),
        sa.UniqueConstraint("public_code", name="uq_atomic_concepts_public_code"),
    )
    op.create_index("ix_atomic_concepts_concept_id", "atomic_concepts", ["concept_id"], unique=False)

    op.create_table(
        "session_lesson_links",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("session_id", "lesson_id"),
    )
    op.create_table(
        "session_concept_links",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("session_id", "concept_id"),
    )
    op.create_table(
        "session_atomic_concept_links",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("atomic_concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["atomic_concept_id"], ["atomic_concepts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("session_id", "atomic_concept_id"),
    )


def downgrade() -> None:
    op.drop_table("session_atomic_concept_links")
    op.drop_table("session_concept_links")
    op.drop_table("session_lesson_links")

    op.drop_index("ix_atomic_concepts_concept_id", table_name="atomic_concepts")
    op.drop_table("atomic_concepts")

    op.drop_index("ix_concepts_lesson_id", table_name="concepts")
    op.drop_table("concepts")

    op.drop_index("ix_lessons_chapter_id", table_name="lessons")
    op.drop_table("lessons")

    for seq_name in ("seq_atomic_concept_code", "seq_concept_code", "seq_lesson_code"):
        op.execute(sa.text(f"DROP SEQUENCE IF EXISTS {seq_name}"))
