import uuid
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class OpeningBalanceInput(BaseModel):
    opening_cash: Decimal = Field(ge=0)
    opening_bank: Decimal = Field(ge=0)
    as_of_date: date_type


class OpeningBalanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    opening_cash: Decimal
    opening_bank: Decimal
    as_of_date: date_type
    updated_at: datetime


class MethodBalance(BaseModel):
    opening: Decimal
    money_in: Decimal
    money_out: Decimal
    balance: Decimal


class LedgerBalancesOut(BaseModel):
    as_of_date: date_type | None
    cash: MethodBalance
    bank: MethodBalance


class LedgerTransactionOut(BaseModel):
    id: uuid.UUID
    date: date_type
    type: str
    direction: str
    amount: Decimal
    payment_method: str
    label: str
    site_id: uuid.UUID | None
    worker_id: uuid.UUID | None
