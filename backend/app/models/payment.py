import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db import Base

PAYMENT_TYPES = ("advance", "salary", "extra_work")
PAYMENT_METHODS = ("cash", "bank")


class WorkerPayment(Base):
    __tablename__ = "worker_payments"
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_worker_payment_amount_positive"),
        CheckConstraint("payment_type IN ('advance', 'salary', 'extra_work')", name="ck_worker_payment_type_enum"),
        CheckConstraint("payment_method IN ('cash', 'bank')", name="ck_worker_payment_method_enum"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("businesses.id"), nullable=False, index=True)
    worker_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workers.id"), nullable=False, index=True)
    site_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sites.id"), nullable=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    payment_type: Mapped[str] = mapped_column(nullable=False)
    reason: Mapped[str | None] = mapped_column(nullable=True)
    payment_method: Mapped[str] = mapped_column(nullable=False)
    payment_details: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
