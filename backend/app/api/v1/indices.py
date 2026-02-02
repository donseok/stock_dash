"""Market indices API endpoints."""

from fastapi import APIRouter

from app.connectors.market_index import fetch_market_indices
from app.utils.time import utcnow_iso

router = APIRouter(prefix="/indices", tags=["indices"])


@router.get("/quotes")
async def get_market_indices():
    """Get major market indices (KOSPI, KOSDAQ, DOW, NASDAQ)."""
    indices = await fetch_market_indices()
    return {
        "data": [i.model_dump() for i in indices],
        "status": "success",
        "timestamp": utcnow_iso(),
    }
