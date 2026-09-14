import uuid
from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SiteCreate(BaseModel):
    name: str = Field(min_length=1)
    start_date: date_type | None = None


class SiteUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    start_date: date_type | None = None
    is_active: bool | None = None


class SiteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    start_date: date_type | None
    is_active: bool
    created_at: datetime
