from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.models.user import User
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.notifications import service as notifications_service
from app.modules.parents import service as parents_service
from app.modules.wallets.models import TransactionStatus, TransactionType, Wallet, WalletTransaction
from app.modules.wallets.schemas import WalletTransactionCreate, WalletTransactionUpdate


async def _next_transaction_public_code(session: AsyncSession) -> str:
    result = await session.execute(text("SELECT nextval('seq_wallet_transaction_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.WALLET_TRANSACTION, sequence)


async def ensure_wallet(session: AsyncSession, student_id: UUID) -> Wallet:
    result = await session.execute(select(Wallet).where(Wallet.student_id == student_id))
    wallet = result.scalar_one_or_none()
    if wallet is not None:
        return wallet
    wallet = Wallet(student_id=student_id, balance=0)
    session.add(wallet)
    await session.flush()
    return wallet


async def get_or_create_wallet(session: AsyncSession, student_id: UUID) -> Wallet:
    wallet = await ensure_wallet(session, student_id)
    await session.commit()
    await session.refresh(wallet)
    return wallet


async def get_wallet_balance(session: AsyncSession, student_id: UUID) -> float:
    wallet = await get_or_create_wallet(session, student_id)
    return float(wallet.balance)


def _transaction_balance_delta(transaction_type: TransactionType, status: TransactionStatus, amount: float) -> float:
    if status == TransactionStatus.PAID:
        if transaction_type == TransactionType.PAYMENT:
            return -amount
        if transaction_type in (TransactionType.TOPUP, TransactionType.ADJUSTMENT):
            return amount
    if status == TransactionStatus.REFUNDED and transaction_type == TransactionType.REFUND:
        return amount
    return 0.0


def _to_read(
    transaction: WalletTransaction,
    student_id: UUID,
    student_name: str,
    course_title: str | None,
):
    from app.modules.wallets.schemas import WalletTransactionRead

    return WalletTransactionRead(
        id=transaction.id,
        public_code=transaction.public_code,
        student_id=student_id,
        student_name=student_name,
        course_id=transaction.course_id,
        course_title=course_title,
        type=transaction.type,
        amount=float(transaction.amount),
        status=transaction.status,
        coupon_code=transaction.coupon_code,
        note=transaction.note,
        created_at=transaction.created_at,
    )


async def list_transactions_for_course(session: AsyncSession, course_id: UUID):
    result = await session.execute(
        select(WalletTransaction, Wallet.student_id, User.full_name, Course.title)
        .join(Wallet, Wallet.id == WalletTransaction.wallet_id)
        .join(User, User.id == Wallet.student_id)
        .outerjoin(Course, Course.id == WalletTransaction.course_id)
        .where(WalletTransaction.course_id == course_id)
        .order_by(WalletTransaction.created_at.desc())
    )
    entries = []
    for transaction, student_id, full_name, course_title in result.all():
        entries.append(_to_read(transaction, student_id, full_name, course_title))
    return entries


async def list_transactions_for_student(
    session: AsyncSession,
    student_id: UUID,
    *,
    limit: int | None = None,
    offset: int = 0,
):
    query = (
        select(WalletTransaction, Wallet.student_id, User.full_name, Course.title)
        .join(Wallet, Wallet.id == WalletTransaction.wallet_id)
        .join(User, User.id == Wallet.student_id)
        .outerjoin(Course, Course.id == WalletTransaction.course_id)
        .where(Wallet.student_id == student_id)
        .order_by(WalletTransaction.created_at.desc())
        .offset(offset)
    )
    if limit is not None:
        query = query.limit(limit)
    result = await session.execute(query)
    entries = []
    for transaction, wallet_student_id, full_name, course_title in result.all():
        entries.append(_to_read(transaction, wallet_student_id, full_name, course_title))
    return entries


async def get_transaction(session: AsyncSession, transaction_id: UUID) -> WalletTransaction | None:
    result = await session.execute(
        select(WalletTransaction).where(WalletTransaction.id == transaction_id)
    )
    return result.scalar_one_or_none()


async def create_transaction(session: AsyncSession, payload: WalletTransactionCreate):
    transaction = await stage_transaction(session, payload)

    await session.commit()
    await session.refresh(transaction)

    student = await session.get(User, payload.student_id)
    course = await session.get(Course, payload.course_id) if payload.course_id else None
    return _to_read(
        transaction,
        payload.student_id,
        student.full_name if student else "",
        course.title if course else None,
    )


async def recharge_wallet(
    session: AsyncSession,
    student_id: UUID,
    amount: float,
    payment_method: str,
    note: str | None = None,
):
    payload = WalletTransactionCreate(
        student_id=student_id,
        type=TransactionType.TOPUP,
        amount=amount,
        status=TransactionStatus.PAID,
        note=note or f"Recharge via {payment_method}",
    )
    transaction = await create_transaction(session, payload)
    await notifications_service.create_notification(
        session,
        notifications_service.notify_wallet_recharge(student_id, amount),
    )
    parent_ids = await parents_service.get_active_parent_ids_for_student(session, student_id)
    for parent_id in parent_ids:
        await notifications_service.create_notification(
            session,
            notifications_service.notify_wallet_recharge(parent_id, amount, for_parent=True),
        )
    return transaction


async def stage_transaction(session: AsyncSession, payload: WalletTransactionCreate) -> WalletTransaction:
    wallet = await ensure_wallet(session, payload.student_id)
    public_code = await _next_transaction_public_code(session)
    transaction = WalletTransaction(
        public_code=public_code,
        wallet_id=wallet.id,
        course_id=payload.course_id,
        type=payload.type,
        amount=payload.amount,
        status=payload.status,
        coupon_code=payload.coupon_code,
        note=payload.note,
    )
    session.add(transaction)
    wallet.balance = float(wallet.balance) + _transaction_balance_delta(payload.type, payload.status, float(payload.amount))
    await session.flush()
    return transaction


async def update_transaction(session: AsyncSession, transaction_id: UUID, payload: WalletTransactionUpdate):
    result = await session.execute(
        select(WalletTransaction, Wallet).join(Wallet, Wallet.id == WalletTransaction.wallet_id).where(
            WalletTransaction.id == transaction_id
        )
    )
    row = result.first()
    if row is None:
        return None
    transaction, wallet = row

    previous_status = transaction.status
    if payload.status is not None:
        previous_delta = _transaction_balance_delta(transaction.type, previous_status, float(transaction.amount))
        transaction.status = payload.status
        next_delta = _transaction_balance_delta(transaction.type, payload.status, float(transaction.amount))
        wallet.balance = float(wallet.balance) - previous_delta + next_delta
    if payload.note is not None:
        transaction.note = payload.note

    await session.commit()
    await session.refresh(transaction)

    student = await session.get(User, wallet.student_id)
    course = await session.get(Course, transaction.course_id) if transaction.course_id else None
    return _to_read(
        transaction,
        wallet.student_id,
        student.full_name if student else "",
        course.title if course else None,
    )
