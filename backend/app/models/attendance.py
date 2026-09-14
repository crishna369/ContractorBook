import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db import Base

# Business term -> fraction-of-day value, per the BRD:
# Absent=0, Half Day=0.5, Full Day=1.0, Savai=1.25, Dedhi=1.5
ATTENDANCE_VALUES = (Decimal("0"), Decimal("0.5"), Decimal("1.0"), Decimal("1.25"), Decimal("1.5"))


class AttendanceEntry(Base):
    __tablename__ = "attendance_entries"
    __table_args__ = (
        UniqueConstraint("worker_id", "site_id", "date", name="uq_attendance_worker_site_date"),
        CheckConstraint("value IN (0, 0.5, 1.0, 1.25, 1.5)", name="ck_attendance_value_enum"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("businesses.id"), nullable=False, index=True)
    worker_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workers.id"), nullable=False, index=True)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    value: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False)
    # Snapshot of the worker's daily_wage at the time this entry was made, so a
    # later wage change never rewrites historical earnings/labour cost.
    wage_at_entry: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
