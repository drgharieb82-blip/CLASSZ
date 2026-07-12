from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.wallets.models import TransactionStatus, TransactionType


class WalletTransactionCreate(BaseModel):
    student_id: UUID
    course_id: UUID | None = None
    type: TransactionType
    amount: float = Field(ge=0)
    status: TransactionStatus = TransactionStatus.PENDING
    coupon_code: str | None = None
    note: str | None = None


class WalletTransactionUpdate(BaseModel):
    status: TransactionStatus | None = None
    note: str | None = None


class WalletTransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    student_id: UUID
    student_name: str
    course_id: UUID | None
    course_title: str | None
    type: TransactionType
    amount: float
    status: TransactionStatus
    coupon_code: str | None
    note: str | None
    created_at: datetime


class WalletRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: UUID
    balance: float


class WalletRechargeCreate(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = Field(min_length=1, max_length=80)
    note: str | None = None
