import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.expense import SiteExpense
from app.schemas.expense import SiteExpenseCreate, SiteExpenseUpdate


async def list_expenses(
    db: AsyncSession, business_id: uuid.UUID, site_id: uuid.UUID | None = None
) -> list[SiteExpense]:
    query = select(SiteExpense).where(SiteExpense.business_id == business_id)
    if site_id is not None:
        query = query.where(SiteExpense.site_id == site_id)
    result = await db.execute(query.order_by(SiteExpense.date.desc(), SiteExpense.created_at.desc()))
    return list(result.scalars().all())


async def get_expense(db: AsyncSession, business_id: uuid.UUID, expense_id: uuid.UUID) -> SiteExpense | None:
    result = await db.execute(
        select(SiteExpense).where(SiteExpense.business_id == business_id, SiteExpense.id == expense_id)
    )
    return result.scalars().first()


async def create_expense(
    db: AsyncSession, business_id: uuid.UUID, updated_by: uuid.UUID, data: SiteExpenseCreate
) -> SiteExpense:
    expense = SiteExpense(business_id=business_id, updated_by=updated_by, **data.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


async def update_expense(
    db: AsyncSession, expense: SiteExpense, updated_by: uuid.UUID, data: SiteExpenseUpdate
) -> SiteExpense:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    expense.updated_by = updated_by
    await db.commit()
    await db.refresh(expense)
    return expense


async def delete_expense(db: AsyncSession, expense: SiteExpense) -> None:
    await db.delete(expense)
    await db.commit()


async def get_quick_descriptions(db: AsyncSession, business_id: uuid.UUID, site_id: uuid.UUID) -> list[str]:
    """The 5 most recent distinct descriptions used for this site, most recent first."""
    result = await db.execute(
        select(SiteExpense.description, SiteExpense.created_at)
        .where(SiteExpense.business_id == business_id, SiteExpense.site_id == site_id)
        .order_by(SiteExpense.created_at.desc())
    )
    seen: list[str] = []
    for description, _created_at in result.all():
        if description not in seen:
            seen.append(description)
        if len(seen) == 5:
            break
    return seen
