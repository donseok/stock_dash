"""Time utilities."""

from datetime import datetime, timezone


def utcnow_iso() -> str:
    """Return current UTC time as ISO format string."""
    return datetime.now(timezone.utc).isoformat()


def utcfromtimestamp(ts: float) -> datetime:
    """Convert UNIX timestamp to UTC datetime."""
    return datetime.fromtimestamp(ts, tz=timezone.utc)
