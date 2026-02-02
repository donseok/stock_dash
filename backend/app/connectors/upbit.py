"""Upbit API connector for cryptocurrency data."""

import logging

import httpx
from app.core.cache import cache
from app.core.config import settings
from app.schemas.market import CryptoQuote
from app.utils.time import utcnow_iso

logger = logging.getLogger(__name__)

UPBIT_API = "https://api.upbit.com/v1"

# Target coins per PRD: BTC, ETH, SOL, XRP, LINK, SUI, ONDO
CRYPTO_MARKETS = [
    ("KRW-BTC", "Bitcoin", "BTC"),
    ("KRW-ETH", "Ethereum", "ETH"),
    ("KRW-SOL", "Solana", "SOL"),
    ("KRW-XRP", "XRP", "XRP"),
    ("KRW-LINK", "Chainlink", "LINK"),
    ("KRW-SUI", "Sui", "SUI"),
    ("KRW-ONDO", "Ondo Finance", "ONDO"),
]


async def fetch_crypto_quotes() -> list[CryptoQuote]:
    """Fetch real-time crypto quotes from Upbit API."""
    cached = cache.get("crypto_quotes")
    if cached is not None:
        return cached

    markets = ",".join(m[0] for m in CRYPTO_MARKETS)
    market_map = {m[0]: (m[1], m[2]) for m in CRYPTO_MARKETS}

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{UPBIT_API}/ticker", params={"markets": markets})
        resp.raise_for_status()
        data = resp.json()

    now = utcnow_iso()
    quotes = []
    for item in data:
        market = item["market"]
        name, symbol = market_map.get(market, ("Unknown", market))
        prev_close = item.get("prev_closing_price", 0)
        price = item.get("trade_price", 0)
        change_val = price - prev_close if prev_close else 0
        change_pct = (change_val / prev_close * 100) if prev_close else 0

        quotes.append(
            CryptoQuote(
                symbol=symbol,
                name=name,
                price=price,
                change=change_val,
                changePercent=round(change_pct, 2),
                volume24h=item.get("acc_trade_volume_24h", 0),
                high24h=item.get("high_price", 0),
                low24h=item.get("low_price", 0),
                timestamp=now,
                currency="KRW",
            )
        )
    cache.set("crypto_quotes", quotes, settings.CACHE_TTL_CRYPTO)
    return quotes
