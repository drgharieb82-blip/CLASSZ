"""Add course price.

Revision ID: 202607100004
Revises: 202607100003
Create Date: 2026-07-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "202607100004"
down_revision: Union[str, None] = "202607100003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("courses", sa.Column("price", sa.Numeric(10, 2), nullable=True))


def downgrade() -> None:
    op.drop_column("courses", "price")
