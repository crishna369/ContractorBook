import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import worker as worker_crud
from app.auth import get_current_business
from app.db import get_db
from app.models.business import Business
from app.schemas.worker import WorkerCreate, WorkerOut, WorkerUpdate

router = APIRouter(prefix="/workers", tags=["workers"])


async def _get_worker_or_404(db: AsyncSession, business: Business, worker_id: uuid.UUID):
    worker = await worker_crud.get_worker(db, business.id, worker_id)
    if worker is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    return worker


@router.get("", response_model=list[WorkerOut])
async def list_workers(
    is_active: bool | None = None,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await worker_crud.list_workers(db, business.id, is_active)


@router.post("", response_model=WorkerOut, status_code=status.HTTP_201_CREATED)
async def create_worker(
    data: WorkerCreate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await worker_crud.create_worker(db, business.id, data)


@router.get("/{worker_id}", response_model=WorkerOut)
async def get_worker(
    worker_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await _get_worker_or_404(db, business, worker_id)


@router.patch("/{worker_id}", response_model=WorkerOut)
async def update_worker(
    worker_id: uuid.UUID,
    data: WorkerUpdate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    worker = await _get_worker_or_404(db, business, worker_id)
    return await worker_crud.update_worker(db, worker, data)


@router.delete("/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_worker(
    worker_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    worker = await _get_worker_or_404(db, business, worker_id)
    await worker_crud.delete_worker(db, worker)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
