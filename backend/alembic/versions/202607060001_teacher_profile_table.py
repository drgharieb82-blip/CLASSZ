"""Add teachers profile table.

Revision ID: 202607060001
Revises: 202606210001
Create Date: 2026-07-06

Adds a 1:1 profile extension on `users` for teacher-specific registration
data (identity documents, bio, certification, etc.). Mirrors the shape of
the orphaned `teachers` table found in the pre-reset legacy database
(user_id, display_name/nickname, bio, specialization), extended with the
additional fields requested for the teacher registration flow.

This table is additive only - it does not alter `users` or any other
existing table.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607060001"
down_revision: Union[str, None] = "202606210001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "teachers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name_on_id", sa.String(length=160), nullable=True),
        sa.Column("national_id", sa.String(length=50), nullable=True),
        sa.Column("id_document_url", sa.String(length=500), nullable=True),
        sa.Column("photo_url", sa.String(length=500), nullable=True),
        sa.Column("nickname", sa.String(length=80), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("social_links", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("mobile_number", sa.String(length=30), nullable=True),
        sa.Column("mobile_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("certification_text", sa.Text(), nullable=True),
        sa.Column("certification_document_url", sa.String(length=500), nullable=True),
        sa.Column("specialization", sa.String(length=160), nullable=True),
        sa.Column("headline", sa.String(length=200), nullable=True),
        sa.Column("gender", sa.String(length=20), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_teachers_user_id"),
    )
    op.create_index(op.f("ix_teachers_user_id"), "teachers", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_teachers_user_id"), table_name="teachers")
    op.drop_table("teachers")
