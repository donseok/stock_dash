"""Market index data connector.

Uses Yahoo Finance-compatible endpoint for major market indices.
"""

import asyncio
import logging

import httpx
from app.core.cache import cache
from app.core.config import settings
from app.schemas.market import MarketIndex
from app.utils.time import utcnow_iso

logger = logging.getLogger(__name__)

# Fallback mock data when API is not available
MOCK_INDICES = [
    MarketIndex(
        symbol="KOSPI",
        name="KOSPI",
        value=2580.45,
        change=12.30,
        changePercent=0.48,
        market="KR",
        isOpen=True,
        timestamp=utcnow_iso(),
    ),
    MarketIndex(
        symbol="KOSDAQ",
        name="KOSDAQ",
        value=742.18,
        change=-3.21,
        changePercent=-0.43,
        market="KR",
        isOpen=True,
        timestamp=utcnow_iso(),
    ),
    MarketIndex(
        symbol="DJI",
        name="다우존스",
        value=44552.12,
        change=125.65,
        changePercent=0.28,
        market="US",
        isOpen=False,
        timestamp=utcnow_iso(),
    ),
    MarketIndex(
        symbol="IXIC",
        name="나스닥",
        value=19654.78,
        change=-45.32,
        changePercent=-0.23,
        market="US",
        isOpen=False,
        timestamp=utcnow_iso(),
    ),
]


SYMBOLS_CONFIG = [
    ("^KS11", "KOSPI", "KR"),
    ("^KQ11", "KOSDAQ", "KR"),
    ("^DJI", "다우존스", "US"),
    ("^IXIC", "나스닥", "US"),
]


async def _fetch_single_index(
    client: httpx.AsyncClient, yf_symbol: str, display_name: str, market: str, now: str
) -> MarketIndex | None:
    """Fetch a single market index. Returns mock on failure."""
    try:
        resp = await client.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{yf_symbol}",
            params={"interval": "1d", "range": "5d"},
            headers={"User-Agent": "Mozilla/5.0"},
        )
        if resp.status_code != 200:
            raise ValueError("API returned non-200")

        result = resp.json()["chart"]["result"][0]
        meta = result["meta"]
        price = meta["regularMarketPrice"]
        prev = meta.get("previousClose")
        if not prev:
            closes = [c for c in result.get("indicators", {}).get("quote", [{}])[0].get("close", []) if c is not None]
            prev = closes[-2] if len(closes) >= 2 else price
        change = round(price - prev, 2)
        pct = round((change / prev) * 100, 2) if prev else 0

        return MarketIndex(
            symbol=yf_symbol.replace("^", ""),
            name=display_name,
            value=round(price, 2),
            change=change,
            changePercent=pct,
            market=market,
            isOpen=meta.get("marketState", "") == "REGULAR",
            timestamp=now,
        )
    except Exception as e:
        logger.warning("Failed to fetch index %s: %s", yf_symbol, e)
        mock = next((m for m in MOCK_INDICES if m.name == display_name), None)
        return mock.model_copy(update={"timestamp": now}) if mock else None


async def fetch_market_indices() -> list[MarketIndex]:
    """Fetch major market indices.

    Uses a free endpoint when available, falls back to mock data.
    """
    cached = cache.get("market_indices")
    if cached is not None:
        return cached

    now = utcnow_iso()

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            tasks = [
                _fetch_single_index(client, yf_sym, name, mkt, now)
                for yf_sym, name, mkt in SYMBOLS_CONFIG
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            indices = [r for r in results if isinstance(r, MarketIndex)]
            indices = indices if indices else MOCK_INDICES
            cache.set("market_indices", indices, settings.CACHE_TTL_INDEX)
            return indices

    except Exception as e:
        logger.error("Failed to fetch market indices: %s", e)
        return [m.model_copy(update={"timestamp": now}) for m in MOCK_INDICES]
