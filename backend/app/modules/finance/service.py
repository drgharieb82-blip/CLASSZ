from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.identity import EntityType, format_public_code
from app.models.user import Role, User
from app.modules.courses.models import Course
from app.modules.finance.models import (
    Coupon,
    Invoice,
    InvoiceStatus,
    PayoutRequest,
    PayoutStatus,
    SubscriptionPaymentStatus,
    SubscriptionPlan,
    SubscriptionStatus,
    TeacherSubscription,
)
from app.modules.finance.schemas import (
    CouponCreate,
    CouponUpdate,
    FinanceDashboardRead,
    PayoutDecision,
    PayoutRequestCreate,
    RevenueTrendPoint,
    TeacherSubscriptionUpdate,
)
from app.modules.wallets.models import TransactionStatus, TransactionType, Wallet, WalletTransaction

PLAN_FEES: dict[SubscriptionPlan, float] = {
    SubscriptionPlan.FREE: 0.0,
    SubscriptionPlan.PRO: 49.0,
    SubscriptionPlan.PREMIUM: 99.0,
    SubscriptionPlan.ENTERPRISE: 199.0,
}


async def _next_public_code(session: AsyncSession, sequence_name: str, entity_type: EntityType) -> str:
    result = await session.execute(text(f"SELECT nextval('{sequence_name}')"))
    sequence = int(result.scalar_one())
    return format_public_code(entity_type, sequence)


# ── Coupons ──


def _normalize_coupon_code(code: str) -> str:
    return code.strip().upper()


async def list_coupons(session: AsyncSession) -> list[dict]:
    result = await session.execute(
        select(Coupon, Course.title).outerjoin(Course, Course.id == Coupon.course_id).order_by(Coupon.created_at.desc())
    )
    return [_coupon_to_dict(coupon, title) for coupon, title in result.all()]


def _coupon_to_dict(coupon: Coupon, course_title: str | None) -> dict:
    return {
        "id": coupon.id,
        "public_code": coupon.public_code,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "discount_value": float(coupon.discount_value),
        "course_id": coupon.course_id,
        "course_title": course_title,
        "max_redemptions": coupon.max_redemptions,
        "redemption_count": coupon.redemption_count,
        "is_active": coupon.is_active,
        "valid_from": coupon.valid_from,
        "valid_until": coupon.valid_until,
        "created_at": coupon.created_at,
    }


async def create_coupon(session: AsyncSession, payload: CouponCreate, created_by: UUID) -> dict:
    code = _normalize_coupon_code(payload.code)
    existing = await session.execute(select(Coupon.id).where(Coupon.code == code))
    if existing.scalar_one_or_none() is not None:
        raise ValueError("Coupon code already exists")

    public_code = await _next_public_code(session, "seq_coupon_code", EntityType.COUPON)
    coupon = Coupon(
        public_code=public_code,
        code=code,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        course_id=payload.course_id,
        max_redemptions=payload.max_redemptions,
        valid_from=payload.valid_from,
        valid_until=payload.valid_until,
        created_by=created_by,
    )
    session.add(coupon)
    await session.commit()
    await session.refresh(coupon)

    course_title = None
    if coupon.course_id is not None:
        course = await session.get(Course, coupon.course_id)
        course_title = course.title if course else None
    return _coupon_to_dict(coupon, course_title)


async def update_coupon(session: AsyncSession, coupon_id: UUID, payload: CouponUpdate) -> dict | None:
    coupon = await session.get(Coupon, coupon_id)
    if coupon is None:
        return None
    if payload.is_active is not None:
        coupon.is_active = payload.is_active
    if payload.max_redemptions is not None:
        coupon.max_redemptions = payload.max_redemptions
    if payload.valid_until is not None:
        coupon.valid_until = payload.valid_until
    await session.commit()
    await session.refresh(coupon)

    course_title = None
    if coupon.course_id is not None:
        course = await session.get(Course, coupon.course_id)
        course_title = course.title if course else None
    return _coupon_to_dict(coupon, course_title)


async def delete_coupon(session: AsyncSession, coupon_id: UUID) -> bool:
    coupon = await session.get(Coupon, coupon_id)
    if coupon is None:
        return False
    await session.delete(coupon)
    await session.commit()
    return True


