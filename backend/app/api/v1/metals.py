"""Precious metals API endpoints."""

from fastapi import APIRouter

from app.connectors.metals import fetch_precious_metals
from app.utils.time import utcnow_iso

router = APIRouter(prefix="/metals", tags=["metals"])


@router.get("/quotes")
async def get_precious_metals():
    """Get gold and silver spot prices."""
    quotes = await fetch_precious_metals()
    return {
        "data": [q.model_dump() for q in quotes],
        "status": "success",
        "timestamp": utcnow_iso(),
    }
