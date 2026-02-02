"""Market index data connector.

Uses Yahoo Finance-compatible endpoint for major market indices.
"""

import httpx
from app.schemas.market import MarketIndex
from app.utils.time import utcnow_iso

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


async def fetch_market_indices() -> list[MarketIndex]:
    """Fetch major market indices.

    Uses a free endpoint when available, falls back to mock data.
    """
    now = utcnow_iso()

    # Try to get real data from a free source
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Use Yahoo Finance chart API for KOSPI
            indices = []

            symbols_config = [
                ("^KS11", "KOSPI", "KR"),
                ("^KQ11", "KOSDAQ", "KR"),
                ("^DJI", "다우존스", "US"),
                ("^IXIC", "나스닥", "US"),
            ]

            for yf_symbol, display_name, market in symbols_config:
                try:
                    resp = await client.get(
                        f"https://query1.finance.yahoo.com/v8/finance/chart/{yf_symbol}",
                        params={"interval": "1d", "range": "5d"},
                        headers={"User-Agent": "Mozilla/5.0"},
                    )
                    if resp.status_code == 200:
                        result = resp.json()["chart"]["result"][0]
                        meta = result["meta"]
                        price = meta["regularMarketPrice"]
                        prev = meta.get("previousClose")
                        if not prev:
                            closes = [c for c in result.get("indicators", {}).get("quote", [{}])[0].get("close", []) if c is not None]
                            prev = closes[-2] if len(closes) >= 2 else price
                        change = round(price - prev, 2)
                        pct = round((change / prev) * 100, 2) if prev else 0

                        indices.append(
                            MarketIndex(
                                symbol=yf_symbol.replace("^", ""),
                                name=display_name,
                                value=round(price, 2),
                                change=change,
                                changePercent=pct,
                                market=market,
                                isOpen=meta.get("regularMarketTime", 0)
                                > meta.get("regularMarketDayHigh", 0),
                                timestamp=now,
                            )
                        )
                    else:
                        raise ValueError("API returned non-200")
                except Exception:
                    # Use mock for this specific index
                    mock = next(
                        (m for m in MOCK_INDICES if m.name == display_name),
                        None,
                    )
                    if mock:
                        mock.timestamp = now
                        indices.append(mock)

            return indices if indices else MOCK_INDICES

    except Exception:
        # Return mock data as fallback
        for m in MOCK_INDICES:
            m.timestamp = now
        return MOCK_INDICES
