"""ai request logs

Revision ID: 202606130014
Revises: 202606130013
Create Date: 2026-06-13 00:14:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606130014"
down_revision: Union[str, None] = "202606130013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_request_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("feature", sa.String(length=120), nullable=False),
        sa.Column("provider", sa.String(length=80), nullable=False),
        sa.Column("model", sa.String(length=120), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), nullable=False),
        sa.Column("completion_tokens", sa.Integer(), nullable=False),
        sa.Column("total_tokens", sa.Integer(), nullable=False),
        sa.Column("estimated_cost", sa.Float(), nullable=False),
        sa.Column("success", sa.Boolean(), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ai_request_logs_feature"), "ai_request_logs", ["feature"], unique=False)
    op.create_index(op.f("ix_ai_request_logs_provider"), "ai_request_logs", ["provider"], unique=False)
    op.create_index(op.f("ix_ai_request_logs_status"), "ai_request_logs", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_request_logs_status"), table_name="ai_request_logs")
    op.drop_index(op.f("ix_ai_request_logs_provider"), table_name="ai_request_logs")
    op.drop_index(op.f("ix_ai_request_logs_feature"), table_name="ai_request_logs")
    op.drop_table("ai_request_logs")
