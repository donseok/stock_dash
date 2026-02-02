# TSK-08 귀금속 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-08 |
| 테스트 대상 | PreciousMetalWidget, Metals API, Metals Connector |
| 관련 요구사항 | FR-006 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient) |
| Frontend 테스트 | Jest, React Testing Library |
| Mock | unittest.mock (BE), MSW (FE) |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-08-004: Metals API 정상 조회

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-08-004 |
| 구분 | Unit (Backend) |
| 사전 조건 | metals.live API mock 설정 |
| 입력 | `GET /api/v1/metals/quotes` |
| 기대 결과 | HTTP 200, Gold/Silver 시세 반환 |

```python
async def test_metals_quotes(client, mock_metals):
    response = await client.get("/api/v1/metals/quotes")
    assert response.status_code == 200
    data = response.json()
    assert len(data["metals"]) == 2
    symbols = [m["symbol"] for m in data["metals"]]
    assert "XAU" in symbols
    assert "XAG" in symbols
    gold = next(m for m in data["metals"] if m["symbol"] == "XAU")
    assert gold["price_usd"] > 0
```

#### TC-08-005: Metals Connector Mock 테스트

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-08-005 |
| 구분 | Unit (Backend) |
| 입력 | metals.live mock 응답 |
| 기대 결과 | 정상 파싱, 가격 데이터 반환 |

```python
async def test_metals_connector(mock_metals_api):
    connector = MetalsConnector()
    prices = await connector.get_spot_prices()
    assert len(prices) == 2
    assert prices[0]["symbol"] in ["XAU", "XAG"]
    assert prices[0]["price"] > 0
```

#### TC-08-006: Metals Connector 에러 처리

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-08-006 |
| 구분 | Unit (Backend) |
| 입력 | metals.live API 장애 시뮬레이션 |
| 기대 결과 | 캐시 반환 또는 503 |

```python
async def test_metals_connector_error(mock_metals_error):
    connector = MetalsConnector()
    with pytest.raises(ServiceUnavailableError):
        await connector.get_spot_prices()
```

### 3.2 Frontend 테스트

#### TC-08-001: Gold MetalCard 렌더링

```typescript
test('renders Gold metal card', async () => {
  render(<PreciousMetalWidget />);
  await waitFor(() => {
    expect(screen.getByText('Gold')).toBeInTheDocument();
    expect(screen.getByText('Au')).toBeInTheDocument();
  });
});
```

#### TC-08-002: Silver MetalCard 렌더링

```typescript
test('renders Silver metal card', async () => {
  render(<PreciousMetalWidget />);
  await waitFor(() => {
    expect(screen.getByText('Silver')).toBeInTheDocument();
    expect(screen.getByText('Ag')).toBeInTheDocument();
  });
});
```

#### TC-08-003: KRW 환산가 표시

```typescript
test('displays KRW converted price', async () => {
  render(<PreciousMetalWidget showKRW={true} />);
  await waitFor(() => {
    expect(screen.getByText(/₩/)).toBeInTheDocument();
  });
});
```

## 4. 테스트 실행 방법

```bash
# Backend 테스트
cd backend && pytest tests/test_metals.py -v

# Frontend 테스트
cd frontend && npm test -- --testPathPattern=PreciousMetalWidget
```
