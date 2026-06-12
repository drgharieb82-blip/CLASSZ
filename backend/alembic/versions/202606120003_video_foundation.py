"""video foundation

Revision ID: 202606120003
Revises: 202606120002
Create Date: 2026-06-12 00:03:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120003"
down_revision: Union[str, None] = "202606120002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    video_provider_enum = postgresql.ENUM("LOCAL", "BUNNY", "MUX", name="video_provider_enum")
    video_provider_enum.create(op.get_bind(), checkfirst=True)
    video_provider_column_enum = postgresql.ENUM(
        "LOCAL",
        "BUNNY",
        "MUX",
        name="video_provider_enum",
        create_type=False,
    )

    op.create_table(
        "videos",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_block_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("provider", video_provider_column_enum, nullable=False),
        sa.Column("provider_video_id", sa.String(length=255), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("thumbnail_url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["lesson_block_id"], ["lesson_blocks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lesson_block_id", name="uq_videos_lesson_block_id"),
    )
    op.create_index(op.f("ix_videos_lesson_block_id"), "videos", ["lesson_block_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_videos_lesson_block_id"), table_name="videos")
    op.drop_table("videos")

    video_provider_enum = postgresql.ENUM(name="video_provider_enum")
    video_provider_enum.drop(op.get_bind(), checkfirst=True)
