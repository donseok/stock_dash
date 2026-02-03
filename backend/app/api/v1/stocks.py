"""Stock data API endpoints."""

from fastapi import APIRouter, Query
from typing import Optional

from app.connectors.stock import (
    fetch_domestic_stocks,
    fetch_foreign_stocks,
    fetch_stock_chart,
    fetch_stock_detail,
    search_stocks,
)
from app.utils.time import utcnow_iso

router = APIRouter(prefix="/stocks", tags=["stocks"])


def _parse_extra(extra: list[str]) -> list[tuple[str, str, str]]:
    """Parse extra stock params in 'yahooSymbol:displaySymbol:name' format."""
    result = []
    for item in extra:
        parts = item.split(":", 2)
        if len(parts) == 3:
            result.append((parts[0], parts[1], parts[2]))
    return result


@router.get("/search")
async def search_stock(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=30),
):
    """Search stocks via Yahoo Finance."""
    results = await search_stocks(q, limit)
    return {
        "data": [r.model_dump() for r in results],
        "status": "success",
        "timestamp": utcnow_iso(),
    }


@router.get("/domestic")
async def get_domestic_stocks(
    extra: list[str] = Query(default=[]),
):
    """Get domestic (Korean) stock quotes."""
    extra_stocks = _parse_extra(extra) if extra else None
    stocks = await fetch_domestic_stocks(extra_stocks=extra_stocks)
    return {
        "data": [s.model_dump() for s in stocks],
        "status": "success",
        "timestamp": utcnow_iso(),
    }


@router.get("/foreign")
async def get_foreign_stocks(
    extra: list[str] = Query(default=[]),
):
    """Get foreign stock quotes."""
    extra_stocks = _parse_extra(extra) if extra else None
    stocks = await fetch_foreign_stocks(extra_stocks=extra_stocks)
    return {
        "data": [s.model_dump() for s in stocks],
        "status": "success",
        "timestamp": utcnow_iso(),
    }


@router.get("/{symbol}/detail")
async def get_stock_detail(
    symbol: str,
    yf: Optional[str] = Query(default=None),
):
    """Get detailed stock information including 52-week high/low."""
    detail = await fetch_stock_detail(symbol, yahoo_symbol=yf)
    if detail is None:
        return {
            "data": None,
            "status": "error",
            "message": "Stock not found or data unavailable",
            "timestamp": utcnow_iso(),
        }
    return {
        "data": detail.model_dump(),
        "status": "success",
        "timestamp": utcnow_iso(),
    }


@router.get("/{symbol}/chart")
async def get_stock_chart(
    symbol: str,
    period: str = Query("1M", pattern="^(1D|1W|1M|3M|1Y)$"),
    yf: Optional[str] = Query(default=None),
):
    """Get OHLC chart data for a stock."""
    data = await fetch_stock_chart(symbol, period, yahoo_symbol=yf)
    return {
        "data": [d.model_dump() for d in data],
        "status": "success",
        "timestamp": utcnow_iso(),
    }
