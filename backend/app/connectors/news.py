"""News data connector.

Uses NewsAPI.org for financial news. Falls back to mock data when
API key is not configured.
"""

import hashlib
from typing import Optional
import httpx
from app.core.config import settings
from app.schemas.market import NewsArticle
from app.utils.time import utcnow_iso

MOCK_NEWS = [
    NewsArticle(
        id="news-001",
        title="삼성전자, AI 반도체 신규 투자 5조원 발표",
        summary="삼성전자가 차세대 AI 반도체 개발을 위해 5조원 규모의 신규 투자를 발표했다.",
        source="한국경제",
        url="https://example.com/news/001",
        publishedAt=utcnow_iso(),
        relatedSymbols=["005930"],
        category="stock",
    ),
    NewsArticle(
        id="news-002",
        title="비트코인 10만 달러 돌파, 기관 투자 확대",
        summary="비트코인이 심리적 저항선인 10만 달러를 돌파하며 사상 최고가를 기록했다.",
        source="코인데스크",
        url="https://example.com/news/002",
        publishedAt=utcnow_iso(),
        relatedSymbols=["BTC", "ETH"],
        category="crypto",
    ),
    NewsArticle(
        id="news-003",
        title="금값 사상 최고치 경신, 안전자산 수요 급증",
        summary="국제 금값이 온스당 2,800달러를 돌파하며 사상 최고치를 경신했다.",
        source="매일경제",
        url="https://example.com/news/003",
        publishedAt=utcnow_iso(),
        relatedSymbols=["GOLD"],
        category="commodity",
    ),
    NewsArticle(
        id="news-004",
        title="KOSPI 2,600선 회복, 외국인 매수세 유입",
        summary="코스피가 외국인 매수세에 힘입어 2,600선을 회복했다.",
        source="조선비즈",
        url="https://example.com/news/004",
        publishedAt=utcnow_iso(),
        relatedSymbols=["KOSPI"],
        category="market",
    ),
    NewsArticle(
        id="news-005",
        title="셀트리온, 신약 FDA 승인 기대감 상승",
        summary="셀트리온의 자가면역질환 신약이 FDA 승인 가능성이 높아지면서 주가가 상승했다.",
        source="머니투데이",
        url="https://example.com/news/005",
        publishedAt=utcnow_iso(),
        relatedSymbols=["068270"],
        category="stock",
    ),
    NewsArticle(
        id="news-006",
        title="원/달러 환율 1,450원대 하락, 달러 약세 영향",
        summary="원/달러 환율이 달러 약세 흐름에 1,450원대로 하락했다.",
        source="서울경제",
        url="https://example.com/news/006",
        publishedAt=utcnow_iso(),
        relatedSymbols=["USD/KRW"],
        category="forex",
    ),
]


async def fetch_news(limit: int = 20) -> list[NewsArticle]:
    """Fetch financial news articles."""
    if not settings.NEWS_API_KEY:
        return MOCK_NEWS[:limit]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{settings.NEWS_API_URL}/top-headlines",
                params={
                    "country": "kr",
                    "category": "business",
                    "pageSize": min(limit, 100),
                    "apiKey": settings.NEWS_API_KEY,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        articles = []
        for item in data.get("articles", []):
            article_id = hashlib.md5(
                (item.get("url", "") + item.get("title", "")).encode()
            ).hexdigest()[:12]

            articles.append(
                NewsArticle(
                    id=article_id,
                    title=item.get("title", ""),
                    summary=item.get("description", "") or "",
                    source=item.get("source", {}).get("name", ""),
                    url=item.get("url", ""),
                    imageUrl=item.get("urlToImage"),
                    publishedAt=item.get("publishedAt", utcnow_iso()),
                    relatedSymbols=[],
                    category="business",
                )
            )
        return articles[:limit]

    except Exception:
        return MOCK_NEWS[:limit]
