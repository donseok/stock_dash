"""News API endpoints."""

from fastapi import APIRouter, Query

from app.connectors.news import fetch_news
from app.utils.time import utcnow_iso

router = APIRouter(prefix="/news", tags=["news"])


@router.get("")
async def get_news(limit: int = Query(20, ge=1, le=100)):
    """Get financial news articles."""
    articles = await fetch_news(limit=limit)
    return {
        "data": [a.model_dump() for a in articles],
        "status": "success",
        "timestamp": utcnow_iso(),
    }
