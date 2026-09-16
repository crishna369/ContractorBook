import uuid
from decimal import Decimal

from pydantic import BaseModel


class MoneyInHand(BaseModel):
    cash: Decimal
    bank: Decimal
    total: Decimal


class TodayAttendance(BaseModel):
    marked: int
    total_active_workers: int
    labour_cost: Decimal


class SitePosition(BaseModel):
    site_id: uuid.UUID
    name: str
    received: Decimal
    labour_cost: Decimal
    expenses: Decimal
    position: Decimal


class DashboardOut(BaseModel):
    money_in_hand: MoneyInHand
    today_attendance: TodayAttendance
    payable_total: Decimal
    receivable_total: Decimal
    sites: list[SitePosition]
