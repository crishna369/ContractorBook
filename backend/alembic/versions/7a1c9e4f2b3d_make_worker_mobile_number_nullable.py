"""make worker mobile_number nullable

Revision ID: 7a1c9e4f2b3d
Revises: 602fe0ecd5a7
Create Date: 2026-09-14 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a1c9e4f2b3d'
down_revision: Union[str, None] = '602fe0ecd5a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('workers', 'mobile_number', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    op.alter_column('workers', 'mobile_number', existing_type=sa.String(), nullable=False)
