"""Add students profile table.

Revision ID: 202607100006
Revises: 202607100005
Create Date: 2026-07-10

Adds a 1:1 profile extension on `users` for student-specific registration
data (date of birth, gender, whatsapp, nickname, avatar, national id).
Mirrors the shape of the `teachers` profile table (migration 202607060001).

This table is additive only - it does not alter `users` or any other
existing table.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607100006"
down_revision: Union[str, None] = "202607100005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "students",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("gender", sa.String(length=20), nullable=True),
        sa.Column("national_id", sa.String(length=50), nullable=True),
        sa.Column("whatsapp", sa.String(length=40), nullable=True),
        sa.Column("nickname", sa.String(length=80), nullable=True),
        sa.Column("avatar", sa.String(length=500), nullable=True),
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
        sa.UniqueConstraint("user_id", name="uq_students_user_id"),
    )


def downgrade() -> None:
    op.drop_table("students")
