"""add notice-board position to notes

Revision ID: b5f3c8a21e47
Revises: 12e832ab1d19
Create Date: 2026-10-16 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b5f3c8a21e47"
down_revision: Union[str, Sequence[str], None] = "12e832ab1d19"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("notes", sa.Column("pos_x", sa.Integer(), nullable=True))
    op.add_column("notes", sa.Column("pos_y", sa.Integer(), nullable=True))
    op.add_column(
        "notes",
        sa.Column(
            "rotation",
            sa.Float(),
            nullable=False,
            server_default="0",
        ),
    )
    op.add_column(
        "notes",
        sa.Column(
            "z_index",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("notes", "z_index")
    op.drop_column("notes", "rotation")
    op.drop_column("notes", "pos_y")
    op.drop_column("notes", "pos_x")
