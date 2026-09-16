import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _validate_mobile_number(value: str | None) -> str | None:
    if value is None or value == "":
        return None
    if not (value.isdigit() and len(value) == 10):
        raise ValueError("Mobile number must be exactly 10 digits")
    return value


def _validate_daily_wage(value: Decimal | None) -> Decimal | None:
    if value is not None and value % 1 != 0:
        raise ValueError("Daily wage must not have decimal places")
    return value


class WorkerCreate(BaseModel):
    name: str = Field(min_length=1)
    mobile_number: str | None = Field(default=None)
    daily_wage: Decimal = Field(gt=0)

    _validate_mobile_number = field_validator("mobile_number")(_validate_mobile_number)
    _validate_daily_wage = field_validator("daily_wage")(_validate_daily_wage)


class WorkerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    mobile_number: str | None = Field(default=None)
    daily_wage: Decimal | None = Field(default=None, gt=0)
    is_active: bool | None = None

    _validate_mobile_number = field_validator("mobile_number")(_validate_mobile_number)
    _validate_daily_wage = field_validator("daily_wage")(_validate_daily_wage)


class WorkerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    mobile_number: str | None
    daily_wage: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime
