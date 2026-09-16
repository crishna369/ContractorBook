import uuid
from datetime import date as date_type
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.additional_work import AdditionalWork
from app.models.attendance import AttendanceEntry
from app.models.billing import BillReceipt, ClientBill
from app.models.expense import SiteExpense
from app.models.payment import WorkerPayment
from app.models.site import Site
from app.models.worker import Worker


def _apply_date_range(query, date_col, date_from: date_type | None, date_to: date_type | None):
    if date_from is not None:
        query = query.where(date_col >= date_from)
    if date_to is not None:
        query = query.where(date_col <= date_to)
    return query


async def get_worker_report(
    db: AsyncSession,
    business_id: uuid.UUID,
    worker_id: uuid.UUID,
    date_from: date_type | None,
    date_to: date_type | None,
) -> dict:
    attendance_query = _apply_date_range(
        select(
            AttendanceEntry.site_id,
            Site.name,
            func.sum(AttendanceEntry.value).label("days_worked"),
            func.sum(AttendanceEntry.value * AttendanceEntry.wage_at_entry).label("earnings"),
        )
        .join(Site, Site.id == AttendanceEntry.site_id)
        .where(AttendanceEntry.business_id == business_id, AttendanceEntry.worker_id == worker_id)
        .group_by(AttendanceEntry.site_id, Site.name),
        AttendanceEntry.date,
        date_from,
        date_to,
    )
    attendance_result = await db.execute(attendance_query)
    sites = [
        {
            "site_id": site_id,
            "site_name": site_name,
            "days_worked": Decimal(days_worked),
            "earnings": Decimal(earnings),
        }
        for site_id, site_name, days_worked, earnings in attendance_result.all()
    ]
    attendance_earnings = sum((s["earnings"] for s in sites), Decimal(0))

    additional_work_query = _apply_date_range(
        select(func.coalesce(func.sum(AdditionalWork.amount), 0)).where(
            AdditionalWork.business_id == business_id, AdditionalWork.worker_id == worker_id
        ),
        AdditionalWork.date,
        date_from,
        date_to,
    )
    additional_work_earnings = Decimal(await db.scalar(additional_work_query) or 0)

    payments_query = _apply_date_range(
        select(func.coalesce(func.sum(WorkerPayment.amount), 0)).where(
            WorkerPayment.business_id == business_id, WorkerPayment.worker_id == worker_id
        ),
        WorkerPayment.date,
        date_from,
        date_to,
    )
    total_paid = Decimal(await db.scalar(payments_query) or 0)

    total_earned = attendance_earnings + additional_work_earnings

    return {
        "worker_id": worker_id,
        "from_date": date_from,
        "to_date": date_to,
        "sites": sites,
        "attendance_earnings": attendance_earnings,
        "additional_work_earnings": additional_work_earnings,
        "total_earned": total_earned,
        "total_paid": total_paid,
        "balance_payable": total_earned - total_paid,
    }


async def get_site_report(
    db: AsyncSession,
    business_id: uuid.UUID,
    site_id: uuid.UUID,
    date_from: date_type | None,
    date_to: date_type | None,
) -> dict:
    bill_query = _apply_date_range(
        select(func.coalesce(func.sum(ClientBill.bill_amount), 0)).where(
            ClientBill.business_id == business_id, ClientBill.site_id == site_id
        ),
        ClientBill.bill_date,
        date_from,
        date_to,
    )
    bill_total = Decimal(await db.scalar(bill_query) or 0)

    received_query = _apply_date_range(
        select(func.coalesce(func.sum(BillReceipt.amount_received), 0))
        .join(ClientBill, ClientBill.id == BillReceipt.bill_id)
        .where(BillReceipt.business_id == business_id, ClientBill.site_id == site_id),
        BillReceipt.date_received,
        date_from,
        date_to,
    )
    received_total = Decimal(await db.scalar(received_query) or 0)

    workers_query = _apply_date_range(
        select(
            AttendanceEntry.worker_id,
            Worker.name,
            func.sum(AttendanceEntry.value).label("days_worked"),
            func.sum(AttendanceEntry.value * AttendanceEntry.wage_at_entry).label("labour_cost"),
        )
        .join(Worker, Worker.id == AttendanceEntry.worker_id)
        .where(AttendanceEntry.business_id == business_id, AttendanceEntry.site_id == site_id)
        .group_by(AttendanceEntry.worker_id, Worker.name),
        AttendanceEntry.date,
        date_from,
        date_to,
    )
    workers_result = await db.execute(workers_query)
    workers = [
        {
            "worker_id": worker_id,
            "worker_name": worker_name,
            "days_worked": Decimal(days_worked),
            "labour_cost": Decimal(labour_cost),
        }
        for worker_id, worker_name, days_worked, labour_cost in workers_result.all()
    ]
    labour_cost_total = sum((w["labour_cost"] for w in workers), Decimal(0))

    expenses_query = _apply_date_range(
        select(func.coalesce(func.sum(SiteExpense.amount), 0)).where(
            SiteExpense.business_id == business_id, SiteExpense.site_id == site_id
        ),
        SiteExpense.date,
        date_from,
        date_to,
    )
    expenses_total = Decimal(await db.scalar(expenses_query) or 0)

    return {
        "site_id": site_id,
        "from_date": date_from,
        "to_date": date_to,
        "bill_total": bill_total,
        "received_total": received_total,
        "bill_balance": bill_total - received_total,
        "workers": workers,
        "labour_cost_total": labour_cost_total,
        "expenses_total": expenses_total,
        "position": received_total - labour_cost_total - expenses_total,
    }
