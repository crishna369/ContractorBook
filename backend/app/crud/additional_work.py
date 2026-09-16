import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.additional_work import AdditionalWork
from app.schemas.additional_work import AdditionalWorkCreate, AdditionalWorkUpdate


async def list_additional_work(
    db: AsyncSession, business_id: uuid.UUID, worker_id: uuid.UUID | None = None
) -> list[AdditionalWork]:
    query = select(AdditionalWork).where(AdditionalWork.business_id == business_id)
    if worker_id is not None:
        query = query.where(AdditionalWork.worker_id == worker_id)
    result = await db.execute(query.order_by(AdditionalWork.date.desc(), AdditionalWork.created_at.desc()))
    return list(result.scalars().all())


async def get_additional_work(
    db: AsyncSession, business_id: uuid.UUID, entry_id: uuid.UUID
) -> AdditionalWork | None:
    result = await db.execute(
        select(AdditionalWork).where(AdditionalWork.business_id == business_id, AdditionalWork.id == entry_id)
    )
    return result.scalars().first()


async def create_additional_work(
    db: AsyncSession, business_id: uuid.UUID, updated_by: uuid.UUID, data: AdditionalWorkCreate
) -> AdditionalWork:
    entry = AdditionalWork(business_id=business_id, updated_by=updated_by, **data.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


async def update_additional_work(
    db: AsyncSession, entry: AdditionalWork, updated_by: uuid.UUID, data: AdditionalWorkUpdate
) -> AdditionalWork:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    entry.updated_by = updated_by
    await db.commit()
    await db.refresh(entry)
    return entry


async def delete_additional_work(db: AsyncSession, entry: AdditionalWork) -> None:
    await db.delete(entry)
    await db.commit()
