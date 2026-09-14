import uuid
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, computed_field, field_validator

from app.models.attendance import ATTENDANCE_VALUES


def _validate_attendance_value(v: Decimal) -> Decimal:
    if v not in ATTENDANCE_VALUES:
        raise ValueError(f"value must be one of {ATTENDANCE_VALUES}")
    return v


class AttendanceSiteValue(BaseModel):
    site_id: uuid.UUID
    value: Decimal

    _validate_value = field_validator("value")(_validate_attendance_value)


class AttendanceSaveRequest(BaseModel):
    worker_id: uuid.UUID
    date: date_type
    entries: list[AttendanceSiteValue]


class AttendanceEntryUpdate(BaseModel):
    value: Decimal

    _validate_value = field_validator("value")(_validate_attendance_value)


class AttendanceEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    worker_id: uuid.UUID
    site_id: uuid.UUID
    date: date_type
    value: Decimal
    wage_at_entry: Decimal
    created_at: datetime
    updated_at: datetime

    @computed_field  # type: ignore[prop-decorator]
    @property
    def earnings(self) -> Decimal:
        return self.value * self.wage_at_entry
