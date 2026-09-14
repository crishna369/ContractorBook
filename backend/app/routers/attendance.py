import uuid
from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_business, verify_supabase_jwt
from app.crud import attendance as attendance_crud
from app.db import get_db
from app.models.business import Business
from app.schemas.attendance import AttendanceEntryOut, AttendanceEntryUpdate, AttendanceSaveRequest

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("", response_model=list[AttendanceEntryOut])
async def list_attendance(
    date: date_type,
    site_id: uuid.UUID | None = None,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await attendance_crud.list_attendance(db, business.id, date, site_id)


@router.post("", response_model=list[AttendanceEntryOut], status_code=status.HTTP_201_CREATED)
async def save_attendance(
    data: AttendanceSaveRequest,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await attendance_crud.save_attendance_for_worker_day(db, business.id, user.auth_user_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch("/{entry_id}", response_model=AttendanceEntryOut)
async def update_attendance(
    entry_id: uuid.UUID,
    data: AttendanceEntryUpdate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    entry = await attendance_crud.get_attendance_entry(db, business.id, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance entry not found")
    return await attendance_crud.update_attendance_entry(db, entry, data.value, user.auth_user_id)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendance(
    entry_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    entry = await attendance_crud.get_attendance_entry(db, business.id, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance entry not found")
    await attendance_crud.delete_attendance_entry(db, entry)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
