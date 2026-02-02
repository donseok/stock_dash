# TSK-07 암호화폐 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-07 |
| 테스트 대상 | CryptoWidget, Crypto API, Upbit Connector |
| 관련 요구사항 | FR-005 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient) |
| Frontend 테스트 | Jest, React Testing Library |
| Mock | unittest.mock (BE), MSW (FE) |
| Upbit API Mock | httpx mock / responses 라이브러리 |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-07-004: Crypto API 전체 조회

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-07-004 |
| 구분 | Unit (Backend) |
| 사전 조건 | Upbit API mock 설정 |
| 입력 | `GET /api/v1/crypto/quotes` |
| 기대 결과 | HTTP 200, 7개 암호화폐 시세 반환 |

```python
async def test_crypto_quotes_all(client, mock_upbit):
    response = await client.get("/api/v1/crypto/quotes")
    assert response.status_code == 200
    data = response.json()
    assert len(data["quotes"]) == 7
    symbols = [q["symbol"] for q in data["quotes"]]
    assert "BTC" in symbols
    assert "ETH" in symbols
    assert "SOL" in symbols
    assert "ONDO" in symbols
```

#### TC-07-005: Crypto API 심볼 필터

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-07-005 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/crypto/quotes?symbols=BTC,ETH` |
| 기대 결과 | HTTP 200, BTC/ETH 2개만 반환 |

```python
async def test_crypto_quotes_filter(client, mock_upbit):
    response = await client.get("/api/v1/crypto/quotes?symbols=BTC,ETH")
    assert response.status_code == 200
    data = response.json()
    assert len(data["quotes"]) == 2
```

#### TC-07-006: Upbit Connector Mock 테스트

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-07-006 |
| 구분 | Unit (Backend) |
| 입력 | Upbit API mock 응답 |
| 기대 결과 | 정상 파싱, CryptoQuote 반환 |

```python
async def test_upbit_connector(mock_upbit_response):
    connector = UpbitConnector()
    tickers = await connector.get_ticker(["KRW-BTC"])
    assert len(tickers) == 1
    assert tickers[0]["market"] == "KRW-BTC"
    assert tickers[0]["trade_price"] > 0
```

#### TC-07-007: Upbit Connector 에러 처리

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-07-007 |
| 구분 | Unit (Backend) |
| 입력 | Upbit API 500 에러 시뮬레이션 |
| 기대 결과 | 캐시 데이터 반환 또는 ServiceUnavailable |

### 3.2 Frontend 테스트

#### TC-07-001: BTC CryptoCard 렌더링

```typescript
test('renders BTC crypto card', async () => {
  render(<CryptoWidget />);
  await waitFor(() => {
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
  });
});
```

#### TC-07-002: ETH CryptoCard 렌더링

```typescript
test('renders ETH crypto card', async () => {
  render(<CryptoWidget />);
  await waitFor(() => {
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
  });
});
```

#### TC-07-003: 전체 코인 리스트 렌더링

```typescript
test('renders all 7 crypto cards', async () => {
  render(<CryptoWidget />);
  await waitFor(() => {
    const cards = screen.getAllByTestId('crypto-card');
    expect(cards).toHaveLength(7);
  });
});
```

#### TC-07-008: 자동 갱신 동작

```typescript
test('auto-refreshes every 10 seconds', async () => {
  jest.useFakeTimers();
  render(<CryptoWidget refreshInterval={10000} />);
  jest.advanceTimersByTime(10000);
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  jest.useRealTimers();
});
```

## 4. 테스트 실행 방법

```bash
# Backend 테스트
cd backend && pytest tests/test_crypto.py -v

# Frontend 테스트
cd frontend && npm test -- --testPathPattern=CryptoWidget
```
