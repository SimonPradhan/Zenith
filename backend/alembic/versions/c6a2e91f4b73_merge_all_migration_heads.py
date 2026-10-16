"""merge all current Alembic heads

Revision ID: c6a2e91f4b73
Revises: 9c4d2f7a1b60, b5f3c8a21e47
Create Date: 2026-10-17
"""
from typing import Sequence, Union

from alembic import op


revision: str = "c6a2e91f4b73"
down_revision: Union[str, Sequence[str], None] = (
    "9c4d2f7a1b60",
    "b5f3c8a21e47",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Merge revision only; parent migrations apply their own schema changes.
    pass


def downgrade() -> None:
    # Merge revisions do not reverse either parent migration.
    pass
