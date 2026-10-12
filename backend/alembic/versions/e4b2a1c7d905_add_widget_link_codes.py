"""add single-use Android widget link codes

Revision ID: e4b2a1c7d905
Revises: d32599368a25
Create Date: 2026-10-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "e4b2a1c7d905"
down_revision: Union[str, Sequence[str], None] = "d32599368a25"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "widget_link_codes",
        sa.Column("token_hash", sa.String(length=64), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_widget_link_codes_user_id",
        "widget_link_codes",
        ["user_id"],
    )
    op.create_index(
        "ix_widget_link_codes_expires_at",
        "widget_link_codes",
        ["expires_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_widget_link_codes_expires_at", table_name="widget_link_codes")
    op.drop_index("ix_widget_link_codes_user_id", table_name="widget_link_codes")
    op.drop_table("widget_link_codes")
