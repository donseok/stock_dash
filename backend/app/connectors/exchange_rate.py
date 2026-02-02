"""Exchange rate connector."""

import asyncio
import logging

import httpx
from app.core.cache import cache
from app.core.config import settings
from app.schemas.market import ExchangeRate
from app.utils.time import utcnow_iso

logger = logging.getLogger(__name__)

EXCHANGE_API = "https://open.er-api.com/v6/latest"

# Yahoo Finance symbols for exchange rate change calculation
YF_PAIRS = [
    ("USD", "KRW", "KRW=X"),
    ("USD", "JPY", "JPY=X"),
    ("USD", "EUR", "EURUSD=X"),
    ("USD", "CNY", "CNY=X"),
]


async def _fetch_yf_exchange(
    client: httpx.AsyncClient, base: str, quote: str, yf_sym: str, fallback_rate: float, now: str
) -> ExchangeRate:
    """Fetch a single exchange rate from Yahoo Finance."""
    rate, change, pct = fallback_rate, 0.0, 0.0

    try:
        resp = await client.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{yf_sym}",
            params={"interval": "1d", "range": "5d"},
            headers={"User-Agent": "Mozilla/5.0"},
        )
        if resp.status_code == 200:
            chart = resp.json()["chart"]["result"][0]
            meta = chart["meta"]
            current = meta.get("regularMarketPrice", rate)
            prev = meta.get("previousClose")
            if not prev:
                closes = [c for c in chart.get("indicators", {}).get("quote", [{}])[0].get("close", []) if c is not None]
                prev = closes[-2] if len(closes) >= 2 else current

            # For EUR pair, Yahoo returns EUR/USD, invert for USD/EUR
            if quote == "EUR":
                current = round(1 / current, 4) if current else 0
                prev = round(1 / prev, 4) if prev else 0

            rate = round(current, 2)
            change = round(current - prev, 2)
            pct = round((change / prev) * 100, 2) if prev else 0
    except Exception as e:
        logger.warning("Failed to fetch Yahoo Finance change for %s: %s", yf_sym, e)

    return ExchangeRate(
        baseCurrency=base,
        quoteCurrency=quote,
        rate=rate,
        change=change,
        changePercent=pct,
        timestamp=now,
    )


async def fetch_exchange_rates() -> list[ExchangeRate]:
    """Fetch USD/KRW and other key exchange rates."""
    cached = cache.get("exchange_rates")
    if cached is not None:
        return cached

    now = utcnow_iso()

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1) Fetch base rates from er-api
        resp = await client.get(f"{EXCHANGE_API}/USD")
        resp.raise_for_status()
        rates_data = resp.json().get("rates", {})

        # 2) Fetch Yahoo Finance change data in parallel
        tasks = [
            _fetch_yf_exchange(client, base, quote, yf_sym, rates_data.get(quote, 0), now)
            for base, quote, yf_sym in YF_PAIRS
        ]
        result = await asyncio.gather(*tasks)

    cache.set("exchange_rates", result, settings.CACHE_TTL_EXCHANGE)
    return result
