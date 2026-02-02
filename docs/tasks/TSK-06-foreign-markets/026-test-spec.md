# TSK-06 해외 시장 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-06 |
| 테스트 대상 | ForeignStockWidget, MarketIndicesBar, Foreign/Indices API |
| 관련 요구사항 | FR-004, FR-009 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient) |
| Frontend 테스트 | Jest, React Testing Library |
| Mock | unittest.mock (BE), MSW (FE) |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-06-002: Foreign Stocks API 정상 조회

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-06-002 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/stocks/foreign` |
| 기대 결과 | HTTP 200, Alphabet C 시세 반환 |

```python
async def test_foreign_stocks(client, mock_yahoo):
    response = await client.get("/api/v1/stocks/foreign")
    assert response.status_code == 200
    data = response.json()
    assert len(data["stocks"]) >= 1
    goog = next(s for s in data["stocks"] if s["symbol"] == "GOOG")
    assert goog["currency"] == "USD"
    assert goog["price"] > 0
```

#### TC-06-003: Foreign Stocks API 에러 처리

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-06-003 |
| 구분 | Unit (Backend) |
| 입력 | Yahoo Finance 장애 시뮬레이션 |
| 기대 결과 | 캐시 데이터 반환 또는 503 |

#### TC-06-006: Indices API 정상 조회

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-06-006 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/indices/quotes` |
| 기대 결과 | HTTP 200, DOW/NASDAQ 지수 반환 |

```python
async def test_indices_quotes(client, mock_yahoo):
    response = await client.get("/api/v1/indices/quotes")
    assert response.status_code == 200
    data = response.json()
    symbols = [i["symbol"] for i in data["indices"]]
    assert "^DJI" in symbols
    assert "^IXIC" in symbols
```

#### TC-06-007: Indices API 타입 필터

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-06-007 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/indices/quotes?type=foreign` |
| 기대 결과 | 해외 지수만 반환 |

### 3.2 Frontend 테스트

#### TC-06-001: Alphabet C 카드 렌더링

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-06-001 |
| 구분 | Unit (Frontend) |
| 기대 결과 | Alphabet C 종목명, USD 가격, 등락 표시 |

```typescript
test('renders Alphabet C stock card', async () => {
  render(<ForeignStockWidget />);
  await waitFor(() => {
    expect(screen.getByText(/Alphabet/)).toBeInTheDocument();
    expect(screen.getByText('GOOG')).toBeInTheDocument();
  });
});
```

#### TC-06-004: DOW 지수 배지 렌더링

```typescript
test('renders DOW index badge', async () => {
  render(<MarketIndicesBar type="foreign" />);
  await waitFor(() => {
    expect(screen.getByText('DOW')).toBeInTheDocument();
  });
});
```

#### TC-06-005: NASDAQ 지수 배지 렌더링

```typescript
test('renders NASDAQ index badge', async () => {
  render(<MarketIndicesBar type="foreign" />);
  await waitFor(() => {
    expect(screen.getByText('NASDAQ')).toBeInTheDocument();
  });
});
```

## 4. 테스트 실행 방법

```bash
# Backend 테스트
cd backend && pytest tests/test_foreign_markets.py tests/test_indices.py -v

# Frontend 테스트
cd frontend && npm test -- --testPathPattern="ForeignStockWidget|MarketIndicesBar"
```
