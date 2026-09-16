import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_business, verify_supabase_jwt
from app.crud import expense as expense_crud
from app.db import get_db
from app.models.business import Business
from app.schemas.expense import SiteExpenseCreate, SiteExpenseOut, SiteExpenseUpdate

router = APIRouter(prefix="/site-expenses", tags=["site-expenses"])


async def _get_expense_or_404(db: AsyncSession, business: Business, expense_id: uuid.UUID):
    expense = await expense_crud.get_expense(db, business.id, expense_id)
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site expense not found")
    return expense


@router.get("", response_model=list[SiteExpenseOut])
async def list_expenses(
    site_id: uuid.UUID | None = None,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await expense_crud.list_expenses(db, business.id, site_id)


@router.get("/quick-descriptions", response_model=list[str])
async def quick_descriptions(
    site_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await expense_crud.get_quick_descriptions(db, business.id, site_id)


@router.post("", response_model=SiteExpenseOut, status_code=status.HTTP_201_CREATED)
async def create_expense(
    data: SiteExpenseCreate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    return await expense_crud.create_expense(db, business.id, user.auth_user_id, data)


@router.patch("/{expense_id}", response_model=SiteExpenseOut)
async def update_expense(
    expense_id: uuid.UUID,
    data: SiteExpenseUpdate,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    expense = await _get_expense_or_404(db, business, expense_id)
    return await expense_crud.update_expense(db, expense, user.auth_user_id, data)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    expense = await _get_expense_or_404(db, business, expense_id)
    await expense_crud.delete_expense(db, expense)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
