from datetime import date as date_type

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_business, verify_supabase_jwt
from app.crud import ledger as ledger_crud
from app.db import get_db
from app.models.business import Business
from app.schemas.ledger import LedgerBalancesOut, LedgerTransactionOut, OpeningBalanceInput, OpeningBalanceOut

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("/balances", response_model=LedgerBalancesOut)
async def get_balances(
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await ledger_crud.get_balances(db, business.id)


@router.get("/transactions", response_model=list[LedgerTransactionOut])
async def list_transactions(
    method: str | None = None,
    date_from: date_type | None = None,
    date_to: date_type | None = None,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await ledger_crud.list_transactions(db, business.id, method, date_from, date_to)


@router.put("/opening-balance", response_model=OpeningBalanceOut)
async def set_opening_balance(
    data: OpeningBalanceInput,
    business: Business = Depends(get_current_business),
    user: CurrentUser = Depends(verify_supabase_jwt),
    db: AsyncSession = Depends(get_db),
):
    return await ledger_crud.set_opening_balance(db, business.id, user.auth_user_id, data)
