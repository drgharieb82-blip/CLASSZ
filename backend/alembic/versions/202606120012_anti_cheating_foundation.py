"""anti cheating foundation

Revision ID: 202606120012
Revises: 202606120011
Create Date: 2026-06-12 00:12:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606120012"
down_revision: Union[str, None] = "202606120011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("quiz_attempts", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("quiz_attempts", sa.Column("time_limit_minutes", sa.Integer(), nullable=True))
    op.add_column("quiz_attempts", sa.Column("attempt_number", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("quiz_attempts", sa.Column("ip_address", sa.String(length=64), nullable=True))
    op.add_column("quiz_attempts", sa.Column("user_agent", sa.String(length=500), nullable=True))
    op.add_column("quiz_attempts", sa.Column("device_fingerprint", sa.String(length=255), nullable=True))
    op.add_column("quiz_attempts", sa.Column("focus_loss_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("quiz_attempts", sa.Column("is_auto_submitted", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index(op.f("ix_quiz_attempts_expires_at"), "quiz_attempts", ["expires_at"], unique=False)

    event_type_enum = postgresql.ENUM(
        "FOCUS_LOST",
        "FOCUS_RETURNED",
        "TAB_SWITCHED",
        "COPY_ATTEMPT",
        "PASTE_ATTEMPT",
        "FULLSCREEN_EXIT",
        "AUTO_SUBMIT",
        name="anti_cheating_event_type_enum",
    )
    event_type_enum.create(op.get_bind(), checkfirst=True)
    event_type_column_enum = postgresql.ENUM(
        "FOCUS_LOST",
        "FOCUS_RETURNED",
        "TAB_SWITCHED",
        "COPY_ATTEMPT",
        "PASTE_ATTEMPT",
        "FULLSCREEN_EXIT",
        "AUTO_SUBMIT",
        name="anti_cheating_event_type_enum",
        create_type=False,
    )

    op.create_table(
        "anti_cheating_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("attempt_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_type", event_type_column_enum, nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["attempt_id"], ["quiz_attempts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_anti_cheating_events_attempt_id"), "anti_cheating_events", ["attempt_id"], unique=False)
    op.create_index(op.f("ix_anti_cheating_events_event_type"), "anti_cheating_events", ["event_type"], unique=False)

    op.alter_column("quiz_attempts", "attempt_number", server_default=None)
    op.alter_column("quiz_attempts", "focus_loss_count", server_default=None)
    op.alter_column("quiz_attempts", "is_auto_submitted", server_default=None)


def downgrade() -> None:
    op.drop_index(op.f("ix_anti_cheating_events_event_type"), table_name="anti_cheating_events")
    op.drop_index(op.f("ix_anti_cheating_events_attempt_id"), table_name="anti_cheating_events")
    op.drop_table("anti_cheating_events")

    event_type_enum = postgresql.ENUM(name="anti_cheating_event_type_enum")
    event_type_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index(op.f("ix_quiz_attempts_expires_at"), table_name="quiz_attempts")
    op.drop_column("quiz_attempts", "is_auto_submitted")
    op.drop_column("quiz_attempts", "focus_loss_count")
    op.drop_column("quiz_attempts", "device_fingerprint")
    op.drop_column("quiz_attempts", "user_agent")
    op.drop_column("quiz_attempts", "ip_address")
    op.drop_column("quiz_attempts", "attempt_number")
    op.drop_column("quiz_attempts", "time_limit_minutes")
    op.drop_column("quiz_attempts", "expires_at")
