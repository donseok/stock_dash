"""Stock data API endpoints."""

from fastapi import APIRouter, Query

from app.connectors.stock import (
    fetch_domestic_stocks,
    fetch_foreign_stocks,
    fetch_stock_chart,
)
from app.utils.time import utcnow_iso

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.get("/domestic")
async def get_domestic_stocks():
    """Get domestic (Korean) stock quotes."""
    stocks = await fetch_domestic_stocks()
    return {
        "data": [s.model_dump() for s in stocks],
        "status": "success",
        "timestamp": utcnow_iso(),
    }


@router.get("/foreign")
async def get_foreign_stocks():
    """Get foreign stock quotes."""
    stocks = await fetch_foreign_stocks()
    return {
        "data": [s.model_dump() for s in stocks],
        "status": "success",
        "timestamp": utcnow_iso(),
    }


@router.get("/{symbol}/chart")
async def get_stock_chart(
    symbol: str,
    period: str = Query("1M", pattern="^(1D|1W|1M|3M|1Y)$"),
):
    """Get OHLC chart data for a stock."""
    data = await fetch_stock_chart(symbol, period)
    return {
        "data": [d.model_dump() for d in data],
        "status": "success",
        "timestamp": utcnow_iso(),
    }