async def get_valid_coupon(session: AsyncSession, code: str, course_id: UUID | None) -> Coupon:
    """Looks up and validates a coupon for use at checkout. Raises ValueError
    with a user-facing message on any validation failure."""
    normalized = _normalize_coupon_code(code)
    result = await session.execute(select(Coupon).where(Coupon.code == normalized))
    coupon = result.scalar_one_or_none()
    if coupon is None or not coupon.is_active:
        raise ValueError("Invalid coupon code")
    if coupon.course_id is not None and coupon.course_id != course_id:
        raise ValueError("Coupon is not valid for this course")
    now = datetime.now(timezone.utc)
    if coupon.valid_from is not None and now < coupon.valid_from:
        raise ValueError("Coupon is not active yet")
    if coupon.valid_until is not None and now > coupon.valid_until:
        raise ValueError("Coupon has expired")
    if coupon.max_redemptions is not None and coupon.redemption_count >= coupon.max_redemptions:
        raise ValueError("Coupon redemption limit reached")
    return coupon


def apply_coupon_discount(price: float, coupon: Coupon) -> float:
    if coupon.discount_type.value == "percent":
        discount = price * float(coupon.discount_value) / 100
    else:
        discount = float(coupon.discount_value)
    return round(max(0.0, price - discount), 2)


async def redeem_coupon(session: AsyncSession, coupon: Coupon) -> None:
    coupon.redemption_count += 1
    await session.flush()


# ── Invoices ──


def _invoice_to_dict(invoice: Invoice, user_name: str, user_role: str, course_title: str | None) -> dict:
    return {
        "id": invoice.id,
        "public_code": invoice.public_code,
        "user_id": invoice.user_id,
        "user_name": user_name,
        "user_role": user_role,
        "course_id": invoice.course_id,
        "course_title": course_title,
        "amount": float(invoice.amount),
        "tax_amount": float(invoice.tax_amount),
        "total_amount": float(invoice.total_amount),
        "status": invoice.status,
        "note": invoice.note,
        "issued_at": invoice.issued_at,
        "paid_at": invoice.paid_at,
    }


async def create_invoice_for_transaction(session: AsyncSession, transaction: WalletTransaction, student_id: UUID) -> Invoice:
    """Auto-issues a student invoice/receipt whenever a course purchase is
    staged. Called from the enrollment purchase flow, in the same
    transaction as the wallet debit."""
    tax = round(float(transaction.amount) * settings.tax_rate_percent / 100, 2)
    total = round(float(transaction.amount) + tax, 2)
    public_code = await _next_public_code(session, "seq_invoice_code", EntityType.INVOICE)
    invoice = Invoice(
        public_code=public_code,
        user_id=student_id,
        wallet_transaction_id=transaction.id,
        course_id=transaction.course_id,
        amount=transaction.amount,
        tax_amount=tax,
        total_amount=total,
        status=InvoiceStatus.PAID if transaction.status == TransactionStatus.PAID else InvoiceStatus.ISSUED,
        paid_at=datetime.now(timezone.utc) if transaction.status == TransactionStatus.PAID else None,
    )
    session.add(invoice)
    await session.flush()
    return invoice


async def list_invoices(session: AsyncSession) -> list[dict]:
    result = await session.execute(
        select(Invoice, User.full_name, User.role, Course.title)
        .join(User, User.id == Invoice.user_id)
        .outerjoin(Course, Course.id == Invoice.course_id)
        .order_by(Invoice.issued_at.desc())
    )
    return [_invoice_to_dict(invoice, name, role.value, title) for invoice, name, role, title in result.all()]


# ── Payment history (finance-wide) ──


