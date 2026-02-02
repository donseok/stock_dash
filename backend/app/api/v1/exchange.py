"""Exchange rate API endpoints."""

from fastapi import APIRouter

from app.connectors.exchange_rate import fetch_exchange_rates
from app.utils.time import utcnow_iso

router = APIRouter(prefix="/exchange", tags=["exchange"])


@router.get("/rates")
async def get_exchange_rates():
    """Get major exchange rates (USD/KRW, etc.)."""
    rates = await fetch_exchange_rates()
    return {
        "data": [r.model_dump() for r in rates],
        "status": "success",
        "timestamp": utcnow_iso(),
    }
