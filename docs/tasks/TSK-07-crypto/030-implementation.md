# TSK-07 암호화폐 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-07 |
| 관련 요구사항 | FR-005 (Cryptocurrencies) |
| 구현 상태 | 완료 |
| Backend 테스트 | 4/4 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `backend/app/routers/crypto.py` | 암호화폐 API 라우터 | ~45 |
| `backend/app/services/crypto_service.py` | 암호화폐 서비스 | ~75 |
| `backend/app/connectors/upbit.py` | Upbit API 커넥터 | ~90 |
| `backend/app/schemas/crypto.py` | 암호화폐 응답 스키마 | ~35 |
| `backend/tests/test_crypto.py` | 암호화폐 API 테스트 | ~65 |

### 2.2 Frontend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/widgets/CryptoWidget.tsx` | 암호화폐 위젯 | ~100 |
| `frontend/src/components/widgets/CryptoCard.tsx` | 개별 코인 카드 | ~60 |
| `frontend/src/hooks/useCryptoQuotes.ts` | 암호화폐 데이터 hook | ~45 |

## 3. 핵심 구현 내용

### 3.1 Backend - Upbit Connector

```python
# connectors/upbit.py
class UpbitConnector:
    BASE_URL = "https://api.upbit.com/v1"
    MARKETS = [
        "KRW-BTC", "KRW-ETH", "KRW-SOL", "KRW-XRP",
        "KRW-LINK", "KRW-SUI", "KRW-ONDO"
    ]

    async def get_ticker(self, markets: list[str] = None) -> list[dict]:
        target = markets or self.MARKETS
        params = {"markets": ",".join(target)}
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/ticker",
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()

    def _to_quote(self, ticker: dict) -> dict:
        market = ticker["market"]
        symbol = market.replace("KRW-", "")
        return {
            "symbol": symbol,
            "market": market,
            "price": ticker["trade_price"],
            "change": ticker["signed_change_price"],
            "change_percent": ticker["signed_change_rate"] * 100,
            "volume_24h": ticker["acc_trade_price_24h"],
            "high_24h": ticker["high_price"],
            "low_24h": ticker["low_price"],
        }
```

### 3.2 Backend - Crypto API

```python
# routers/crypto.py
@router.get("/crypto/quotes")
async def get_crypto_quotes(
    symbols: Optional[str] = Query(default=None)
):
    """암호화폐 시세 조회"""
    service = CryptoService()
    symbol_list = symbols.split(",") if symbols else None
    quotes = await service.get_quotes(symbol_list)
    return {"quotes": quotes, "count": len(quotes)}
```

### 3.3 Frontend - CryptoWidget

```typescript
// components/widgets/CryptoWidget.tsx
export const CryptoWidget: React.FC<CryptoWidgetProps> = ({
  refreshInterval = 10000,
  onCryptoClick
}) => {
  const { quotes, loading, refresh } = useCryptoQuotes(refreshInterval);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <WidgetHeader title="암호화폐" onRefresh={refresh} />
      <div className="space-y-2">
        {quotes.map(quote => (
          <CryptoCard
            key={quote.symbol}
            data-testid="crypto-card"
            quote={quote}
            onClick={() => onCryptoClick?.(quote.symbol)}
          />
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-3">
        24시간 거래 중
      </div>
    </div>
  );
};
```

## 4. API 명세

### GET `/api/v1/crypto/quotes`

**Request:**
```
GET /api/v1/crypto/quotes
GET /api/v1/crypto/quotes?symbols=BTC,ETH
```

**Response (200):**
```json
{
  "quotes": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "market": "KRW-BTC",
      "price": 145230000,
      "change": 2350000,
      "change_percent": 1.64,
      "volume_24h": 125678901234,
      "high_24h": 146500000,
      "low_24h": 142800000,
      "currency": "KRW",
      "updated_at": "2026-02-02T10:30:00Z"
    }
  ],
  "count": 7
}
```

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 데이터 소스 | Upbit API | 국내 KRW 마켓 지원, 무료, 안정적 |
| 갱신 주기 | 10초 | 암호화폐 24/7 거래, 높은 변동성 |
| 가격 통화 | KRW | Upbit KRW 마켓 기준 |
| Rate Limit 대응 | 10초 polling | Upbit 초당 10회 제한 준수 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend | 4 | 4 | 0 | 100% |
| Frontend | 4 | 4 | 0 | 100% |
| **합계** | **8** | **8** | **0** | **100%** |
