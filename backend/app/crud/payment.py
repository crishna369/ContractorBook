import uuid
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.additional_work import AdditionalWork
from app.models.attendance import AttendanceEntry
from app.models.payment import WorkerPayment
from app.schemas.payment import WorkerPaymentCreate, WorkerPaymentUpdate


async def list_payments(
    db: AsyncSession, business_id: uuid.UUID, worker_id: uuid.UUID | None = None
) -> list[WorkerPayment]:
    query = select(WorkerPayment).where(WorkerPayment.business_id == business_id)
    if worker_id is not None:
        query = query.where(WorkerPayment.worker_id == worker_id)
    result = await db.execute(query.order_by(WorkerPayment.date.desc(), WorkerPayment.created_at.desc()))
    return list(result.scalars().all())


async def get_payment(db: AsyncSession, business_id: uuid.UUID, payment_id: uuid.UUID) -> WorkerPayment | None:
    result = await db.execute(
        select(WorkerPayment).where(WorkerPayment.business_id == business_id, WorkerPayment.id == payment_id)
    )
    return result.scalars().first()


async def create_payment(
    db: AsyncSession, business_id: uuid.UUID, updated_by: uuid.UUID, data: WorkerPaymentCreate
) -> WorkerPayment:
    payment = WorkerPayment(business_id=business_id, updated_by=updated_by, **data.model_dump())
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment


async def update_payment(
    db: AsyncSession, payment: WorkerPayment, updated_by: uuid.UUID, data: WorkerPaymentUpdate
) -> WorkerPayment:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(payment, field, value)
    payment.updated_by = updated_by
    await db.commit()
    await db.refresh(payment)
    return payment


async def delete_payment(db: AsyncSession, payment: WorkerPayment) -> None:
    await db.delete(payment)
    await db.commit()


async def get_worker_balance(
    db: AsyncSession, business_id: uuid.UUID, worker_id: uuid.UUID
) -> dict[str, Decimal]:
    """All-time balance payable: attendance earnings + additional work, minus payments made.

    Computed on read from the underlying ledgers, never stored — same principle as the
    rest of the app's money model (see plan's Database schema section).
    """
    attendance_total = await db.scalar(
        select(func.coalesce(func.sum(AttendanceEntry.value * AttendanceEntry.wage_at_entry), 0)).where(
            AttendanceEntry.business_id == business_id, AttendanceEntry.worker_id == worker_id
        )
    )
    additional_work_total = await db.scalar(
        select(func.coalesce(func.sum(AdditionalWork.amount), 0)).where(
            AdditionalWork.business_id == business_id, AdditionalWork.worker_id == worker_id
        )
    )
    payments_total = await db.scalar(
        select(func.coalesce(func.sum(WorkerPayment.amount), 0)).where(
            WorkerPayment.business_id == business_id, WorkerPayment.worker_id == worker_id
        )
    )
    total_earned = Decimal(attendance_total) + Decimal(additional_work_total)
    total_paid = Decimal(payments_total)
    return {
        "total_earned": total_earned,
        "total_paid": total_paid,
        "balance_payable": total_earned - total_paid,
    }
