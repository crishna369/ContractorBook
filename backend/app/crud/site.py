import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site import Site
from app.schemas.site import SiteCreate, SiteUpdate


async def list_sites(db: AsyncSession, business_id: uuid.UUID, is_active: bool | None = None) -> list[Site]:
    query = select(Site).where(Site.business_id == business_id)
    if is_active is not None:
        query = query.where(Site.is_active == is_active)
    result = await db.execute(query.order_by(Site.name))
    return list(result.scalars().all())


async def get_site(db: AsyncSession, business_id: uuid.UUID, site_id: uuid.UUID) -> Site | None:
    result = await db.execute(select(Site).where(Site.business_id == business_id, Site.id == site_id))
    return result.scalars().first()


async def create_site(db: AsyncSession, business_id: uuid.UUID, data: SiteCreate) -> Site:
    site = Site(business_id=business_id, **data.model_dump())
    db.add(site)
    await db.commit()
    await db.refresh(site)
    return site


async def update_site(db: AsyncSession, site: Site, data: SiteUpdate) -> Site:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(site, field, value)
    await db.commit()
    await db.refresh(site)
    return site


async def delete_site(db: AsyncSession, site: Site) -> bool:
    """Hard-deletes if nothing references the site yet; otherwise soft-deletes."""
    await db.delete(site)
    try:
        await db.commit()
        return True
    except IntegrityError:
        await db.rollback()
        site.is_active = False
        db.add(site)
        await db.commit()
        return False
