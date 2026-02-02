# TSK-11 뉴스 피드 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-11 |
| 태스크명 | News Feed (뉴스 피드) |
| 관련 요구사항 | FR-010 (News feed) |
| 우선순위 | 중간 |
| 상태 | 완료 |

## 2. 목적

금융/주식 관련 최신 뉴스를 대시보드 위젯으로 제공한다. NewsAPI를 주 데이터 소스로 사용하며, API 사용 불가 시 mock 데이터로 fallback하여 서비스 안정성을 확보한다.

## 3. 아키텍처

### 3.1 시스템 구성도

```
[Frontend]                              [Backend]
NewsWidget.tsx        ──HTTP──>      /api/v1/news
  ├─ NewsCard (뉴스1)                    │
  ├─ NewsCard (뉴스2)                    ├─ NewsService
  ├─ NewsCard (뉴스3)                    ├─ News Connector
  └─ ...                                │   (connectors/news.py)
                                        ├─ Mock Fallback
                                        └─ Cache Layer
```

### 3.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/news` | 뉴스 목록 조회 |

#### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| category | string | `business` | 뉴스 카테고리 |
| country | string | `kr` | 국가 코드 |
| limit | int | `10` | 최대 뉴스 수 |
| q | string | (없음) | 검색 키워드 |

#### Response Schema

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

> `source_type`: "live" (NewsAPI 실시간) 또는 "mock" (fallback)

#### News Connector

```python
# connectors/news.py
class NewsConnector:
    NEWSAPI_URL = "https://newsapi.org/v2/top-headlines"
    MOCK_NEWS = [...]  # 기본 mock 뉴스 데이터

    async def get_news(self, category="business", country="kr", limit=10) -> tuple[list, str]:
        """뉴스 조회 (NewsAPI + mock fallback)"""
        try:
            articles = await self._fetch_from_newsapi(category, country, limit)
            return articles, "live"
        except Exception:
            return self.MOCK_NEWS[:limit], "mock"

    async def _fetch_from_newsapi(self, category, country, limit):
        api_key = os.getenv("NEWSAPI_KEY")
        if not api_key:
            raise ValueError("NEWSAPI_KEY not configured")
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.NEWSAPI_URL,
                params={
                    "category": category,
                    "country": country,
                    "pageSize": limit,
                    "apiKey": api_key
                }
            )
            return response.json()["articles"]
```

### 3.3 Frontend 설계

#### 컴포넌트 구조

```
NewsWidget
├── WidgetHeader ("뉴스")
├── NewsCard (뉴스 항목 1)
│   ├── Thumbnail (이미지)
│   ├── Title (제목)
│   ├── Description (요약)
│   ├── Source (출처)
│   └── PublishedTime (발행 시간)
├── NewsCard (뉴스 항목 2)
├── ...
└── MoreButton ("더 보기")
```

#### 주요 Props

```typescript
interface NewsWidgetProps {
  category?: string;
  limit?: number;
  refreshInterval?: number;  // ms, default: 300000 (5분)
  onArticleClick?: (url: string) => void;
}
```

## 4. 데이터 흐름

1. NewsWidget 마운트 시 `/api/v1/news` 호출
2. Backend에서 NewsAPI로 뉴스 조회 시도
3. NewsAPI 성공 시 실시간 뉴스 반환 (source_type: "live")
4. NewsAPI 실패 시 mock 뉴스 반환 (source_type: "mock")
5. NewsCard에 매핑하여 렌더링
6. 5분 간격 자동 갱신

## 5. Mock 뉴스 전략

| 항목 | 설명 |
|------|------|
| Mock 데이터 수 | 10개 고정 뉴스 기사 |
| 내용 | 금융/주식 관련 일반 뉴스 |
| 활성화 조건 | NEWSAPI_KEY 미설정 또는 API 장애 |
| 표시 | 위젯 하단에 "mock 데이터" 알림 표시 |

## 6. 캐시 전략

| 데이터 | TTL | 사유 |
|--------|-----|------|
| 뉴스 목록 (live) | 300초 (5분) | 뉴스 갱신 주기 |
| 뉴스 목록 (mock) | 3600초 (1시간) | 정적 데이터 |

## 7. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| NewsAPI 키 없음 | 200 | Mock 데이터 fallback |
| NewsAPI 장애 | 200 | Mock 데이터 fallback |
| NewsAPI Rate Limit | 200 | 캐시 또는 mock fallback |
| 전체 실패 | 200 | Mock 데이터 반환 (항상 뉴스 표시) |
