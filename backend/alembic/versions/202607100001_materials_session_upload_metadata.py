"""Materials: link to a session, add upload metadata, support document/audio.

Revision ID: 202607100001
Revises: 202607080001
Create Date: 2026-07-10

Teacher MVP P0-03 (Content Delivery + Material Upload System). Materials
previously had no `session_id` at all - the Session Builder's "materials in
this session" concept was pure local Zustand state (`linkedSessionIds`) with
nothing persisted server-side. This adds a real nullable `session_id` FK (a
material can exist in the course library unattached, or be attached to one
session) plus file metadata columns (file_name/file_size_bytes/mime_type)
needed for rename/preview/download, and extends `material_type_enum` with
`document` and `audio` to cover Word/PowerPoint/Excel and audio uploads.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607100001"
down_revision: Union[str, None] = "202607080001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE material_type_enum ADD VALUE IF NOT EXISTS 'document'")
    op.execute("ALTER TYPE material_type_enum ADD VALUE IF NOT EXISTS 'audio'")

    op.add_column("materials", sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("materials", sa.Column("file_name", sa.String(length=255), nullable=True))
    op.add_column("materials", sa.Column("file_size_bytes", sa.BigInteger(), nullable=True))
    op.add_column("materials", sa.Column("mime_type", sa.String(length=120), nullable=True))
    op.create_foreign_key(
        "fk_materials_session_id", "materials", "sessions", ["session_id"], ["id"], ondelete="SET NULL"
    )
    op.create_index("ix_materials_session_id", "materials", ["session_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_materials_session_id", table_name="materials")
    op.drop_constraint("fk_materials_session_id", "materials", type_="foreignkey")
    op.drop_column("materials", "mime_type")
    op.drop_column("materials", "file_size_bytes")
    op.drop_column("materials", "file_name")
    op.drop_column("materials", "session_id")
    # Postgres has no DROP VALUE for enums; 'document'/'audio' remain defined
    # but unused after downgrade.
