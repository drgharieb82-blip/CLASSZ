from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.finance.models import (
    DiscountType,
    InvoiceStatus,
    PayoutStatus,
    SubscriptionPaymentStatus,
    SubscriptionPlan,
    SubscriptionStatus,
)
from app.modules.wallets.models import TransactionStatus, TransactionType


# ── Dashboard ──


class RevenueTrendPoint(BaseModel):
    month: str
    gmv: float
    platform_revenue: float


class FinanceDashboardRead(BaseModel):
    gmv: float
    platform_revenue: float
    refunds: float
    pending_payouts: float
    active_subscriptions: int
    mrr: float
    platform_fee_percent: float
    revenue_trend: list[RevenueTrendPoint]


# ── Payment history ──


class FinanceTransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    student_id: UUID
    student_name: str
    course_id: UUID | None
    course_title: str | None
    teacher_id: UUID | None
    teacher_name: str | None
    type: TransactionType
    amount: float
    status: TransactionStatus
    coupon_code: str | None
    note: str | None
    created_at: datetime


# ── Teacher revenue ──


class TeacherRevenueRead(BaseModel):
    teacher_id: UUID
    teacher_name: str
    gross_revenue: float
    platform_fee: float
    net_revenue: float
    refunds: float
    paid_out: float
    pending_payout: float
    available_balance: float


# ── Coupons ──


class CouponCreate(BaseModel):
    code: str = Field(min_length=3, max_length=40)
    discount_type: DiscountType
    discount_value: float = Field(gt=0)
    course_id: UUID | None = None
    max_redemptions: int | None = Field(default=None, ge=1)
    valid_from: datetime | None = None
    valid_until: datetime | None = None


class CouponUpdate(BaseModel):
    is_active: bool | None = None
    max_redemptions: int | None = Field(default=None, ge=1)
    valid_until: datetime | None = None


class CouponRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    code: str
    discount_type: DiscountType
    discount_value: float
    course_id: UUID | None
    course_title: str | None
    max_redemptions: int | None
    redemption_count: int
    is_active: bool
    valid_from: datetime | None
    valid_until: datetime | None
    created_at: datetime


# ── Invoices ──


class InvoiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    user_id: UUID
    user_name: str
    user_role: str
    course_id: UUID | None
    course_title: str | None
    amount: float
    tax_amount: float
    total_amount: float
    status: InvoiceStatus
    note: str | None
    issued_at: datetime
    paid_at: datetime | None


# ── Subscriptions ──


class TeacherSubscriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    teacher_id: UUID
    teacher_name: str
    plan: SubscriptionPlan
    monthly_fee: float
    status: SubscriptionStatus
    payment_status: SubscriptionPaymentStatus
    renewal_date: datetime | None
    created_at: datetime
    updated_at: datetime


class TeacherSubscriptionUpdate(BaseModel):
    plan: SubscriptionPlan | None = None
    status: SubscriptionStatus | None = None
    record_payment: bool = False


# ── Payouts ──


class PayoutRequestCreate(BaseModel):
    amount: float = Field(gt=0)
    method: str = Field(min_length=1, max_length=80)
    note: str | None = None


class PayoutDecision(BaseModel):
    status: PayoutStatus
    note: str | None = None


class PayoutRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    teacher_id: UUID
    teacher_name: str
    amount: float
    method: str
    status: PayoutStatus
    note: str | None
    requested_at: datetime
    decided_at: datetime | None
