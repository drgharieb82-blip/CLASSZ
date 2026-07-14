"""Sessions: add real status column, enable PATCH/DELETE.

Revision ID: 202607080001
Revises: 202607070005
Create Date: 2026-07-08

Sessions previously had no status column at all - publish/archive/lock/
delete were pure local Zustand mutations with nothing to persist to. This
adds a real status enum (draft/published/archived) so publish/archive are
genuine, and enables the PATCH/DELETE endpoints backing them plus is_locked
toggling and deletion. Sessions (Delivery Domain) are not part of the frozen
Academic Domain, so this table is safe to evolve.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607080001"
down_revision: Union[str, None] = "202607070005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

session_status_enum = postgresql.ENUM("draft", "published", "archived", name="session_status_enum")


def upgrade() -> None:
    session_status_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "sessions",
        sa.Column("status", session_status_enum, nullable=False, server_default="draft"),
    )


def downgrade() -> None:
    op.drop_column("sessions", "status")
    session_status_enum.drop(op.get_bind(), checkfirst=True)
