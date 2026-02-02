# TSK-04 주식 차트 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-04 |
| 관련 요구사항 | FR-002 (Real-time stock charts) |
| 구현 상태 | 완료 |
| Backend 테스트 | 4/4 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `backend/app/routers/stocks.py` | 주식 차트 API 라우터 | ~80 |
| `backend/app/services/chart_service.py` | 차트 데이터 조회/가공 서비스 | ~120 |
| `backend/app/schemas/chart.py` | 차트 응답 스키마 (Pydantic) | ~45 |
| `backend/tests/test_chart.py` | 차트 API 테스트 | ~60 |

### 2.2 Frontend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/charts/StockChartWidget.tsx` | 메인 차트 위젯 | ~180 |
| `frontend/src/components/charts/PeriodSelector.tsx` | 기간 선택 컴포넌트 | ~45 |
| `frontend/src/types/chart.ts` | 차트 타입 정의 | ~30 |
| `frontend/src/hooks/useChartData.ts` | 차트 데이터 fetching hook | ~50 |

## 3. 핵심 구현 내용

### 3.1 Backend - Chart API

```python
# routers/stocks.py
@router.get("/stocks/{symbol}/chart")
async def get_stock_chart(
    symbol: str,
    period: str = Query(default="1M", regex="^(1D|1W|1M|3M|6M|1Y|5Y)$"),
    interval: Optional[str] = None,
    chart_type: str = Query(default="candlestick")
):
    """주식 차트 데이터 조회 엔드포인트"""
    service = ChartService()
    data = await service.get_chart_data(symbol, period, interval)
    return ChartResponse(
        symbol=symbol,
        period=period,
        data=data
    )
```

### 3.2 Backend - ChartService

```python
# services/chart_service.py
class ChartService:
    PERIOD_INTERVAL_MAP = {
        "1D": "1m", "1W": "5m", "1M": "1d",
        "3M": "1d", "6M": "1d", "1Y": "1wk", "5Y": "1wk"
    }

    async def get_chart_data(self, symbol, period, interval=None):
        if interval is None:
            interval = self.PERIOD_INTERVAL_MAP.get(period, "1d")
        # Yahoo Finance에서 데이터 조회
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=self._convert_period(period), interval=interval)
        return self._format_ohlcv(df)
```

### 3.3 Frontend - StockChartWidget

```typescript
// components/charts/StockChartWidget.tsx
export const StockChartWidget: React.FC<StockChartWidgetProps> = ({
  symbol,
  chartType = 'candlestick',
  defaultPeriod = '1M',
  onSymbolChange
}) => {
  const [period, setPeriod] = useState(defaultPeriod);
  const { data, loading, error } = useChartData(symbol, period);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;
    const chart = createChart(chartRef.current, chartOptions);

    if (chartType === 'candlestick') {
      const series = chart.addCandlestickSeries(candlestickOptions);
      series.setData(data);
    } else {
      const series = chart.addLineSeries(lineOptions);
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
    }

    return () => chart.remove();
  }, [data, chartType]);

  return (
    <div className="stock-chart-widget">
      <ChartHeader symbol={symbol} onSymbolChange={onSymbolChange} />
      <div ref={chartRef} data-testid="chart-canvas" />
      <PeriodSelector selected={period} onSelect={setPeriod} />
    </div>
  );
};
```

## 4. API 명세

### GET `/api/v1/stocks/{symbol}/chart`

**Request:**
```
GET /api/v1/stocks/005930/chart?period=1M&chart_type=candlestick
```

**Response (200):**
```json
{
  "symbol": "005930",
  "name": "삼성전자",
  "period": "1M",
  "interval": "1d",
  "data": [
    {
      "timestamp": "2026-01-02T00:00:00Z",
      "open": 78000,
      "high": 79500,
      "low": 77500,
      "close": 79000,
      "volume": 15234567
    }
  ],
  "metadata": {
    "currency": "KRW",
    "exchange": "KRX",
    "total_count": 22
  }
}
```

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 차트 라이브러리 | TradingView Lightweight Charts | 경량, 성능 우수, 커스터마이징 용이 |
| 기간-interval 매핑 | 자동 매핑 | 사용자 편의성 (기간만 선택하면 됨) |
| 캐시 전략 | In-memory (TTL 기반) | 단순 구조, 외부 의존성 최소화 |
| 색상 규칙 | 한국식 (상승=빨강, 하락=파랑) | 국내 사용자 대상 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend | 4 | 4 | 0 | 100% |
| Frontend | 4 | 4 | 0 | 100% |
| **합계** | **8** | **8** | **0** | **100%** |
