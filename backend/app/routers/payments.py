import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_business, verify_supabase_jwt
from app.crud import payment as payment_crud
from app.db import get_db
from app.models.business import Business
from app.schemas.payment import WorkerPaymentCreate, WorkerPaymentOut, WorkerPaymentUpdate

router = APIRouter(prefix="/payments", tags=["payments"])


async def _get_payment_or_404(db: AsyncSession, business: Business, payment_id: uuid.UUID):
    payment = await payment_crud.get_payment(db, business.id, payment_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


@router.get("", response_model=list[WorkerPaymentOut])
async def list_payments(
    worker_id: uuid.UUID | None = None,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await payment_crud.list_payments(db, business.id, worker_id)


@router.post("", response_model=WorkerPaymentOut, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: WorkerPaymentCreate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    return await payment_crud.create_payment(db, business.id, user.auth_user_id, data)


@router.patch("/{payment_id}", response_model=WorkerPaymentOut)
async def update_payment(
    payment_id: uuid.UUID,
    data: WorkerPaymentUpdate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    payment = await _get_payment_or_404(db, business, payment_id)
    return await payment_crud.update_payment(db, payment, user.auth_user_id, data)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(
    payment_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    payment = await _get_payment_or_404(db, business, payment_id)
    await payment_crud.delete_payment(db, payment)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
