import uuid
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing import BillReceipt, ClientBill
from app.schemas.billing import BillReceiptCreate, BillReceiptUpdate, ClientBillCreate, ClientBillUpdate


async def _received_totals(db: AsyncSession, business_id: uuid.UUID, bill_ids: list[uuid.UUID]) -> dict[uuid.UUID, Decimal]:
    if not bill_ids:
        return {}
    result = await db.execute(
        select(BillReceipt.bill_id, func.coalesce(func.sum(BillReceipt.amount_received), 0))
        .where(BillReceipt.business_id == business_id, BillReceipt.bill_id.in_(bill_ids))
        .group_by(BillReceipt.bill_id)
    )
    return {bill_id: Decimal(total) for bill_id, total in result.all()}


async def list_bills(db: AsyncSession, business_id: uuid.UUID, site_id: uuid.UUID | None = None) -> list[dict]:
    query = select(ClientBill).where(ClientBill.business_id == business_id)
    if site_id is not None:
        query = query.where(ClientBill.site_id == site_id)
    result = await db.execute(query.order_by(ClientBill.bill_date.desc(), ClientBill.created_at.desc()))
    bills = list(result.scalars().all())
    totals = await _received_totals(db, business_id, [bill.id for bill in bills])
    out = []
    for bill in bills:
        received = totals.get(bill.id, Decimal(0))
        out.append({**bill.__dict__, "amount_received": received, "balance": bill.bill_amount - received})
    return out


async def get_bill(db: AsyncSession, business_id: uuid.UUID, bill_id: uuid.UUID) -> ClientBill | None:
    result = await db.execute(
        select(ClientBill).where(ClientBill.business_id == business_id, ClientBill.id == bill_id)
    )
    return result.scalars().first()


async def get_bill_detail(db: AsyncSession, business_id: uuid.UUID, bill: ClientBill) -> dict:
    result = await db.execute(
        select(BillReceipt)
        .where(BillReceipt.business_id == business_id, BillReceipt.bill_id == bill.id)
        .order_by(BillReceipt.date_received.desc(), BillReceipt.created_at.desc())
    )
    receipts = list(result.scalars().all())
    received = sum((r.amount_received for r in receipts), Decimal(0))
    return {
        **bill.__dict__,
        "amount_received": received,
        "balance": bill.bill_amount - received,
        "receipts": receipts,
    }


async def create_bill(
    db: AsyncSession, business_id: uuid.UUID, updated_by: uuid.UUID, data: ClientBillCreate
) -> ClientBill:
    bill = ClientBill(business_id=business_id, updated_by=updated_by, **data.model_dump())
    db.add(bill)
    await db.commit()
    await db.refresh(bill)
    return bill


async def update_bill(
    db: AsyncSession, bill: ClientBill, updated_by: uuid.UUID, data: ClientBillUpdate
) -> ClientBill:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bill, field, value)
    bill.updated_by = updated_by
    await db.commit()
    await db.refresh(bill)
    return bill


async def delete_bill(db: AsyncSession, bill: ClientBill) -> None:
    await db.delete(bill)
    await db.commit()


async def get_receipt(db: AsyncSession, business_id: uuid.UUID, receipt_id: uuid.UUID) -> BillReceipt | None:
    result = await db.execute(
        select(BillReceipt).where(BillReceipt.business_id == business_id, BillReceipt.id == receipt_id)
    )
    return result.scalars().first()


async def create_receipt(
    db: AsyncSession, business_id: uuid.UUID, updated_by: uuid.UUID, data: BillReceiptCreate
) -> BillReceipt:
    receipt = BillReceipt(business_id=business_id, updated_by=updated_by, **data.model_dump())
    db.add(receipt)
    await db.commit()
    await db.refresh(receipt)
    return receipt


async def update_receipt(
    db: AsyncSession, receipt: BillReceipt, updated_by: uuid.UUID, data: BillReceiptUpdate
) -> BillReceipt:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(receipt, field, value)
    receipt.updated_by = updated_by
    await db.commit()
    await db.refresh(receipt)
    return receipt


async def delete_receipt(db: AsyncSession, receipt: BillReceipt) -> None:
    await db.delete(receipt)
    await db.commit()
