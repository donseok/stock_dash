# TSK-11 뉴스 피드 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-11 |
| 테스트 대상 | NewsWidget, News API, News Connector |
| 관련 요구사항 | FR-010 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient) |
| Frontend 테스트 | Jest, React Testing Library |
| Mock | unittest.mock (BE), MSW (FE) |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-11-004: News API 정상 조회 (live)

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-004 |
| 구분 | Unit (Backend) |
| 사전 조건 | NewsAPI mock 설정 (정상 응답) |
| 입력 | `GET /api/v1/news` |
| 기대 결과 | HTTP 200, 뉴스 목록 반환, source_type == "live" |

```python
async def test_news_api_live(client, mock_newsapi):
    response = await client.get("/api/v1/news")
    assert response.status_code == 200
    data = response.json()
    assert len(data["articles"]) > 0
    assert data["source_type"] == "live"
    article = data["articles"][0]
    assert "title" in article
    assert "url" in article
    assert "source" in article
```

#### TC-11-005: News API 카테고리 필터

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-005 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/news?category=business&limit=5` |
| 기대 결과 | HTTP 200, 최대 5개 뉴스 반환 |

```python
async def test_news_api_filter(client, mock_newsapi):
    response = await client.get("/api/v1/news?category=business&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["articles"]) <= 5
```

#### TC-11-006: News API mock fallback

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-006 |
| 구분 | Unit (Backend) |
| 사전 조건 | NEWSAPI_KEY 미설정 또는 API 장애 mock |
| 입력 | `GET /api/v1/news` |
| 기대 결과 | HTTP 200, mock 뉴스 반환, source_type == "mock" |

```python
async def test_news_api_mock_fallback(client, mock_newsapi_error):
    response = await client.get("/api/v1/news")
    assert response.status_code == 200
    data = response.json()
    assert data["source_type"] == "mock"
    assert len(data["articles"]) > 0
```

#### TC-11-007: News Connector 에러 처리

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-007 |
| 구분 | Unit (Backend) |
| 입력 | NewsAPI 타임아웃 시뮬레이션 |
| 기대 결과 | Mock fallback 활성화, 에러 전파 없음 |

```python
async def test_news_connector_fallback(mock_newsapi_timeout):
    connector = NewsConnector()
    articles, source_type = await connector.get_news()
    assert source_type == "mock"
    assert len(articles) > 0
```

### 3.2 Frontend 테스트

#### TC-11-001: 뉴스 목록 렌더링

```typescript
test('renders news list', async () => {
  render(<NewsWidget />);
  await waitFor(() => {
    const cards = screen.getAllByTestId('news-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
```

#### TC-11-002: NewsCard 상세 표시

```typescript
test('displays article details', async () => {
  render(<NewsWidget />);
  await waitFor(() => {
    expect(screen.getByText(/삼성전자/)).toBeInTheDocument();
    expect(screen.getByText(/한국경제/)).toBeInTheDocument();
  });
});
```

#### TC-11-003: 외부 링크 동작

```typescript
test('news card links to external URL', async () => {
  render(<NewsWidget />);
  await waitFor(() => {
    const link = screen.getAllByRole('link')[0];
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
```

## 4. 테스트 실행 방법

```bash
# Backend 테스트
cd backend && pytest tests/test_news.py -v

# Frontend 테스트
cd frontend && npm test -- --testPathPattern=NewsWidget
```
