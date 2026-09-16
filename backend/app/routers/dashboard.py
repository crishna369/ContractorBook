from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_business
from app.crud import dashboard as dashboard_crud
from app.db import get_db
from app.models.business import Business
from app.schemas.dashboard import DashboardOut

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardOut)
async def get_dashboard(
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await dashboard_crud.get_dashboard(db, business.id)
