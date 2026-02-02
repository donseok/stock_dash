# TSK-04 주식 차트 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-04 |
| 테스트 대상 | StockChartWidget, Chart API |
| 관련 요구사항 | FR-002 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient) |
| Frontend 테스트 | Jest, React Testing Library |
| E2E 테스트 | Playwright |
| Mock | unittest.mock (BE), MSW (FE) |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-04-005: Chart API 정상 응답

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-04-005 |
| 구분 | Unit (Backend) |
| 사전 조건 | 서버 실행 상태 |
| 입력 | `GET /api/v1/stocks/005930/chart?period=1M` |
| 기대 결과 | HTTP 200, OHLCV 데이터 배열 반환 |
| 검증 항목 | status_code == 200, `data` 배열 존재, 각 항목에 open/high/low/close/volume 포함 |

```python
async def test_chart_api_success(client):
    response = await client.get("/api/v1/stocks/005930/chart?period=1M")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) > 0
    item = data["data"][0]
    assert all(k in item for k in ["open", "high", "low", "close", "volume"])
```

#### TC-04-006: Chart API 잘못된 심볼

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-04-006 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/stocks/INVALID/chart` |
| 기대 결과 | HTTP 404, 에러 메시지 반환 |

```python
async def test_chart_api_invalid_symbol(client):
    response = await client.get("/api/v1/stocks/INVALID/chart")
    assert response.status_code == 404
```

#### TC-04-007: Chart API 기간 파라미터 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-04-007 |
| 구분 | Unit (Backend) |
| 입력 | `GET /api/v1/stocks/005930/chart?period=1D`, `?period=1Y` |
| 기대 결과 | 각 기간에 맞는 데이터 반환, interval 자동 설정 |

```python
@pytest.mark.parametrize("period,expected_interval", [
    ("1D", "1m"), ("1W", "5m"), ("1M", "1d"), ("1Y", "1wk")
])
async def test_chart_period_parameter(client, period, expected_interval):
    response = await client.get(f"/api/v1/stocks/005930/chart?period={period}")
    assert response.status_code == 200
```

#### TC-04-008: Chart API 캐시 동작

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-04-008 |
| 구분 | Integration |
| 입력 | 동일 요청 2회 연속 호출 |
| 기대 결과 | 두 번째 호출은 캐시에서 반환, 응답 동일 |

### 3.2 Frontend 테스트

#### TC-04-001: 캔들스틱 차트 렌더링

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-04-001 |
| 구분 | Unit (Frontend) |
| 사전 조건 | Mock 차트 데이터 준비 |
| 기대 결과 | 캔들스틱 차트 캔버스 렌더링 |

```typescript
test('renders candlestick chart', async () => {
  render(<StockChartWidget symbol="005930" chartType="candlestick" />);
  await waitFor(() => {
    expect(screen.getByTestId('chart-canvas')).toBeInTheDocument();
  });
});
```

#### TC-04-002: 라인 차트 렌더링

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-04-002 |
| 구분 | Unit (Frontend) |
| 기대 결과 | 라인 차트 캔버스 렌더링 |

#### TC-04-003: 기간 선택 동작

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-04-003 |
| 구분 | Unit (Frontend) |
| 기대 결과 | 기간 버튼 클릭 시 API 재호출, 차트 갱신 |

```typescript
test('period selector triggers data reload', async () => {
  render(<StockChartWidget symbol="005930" />);
  const btn = screen.getByText('1Y');
  fireEvent.click(btn);
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('period=1Y')
    );
  });
});
```

#### TC-04-004: 심볼 전환 동작

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-04-004 |
| 구분 | Unit (Frontend) |
| 기대 결과 | 종목 변경 시 새 데이터 로드, onSymbolChange 콜백 호출 |

## 4. 테스트 실행 방법

```bash
# Backend 테스트
cd backend && pytest tests/test_chart.py -v

# Frontend 테스트
cd frontend && npm test -- --testPathPattern=StockChartWidget

# E2E 테스트
cd frontend && npx playwright test chart.spec.ts
```
