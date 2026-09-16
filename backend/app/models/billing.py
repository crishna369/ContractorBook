import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db import Base

BILL_RECEIPT_PAYMENT_METHODS = ("cash", "bank")


class ClientBill(Base):
    __tablename__ = "client_bills"
    __table_args__ = (CheckConstraint("bill_amount > 0", name="ck_client_bill_amount_positive"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("businesses.id"), nullable=False, index=True)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id"), nullable=False, index=True)
    bill_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    bill_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    remarks: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)


class BillReceipt(Base):
    __tablename__ = "bill_receipts"
    __table_args__ = (
        CheckConstraint("amount_received > 0", name="ck_bill_receipt_amount_positive"),
        CheckConstraint("payment_method IN ('cash', 'bank')", name="ck_bill_receipt_payment_method_enum"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("businesses.id"), nullable=False, index=True)
    bill_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("client_bills.id"), nullable=False, index=True)
    amount_received: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    date_received: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    payment_method: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
