import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import site as site_crud
from app.auth import get_current_business
from app.db import get_db
from app.models.business import Business
from app.schemas.site import SiteCreate, SiteOut, SiteUpdate

router = APIRouter(prefix="/sites", tags=["sites"])


async def _get_site_or_404(db: AsyncSession, business: Business, site_id: uuid.UUID):
    site = await site_crud.get_site(db, business.id, site_id)
    if site is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return site


@router.get("", response_model=list[SiteOut])
async def list_sites(
    is_active: bool | None = None,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await site_crud.list_sites(db, business.id, is_active)


@router.post("", response_model=SiteOut, status_code=status.HTTP_201_CREATED)
async def create_site(
    data: SiteCreate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await site_crud.create_site(db, business.id, data)


@router.get("/{site_id}", response_model=SiteOut)
async def get_site(
    site_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await _get_site_or_404(db, business, site_id)


@router.patch("/{site_id}", response_model=SiteOut)
async def update_site(
    site_id: uuid.UUID,
    data: SiteUpdate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    site = await _get_site_or_404(db, business, site_id)
    return await site_crud.update_site(db, site, data)


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_site(
    site_id: uuid.UUID,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    site = await _get_site_or_404(db, business, site_id)
    await site_crud.delete_site(db, site)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
