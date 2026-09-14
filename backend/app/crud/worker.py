import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.worker import Worker
from app.schemas.worker import WorkerCreate, WorkerUpdate


async def list_workers(db: AsyncSession, business_id: uuid.UUID, is_active: bool | None = None) -> list[Worker]:
    query = select(Worker).where(Worker.business_id == business_id)
    if is_active is not None:
        query = query.where(Worker.is_active == is_active)
    result = await db.execute(query.order_by(Worker.name))
    return list(result.scalars().all())


async def get_worker(db: AsyncSession, business_id: uuid.UUID, worker_id: uuid.UUID) -> Worker | None:
    result = await db.execute(
        select(Worker).where(Worker.business_id == business_id, Worker.id == worker_id)
    )
    return result.scalars().first()


async def create_worker(db: AsyncSession, business_id: uuid.UUID, data: WorkerCreate) -> Worker:
    worker = Worker(business_id=business_id, **data.model_dump())
    db.add(worker)
    await db.commit()
    await db.refresh(worker)
    return worker


async def update_worker(db: AsyncSession, worker: Worker, data: WorkerUpdate) -> Worker:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(worker, field, value)
    await db.commit()
    await db.refresh(worker)
    return worker


async def delete_worker(db: AsyncSession, worker: Worker) -> bool:
    """Hard-deletes if nothing references the worker yet; otherwise soft-deletes.

    Returns True if hard-deleted, False if soft-deleted (is_active set to False).
    """
    await db.delete(worker)
    try:
        await db.commit()
        return True
    except IntegrityError:
        await db.rollback()
        worker.is_active = False
        db.add(worker)
        await db.commit()
        return False
