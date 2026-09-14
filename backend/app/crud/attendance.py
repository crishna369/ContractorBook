import uuid
from datetime import date as date_type

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import AttendanceEntry
from app.models.worker import Worker
from app.schemas.attendance import AttendanceSaveRequest


async def list_attendance(
    db: AsyncSession, business_id: uuid.UUID, date: date_type, site_id: uuid.UUID | None = None
) -> list[AttendanceEntry]:
    query = select(AttendanceEntry).where(
        AttendanceEntry.business_id == business_id, AttendanceEntry.date == date
    )
    if site_id is not None:
        query = query.where(AttendanceEntry.site_id == site_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_attendance_entry(
    db: AsyncSession, business_id: uuid.UUID, entry_id: uuid.UUID
) -> AttendanceEntry | None:
    result = await db.execute(
        select(AttendanceEntry).where(AttendanceEntry.business_id == business_id, AttendanceEntry.id == entry_id)
    )
    return result.scalars().first()


async def save_attendance_for_worker_day(
    db: AsyncSession,
    business_id: uuid.UUID,
    updated_by: uuid.UUID,
    data: AttendanceSaveRequest,
) -> list[AttendanceEntry]:
    """Replaces all of a worker's attendance rows for one date with the given
    set of per-site entries — upserting the ones present, and deleting any
    existing row for that worker/date whose site was dropped from the sheet.
    """
    worker_result = await db.execute(
        select(Worker).where(Worker.business_id == business_id, Worker.id == data.worker_id)
    )
    worker = worker_result.scalars().first()
    if worker is None:
        raise ValueError("Worker not found")

    kept_site_ids = {entry.site_id for entry in data.entries}

    stale_delete = delete(AttendanceEntry).where(
        AttendanceEntry.business_id == business_id,
        AttendanceEntry.worker_id == data.worker_id,
        AttendanceEntry.date == data.date,
    )
    if kept_site_ids:
        stale_delete = stale_delete.where(AttendanceEntry.site_id.notin_(kept_site_ids))
    await db.execute(stale_delete)

    saved: list[AttendanceEntry] = []
    for site_entry in data.entries:
        existing_result = await db.execute(
            select(AttendanceEntry).where(
                AttendanceEntry.business_id == business_id,
                AttendanceEntry.worker_id == data.worker_id,
                AttendanceEntry.site_id == site_entry.site_id,
                AttendanceEntry.date == data.date,
            )
        )
        existing = existing_result.scalars().first()
        if existing:
            existing.value = site_entry.value
            existing.wage_at_entry = worker.daily_wage
            existing.updated_by = updated_by
            saved.append(existing)
        else:
            new_entry = AttendanceEntry(
                business_id=business_id,
                worker_id=data.worker_id,
                site_id=site_entry.site_id,
                date=data.date,
                value=site_entry.value,
                wage_at_entry=worker.daily_wage,
                updated_by=updated_by,
            )
            db.add(new_entry)
            saved.append(new_entry)

    await db.commit()
    for entry in saved:
        await db.refresh(entry)
    return saved


async def update_attendance_entry(
    db: AsyncSession, entry: AttendanceEntry, value, updated_by: uuid.UUID
) -> AttendanceEntry:
    entry.value = value
    entry.updated_by = updated_by
    await db.commit()
    await db.refresh(entry)
    return entry


async def delete_attendance_entry(db: AsyncSession, entry: AttendanceEntry) -> None:
    await db.delete(entry)
    await db.commit()
