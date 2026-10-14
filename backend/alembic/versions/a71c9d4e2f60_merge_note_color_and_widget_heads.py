
"""Merge note-color and Android widget-link migration heads."""

from typing import Sequence, Union

from alembic import op

revision: str = "a71c9d4e2f60"
down_revision: Union[str, Sequence[str], None] = (
    "645e5cede571",
    "e4b2a1c7d905",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
