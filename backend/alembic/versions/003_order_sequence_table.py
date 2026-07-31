"""Add order_sequences table for atomic daily order-code counters.

Revision ID: 003
Revises: 002
Create Date: 2026-07-31
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "order_sequences",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("order_date", sa.Date(), nullable=False),
        sa.Column("last_seq", sa.Integer(), nullable=False, server_default="0"),
        sa.UniqueConstraint("order_date", name="uq_order_sequences_order_date"),
    )


def downgrade() -> None:
    op.drop_table("order_sequences")
