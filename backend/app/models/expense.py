import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db import Base

PAID_BY_OPTIONS = ("contractor", "supervisor")
EXPENSE_PAYMENT_METHODS = ("cash", "bank")


class SiteExpense(Base):
    __tablename__ = "site_expenses"
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_site_expense_amount_positive"),
        CheckConstraint("paid_by IN ('contractor', 'supervisor')", name="ck_site_expense_paid_by_enum"),
        CheckConstraint("payment_method IN ('cash', 'bank')", name="ck_site_expense_payment_method_enum"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("businesses.id"), nullable=False, index=True)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    paid_by: Mapped[str] = mapped_column(nullable=False)
    payment_method: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
