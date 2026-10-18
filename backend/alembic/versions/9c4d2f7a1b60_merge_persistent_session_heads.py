"""merge persistent sessions with existing migration heads

Revision ID: 9c4d2f7a1b60
Revises: f18a7c2d9e41, e7eeb4b09f65
Create Date: 2026-10-17
"""
from typing import Sequence, Union

from alembic import op


revision: str = "9c4d2f7a1b60"
down_revision: Union[str, Sequence[str], None] = (
    "f18a7c2d9e41",
    "e7eeb4b09f65",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Merge revision only: both parent branches are already applied here.
    pass


def downgrade() -> None:
    # Merge revisions intentionally do not reverse either parent branch.
    pass
