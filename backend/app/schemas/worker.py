import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class WorkerCreate(BaseModel):
    name: str = Field(min_length=1)
    mobile_number: str = Field(min_length=1)
    daily_wage: Decimal = Field(gt=0)


class WorkerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    mobile_number: str | None = Field(default=None, min_length=1)
    daily_wage: Decimal | None = Field(default=None, gt=0)
    is_active: bool | None = None


class WorkerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    mobile_number: str
    daily_wage: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime
