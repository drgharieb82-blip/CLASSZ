from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_finance, get_current_teacher
from app.modules.finance import service
from app.modules.finance.schemas import (
    CouponCreate,
    CouponRead,
    CouponUpdate,
    FinanceDashboardRead,
    FinanceTransactionRead,
    InvoiceRead,
    PayoutDecision,
    PayoutRequestCreate,
    PayoutRequestRead,
    TeacherRevenueRead,
    TeacherSubscriptionRead,
    TeacherSubscriptionUpdate,
)
from app.modules.wallets.models import TransactionStatus, TransactionType

router = APIRouter(prefix="/finance", tags=["finance"])


@router.get("/dashboard", response_model=FinanceDashboardRead)
async def get_dashboard(
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> FinanceDashboardRead:
    return await service.get_dashboard(session)


@router.get("/payments", response_model=list[FinanceTransactionRead])
async def list_payments(
    status_filter: TransactionStatus | None = Query(default=None, alias="status"),
    type_filter: TransactionType | None = Query(default=None, alias="type"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> list[FinanceTransactionRead]:
    return await service.list_all_transactions(
        session, status_filter=status_filter, type_filter=type_filter, limit=limit, offset=offset
    )


@router.get("/teacher-revenue", response_model=list[TeacherRevenueRead])
async def get_teacher_revenue(
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> list[TeacherRevenueRead]:
    return await service.get_teacher_revenue(session)


@router.get("/invoices", response_model=list[InvoiceRead])
async def list_invoices(
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> list[InvoiceRead]:
    return await service.list_invoices(session)


@router.get("/coupons", response_model=list[CouponRead])
async def list_coupons(
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> list[CouponRead]:
    return await service.list_coupons(session)


@router.post("/coupons", response_model=CouponRead, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    payload: CouponCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_finance),
) -> CouponRead:
    try:
        return await service.create_coupon(session, payload, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.patch("/coupons/{coupon_id}", response_model=CouponRead)
async def update_coupon(
    coupon_id: UUID,
    payload: CouponUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> CouponRead:
    updated = await service.update_coupon(session, coupon_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
    return updated


@router.delete("/coupons/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coupon(
    coupon_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> None:
    deleted = await service.delete_coupon(session, coupon_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")


@router.get("/subscriptions", response_model=list[TeacherSubscriptionRead])
async def list_subscriptions(
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> list[TeacherSubscriptionRead]:
    return await service.list_subscriptions(session)


@router.patch("/subscriptions/{teacher_id}", response_model=TeacherSubscriptionRead)
async def update_subscription(
    teacher_id: UUID,
    payload: TeacherSubscriptionUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> TeacherSubscriptionRead:
    updated = await service.update_subscription(session, teacher_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    return updated


@router.get("/payouts", response_model=list[PayoutRequestRead])
async def list_payouts(
    session: AsyncSession = Depends(get_db_session),
    _current_user: User = Depends(get_current_finance),
) -> list[PayoutRequestRead]:
    return await service.list_payout_requests(session)


@router.post("/payouts/{payout_id}/decide", response_model=PayoutRequestRead)
async def decide_payout(
    payout_id: UUID,
    payload: PayoutDecision,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_finance),
) -> PayoutRequestRead:
    updated = await service.decide_payout_request(session, payout_id, payload, current_user.id)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payout request not found")
    return updated


@router.get("/payouts/me", response_model=list[PayoutRequestRead])
async def list_my_payouts(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[PayoutRequestRead]:
    all_payouts = await service.list_payout_requests(session)
    return [p for p in all_payouts if p["teacher_id"] == current_user.id]


@router.get("/payouts/me/balance")
async def get_my_available_balance(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> dict[str, float]:
    balance = await service.get_teacher_available_balance(session, current_user.id)
    return {"available_balance": balance}


@router.post("/payouts/me", response_model=PayoutRequestRead, status_code=status.HTTP_201_CREATED)
async def request_payout(
    payload: PayoutRequestCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> PayoutRequestRead:
    try:
        return await service.create_payout_request(session, current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=str(exc))
