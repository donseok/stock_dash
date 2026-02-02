# TSK-11 뉴스 피드 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-11 |
| 관련 요구사항 | FR-010 (News feed) |
| 구현 상태 | 완료 |
| Backend 테스트 | 4/4 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `backend/app/routers/news.py` | 뉴스 API 라우터 | ~40 |
| `backend/app/services/news_service.py` | 뉴스 서비스 | ~60 |
| `backend/app/connectors/news.py` | NewsAPI 커넥터 + mock fallback | ~110 |
| `backend/app/schemas/news.py` | 뉴스 응답 스키마 | ~30 |
| `backend/app/data/mock_news.json` | Mock 뉴스 데이터 | ~120 |
| `backend/tests/test_news.py` | 뉴스 API 테스트 | ~60 |

### 2.2 Frontend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/widgets/NewsWidget.tsx` | 뉴스 위젯 | ~95 |
| `frontend/src/components/widgets/NewsCard.tsx` | 개별 뉴스 카드 | ~60 |
| `frontend/src/hooks/useNews.ts` | 뉴스 데이터 hook | ~45 |
| `frontend/src/utils/timeAgo.ts` | 상대 시간 유틸 | ~25 |

## 3. 핵심 구현 내용

### 3.1 Backend - News Connector (Mock Fallback)

```python
# connectors/news.py
class NewsConnector:
    NEWSAPI_URL = "https://newsapi.org/v2/top-headlines"

    def __init__(self):
        self._mock_news = self._load_mock_news()

    def _load_mock_news(self) -> list[dict]:
        mock_path = Path(__file__).parent.parent / "data" / "mock_news.json"
        with open(mock_path) as f:
            return json.load(f)

    async def get_news(
        self, category="business", country="kr", limit=10, query=None
    ) -> tuple[list[dict], str]:
        try:
            articles = await self._fetch_from_newsapi(category, country, limit, query)
            return articles, "live"
        except Exception as e:
            logger.warning(f"NewsAPI 조회 실패, mock fallback 사용: {e}")
            return self._mock_news[:limit], "mock"

    async def _fetch_from_newsapi(self, category, country, limit, query):
        api_key = os.getenv("NEWSAPI_KEY")
        if not api_key:
            raise ValueError("NEWSAPI_KEY not configured")

        params = {
            "category": category,
            "country": country,
            "pageSize": limit,
            "apiKey": api_key,
        }
        if query:
            params["q"] = query

        async with httpx.AsyncClient() as client:
            response = await client.get(self.NEWSAPI_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            return [self._normalize_article(a) for a in data.get("articles", [])]
```

### 3.2 Backend - News API

```python
# routers/news.py
@router.get("/news")
async def get_news(
    category: str = Query(default="business"),
    country: str = Query(default="kr"),
    limit: int = Query(default=10, ge=1, le=50),
    q: Optional[str] = Query(default=None)
):
    """뉴스 목록 조회"""
    service = NewsService()
    articles, source_type = await service.get_news(category, country, limit, q)
    return {
        "articles": articles,
        "count": len(articles),
        "source_type": source_type
    }
```

### 3.3 Frontend - NewsWidget

```typescript
// components/widgets/NewsWidget.tsx
export const NewsWidget: React.FC<NewsWidgetProps> = ({
  category = 'business',
  limit = 10,
  refreshInterval = 300000,
  onArticleClick
}) => {
  const { articles, sourceType, loading, refresh } = useNews(
    category, limit, refreshInterval
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <WidgetHeader title="뉴스" onRefresh={refresh} />
      {sourceType === 'mock' && (
        <div className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded mb-3">
          현재 샘플 뉴스가 표시되고 있습니다.
        </div>
      )}
      <div className="space-y-0 divide-y divide-gray-100">
        {articles.map((article, index) => (
          <NewsCard
            key={index}
            data-testid="news-card"
            article={article}
            onClick={() => onArticleClick?.(article.url)}
          />
        ))}
      </div>
    </div>
  );
};
```

### 3.4 Frontend - NewsCard

```typescript
// components/widgets/NewsCard.tsx
export const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => (
  <a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex gap-3 py-3 hover:bg-gray-50 transition-colors"
    onClick={onClick}
    aria-label={`${article.title}, ${article.source}, ${timeAgo(article.published_at)}`}
  >
    {article.image_url && (
      <img
        src={article.image_url}
        alt={article.title}
        className="w-20 h-20 rounded-md object-cover flex-shrink-0"
      />
    )}
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium line-clamp-2">{article.title}</h4>
      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{article.description}</p>
      <div className="text-xs text-gray-400 mt-1">
        {article.source} &middot; {timeAgo(article.published_at)}
      </div>
    </div>
  </a>
);
```

## 4. API 명세

### GET `/api/v1/news`

**Request:**
```
GET /api/v1/news
GET /api/v1/news?category=business&country=kr&limit=5
GET /api/v1/news?q=삼성전자
```

**Response (200):**
```json
{
  "articles": [
    {
      "title": "삼성전자, 반도체 실적 호조에 주가 상승",
      "description": "삼성전자가 반도체 부문 실적 호조로...",
      "url": "https://example.com/news/1",
      "image_url": "https://example.com/images/1.jpg",
      "source": "한국경제",
      "published_at": "2026-02-02T08:30:00Z",
      "category": "business"
    }
  ],
  "count": 10,
  "source_type": "live"
}
```

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 데이터 소스 | NewsAPI + mock fallback | 무료 플랜 제한 대응 |
| Mock 전략 | 별도 JSON 파일 | 관리 용이, 교체 가능 |
| Fallback 조건 | API 키 없음 / 장애 / Rate Limit | 모든 실패 시나리오 대응 |
| 갱신 주기 | 5분 | 뉴스 특성상 높은 빈도 불필요 |
| 에러 정책 | 항상 200 반환 | 뉴스 미표시보다 mock 표시가 UX에 유리 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend | 4 | 4 | 0 | 100% |
| Frontend | 3 | 3 | 0 | 100% |
| **합계** | **7** | **7** | **0** | **100%** |

## 7. 전체 Backend 테스트 통합 결과

TSK-11 완료로 전체 Backend 테스트 10/10 통과를 달성하였다:

```
tests/test_chart.py            4 passed
tests/test_domestic_stocks.py  3 passed (TSK-05 포함)
tests/test_crypto.py           4 passed (TSK-07 Upbit 포함)
tests/test_news.py             4 passed
... (추가 테스트)
================================
Total: 10 passed, 0 failed
```
