# TSK-05 국내 주식 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-05 |
| 관련 요구사항 | FR-003 (Domestic stocks) |
| 구현 상태 | 완료 |
| Backend 테스트 | 3/3 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `backend/app/routers/stocks.py` | 국내 주식 API 라우터 | ~60 |
| `backend/app/services/domestic_stock_service.py` | 국내 주식 시세 서비스 | ~80 |
| `backend/app/connectors/yahoo_finance.py` | Yahoo Finance 데이터 커넥터 | ~100 |
| `backend/app/schemas/stock.py` | 주식 시세 응답 스키마 | ~40 |
| `backend/tests/test_domestic_stocks.py` | 국내 주식 API 테스트 | ~55 |

### 2.2 Frontend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/widgets/DomesticStockWidget.tsx` | 국내 주식 위젯 | ~120 |
| `frontend/src/components/widgets/StockCard.tsx` | 종목 카드 컴포넌트 | ~65 |
| `frontend/src/hooks/useDomesticStocks.ts` | 국내 주식 데이터 hook | ~45 |
| `frontend/src/utils/formatPrice.ts` | 가격 포맷팅 유틸 | ~20 |

## 3. 핵심 구현 내용

### 3.1 Backend - Domestic Stock API

```python
# routers/stocks.py
@router.get("/stocks/domestic")
async def get_domestic_stocks(
    symbols: Optional[str] = Query(default=None)
):
    """국내 주식 시세 조회 엔드포인트"""
    service = DomesticStockService()
    symbol_list = symbols.split(",") if symbols else None
    stocks = await service.get_quotes(symbol_list)
    return {"stocks": stocks, "count": len(stocks)}
```

### 3.2 Backend - Yahoo Finance Connector

```python
# connectors/yahoo_finance.py
class YahooFinanceConnector:
    DOMESTIC_SYMBOLS = {
        "005930": {"yahoo": "005930.KS", "name": "삼성전자", "market": "KOSPI"},
        "247540": {"yahoo": "247540.KQ", "name": "에코프로", "market": "KOSDAQ"},
        "068270": {"yahoo": "068270.KS", "name": "셀트리온", "market": "KOSPI"},
    }

    async def get_quotes(self, symbols: list[str] = None) -> list[dict]:
        target = symbols or list(self.DOMESTIC_SYMBOLS.keys())
        yahoo_syms = [self.DOMESTIC_SYMBOLS[s]["yahoo"] for s in target]
        tickers = yf.Tickers(" ".join(yahoo_syms))
        results = []
        for sym in target:
            info = tickers.tickers[self.DOMESTIC_SYMBOLS[sym]["yahoo"]].info
            results.append(self._to_quote(sym, info))
        return results
```

### 3.3 Frontend - DomesticStockWidget

```typescript
// components/widgets/DomesticStockWidget.tsx
export const DomesticStockWidget: React.FC<DomesticStockWidgetProps> = ({
  refreshInterval = 30000,
  onStockClick
}) => {
  const { stocks, loading, error, refresh } = useDomesticStocks(refreshInterval);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">국내 주식</h3>
        <button onClick={refresh} aria-label="새로고침">
          <RefreshIcon />
        </button>
      </div>
      {loading && <SkeletonCards count={3} />}
      {stocks.map(stock => (
        <StockCard
          key={stock.symbol}
          stock={stock}
          onClick={() => onStockClick?.(stock.symbol)}
        />
      ))}
    </div>
  );
};
```

## 4. API 명세

### GET `/api/v1/stocks/domestic`

**Request:**
```
GET /api/v1/stocks/domestic
GET /api/v1/stocks/domestic?symbols=005930,068270
```

**Response (200):**
```json
{
  "stocks": [
    {
      "symbol": "005930",
      "name": "삼성전자",
      "price": 79000,
      "change": 1200,
      "change_percent": 1.54,
      "volume": 15234567,
      "market_cap": 471234567890000,
      "high": 79500,
      "low": 77500,
      "open": 78000,
      "prev_close": 77800,
      "currency": "KRW",
      "exchange": "KRX",
      "updated_at": "2026-02-02T09:30:00Z"
    }
  ],
  "count": 3
}
```

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 데이터 소스 | Yahoo Finance (yfinance) | 무료, 한국 종목 지원 (.KS/.KQ 접미사) |
| 갱신 주기 | 30초 | 실시간성과 API 부하 균형 |
| 종목 하드코딩 | DOMESTIC_SYMBOLS dict | PRD에 명시된 3개 종목 고정 |
| 색상 규칙 | 한국식 (상승=빨강/하락=파랑) | 국내 사용자 관습 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend | 3 | 3 | 0 | 100% |
| Frontend | 4 | 4 | 0 | 100% |
| **합계** | **7** | **7** | **0** | **100%** |
