import uuid
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class AdditionalWorkCreate(BaseModel):
    worker_id: uuid.UUID
    date: date_type
    amount: Decimal = Field(gt=0)
    description: str = Field(min_length=1)


class AdditionalWorkUpdate(BaseModel):
    date: date_type | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, min_length=1)


class AdditionalWorkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    worker_id: uuid.UUID
    date: date_type
    amount: Decimal
    description: str
    created_at: datetime
    updated_at: datetime
