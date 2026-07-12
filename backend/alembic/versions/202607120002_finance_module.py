"""Finance role: coupons, invoices, teacher subscriptions, payout requests.

Revision ID: 202607120002
Revises: 202607120001
Create Date: 2026-07-12 00:00:00.000000

Backs the previously 100%-mock Finance role (dashboard, payment history,
teacher revenue, invoices, subscriptions, coupons — see
FULL_AUDIT_2026-07-11.md item 9) with real tables. Payment history and
teacher revenue are aggregations over the existing `wallet_transactions`/
`courses` tables and need no new schema of their own.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607120002"
down_revision: Union[str, None] = "202607120001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


coupon_discount_type_enum = postgresql.ENUM(
    "percent", "fixed", name="coupon_discount_type_enum", create_type=False
)
invoice_status_enum = postgresql.ENUM(
    "issued", "paid", "overdue", "cancelled", name="invoice_status_enum", create_type=False
)
subscription_plan_enum = postgresql.ENUM(
    "free", "pro", "premium", "enterprise", name="subscription_plan_enum", create_type=False
)
subscription_status_enum = postgresql.ENUM(
    "active", "trial", "expired", "cancelled", name="subscription_status_enum", create_type=False
)
subscription_payment_status_enum = postgresql.ENUM(
    "paid", "overdue", "pending", name="subscription_payment_status_enum", create_type=False
)
payout_status_enum = postgresql.ENUM(
    "pending", "approved", "rejected", "paid", name="payout_status_enum", create_type=False
)


def upgrade() -> None:
    bind = op.get_bind()

    for seq_name in ("seq_coupon_code", "seq_invoice_code", "seq_payout_code"):
        op.execute(sa.text(f"CREATE SEQUENCE IF NOT EXISTS {seq_name} START WITH 1"))

    # --- coupons ---------------------------------------------------------
    coupon_discount_type_enum.create(bind, checkfirst=True)
    op.create_table(
        "coupons",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("code", sa.String(length=40), nullable=False),
        sa.Column("discount_type", coupon_discount_type_enum, nullable=False),
        sa.Column("discount_value", sa.Numeric(10, 2), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("max_redemptions", sa.Integer(), nullable=True),
        sa.Column("redemption_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_code", name="uq_coupons_public_code"),
        sa.UniqueConstraint("code", name="uq_coupons_code"),
    )
    op.create_index("ix_coupons_code", "coupons", ["code"])
    op.create_index("ix_coupons_course_id", "coupons", ["course_id"])

    # --- invoices ----------------------------------------------------------
    invoice_status_enum.create(bind, checkfirst=True)
    op.create_table(
        "invoices",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("wallet_transaction_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("tax_amount", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", invoice_status_enum, nullable=False, server_default="issued"),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("issued_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["wallet_transaction_id"], ["wallet_transactions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_code", name="uq_invoices_public_code"),
        sa.UniqueConstraint("wallet_transaction_id", name="uq_invoices_wallet_transaction_id"),
    )
    op.create_index("ix_invoices_user_id", "invoices", ["user_id"])

    # --- teacher subscriptions ----------------------------------------------
    subscription_plan_enum.create(bind, checkfirst=True)
    subscription_status_enum.create(bind, checkfirst=True)
    subscription_payment_status_enum.create(bind, checkfirst=True)
    op.create_table(
        "teacher_subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("teacher_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan", subscription_plan_enum, nullable=False, server_default="free"),
        sa.Column("monthly_fee", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("status", subscription_status_enum, nullable=False, server_default="active"),
        sa.Column("payment_status", subscription_payment_status_enum, nullable=False, server_default="paid"),
        sa.Column("renewal_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("teacher_id", name="uq_teacher_subscriptions_teacher_id"),
    )

    # --- payout requests -----------------------------------------------------
    payout_status_enum.create(bind, checkfirst=True)
    op.create_table(
        "payout_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_code", sa.String(length=20), nullable=False),
        sa.Column("teacher_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("method", sa.String(length=80), nullable=False),
        sa.Column("status", payout_status_enum, nullable=False, server_default="pending"),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("requested_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("decided_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["decided_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_code", name="uq_payout_requests_public_code"),
    )
    op.create_index("ix_payout_requests_teacher_id", "payout_requests", ["teacher_id"])


def downgrade() -> None:
    op.drop_index("ix_payout_requests_teacher_id", table_name="payout_requests")
    op.drop_table("payout_requests")
    payout_status_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_table("teacher_subscriptions")
    subscription_payment_status_enum.drop(op.get_bind(), checkfirst=True)
    subscription_status_enum.drop(op.get_bind(), checkfirst=True)
    subscription_plan_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_invoices_user_id", table_name="invoices")
    op.drop_table("invoices")
    invoice_status_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_coupons_course_id", table_name="coupons")
    op.drop_index("ix_coupons_code", table_name="coupons")
    op.drop_table("coupons")
    coupon_discount_type_enum.drop(op.get_bind(), checkfirst=True)

    for seq_name in ("seq_coupon_code", "seq_invoice_code", "seq_payout_code"):
        op.execute(sa.text(f"DROP SEQUENCE IF EXISTS {seq_name}"))
