import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_business, verify_supabase_jwt
from app.crud import additional_work as additional_work_crud
from app.db import get_db
from app.models.business import Business
from app.schemas.additional_work import AdditionalWorkCreate, AdditionalWorkOut, AdditionalWorkUpdate

router = APIRouter(prefix="/additional-work", tags=["additional-work"])


async def _get_entry_or_404(db: AsyncSession, business: Business, entry_id: uuid.UUID):
    entry = await additional_work_crud.get_additional_work(db, business.id, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Additional work entry not found")
    return entry


@router.get("", response_model=list[AdditionalWorkOut])
async def list_additional_work(
    worker_id: uuid.UUID | None = None,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await additional_work_crud.list_additional_work(db, business.id, worker_id)


@router.post("", response_model=AdditionalWorkOut, status_code=status.HTTP_201_CREATED)
async def create_additional_work(
    data: AdditionalWorkCreate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    return await additional_work_crud.create_additional_work(db, business.id, user.auth_user_id, data)


@router.patch("/{entry_id}", response_model=AdditionalWorkOut)
async def update_additional_work(
    entry_id: uuid.UUID,
    data: AdditionalWorkUpdate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    entry = await _get_entry_or_404(db, business, entry_id)
    return await additional_work_crud.update_additional_work(db, entry, user.auth_user_id, data)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_additional_work(
    entry_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    entry = await _get_entry_or_404(db, business, entry_id)
    await additional_work_crud.delete_additional_work(db, entry)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
