"""Teacher Students section: pods, parent contacts, wallets, certificates.

Revision ID: 202607100003
Revises: 202607100002
Create Date: 2026-07-10

Backs the previously mock-only Teacher > Students pages (pods, parents,
payments, certificates) with real tables. Roster/progress/at-risk/wrong-
questions/memory are pure aggregations over existing tables (enrollments,
session_progress, question_results) and need no new schema.

`seq_certificate_code` / `seq_payment_code` / `seq_wallet_transaction_code`
already exist (created in 202606210001) — this migration only adds the
tables that consume them.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607100003"
down_revision: Union[str, None] = "202607100002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

parent_alert_status_enum = postgresql.ENUM(
    "none", "sent", "urgent", name="parent_alert_status_enum", create_type=False
)
wallet_transaction_type_enum = postgresql.ENUM(
    "payment", "refund", "topup", "adjustment", name="wallet_transaction_type_enum", create_type=False
)
wallet_transaction_status_enum = postgresql.ENUM(
    "pending", "paid", "refunded", "rejected", name="wallet_transaction_status_enum", create_type=False
)
certificate_status_enum = postgresql.ENUM(
    "pending", "issued", "revoked", name="certificate_status_enum", create_type=False
)


def upgrade() -> None:
    # --- student pods ---------------------------------------------------
    op.create_table(
        "student_pods",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_student_pods_course_id", "student_pods", ["course_id"])

    op.create_table(
        "student_pod_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pod_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["pod_id"], ["student_pods.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("pod_id", "student_id", name="uq_student_pod_members_pod_student"),
    )
    op.create_index("ix_student_pod_members_pod_id", "student_pod_members", ["pod_id"])
    op.create_index("ix_student_pod_members_student_id", "student_pod_members", ["student_id"])

    # --- parent contacts ---------------------------------------------------
    parent_alert_status_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "parent_contacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("relation", sa.String(length=60), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("whatsapp", sa.String(length=40), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("last_contact_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("alert_status", parent_alert_status_enum, nullable=False, server_default="none"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_parent_contacts_student_id", "parent_contacts", ["student_id"])

    # --- wallets / wallet transactions --------------------------------------
    wallet_transaction_type_enum.create(op.get_bind(), checkfirst=True)
    wallet_transaction_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "wallets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("balance", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", name="uq_wallets_student_id"),
    )

    op.create_table(
        "wallet_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("wallet_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("type", wallet_transaction_type_enum, nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("status", wallet_transaction_status_enum, nullable=False, server_default="pending"),
        sa.Column("coupon_code", sa.String(length=60), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["wallet_id"], ["wallets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_code", name="uq_wallet_transactions_public_code"),
    )
    op.create_index("ix_wallet_transactions_wallet_id", "wallet_transactions", ["wallet_id"])
    op.create_index("ix_wallet_transactions_course_id", "wallet_transactions", ["course_id"])

    # --- certificates --------------------------------------------------
    certificate_status_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "certificates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("status", certificate_status_enum, nullable=False, server_default="issued"),
        sa.Column("issued_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_code", name="uq_certificates_public_code"),
    )
    op.create_index("ix_certificates_student_id", "certificates", ["student_id"])
    op.create_index("ix_certificates_course_id", "certificates", ["course_id"])


def downgrade() -> None:
    op.drop_index("ix_certificates_course_id", table_name="certificates")
    op.drop_index("ix_certificates_student_id", table_name="certificates")
    op.drop_table("certificates")
    certificate_status_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_wallet_transactions_course_id", table_name="wallet_transactions")
    op.drop_index("ix_wallet_transactions_wallet_id", table_name="wallet_transactions")
    op.drop_table("wallet_transactions")
    op.drop_table("wallets")
    wallet_transaction_status_enum.drop(op.get_bind(), checkfirst=True)
    wallet_transaction_type_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_parent_contacts_student_id", table_name="parent_contacts")
    op.drop_table("parent_contacts")
    parent_alert_status_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_student_pod_members_student_id", table_name="student_pod_members")
    op.drop_index("ix_student_pod_members_pod_id", table_name="student_pod_members")
    op.drop_table("student_pod_members")
    op.drop_index("ix_student_pods_course_id", table_name="student_pods")
    op.drop_table("student_pods")
