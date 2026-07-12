from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_course, assert_teaches_student
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student, get_current_teacher
from app.modules.wallets import service
from app.modules.wallets.models import Wallet
from app.modules.wallets.schemas import (
    WalletRead,
    WalletRechargeCreate,
    WalletTransactionCreate,
    WalletTransactionRead,
    WalletTransactionUpdate,
)

router = APIRouter(prefix="/wallets", tags=["wallets"])


@router.get("/me", response_model=WalletRead)
async def get_my_wallet(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> WalletRead:
    balance = await service.get_wallet_balance(session, current_user.id)
    return WalletRead(student_id=current_user.id, balance=balance)


@router.get("/me/transactions", response_model=list[WalletTransactionRead])
async def list_my_transactions(
    limit: int | None = Query(default=None, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> list[WalletTransactionRead]:
    return await service.list_transactions_for_student(session, current_user.id, limit=limit, offset=offset)


@router.post("/me/recharge", response_model=WalletTransactionRead, status_code=status.HTTP_201_CREATED)
async def recharge_my_wallet(
    payload: WalletRechargeCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> WalletTransactionRead:
    return await service.recharge_wallet(session, current_user.id, payload.amount, payload.payment_method, payload.note)


@router.get("/transactions", response_model=list[WalletTransactionRead])
async def list_transactions(
    course_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[WalletTransactionRead]:
    await assert_owns_course(session, course_id, current_user)
    return await service.list_transactions_for_course(session, course_id)


@router.post("/transactions", response_model=WalletTransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: WalletTransactionCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> WalletTransactionRead:
    await assert_teaches_student(session, payload.student_id, current_user)
    if payload.course_id is not None:
        await assert_owns_course(session, payload.course_id, current_user)
    return await service.create_transaction(session, payload)


@router.patch("/transactions/{transaction_id}", response_model=WalletTransactionRead)
async def update_transaction(
    transaction_id: UUID,
    payload: WalletTransactionUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> WalletTransactionRead:
    transaction = await service.get_transaction(session, transaction_id)
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    if transaction.course_id is not None:
        await assert_owns_course(session, transaction.course_id, current_user, not_found_detail="Transaction not found")
    else:
        wallet = await session.get(Wallet, transaction.wallet_id)
        if wallet is not None:
            await assert_teaches_student(session, wallet.student_id, current_user)
    updated = await service.update_transaction(session, transaction_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return updated


@router.get("/{student_id}", response_model=WalletRead)
async def get_wallet(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> WalletRead:
    await assert_teaches_student(session, student_id, current_user)
    balance = await service.get_wallet_balance(session, student_id)
    return WalletRead(student_id=student_id, balance=balance)
