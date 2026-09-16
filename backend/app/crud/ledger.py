import uuid
from datetime import date as date_type
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing import BillReceipt, ClientBill
from app.models.expense import SiteExpense
from app.models.ledger import CashBankOpeningBalance
from app.models.payment import WorkerPayment
from app.models.site import Site
from app.models.worker import Worker
from app.schemas.ledger import OpeningBalanceInput


async def get_opening_balance(db: AsyncSession, business_id: uuid.UUID) -> CashBankOpeningBalance | None:
    result = await db.execute(
        select(CashBankOpeningBalance).where(CashBankOpeningBalance.business_id == business_id)
    )
    return result.scalars().first()


async def set_opening_balance(
    db: AsyncSession, business_id: uuid.UUID, updated_by: uuid.UUID, data: OpeningBalanceInput
) -> CashBankOpeningBalance:
    existing = await get_opening_balance(db, business_id)
    if existing is None:
        existing = CashBankOpeningBalance(business_id=business_id)
        db.add(existing)
    existing.opening_cash = data.opening_cash
    existing.opening_bank = data.opening_bank
    existing.as_of_date = data.as_of_date
    existing.updated_by = updated_by
    await db.commit()
    await db.refresh(existing)
    return existing


async def _sum_where(db: AsyncSession, query) -> Decimal:
    return Decimal(await db.scalar(query) or 0)


async def get_balances(db: AsyncSession, business_id: uuid.UUID) -> dict:
    opening = await get_opening_balance(db, business_id)
    opening_cash = opening.opening_cash if opening else Decimal(0)
    opening_bank = opening.opening_bank if opening else Decimal(0)
    as_of_date = opening.as_of_date if opening else None

    async def method_totals(method: str) -> dict[str, Decimal]:
        in_query = (
            select(func.coalesce(func.sum(BillReceipt.amount_received), 0))
            .where(BillReceipt.business_id == business_id, BillReceipt.payment_method == method)
        )
        payments_out_query = (
            select(func.coalesce(func.sum(WorkerPayment.amount), 0))
            .where(WorkerPayment.business_id == business_id, WorkerPayment.payment_method == method)
        )
        expenses_out_query = (
            select(func.coalesce(func.sum(SiteExpense.amount), 0))
            .where(SiteExpense.business_id == business_id, SiteExpense.payment_method == method)
        )
        if as_of_date is not None:
            in_query = in_query.where(BillReceipt.date_received >= as_of_date)
            payments_out_query = payments_out_query.where(WorkerPayment.date >= as_of_date)
            expenses_out_query = expenses_out_query.where(SiteExpense.date >= as_of_date)

        money_in = await _sum_where(db, in_query)
        money_out = await _sum_where(db, payments_out_query) + await _sum_where(db, expenses_out_query)
        return {"money_in": money_in, "money_out": money_out}

    cash = await method_totals("cash")
    bank = await method_totals("bank")

    return {
        "as_of_date": as_of_date,
        "cash": {
            "opening": opening_cash,
            "money_in": cash["money_in"],
            "money_out": cash["money_out"],
            "balance": opening_cash + cash["money_in"] - cash["money_out"],
        },
        "bank": {
            "opening": opening_bank,
            "money_in": bank["money_in"],
            "money_out": bank["money_out"],
            "balance": opening_bank + bank["money_in"] - bank["money_out"],
        },
    }


async def list_transactions(
    db: AsyncSession,
    business_id: uuid.UUID,
    method: str | None = None,
    date_from: date_type | None = None,
    date_to: date_type | None = None,
) -> list[dict]:
    receipts_query = (
        select(BillReceipt, Site.name)
        .join(ClientBill, ClientBill.id == BillReceipt.bill_id)
        .join(Site, Site.id == ClientBill.site_id)
        .where(BillReceipt.business_id == business_id)
    )
    payments_query = (
        select(WorkerPayment, Worker.name)
        .join(Worker, Worker.id == WorkerPayment.worker_id)
        .where(WorkerPayment.business_id == business_id)
    )
    expenses_query = (
        select(SiteExpense, Site.name)
        .join(Site, Site.id == SiteExpense.site_id)
        .where(SiteExpense.business_id == business_id)
    )

    if method is not None:
        receipts_query = receipts_query.where(BillReceipt.payment_method == method)
        payments_query = payments_query.where(WorkerPayment.payment_method == method)
        expenses_query = expenses_query.where(SiteExpense.payment_method == method)
    if date_from is not None:
        receipts_query = receipts_query.where(BillReceipt.date_received >= date_from)
        payments_query = payments_query.where(WorkerPayment.date >= date_from)
        expenses_query = expenses_query.where(SiteExpense.date >= date_from)
    if date_to is not None:
        receipts_query = receipts_query.where(BillReceipt.date_received <= date_to)
        payments_query = payments_query.where(WorkerPayment.date <= date_to)
        expenses_query = expenses_query.where(SiteExpense.date <= date_to)

    transactions: list[dict] = []

    receipts_result = await db.execute(receipts_query)
    for receipt, site_name in receipts_result.all():
        transactions.append(
            {
                "id": receipt.id,
                "date": receipt.date_received,
                "type": "receipt",
                "direction": "in",
                "amount": receipt.amount_received,
                "payment_method": receipt.payment_method,
                "label": f"Bill receipt — {site_name}",
                "site_id": None,
                "worker_id": None,
                "created_at": receipt.created_at,
            }
        )

    payments_result = await db.execute(payments_query)
    for payment, worker_name in payments_result.all():
        transactions.append(
            {
                "id": payment.id,
                "date": payment.date,
                "type": "payment",
                "direction": "out",
                "amount": payment.amount,
                "payment_method": payment.payment_method,
                "label": f"Payment — {worker_name}",
                "site_id": None,
                "worker_id": payment.worker_id,
                "created_at": payment.created_at,
            }
        )

    expenses_result = await db.execute(expenses_query)
    for expense, site_name in expenses_result.all():
        transactions.append(
            {
                "id": expense.id,
                "date": expense.date,
                "type": "expense",
                "direction": "out",
                "amount": expense.amount,
                "payment_method": expense.payment_method,
                "label": f"{expense.description} — {site_name}",
                "site_id": expense.site_id,
                "worker_id": None,
                "created_at": expense.created_at,
            }
        )

    transactions.sort(key=lambda t: (t["date"], t["created_at"]), reverse=True)
    for t in transactions:
        del t["created_at"]
    return transactions
