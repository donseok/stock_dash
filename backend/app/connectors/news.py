"""News data connector.

Uses NewsAPI.org for financial news. Falls back to Google News RSS
when API key is not configured. Uses mock data only if RSS also fails.
"""

import hashlib
import logging
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

import httpx
from app.core.cache import cache
from app.core.config import settings
from app.schemas.market import NewsArticle
from app.utils.time import utcnow_iso

logger = logging.getLogger(__name__)

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


async def _fetch_google_news_rss(limit: int = 20) -> list[NewsArticle]:
    """Fetch Korean financial news from Google News RSS feed."""
    rss_url = (
        "https://news.google.com/rss/search?"
        "q=%EC%A3%BC%EC%8B%9D+%EA%B2%BD%EC%A0%9C&hl=ko&gl=KR&ceid=KR:ko"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(rss_url, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()

    root = ET.fromstring(resp.text)
    channel = root.find("channel")
    if channel is None:
        return []

    articles: list[NewsArticle] = []
    for item in channel.findall("item"):
        title = item.findtext("title", "")
        link = item.findtext("link", "")
        pub_date_str = item.findtext("pubDate", "")
        # Source is often in the title as " - SourceName"
        source_el = item.find("source")
        source = source_el.text if source_el is not None and source_el.text else ""
        if not source and " - " in title:
            parts = title.rsplit(" - ", 1)
            title = parts[0].strip()
            source = parts[1].strip()

        # Parse RFC 2822 date to ISO
        published_at = utcnow_iso()
        if pub_date_str:
            try:
                dt = parsedate_to_datetime(pub_date_str)
                published_at = dt.isoformat()
            except Exception as e:
                logger.warning("Failed to parse RSS date '%s': %s", pub_date_str, e)

        article_id = hashlib.md5(
            (link + title).encode()
        ).hexdigest()[:12]

        articles.append(
            NewsArticle(
                id=article_id,
                title=title,
                summary="",
                source=source,
                url=link,
                publishedAt=published_at,
                relatedSymbols=[],
                category="business",
            )
        )

        if len(articles) >= limit:
            break

    return articles


async def fetch_news(limit: int = 20) -> list[NewsArticle]:
    """Fetch financial news articles."""
    cache_key = f"news:{limit}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    result = None

    # 1. Try NewsAPI if key is configured
    if settings.NEWS_API_KEY:
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
            result = articles[:limit]
        except Exception as e:
            logger.warning("NewsAPI fetch failed: %s", e)

    # 2. Try Google News RSS (no API key needed)
    if result is None:
        try:
            rss_articles = await _fetch_google_news_rss(limit)
            if rss_articles:
                result = rss_articles
        except Exception as e:
            logger.warning("Google News RSS fetch failed: %s", e)

    # 3. Final fallback: mock data
    if result is None:
        result = MOCK_NEWS[:limit]

    cache.set(cache_key, result, settings.CACHE_TTL_NEWS)
    return result