async def list_all_transactions(
    session: AsyncSession,
    *,
    status_filter: TransactionStatus | None = None,
    type_filter: TransactionType | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[dict]:
    query = (
        select(WalletTransaction, Wallet.student_id, User.full_name, Course.title, Course.teacher_id)
        .join(Wallet, Wallet.id == WalletTransaction.wallet_id)
        .join(User, User.id == Wallet.student_id)
        .outerjoin(Course, Course.id == WalletTransaction.course_id)
        .order_by(WalletTransaction.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if status_filter is not None:
        query = query.where(WalletTransaction.status == status_filter)
    if type_filter is not None:
        query = query.where(WalletTransaction.type == type_filter)

    result = await session.execute(query)
    rows = result.all()

    teacher_ids = {teacher_id for *_rest, teacher_id in rows if teacher_id is not None}
    teacher_names: dict[UUID, str] = {}
    if teacher_ids:
        teacher_result = await session.execute(select(User.id, User.full_name).where(User.id.in_(teacher_ids)))
        teacher_names = dict(teacher_result.all())

    entries = []
    for transaction, student_id, student_name, course_title, teacher_id in rows:
        entries.append(
            {
                "id": transaction.id,
                "public_code": transaction.public_code,
                "student_id": student_id,
                "student_name": student_name,
                "course_id": transaction.course_id,
                "course_title": course_title,
                "teacher_id": teacher_id,
                "teacher_name": teacher_names.get(teacher_id) if teacher_id else None,
                "type": transaction.type,
                "amount": float(transaction.amount),
                "status": transaction.status,
                "coupon_code": transaction.coupon_code,
                "note": transaction.note,
                "created_at": transaction.created_at,
            }
        )
    return entries


# ── Teacher revenue ──


async def get_teacher_revenue(session: AsyncSession) -> list[dict]:
    fee_pct = settings.platform_fee_percent

    gross_query = (
        select(Course.teacher_id, func.coalesce(func.sum(WalletTransaction.amount), 0))
        .join(WalletTransaction, WalletTransaction.course_id == Course.id)
        .where(WalletTransaction.type == TransactionType.PAYMENT, WalletTransaction.status == TransactionStatus.PAID)
        .group_by(Course.teacher_id)
    )
    refund_query = (
        select(Course.teacher_id, func.coalesce(func.sum(WalletTransaction.amount), 0))
        .join(WalletTransaction, WalletTransaction.course_id == Course.id)
        .where(WalletTransaction.type == TransactionType.REFUND, WalletTransaction.status == TransactionStatus.REFUNDED)
        .group_by(Course.teacher_id)
    )
    paid_out_query = (
        select(PayoutRequest.teacher_id, func.coalesce(func.sum(PayoutRequest.amount), 0))
        .where(PayoutRequest.status == PayoutStatus.PAID)
        .group_by(PayoutRequest.teacher_id)
    )
    pending_payout_query = (
        select(PayoutRequest.teacher_id, func.coalesce(func.sum(PayoutRequest.amount), 0))
        .where(PayoutRequest.status.in_([PayoutStatus.PENDING, PayoutStatus.APPROVED]))
        .group_by(PayoutRequest.teacher_id)
    )

    gross_by_teacher = dict((await session.execute(gross_query)).all())
    refunds_by_teacher = dict((await session.execute(refund_query)).all())
    paid_out_by_teacher = dict((await session.execute(paid_out_query)).all())
    pending_payout_by_teacher = dict((await session.execute(pending_payout_query)).all())

    teacher_ids = set(gross_by_teacher) | set(refunds_by_teacher) | set(paid_out_by_teacher) | set(pending_payout_by_teacher)
    if not teacher_ids:
        return []

    teacher_result = await session.execute(select(User.id, User.full_name).where(User.id.in_(teacher_ids)))
    teacher_names = dict(teacher_result.all())

    entries = []
    for teacher_id in teacher_ids:
        gross = float(gross_by_teacher.get(teacher_id, 0))
        refunds = float(refunds_by_teacher.get(teacher_id, 0))
        paid_out = float(paid_out_by_teacher.get(teacher_id, 0))
        pending_payout = float(pending_payout_by_teacher.get(teacher_id, 0))
        platform_fee = round(gross * fee_pct / 100, 2)
        net = round(gross - platform_fee - refunds, 2)
        available = round(net - paid_out - pending_payout, 2)
        entries.append(
            {
                "teacher_id": teacher_id,
                "teacher_name": teacher_names.get(teacher_id, ""),
                "gross_revenue": gross,
                "platform_fee": platform_fee,
                "net_revenue": net,
                "refunds": refunds,
                "paid_out": paid_out,
                "pending_payout": pending_payout,
                "available_balance": max(0.0, available),
            }
        )
    entries.sort(key=lambda e: e["gross_revenue"], reverse=True)
    return entries


async def get_teacher_available_balance(session: AsyncSession, teacher_id: UUID) -> float:
    revenue = await get_teacher_revenue(session)
    for entry in revenue:
        if entry["teacher_id"] == teacher_id:
            return entry["available_balance"]
    return 0.0


# ── Dashboard ──


async def get_dashboard(session: AsyncSession) -> FinanceDashboardRead:
    fee_pct = settings.platform_fee_percent

    gmv_result = await session.execute(
        select(func.coalesce(func.sum(WalletTransaction.amount), 0)).where(
            WalletTransaction.type == TransactionType.PAYMENT, WalletTransaction.status == TransactionStatus.PAID
        )
    )
    gmv = float(gmv_result.scalar_one())

    refunds_result = await session.execute(
        select(func.coalesce(func.sum(WalletTransaction.amount), 0)).where(
            WalletTransaction.type == TransactionType.REFUND, WalletTransaction.status == TransactionStatus.REFUNDED
        )
    )
    refunds = float(refunds_result.scalar_one())

    pending_payouts_result = await session.execute(
        select(func.coalesce(func.sum(PayoutRequest.amount), 0)).where(PayoutRequest.status == PayoutStatus.PENDING)
    )
    pending_payouts = float(pending_payouts_result.scalar_one())

    active_subs_result = await session.execute(
        select(func.count(TeacherSubscription.id)).where(TeacherSubscription.status == SubscriptionStatus.ACTIVE)
    )
    active_subscriptions = int(active_subs_result.scalar_one())

    mrr_result = await session.execute(
        select(func.coalesce(func.sum(TeacherSubscription.monthly_fee), 0)).where(
            TeacherSubscription.status == SubscriptionStatus.ACTIVE
        )
    )
    mrr = float(mrr_result.scalar_one())

    trend = await _revenue_trend(session)

    return FinanceDashboardRead(
        gmv=gmv,
        platform_revenue=round(gmv * fee_pct / 100, 2),
        refunds=refunds,
        pending_payouts=pending_payouts,
        active_subscriptions=active_subscriptions,
        mrr=mrr,
        platform_fee_percent=fee_pct,
        revenue_trend=trend,
    )


async def _revenue_trend(session: AsyncSession, months: int = 6) -> list[RevenueTrendPoint]:
    now = datetime.now(timezone.utc)
    fee_pct = settings.platform_fee_percent
    points: list[RevenueTrendPoint] = []
    for offset in range(months - 1, -1, -1):
        month_start = _shift_month(now, -offset).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = _shift_month(month_start, 1)
        result = await session.execute(
            select(func.coalesce(func.sum(WalletTransaction.amount), 0)).where(
                WalletTransaction.type == TransactionType.PAYMENT,
                WalletTransaction.status == TransactionStatus.PAID,
                WalletTransaction.created_at >= month_start,
                WalletTransaction.created_at < month_end,
            )
        )
        month_gmv = float(result.scalar_one())
        points.append(
            RevenueTrendPoint(
                month=month_start.strftime("%b"),
                gmv=month_gmv,
                platform_revenue=round(month_gmv * fee_pct / 100, 2),
            )
        )
    return points


def _shift_month(dt: datetime, delta: int) -> datetime:
    month_index = dt.month - 1 + delta
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    return dt.replace(year=year, month=month)


# ── Subscriptions ──


def _subscription_to_dict(subscription: TeacherSubscription, teacher_name: str) -> dict:
    return {
        "id": subscription.id,
        "teacher_id": subscription.teacher_id,
        "teacher_name": teacher_name,
        "plan": subscription.plan,
        "monthly_fee": float(subscription.monthly_fee),
        "status": subscription.status,
        "payment_status": subscription.payment_status,
        "renewal_date": subscription.renewal_date,
        "created_at": subscription.created_at,
        "updated_at": subscription.updated_at,
    }


async def ensure_teacher_subscription(session: AsyncSession, teacher_id: UUID) -> TeacherSubscription:
    result = await session.execute(select(TeacherSubscription).where(TeacherSubscription.teacher_id == teacher_id))
    subscription = result.scalar_one_or_none()
    if subscription is not None:
        return subscription
    subscription = TeacherSubscription(teacher_id=teacher_id, plan=SubscriptionPlan.FREE, monthly_fee=0)
    session.add(subscription)
    await session.flush()
    return subscription


async def list_subscriptions(session: AsyncSession) -> list[dict]:
    teachers_result = await session.execute(select(User.id).where(User.role == Role.TEACHER))
    for (teacher_id,) in teachers_result.all():
        await ensure_teacher_subscription(session, teacher_id)
    await session.commit()

    result = await session.execute(
        select(TeacherSubscription, User.full_name)
        .join(User, User.id == TeacherSubscription.teacher_id)
        .order_by(TeacherSubscription.monthly_fee.desc())
    )
    return [_subscription_to_dict(subscription, name) for subscription, name in result.all()]


async def update_subscription(session: AsyncSession, teacher_id: UUID, payload: TeacherSubscriptionUpdate) -> dict | None:
    subscription = await ensure_teacher_subscription(session, teacher_id)
    teacher = await session.get(User, teacher_id)
    if teacher is None:
        return None

    if payload.plan is not None:
        subscription.plan = payload.plan
        subscription.monthly_fee = PLAN_FEES[payload.plan]
    if payload.status is not None:
        subscription.status = payload.status

    if payload.record_payment:
        subscription.payment_status = SubscriptionPaymentStatus.PAID
        base = subscription.renewal_date or datetime.now(timezone.utc)
        subscription.renewal_date = base + timedelta(days=30)
        if float(subscription.monthly_fee) > 0:
            public_code = await _next_public_code(session, "seq_invoice_code", EntityType.INVOICE)
            tax = round(float(subscription.monthly_fee) * settings.tax_rate_percent / 100, 2)
            invoice = Invoice(
                public_code=public_code,
                user_id=teacher_id,
                course_id=None,
                amount=subscription.monthly_fee,
                tax_amount=tax,
                total_amount=round(float(subscription.monthly_fee) + tax, 2),
                status=InvoiceStatus.PAID,
                note=f"{subscription.plan.value.title()} plan subscription renewal",
                paid_at=datetime.now(timezone.utc),
            )
            session.add(invoice)

    await session.commit()
    await session.refresh(subscription)
    return _subscription_to_dict(subscription, teacher.full_name)


# ── Payouts ──


def _payout_to_dict(payout: PayoutRequest, teacher_name: str) -> dict:
    return {
        "id": payout.id,
        "public_code": payout.public_code,
        "teacher_id": payout.teacher_id,
        "teacher_name": teacher_name,
        "amount": float(payout.amount),
        "method": payout.method,
        "status": payout.status,
        "note": payout.note,
        "requested_at": payout.requested_at,
        "decided_at": payout.decided_at,
    }


async def list_payout_requests(session: AsyncSession) -> list[dict]:
    result = await session.execute(
        select(PayoutRequest, User.full_name)
        .join(User, User.id == PayoutRequest.teacher_id)
        .order_by(PayoutRequest.requested_at.desc())
    )
    return [_payout_to_dict(payout, name) for payout, name in result.all()]


async def create_payout_request(session: AsyncSession, teacher_id: UUID, payload: PayoutRequestCreate) -> dict:
    available = await get_teacher_available_balance(session, teacher_id)
    if payload.amount > available:
        raise ValueError("Requested amount exceeds available balance")

    public_code = await _next_public_code(session, "seq_payout_code", EntityType.PAYOUT)
    payout = PayoutRequest(
        public_code=public_code,
        teacher_id=teacher_id,
        amount=payload.amount,
        method=payload.method,
        note=payload.note,
    )
    session.add(payout)
    await session.commit()
    await session.refresh(payout)

    teacher = await session.get(User, teacher_id)
    return _payout_to_dict(payout, teacher.full_name if teacher else "")


async def decide_payout_request(
    session: AsyncSession, payout_id: UUID, payload: PayoutDecision, decided_by: UUID
) -> dict | None:
    payout = await session.get(PayoutRequest, payout_id)
    if payout is None:
        return None
    payout.status = payload.status
    payout.decided_at = datetime.now(timezone.utc)
    payout.decided_by = decided_by
    if payload.note is not None:
        payout.note = payload.note
    await session.commit()
    await session.refresh(payout)

    teacher = await session.get(User, payout.teacher_id)
    return _payout_to_dict(payout, teacher.full_name if teacher else "")
