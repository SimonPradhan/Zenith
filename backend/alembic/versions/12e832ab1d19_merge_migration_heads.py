"""merge migration heads

Revision ID: 12e832ab1d19
Revises: 42e37b0eb1c0, a71c9d4e2f60
Create Date: 2026-10-14 16:45:24.196699

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '12e832ab1d19'
down_revision: Union[str, Sequence[str], None] = ('42e37b0eb1c0', 'a71c9d4e2f60')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
