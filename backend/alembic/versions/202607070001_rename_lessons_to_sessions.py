"""Rename lessons domain to sessions; add public_code to courses/chapters/sessions.

Revision ID: 202607070001
Revises: 202607060001
Create Date: 2026-07-07

Domain reconciliation: the "lessons" table has always modeled a schedulable,
priced, lockable class unit (is_free_preview, release_at, hide_at, is_locked) -
i.e. a Session, not a curriculum topic. Every real consumer (frontend and
backend) already treated it as such. This migration renames it to its true
name so the "lessons" name is free for the real Academic Domain entity built
in a later migration.

Also completes the public-code identity rollout for courses/chapters/sessions,
reusing the seq_course_code/seq_chapter_code/seq_session_code sequences that
migration 202606210001 already created but never wired up (same situation
seq_teacher_code was in before it was fixed for users).
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "202607070001"
down_revision: Union[str, None] = "202607060001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. lessons -> sessions ──
    op.rename_table("lessons", "sessions")
    op.execute("ALTER TABLE sessions RENAME CONSTRAINT uq_lessons_chapter_position TO uq_sessions_chapter_position")
    op.execute("ALTER INDEX ix_lessons_chapter_id RENAME TO ix_sessions_chapter_id")
    op.execute("ALTER TABLE sessions RENAME CONSTRAINT lessons_pkey TO sessions_pkey")
    op.execute("ALTER TABLE sessions RENAME CONSTRAINT lessons_chapter_id_fkey TO sessions_chapter_id_fkey")

    # ── 2. lesson_blocks -> session_blocks (table + lesson_id -> session_id) ──
    op.rename_table("lesson_blocks", "session_blocks")
    op.alter_column("session_blocks", "lesson_id", new_column_name="session_id")
    op.execute("ALTER TABLE session_blocks RENAME CONSTRAINT uq_lesson_blocks_lesson_position TO uq_session_blocks_session_position")
    op.execute("ALTER INDEX ix_lesson_blocks_lesson_id RENAME TO ix_session_blocks_session_id")
    op.execute("ALTER TABLE session_blocks RENAME CONSTRAINT lesson_blocks_pkey TO session_blocks_pkey")
    op.execute("ALTER TABLE session_blocks RENAME CONSTRAINT lesson_blocks_lesson_id_fkey TO session_blocks_session_id_fkey")

    # ── 3. videos.lesson_block_id -> session_block_id ──
    op.alter_column("videos", "lesson_block_id", new_column_name="session_block_id")
    op.execute("ALTER TABLE videos RENAME CONSTRAINT uq_videos_lesson_block_id TO uq_videos_session_block_id")
    op.execute("ALTER INDEX ix_videos_lesson_block_id RENAME TO ix_videos_session_block_id")
    op.execute("ALTER TABLE videos RENAME CONSTRAINT videos_lesson_block_id_fkey TO videos_session_block_id_fkey")

    # ── 4. assignments.lesson_id -> session_id ──
    op.alter_column("assignments", "lesson_id", new_column_name="session_id")
    op.execute("ALTER INDEX ix_assignments_lesson_id RENAME TO ix_assignments_session_id")
    op.execute("ALTER TABLE assignments RENAME CONSTRAINT assignments_lesson_id_fkey TO assignments_session_id_fkey")

    # ── 5. quizzes.lesson_id -> session_id ──
    op.alter_column("quizzes", "lesson_id", new_column_name="session_id")
    op.execute("ALTER INDEX ix_quizzes_lesson_id RENAME TO ix_quizzes_session_id")
    op.execute("ALTER TABLE quizzes RENAME CONSTRAINT quizzes_lesson_id_fkey TO quizzes_session_id_fkey")

    # ── 6. lesson_progress -> session_progress (table + lesson_id -> session_id) ──
    op.rename_table("lesson_progress", "session_progress")
    op.alter_column("session_progress", "lesson_id", new_column_name="session_id")
    op.execute("ALTER TABLE session_progress RENAME CONSTRAINT uq_lesson_progress_student_lesson TO uq_session_progress_student_session")
    op.execute("ALTER INDEX ix_lesson_progress_lesson_id RENAME TO ix_session_progress_session_id")
    op.execute("ALTER INDEX ix_lesson_progress_student_id RENAME TO ix_session_progress_student_id")
    op.execute("ALTER TABLE session_progress RENAME CONSTRAINT lesson_progress_pkey TO session_progress_pkey")
    op.execute("ALTER TABLE session_progress RENAME CONSTRAINT lesson_progress_lesson_id_fkey TO session_progress_session_id_fkey")
    op.execute("ALTER TABLE session_progress RENAME CONSTRAINT lesson_progress_student_id_fkey TO session_progress_student_id_fkey")

    # ── 7. public_code for courses, chapters, sessions (sequences already exist) ──
    for table, prefix, seq in [("courses", "CRS", "seq_course_code"), ("chapters", "CHP", "seq_chapter_code"), ("sessions", "SES", "seq_session_code")]:
        op.add_column(table, sa.Column("public_code", sa.String(20), nullable=True))
        op.create_index(f"ix_{table}_public_code", table, ["public_code"], unique=True)
        op.execute(f"""
            WITH ordered AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS seq
                FROM {table}
                WHERE public_code IS NULL
            )
            UPDATE {table} SET public_code = '{prefix}-' || TO_CHAR(EXTRACT(YEAR FROM NOW())::int % 100, 'FM00') || '-' || LPAD(ordered.seq::text, 6, '0')
            FROM ordered
            WHERE {table}.id = ordered.id
        """)
        op.execute(f"SELECT setval('{seq}', COALESCE((SELECT COUNT(*) FROM {table}), 0) + 1, false)")
        op.alter_column(table, "public_code", nullable=False)


def downgrade() -> None:
    for table in ["sessions", "chapters", "courses"]:
        op.drop_index(f"ix_{table}_public_code", table_name=table)
        op.drop_column(table, "public_code")

    op.execute("ALTER TABLE session_progress RENAME CONSTRAINT session_progress_student_id_fkey TO lesson_progress_student_id_fkey")
    op.execute("ALTER TABLE session_progress RENAME CONSTRAINT session_progress_session_id_fkey TO lesson_progress_lesson_id_fkey")
    op.execute("ALTER TABLE session_progress RENAME CONSTRAINT session_progress_pkey TO lesson_progress_pkey")
    op.execute("ALTER INDEX ix_session_progress_student_id RENAME TO ix_lesson_progress_student_id")
    op.execute("ALTER INDEX ix_session_progress_session_id RENAME TO ix_lesson_progress_lesson_id")
    op.execute("ALTER TABLE session_progress RENAME CONSTRAINT uq_session_progress_student_session TO uq_lesson_progress_student_lesson")
    op.alter_column("session_progress", "session_id", new_column_name="lesson_id")
    op.rename_table("session_progress", "lesson_progress")

    op.execute("ALTER TABLE quizzes RENAME CONSTRAINT quizzes_session_id_fkey TO quizzes_lesson_id_fkey")
    op.execute("ALTER INDEX ix_quizzes_session_id RENAME TO ix_quizzes_lesson_id")
    op.alter_column("quizzes", "session_id", new_column_name="lesson_id")

    op.execute("ALTER TABLE assignments RENAME CONSTRAINT assignments_session_id_fkey TO assignments_lesson_id_fkey")
    op.execute("ALTER INDEX ix_assignments_session_id RENAME TO ix_assignments_lesson_id")
    op.alter_column("assignments", "session_id", new_column_name="lesson_id")

    op.execute("ALTER TABLE videos RENAME CONSTRAINT videos_session_block_id_fkey TO videos_lesson_block_id_fkey")
    op.execute("ALTER INDEX ix_videos_session_block_id RENAME TO ix_videos_lesson_block_id")
    op.execute("ALTER TABLE videos RENAME CONSTRAINT uq_videos_session_block_id TO uq_videos_lesson_block_id")
    op.alter_column("videos", "session_block_id", new_column_name="lesson_block_id")

    op.execute("ALTER TABLE session_blocks RENAME CONSTRAINT session_blocks_session_id_fkey TO lesson_blocks_lesson_id_fkey")
    op.execute("ALTER TABLE session_blocks RENAME CONSTRAINT session_blocks_pkey TO lesson_blocks_pkey")
    op.execute("ALTER INDEX ix_session_blocks_session_id RENAME TO ix_lesson_blocks_lesson_id")
    op.execute("ALTER TABLE session_blocks RENAME CONSTRAINT uq_session_blocks_session_position TO uq_lesson_blocks_lesson_position")
    op.alter_column("session_blocks", "session_id", new_column_name="lesson_id")
    op.rename_table("session_blocks", "lesson_blocks")

    op.execute("ALTER TABLE sessions RENAME CONSTRAINT sessions_chapter_id_fkey TO lessons_chapter_id_fkey")
    op.execute("ALTER TABLE sessions RENAME CONSTRAINT sessions_pkey TO lessons_pkey")
    op.execute("ALTER INDEX ix_sessions_chapter_id RENAME TO ix_lessons_chapter_id")
    op.execute("ALTER TABLE sessions RENAME CONSTRAINT uq_sessions_chapter_position TO uq_lessons_chapter_position")
    op.rename_table("sessions", "lessons")
