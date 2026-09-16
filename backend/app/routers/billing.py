import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_business, verify_supabase_jwt
from app.crud import billing as billing_crud
from app.db import get_db
from app.models.business import Business
from app.schemas.billing import (
    BillReceiptCreate,
    BillReceiptOut,
    BillReceiptUpdate,
    ClientBillCreate,
    ClientBillDetailOut,
    ClientBillOut,
    ClientBillUpdate,
    ClientBillWithBalanceOut,
)

bills_router = APIRouter(prefix="/bills", tags=["bills"])
receipts_router = APIRouter(prefix="/receipts", tags=["bills"])


async def _get_bill_or_404(db: AsyncSession, business: Business, bill_id: uuid.UUID):
    bill = await billing_crud.get_bill(db, business.id, bill_id)
    if bill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return bill


async def _get_receipt_or_404(db: AsyncSession, business: Business, receipt_id: uuid.UUID):
    receipt = await billing_crud.get_receipt(db, business.id, receipt_id)
    if receipt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found")
    return receipt


@bills_router.get("", response_model=list[ClientBillWithBalanceOut])
async def list_bills(
    site_id: uuid.UUID | None = None,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await billing_crud.list_bills(db, business.id, site_id)


@bills_router.post("", response_model=ClientBillOut, status_code=status.HTTP_201_CREATED)
async def create_bill(
    data: ClientBillCreate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    return await billing_crud.create_bill(db, business.id, user.auth_user_id, data)


@bills_router.get("/{bill_id}", response_model=ClientBillDetailOut)
async def get_bill(
    bill_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    bill = await _get_bill_or_404(db, business, bill_id)
    return await billing_crud.get_bill_detail(db, business.id, bill)


@bills_router.patch("/{bill_id}", response_model=ClientBillOut)
async def update_bill(
    bill_id: uuid.UUID,
    data: ClientBillUpdate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    bill = await _get_bill_or_404(db, business, bill_id)
    return await billing_crud.update_bill(db, bill, user.auth_user_id, data)


@bills_router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bill(
    bill_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    bill = await _get_bill_or_404(db, business, bill_id)
    await billing_crud.delete_bill(db, bill)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@bills_router.post("/{bill_id}/receipts", response_model=BillReceiptOut, status_code=status.HTTP_201_CREATED)
async def create_receipt(
    bill_id: uuid.UUID,
    data: BillReceiptCreate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    await _get_bill_or_404(db, business, bill_id)
    if data.bill_id != bill_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="bill_id mismatch")
    return await billing_crud.create_receipt(db, business.id, user.auth_user_id, data)


@receipts_router.patch("/{receipt_id}", response_model=BillReceiptOut)
async def update_receipt(
    receipt_id: uuid.UUID,
    data: BillReceiptUpdate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    receipt = await _get_receipt_or_404(db, business, receipt_id)
    return await billing_crud.update_receipt(db, receipt, user.auth_user_id, data)


@receipts_router.delete("/{receipt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_receipt(
    receipt_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    receipt = await _get_receipt_or_404(db, business, receipt_id)
    await billing_crud.delete_receipt(db, receipt)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
