import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db import Base


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    memberships: Mapped[list["Membership"]] = relationship(back_populates="business")


class Membership(Base):
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("business_id", "auth_user_id", name="uq_membership_business_user"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    # Matches Supabase auth.users.id — not a local FK since auth.users lives in
    # Supabase's own schema, not one we manage via Alembic.
    auth_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    role: Mapped[str] = mapped_column(default="member")  # stored, not enforced in v1
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    business: Mapped["Business"] = relationship(back_populates="memberships")
