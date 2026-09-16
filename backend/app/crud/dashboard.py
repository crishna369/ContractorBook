import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import ledger as ledger_crud
from app.models.additional_work import AdditionalWork
from app.models.attendance import AttendanceEntry
from app.models.billing import BillReceipt, ClientBill
from app.models.expense import SiteExpense
from app.models.payment import WorkerPayment
from app.models.site import Site
from app.models.worker import Worker


async def _scalar_decimal(db: AsyncSession, query) -> Decimal:
    return Decimal(await db.scalar(query) or 0)


async def get_dashboard(db: AsyncSession, business_id: uuid.UUID) -> dict:
    balances = await ledger_crud.get_balances(db, business_id)
    cash_balance = balances["cash"]["balance"]
    bank_balance = balances["bank"]["balance"]

    today = date.today()
    marked = await db.scalar(
        select(func.count(func.distinct(AttendanceEntry.worker_id))).where(
            AttendanceEntry.business_id == business_id, AttendanceEntry.date == today
        )
    )
    total_active_workers = await db.scalar(
        select(func.count()).select_from(Worker).where(Worker.business_id == business_id, Worker.is_active.is_(True))
    )
    today_labour_cost = await _scalar_decimal(
        db,
        select(func.coalesce(func.sum(AttendanceEntry.value * AttendanceEntry.wage_at_entry), 0)).where(
            AttendanceEntry.business_id == business_id, AttendanceEntry.date == today
        ),
    )

    attendance_total = await _scalar_decimal(
        db,
        select(func.coalesce(func.sum(AttendanceEntry.value * AttendanceEntry.wage_at_entry), 0)).where(
            AttendanceEntry.business_id == business_id
        ),
    )
    additional_work_total = await _scalar_decimal(
        db, select(func.coalesce(func.sum(AdditionalWork.amount), 0)).where(AdditionalWork.business_id == business_id)
    )
    payments_total = await _scalar_decimal(
        db, select(func.coalesce(func.sum(WorkerPayment.amount), 0)).where(WorkerPayment.business_id == business_id)
    )
    payable_total = attendance_total + additional_work_total - payments_total

    bills_total = await _scalar_decimal(
        db, select(func.coalesce(func.sum(ClientBill.bill_amount), 0)).where(ClientBill.business_id == business_id)
    )
    receipts_total = await _scalar_decimal(
        db,
        select(func.coalesce(func.sum(BillReceipt.amount_received), 0)).where(
            BillReceipt.business_id == business_id
        ),
    )
    receivable_total = bills_total - receipts_total

    sites_result = await db.execute(
        select(Site.id, Site.name).where(Site.business_id == business_id).order_by(Site.name)
    )
    sites = []
    for site_id, site_name in sites_result.all():
        received = await _scalar_decimal(
            db,
            select(func.coalesce(func.sum(BillReceipt.amount_received), 0))
            .join(ClientBill, ClientBill.id == BillReceipt.bill_id)
            .where(BillReceipt.business_id == business_id, ClientBill.site_id == site_id),
        )
        labour_cost = await _scalar_decimal(
            db,
            select(func.coalesce(func.sum(AttendanceEntry.value * AttendanceEntry.wage_at_entry), 0)).where(
                AttendanceEntry.business_id == business_id, AttendanceEntry.site_id == site_id
            ),
        )
        expenses = await _scalar_decimal(
            db,
            select(func.coalesce(func.sum(SiteExpense.amount), 0)).where(
                SiteExpense.business_id == business_id, SiteExpense.site_id == site_id
            ),
        )
        sites.append(
            {
                "site_id": site_id,
                "name": site_name,
                "received": received,
                "labour_cost": labour_cost,
                "expenses": expenses,
                "position": received - labour_cost - expenses,
            }
        )

    return {
        "money_in_hand": {"cash": cash_balance, "bank": bank_balance, "total": cash_balance + bank_balance},
        "today_attendance": {
            "marked": marked or 0,
            "total_active_workers": total_active_workers or 0,
            "labour_cost": today_labour_cost,
        },
        "payable_total": payable_total,
        "receivable_total": receivable_total,
        "sites": sites,
    }
