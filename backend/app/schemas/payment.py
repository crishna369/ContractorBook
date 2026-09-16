import uuid
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.payment import PAYMENT_METHODS, PAYMENT_TYPES


def _validate_payment_type(value: str) -> str:
    if value not in PAYMENT_TYPES:
        raise ValueError(f"payment_type must be one of {PAYMENT_TYPES}")
    return value


def _validate_payment_method(value: str) -> str:
    if value not in PAYMENT_METHODS:
        raise ValueError(f"payment_method must be one of {PAYMENT_METHODS}")
    return value


class WorkerPaymentCreate(BaseModel):
    worker_id: uuid.UUID
    site_id: uuid.UUID | None = None
    date: date_type
    amount: Decimal = Field(gt=0)
    payment_type: str
    reason: str | None = None
    payment_method: str
    payment_details: str | None = None

    _validate_payment_type = field_validator("payment_type")(_validate_payment_type)
    _validate_payment_method = field_validator("payment_method")(_validate_payment_method)


class WorkerPaymentUpdate(BaseModel):
    site_id: uuid.UUID | None = None
    date: date_type | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    payment_type: str | None = None
    reason: str | None = None
    payment_method: str | None = None
    payment_details: str | None = None

    _validate_payment_type = field_validator("payment_type")(
        lambda v: _validate_payment_type(v) if v is not None else v
    )
    _validate_payment_method = field_validator("payment_method")(
        lambda v: _validate_payment_method(v) if v is not None else v
    )


class WorkerPaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    worker_id: uuid.UUID
    site_id: uuid.UUID | None
    date: date_type
    amount: Decimal
    payment_type: str
    reason: str | None
    payment_method: str
    payment_details: str | None
    created_at: datetime
    updated_at: datetime


class WorkerBalanceOut(BaseModel):
    total_earned: Decimal
    total_paid: Decimal
    balance_payable: Decimal
