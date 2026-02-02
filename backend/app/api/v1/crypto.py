"""Cryptocurrency API endpoints."""

from fastapi import APIRouter

from app.connectors.upbit import fetch_crypto_quotes
from app.utils.time import utcnow_iso

router = APIRouter(prefix="/crypto", tags=["crypto"])


@router.get("/quotes")
async def get_crypto_quotes():
    """Get real-time cryptocurrency quotes from Upbit."""
    quotes = await fetch_crypto_quotes()
    return {
        "data": [q.model_dump() for q in quotes],
        "status": "success",
        "timestamp": utcnow_iso(),
    }
