import uuid
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.billing import BILL_RECEIPT_PAYMENT_METHODS


def _validate_payment_method(value: str) -> str:
    if value not in BILL_RECEIPT_PAYMENT_METHODS:
        raise ValueError(f"payment_method must be one of {BILL_RECEIPT_PAYMENT_METHODS}")
    return value


class ClientBillCreate(BaseModel):
    site_id: uuid.UUID
    bill_date: date_type
    bill_amount: Decimal = Field(gt=0)
    remarks: str | None = None


class ClientBillUpdate(BaseModel):
    bill_date: date_type | None = None
    bill_amount: Decimal | None = Field(default=None, gt=0)
    remarks: str | None = None


class ClientBillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    site_id: uuid.UUID
    bill_date: date_type
    bill_amount: Decimal
    remarks: str | None
    created_at: datetime
    updated_at: datetime


class ClientBillWithBalanceOut(ClientBillOut):
    amount_received: Decimal
    balance: Decimal


class BillReceiptCreate(BaseModel):
    bill_id: uuid.UUID
    amount_received: Decimal = Field(gt=0)
    date_received: date_type
    payment_method: str

    _validate_payment_method = field_validator("payment_method")(_validate_payment_method)


class BillReceiptUpdate(BaseModel):
    amount_received: Decimal | None = Field(default=None, gt=0)
    date_received: date_type | None = None
    payment_method: str | None = None

    _validate_payment_method = field_validator("payment_method")(
        lambda v: _validate_payment_method(v) if v is not None else v
    )


class BillReceiptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    bill_id: uuid.UUID
    amount_received: Decimal
    date_received: date_type
    payment_method: str
    created_at: datetime
    updated_at: datetime


class ClientBillDetailOut(ClientBillWithBalanceOut):
    receipts: list[BillReceiptOut]
