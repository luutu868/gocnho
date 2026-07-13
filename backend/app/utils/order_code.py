"""Generate unique order codes: TC-YYYYMMDD-XXXX."""

from datetime import date


def generate_order_code(sequence_number: int) -> str:
    """Generate order code: TC-YYYYMMDD-XXXX.

    Args:
        sequence_number: Daily sequence number (1-9999, reset each day).

    Returns:
        Order code string like "TC-20260712-0001".
    """
    today = date.today().strftime("%Y%m%d")
    seq = str(sequence_number).zfill(4)
    return f"TC-{today}-{seq}"


async def get_next_sequence(db, today: date) -> int:
    """Get the next sequence number for today (atomic increment).

    Uses PostgreSQL sequence or SELECT FOR UPDATE to ensure uniqueness.
    Returns the next number (1-based).
    """
    raise NotImplementedError("TODO: implement with DB sequence")
