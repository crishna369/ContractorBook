import uuid
from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel


class WorkerSiteBreakdown(BaseModel):
    site_id: uuid.UUID
    site_name: str
    days_worked: Decimal
    earnings: Decimal


class WorkerReportOut(BaseModel):
    worker_id: uuid.UUID
    from_date: date_type | None
    to_date: date_type | None
    sites: list[WorkerSiteBreakdown]
    attendance_earnings: Decimal
    additional_work_earnings: Decimal
    total_earned: Decimal
    total_paid: Decimal
    balance_payable: Decimal


class SiteWorkerBreakdown(BaseModel):
    worker_id: uuid.UUID
    worker_name: str
    days_worked: Decimal
    labour_cost: Decimal


class SiteReportOut(BaseModel):
    site_id: uuid.UUID
    from_date: date_type | None
    to_date: date_type | None
    bill_total: Decimal
    received_total: Decimal
    bill_balance: Decimal
    workers: list[SiteWorkerBreakdown]
    labour_cost_total: Decimal
    expenses_total: Decimal
    position: Decimal
