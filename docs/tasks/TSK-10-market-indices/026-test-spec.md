# TSK-10 시장 지수 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-10 |
| 테스트 대상 | MarketIndicesBar, Indices API, Market Index Connector |
| 관련 요구사항 | FR-008, FR-009 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient) |
| Frontend 테스트 | Jest, React Testing Library |
| Mock | unittest.mock (BE), MSW (FE) |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-10-005: Indices API 전체 조회

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-10-005 |
| 구분 | Unit (Backend) |
| 사전 조건 | Yahoo Finance mock 설정 |
| 입력 | `GET /api/v1/indices/quotes` |
| 기대 결과 | HTTP 200, 4개 지수 (KOSPI, KOSDAQ, DOW, NASDAQ) 반환 |

```python
async def test_indices_all(client, mock_yahoo):
    response = await client.get("/api/v1/indices/quotes")
    assert response.status_code == 200
    data = response.json()
    assert len(data["indices"]) == 4
    names = [i["name"] for i in data["indices"]]
    assert "KOSPI" in names
    assert "KOSDAQ" in names
    assert "DOW" in names
    assert "NASDAQ" in names
```

#### TC-10-006: Indices API domestic 필터

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-10-006 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/indices/quotes?type=domestic` |
| 기대 결과 | HTTP 200, KOSPI/KOSDAQ 2개만 반환 |

```python
async def test_indices_domestic(client, mock_yahoo):
    response = await client.get("/api/v1/indices/quotes?type=domestic")
    assert response.status_code == 200
    data = response.json()
    assert len(data["indices"]) == 2
    types = set(i["type"] for i in data["indices"])
    assert types == {"domestic"}
```

#### TC-10-007: Market Index Connector Mock 테스트

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-10-007 |
| 구분 | Unit (Backend) |
| 입력 | Yahoo Finance mock 응답 |
| 기대 결과 | 4개 지수 데이터 정상 파싱 |

```python
async def test_market_index_connector(mock_yahoo):
    connector = MarketIndexConnector()
    indices = await connector.get_indices("all")
    assert len(indices) == 4
    for idx in indices:
        assert "symbol" in idx
        assert "value" in idx
        assert idx["value"] > 0
```

#### TC-10-008: Market Index Connector 에러 처리

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-10-008 |
| 구분 | Unit (Backend) |
| 입력 | Yahoo Finance 장애 시뮬레이션 |
| 기대 결과 | 캐시 데이터 반환 또는 503 |

### 3.2 Frontend 테스트

#### TC-10-001: KOSPI IndexBadge 렌더링

```typescript
test('renders KOSPI index badge', async () => {
  render(<MarketIndicesBar type="all" />);
  await waitFor(() => {
    expect(screen.getByText('KOSPI')).toBeInTheDocument();
  });
});
```

#### TC-10-002: KOSDAQ IndexBadge 렌더링

```typescript
test('renders KOSDAQ index badge', async () => {
  render(<MarketIndicesBar type="all" />);
  await waitFor(() => {
    expect(screen.getByText('KOSDAQ')).toBeInTheDocument();
  });
});
```

#### TC-10-003: DOW IndexBadge 렌더링

```typescript
test('renders DOW index badge', async () => {
  render(<MarketIndicesBar type="all" />);
  await waitFor(() => {
    expect(screen.getByText('DOW')).toBeInTheDocument();
  });
});
```

#### TC-10-004: NASDAQ IndexBadge 렌더링

```typescript
test('renders NASDAQ index badge', async () => {
  render(<MarketIndicesBar type="all" />);
  await waitFor(() => {
    expect(screen.getByText('NASDAQ')).toBeInTheDocument();
  });
});
```

## 4. 테스트 실행 방법

```bash
# Backend 테스트
cd backend && pytest tests/test_market_indices.py -v

# Frontend 테스트
cd frontend && npm test -- --testPathPattern=MarketIndicesBar
```
