# TSK-09 환율 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-09 |
| 테스트 대상 | ExchangeRateWidget, Exchange Rate API, ER-API Connector |
| 관련 요구사항 | FR-007 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient) |
| Frontend 테스트 | Jest, React Testing Library |
| Mock | unittest.mock (BE), MSW (FE) |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-09-004: Exchange Rate API 정상 조회

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-09-004 |
| 구분 | Unit (Backend) |
| 사전 조건 | ER-API mock 설정 |
| 입력 | `GET /api/v1/exchange/rates` |
| 기대 결과 | HTTP 200, USD/KRW 환율 반환 |

```python
async def test_exchange_rate(client, mock_er_api):
    response = await client.get("/api/v1/exchange/rates")
    assert response.status_code == 200
    data = response.json()
    assert data["base"] == "USD"
    assert data["target"] == "KRW"
    assert data["rate"] > 0
    assert isinstance(data["rate"], (int, float))
```

#### TC-09-005: ER-API Connector Mock 테스트

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-09-005 |
| 구분 | Unit (Backend) |
| 입력 | ER-API mock 응답 |
| 기대 결과 | 정상 파싱, 환율 데이터 반환 |

```python
async def test_er_api_connector(mock_er_api_response):
    connector = ExchangeRateConnector()
    result = await connector.get_rate("USD", "KRW")
    assert result["base"] == "USD"
    assert result["target"] == "KRW"
    assert result["rate"] > 1000  # KRW는 1000 이상
```

#### TC-09-006: ER-API Connector 에러 처리

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-09-006 |
| 구분 | Unit (Backend) |
| 입력 | ER-API 장애 시뮬레이션 |
| 기대 결과 | 캐시 데이터 반환 또는 503 |

```python
async def test_er_api_connector_error(mock_er_api_error):
    connector = ExchangeRateConnector()
    # 캐시가 있으면 캐시 반환
    result = await connector.get_rate("USD", "KRW")
    assert result is not None or pytest.raises(ServiceUnavailableError)
```

### 3.2 Frontend 테스트

#### TC-09-001: USD/KRW 환율 렌더링

```typescript
test('renders USD/KRW exchange rate', async () => {
  render(<ExchangeRateWidget />);
  await waitFor(() => {
    expect(screen.getByText('USD / KRW')).toBeInTheDocument();
    expect(screen.getByText(/1,318/)).toBeInTheDocument();
  });
});
```

#### TC-09-002: 등락 정보 표시

```typescript
test('displays change information', async () => {
  render(<ExchangeRateWidget />);
  await waitFor(() => {
    expect(screen.getByText(/\+.*0\.17%/)).toBeInTheDocument();
  });
});
```

#### TC-09-003: 고가/저가 표시

```typescript
test('displays high and low values', async () => {
  render(<ExchangeRateWidget />);
  await waitFor(() => {
    expect(screen.getByText(/고가/)).toBeInTheDocument();
    expect(screen.getByText(/저가/)).toBeInTheDocument();
  });
});
```

## 4. 테스트 실행 방법

```bash
# Backend 테스트
cd backend && pytest tests/test_exchange_rate.py -v

# Frontend 테스트
cd frontend && npm test -- --testPathPattern=ExchangeRateWidget
```
