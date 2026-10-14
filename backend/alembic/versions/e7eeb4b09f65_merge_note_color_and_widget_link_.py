"""merge note color and widget link migrations

Revision ID: e7eeb4b09f65
Revises: 645e5cede571, e4b2a1c7d905
Create Date: 2026-10-14 14:16:15.419177

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7eeb4b09f65'
down_revision: Union[str, Sequence[str], None] = ('645e5cede571', 'e4b2a1c7d905')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
