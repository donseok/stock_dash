# TSK-05 국내 주식 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-05 |
| 테스트 대상 | DomesticStockWidget, Domestic Stock API |
| 관련 요구사항 | FR-003 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient) |
| Frontend 테스트 | Jest, React Testing Library |
| Mock | unittest.mock (BE), MSW (FE) |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-05-004: Domestic API 전체 종목 조회

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-05-004 |
| 구분 | Unit (Backend) |
| 사전 조건 | Yahoo Finance mock 설정 |
| 입력 | `GET /api/v1/stocks/domestic` |
| 기대 결과 | HTTP 200, 3개 종목 시세 반환 |
| 검증 항목 | status_code == 200, stocks 배열 길이 == 3, 각 항목에 price/change/volume 포함 |

```python
async def test_domestic_stocks_all(client, mock_yahoo):
    response = await client.get("/api/v1/stocks/domestic")
    assert response.status_code == 200
    data = response.json()
    assert len(data["stocks"]) == 3
    symbols = [s["symbol"] for s in data["stocks"]]
    assert "005930" in symbols
    assert "247540" in symbols
    assert "068270" in symbols
```

#### TC-05-005: Domestic API 개별 종목 필터

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-05-005 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/stocks/domestic?symbols=005930` |
| 기대 결과 | HTTP 200, 삼성전자 1개 종목만 반환 |

```python
async def test_domestic_stocks_filter(client, mock_yahoo):
    response = await client.get("/api/v1/stocks/domestic?symbols=005930")
    assert response.status_code == 200
    data = response.json()
    assert len(data["stocks"]) == 1
    assert data["stocks"][0]["symbol"] == "005930"
```

#### TC-05-006: Yahoo Finance Connector Mock 테스트

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-05-006 |
| 구분 | Unit (Backend) |
| 입력 | Connector에 mock 데이터 주입 |
| 기대 결과 | StockQuote 객체 정상 반환 |

```python
async def test_yahoo_connector(mock_yahoo):
    connector = YahooFinanceConnector()
    quotes = await connector.get_quotes(["005930"])
    assert len(quotes) == 1
    assert quotes[0].symbol == "005930"
    assert quotes[0].price > 0
```

### 3.2 Frontend 테스트

#### TC-05-001: 삼성전자 StockCard 렌더링

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-05-001 |
| 구분 | Unit (Frontend) |
| 기대 결과 | 삼성전자 종목명, 가격, 등락 정보 표시 |

```typescript
test('renders Samsung stock card', async () => {
  render(<DomesticStockWidget />);
  await waitFor(() => {
    expect(screen.getByText('삼성전자')).toBeInTheDocument();
    expect(screen.getByText('005930')).toBeInTheDocument();
  });
});
```

#### TC-05-002: 에코프로 StockCard 렌더링

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-05-002 |
| 구분 | Unit (Frontend) |
| 기대 결과 | 에코프로 종목명 표시 |

#### TC-05-003: 셀트리온 StockCard 렌더링

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-05-003 |
| 구분 | Unit (Frontend) |
| 기대 결과 | 셀트리온 종목명 표시 |

#### TC-05-007: 자동 갱신 동작

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-05-007 |
| 구분 | Unit (Frontend) |
| 기대 결과 | 30초 후 API 재호출 |

```typescript
test('auto-refreshes data', async () => {
  jest.useFakeTimers();
  render(<DomesticStockWidget refreshInterval={30000} />);
  jest.advanceTimersByTime(30000);
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  jest.useRealTimers();
});
```

## 4. 테스트 실행 방법

```bash
# Backend 테스트
cd backend && pytest tests/test_domestic_stocks.py -v

# Frontend 테스트
cd frontend && npm test -- --testPathPattern=DomesticStockWidget
```
