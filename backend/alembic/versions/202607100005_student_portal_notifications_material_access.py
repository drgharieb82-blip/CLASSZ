"""Student portal, notifications, and material access audit trail.

Revision ID: 202607100005
Revises: 202607100004
Create Date: 2026-07-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607100005"
down_revision: Union[str, None] = "202607100004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

notification_category_enum = postgresql.ENUM(
    "system",
    "enrollment",
    "wallet",
    "progress",
    "material",
    "certificate",
    name="notification_category_enum",
    create_type=False,
)
notification_priority_enum = postgresql.ENUM(
    "normal", "important", "urgent", name="notification_priority_enum", create_type=False
)
material_access_type_enum = postgresql.ENUM(
    "view", "download", name="material_access_type_enum", create_type=False
)


def upgrade() -> None:
    op.execute(sa.text("CREATE SEQUENCE IF NOT EXISTS seq_notification_code START WITH 1"))

    op.create_table(
        "student_profiles",
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("headline", sa.String(length=160), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("timezone", sa.String(length=80), nullable=False, server_default="Africa/Cairo"),
        sa.Column("language", sa.String(length=12), nullable=False, server_default="en"),
        sa.Column("theme", sa.String(length=20), nullable=False, server_default="system"),
        sa.Column("notifications_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("email_notifications", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("push_notifications", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("weekly_digest_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("study_reminder_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("study_goal_minutes", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("student_id"),
    )

    notification_category_enum.create(op.get_bind(), checkfirst=True)
    notification_priority_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category", notification_category_enum, nullable=False, server_default="system"),
        sa.Column("priority", notification_priority_enum, nullable=False, server_default="normal"),
        sa.Column("title", sa.String(length=220), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("action_label", sa.String(length=80), nullable=True),
        sa.Column("action_url", sa.String(length=500), nullable=True),
        sa.Column("payload_json", sa.JSON(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_code", name="uq_notifications_public_code"),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_category", "notifications", ["category"])
    op.create_index("ix_notifications_priority", "notifications", ["priority"])
    op.create_index("ix_notifications_is_read", "notifications", ["is_read"])
    op.create_index("ix_notifications_is_archived", "notifications", ["is_archived"])

    material_access_type_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "material_access_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("material_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("access_type", material_access_type_enum, nullable=False, server_default="view"),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accessed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["material_id"], ["materials.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash", name="uq_material_access_logs_token_hash"),
    )
    op.create_index("ix_material_access_logs_material_id", "material_access_logs", ["material_id"])
    op.create_index("ix_material_access_logs_student_id", "material_access_logs", ["student_id"])
    op.create_index("ix_material_access_logs_access_type", "material_access_logs", ["access_type"])


def downgrade() -> None:
    op.drop_index("ix_material_access_logs_access_type", table_name="material_access_logs")
    op.drop_index("ix_material_access_logs_student_id", table_name="material_access_logs")
    op.drop_index("ix_material_access_logs_material_id", table_name="material_access_logs")
    op.drop_table("material_access_logs")
    material_access_type_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_notifications_is_archived", table_name="notifications")
    op.drop_index("ix_notifications_is_read", table_name="notifications")
    op.drop_index("ix_notifications_priority", table_name="notifications")
    op.drop_index("ix_notifications_category", table_name="notifications")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")
    notification_priority_enum.drop(op.get_bind(), checkfirst=True)
    notification_category_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_table("student_profiles")
    op.execute(sa.text("DROP SEQUENCE IF EXISTS seq_notification_code"))
