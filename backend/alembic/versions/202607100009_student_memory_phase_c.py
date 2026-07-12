"""student memory phase c

Revision ID: 202607100009
Revises: 202607100008
Create Date: 2026-07-11 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "202607100009"
down_revision: Union[str, None] = "202607100008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


note_importance_enum = postgresql.ENUM(
    "low", "medium", "high", name="student_note_importance_enum", create_type=False
)
note_smart_type_enum = postgresql.ENUM(
    "chemistry-equation",
    "physics-law",
    "math-formula",
    "definition",
    "question",
    "general",
    name="student_note_smart_type_enum",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    note_importance_enum.create(bind, checkfirst=True)
    note_smart_type_enum.create(bind, checkfirst=True)

    op.create_table(
        "student_notes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("subject_name", sa.String(length=160), nullable=False),
        sa.Column("course_name", sa.String(length=220), nullable=False),
        sa.Column("session_title", sa.String(length=220), nullable=False),
        sa.Column("session_item_title", sa.String(length=220), nullable=False),
        sa.Column("session_item_id", sa.String(length=120), nullable=False),
        sa.Column("item_type", sa.String(length=60), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("tags", sa.Text(), nullable=False, server_default=""),
        sa.Column("importance", note_importance_enum, nullable=False, server_default="low"),
        sa.Column("smart_type", note_smart_type_enum, nullable=False, server_default="general"),
        sa.Column("pinned", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_student_notes_student_id", "student_notes", ["student_id"])
    op.create_index("ix_student_notes_pinned", "student_notes", ["pinned"])
    op.create_index("ix_student_notes_importance", "student_notes", ["importance"])
    op.create_index("ix_student_notes_smart_type", "student_notes", ["smart_type"])
    op.create_index("ix_student_notes_session_item_id", "student_notes", ["session_item_id"])

    op.create_table(
        "student_question_bookmarks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("is_bookmarked", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.UniqueConstraint("student_id", "question_id", name="uq_student_question_bookmarks_student_question"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_student_question_bookmarks_student_id", "student_question_bookmarks", ["student_id"])
    op.create_index("ix_student_question_bookmarks_question_id", "student_question_bookmarks", ["question_id"])
    op.create_index("ix_student_question_bookmarks_is_bookmarked", "student_question_bookmarks", ["is_bookmarked"])


def downgrade() -> None:
    op.drop_index("ix_student_question_bookmarks_is_bookmarked", table_name="student_question_bookmarks")
    op.drop_index("ix_student_question_bookmarks_question_id", table_name="student_question_bookmarks")
    op.drop_index("ix_student_question_bookmarks_student_id", table_name="student_question_bookmarks")
    op.drop_table("student_question_bookmarks")

    op.drop_index("ix_student_notes_session_item_id", table_name="student_notes")
    op.drop_index("ix_student_notes_smart_type", table_name="student_notes")
    op.drop_index("ix_student_notes_importance", table_name="student_notes")
    op.drop_index("ix_student_notes_pinned", table_name="student_notes")
    op.drop_index("ix_student_notes_student_id", table_name="student_notes")
    op.drop_table("student_notes")

    bind = op.get_bind()
    note_smart_type_enum.drop(bind, checkfirst=True)
    note_importance_enum.drop(bind, checkfirst=True)
