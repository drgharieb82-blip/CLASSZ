"""Sessions belong directly to Courses; Chapter becomes a many-to-many academic tag.

Revision ID: 202607070002
Revises: 202607070001
Create Date: 2026-07-07

Product correction: a Session is a Delivery Domain orchestration unit
(Course -> Session 1, Session 2, ...), never owned by a single Chapter. A
session may reference any combination of chapters (and, once built in a
later migration, lessons/concepts/atomic concepts) from the Academic Domain
- e.g. a revision session spanning several chapters. This migration:
  1. Adds sessions.course_id (backfilled from the existing chapter -> course
     link) as the real structural parent.
  2. Introduces session_chapter_links, a many-to-many table, as the first of
     a family of identically-shaped tables (session_lesson_links,
     session_concept_links, session_atomic_concept_links follow later with
     the same pattern once those academic tables exist).
  3. Drops sessions.chapter_id - the single-parent relationship is gone.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607070002"
down_revision: Union[str, None] = "202607070001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. sessions.course_id, backfilled via the existing chapter_id -> course_id join ──
    op.add_column("sessions", sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.execute("""
        UPDATE sessions SET course_id = chapters.course_id
        FROM chapters WHERE sessions.chapter_id = chapters.id
    """)
    op.alter_column("sessions", "course_id", nullable=False)
    op.create_foreign_key("sessions_course_id_fkey", "sessions", "courses", ["course_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_sessions_course_id", "sessions", ["course_id"], unique=False)

    # ── 2. session_chapter_links (first of the session_<level>_links family) ──
    op.create_table(
        "session_chapter_links",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("session_id", "chapter_id"),
    )

    # Preserve the existing chapter_id relationship as a link-table row before dropping the column.
    op.execute("""
        INSERT INTO session_chapter_links (session_id, chapter_id)
        SELECT id, chapter_id FROM sessions WHERE chapter_id IS NOT NULL
    """)

    # ── 3. Drop the old single-parent chapter_id column ──
    op.drop_constraint("uq_sessions_chapter_position", "sessions", type_="unique")
    op.drop_index("ix_sessions_chapter_id", table_name="sessions")
    op.drop_constraint("sessions_chapter_id_fkey", "sessions", type_="foreignkey")
    op.drop_column("sessions", "chapter_id")
    op.create_unique_constraint("uq_sessions_course_position", "sessions", ["course_id", "position"])


def downgrade() -> None:
    op.add_column("sessions", sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.execute("""
        UPDATE sessions SET chapter_id = (
            SELECT chapter_id FROM session_chapter_links WHERE session_chapter_links.session_id = sessions.id LIMIT 1
        )
    """)
    op.drop_constraint("uq_sessions_course_position", "sessions", type_="unique")
    op.create_foreign_key("sessions_chapter_id_fkey", "sessions", "chapters", ["chapter_id"], ["id"], ondelete="CASCADE")
    op.alter_column("sessions", "chapter_id", nullable=False)
    op.create_index("ix_sessions_chapter_id", "sessions", ["chapter_id"], unique=False)
    op.create_unique_constraint("uq_sessions_chapter_position", "sessions", ["chapter_id", "position"])

    op.drop_table("session_chapter_links")

    op.drop_index("ix_sessions_course_id", table_name="sessions")
    op.drop_constraint("sessions_course_id_fkey", "sessions", type_="foreignkey")
    op.drop_column("sessions", "course_id")
