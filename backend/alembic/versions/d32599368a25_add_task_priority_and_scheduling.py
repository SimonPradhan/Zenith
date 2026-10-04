"""add task priority and scheduling

Revision ID: d32599368a25
Revises: 96a0c1e8b512
Create Date: 2026-10-04 21:48:06.570069

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d32599368a25"
down_revision: Union[str, Sequence[str], None] = "96a0c1e8b512"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "tasks",
        sa.Column(
            "priority",
            sa.String(length=50),
            nullable=False,
            server_default="medium",
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "start_date",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "estimated_minutes",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Existing tasks receive medium priority.
    # Remove the database-level default after migration so that
    # the application/model remains responsible for the default.
    op.alter_column(
        "tasks",
        "priority",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("tasks", "estimated_minutes")
    op.drop_column("tasks", "start_date")
    op.drop_column("tasks", "priority")
