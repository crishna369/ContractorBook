import uuid
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.expense import EXPENSE_PAYMENT_METHODS, PAID_BY_OPTIONS


def _validate_paid_by(value: str) -> str:
    if value not in PAID_BY_OPTIONS:
        raise ValueError(f"paid_by must be one of {PAID_BY_OPTIONS}")
    return value


def _validate_payment_method(value: str) -> str:
    if value not in EXPENSE_PAYMENT_METHODS:
        raise ValueError(f"payment_method must be one of {EXPENSE_PAYMENT_METHODS}")
    return value


class SiteExpenseCreate(BaseModel):
    site_id: uuid.UUID
    date: date_type
    amount: Decimal = Field(gt=0)
    description: str = Field(min_length=1)
    paid_by: str
    payment_method: str

    _validate_paid_by = field_validator("paid_by")(_validate_paid_by)
    _validate_payment_method = field_validator("payment_method")(_validate_payment_method)


class SiteExpenseUpdate(BaseModel):
    date: date_type | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, min_length=1)
    paid_by: str | None = None
    payment_method: str | None = None

    _validate_paid_by = field_validator("paid_by")(lambda v: _validate_paid_by(v) if v is not None else v)
    _validate_payment_method = field_validator("payment_method")(
        lambda v: _validate_payment_method(v) if v is not None else v
    )


class SiteExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    site_id: uuid.UUID
    date: date_type
    amount: Decimal
    description: str
    paid_by: str
    payment_method: str
    created_at: datetime
    updated_at: datetime
