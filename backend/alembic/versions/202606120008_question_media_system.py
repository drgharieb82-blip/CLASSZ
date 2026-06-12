"""question media system

Revision ID: 202606120008
Revises: 202606120007
Create Date: 2026-06-12 00:08:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120008"
down_revision: Union[str, None] = "202606120007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    media_type_enum = postgresql.ENUM("IMAGE", "PDF", "AUDIO", "VIDEO", name="question_media_type_enum")
    media_type_enum.create(op.get_bind(), checkfirst=True)

    op.add_column("question_media", sa.Column("caption", sa.String(length=240), nullable=True))
    op.add_column("question_media", sa.Column("position", sa.Integer(), nullable=False, server_default="0"))
    op.add_column(
        "question_media",
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.execute(
        """
        ALTER TABLE question_media
        ALTER COLUMN media_type TYPE question_media_type_enum
        USING (
            CASE
                WHEN upper(media_type) IN ('IMAGE', 'PDF', 'AUDIO', 'VIDEO') THEN upper(media_type)
                ELSE 'IMAGE'
            END
        )::question_media_type_enum
        """
    )
    op.alter_column("question_media", "position", server_default=None)
    op.create_index(op.f("ix_question_media_media_type"), "question_media", ["media_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_question_media_media_type"), table_name="question_media")
    op.execute("ALTER TABLE question_media ALTER COLUMN media_type TYPE VARCHAR(80) USING media_type::text")
    op.drop_column("question_media", "created_at")
    op.drop_column("question_media", "position")
    op.drop_column("question_media", "caption")

    media_type_enum = postgresql.ENUM(name="question_media_type_enum")
    media_type_enum.drop(op.get_bind(), checkfirst=True)
