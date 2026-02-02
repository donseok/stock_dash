# TSK-07 암호화폐 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-07 |
| 태스크명 | Crypto (암호화폐) |
| 관련 요구사항 | FR-005 (Cryptocurrencies) |
| 우선순위 | 높음 |
| 상태 | 완료 |

## 2. 목적

주요 암호화폐(BTC, ETH, SOL, XRP, LINK, SUI, ONDO)의 실시간 시세를 대시보드 위젯으로 제공한다. Upbit API를 데이터 소스로 활용하여 KRW 기준 가격을 표시한다.

## 3. 대상 암호화폐

| 암호화폐 | 심볼 | Upbit 마켓 코드 | 설명 |
|----------|------|-----------------|------|
| Bitcoin | BTC | KRW-BTC | 비트코인 |
| Ethereum | ETH | KRW-ETH | 이더리움 |
| Solana | SOL | KRW-SOL | 솔라나 |
| Ripple | XRP | KRW-XRP | 리플 |
| Chainlink | LINK | KRW-LINK | 체인링크 |
| Sui | SUI | KRW-SUI | 수이 |
| Ondo | ONDO | KRW-ONDO | 온도 |

## 4. 아키텍처

### 4.1 시스템 구성도

```
[Frontend]                          [Backend]
CryptoWidget.tsx     ──HTTP──>   /api/v1/crypto/quotes
  ├─ CryptoCard (BTC)                │
  ├─ CryptoCard (ETH)                ├─ CryptoService
  ├─ CryptoCard (SOL)                ├─ Upbit Connector
  ├─ CryptoCard (XRP)                │   (connectors/upbit.py)
  ├─ CryptoCard (LINK)               └─ Cache Layer
  ├─ CryptoCard (SUI)
  └─ CryptoCard (ONDO)
```

### 4.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/crypto/quotes` | 암호화폐 시세 조회 |

#### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| symbols | string | (전체) | 콤마 구분 심볼 필터 |

#### Response Schema

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

#### Upbit Connector

```python
# connectors/upbit.py
class UpbitConnector:
    BASE_URL = "https://api.upbit.com/v1"
    MARKETS = [
        "KRW-BTC", "KRW-ETH", "KRW-SOL", "KRW-XRP",
        "KRW-LINK", "KRW-SUI", "KRW-ONDO"
    ]

    async def get_ticker(self, markets: list[str] = None) -> list[dict]:
        """Upbit ticker API 호출"""
        target = markets or self.MARKETS
        params = {"markets": ",".join(target)}
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.BASE_URL}/ticker", params=params)
            return response.json()
```

### 4.3 Frontend 설계

#### 컴포넌트 구조

```
CryptoWidget
├── WidgetHeader ("암호화폐")
├── CryptoCard (BTC)
│   ├── CoinIcon + Name
│   ├── CurrentPrice (KRW)
│   ├── ChangeInfo (24h 변동)
│   └── Volume24h
├── CryptoCard (ETH)
├── CryptoCard (SOL)
├── CryptoCard (XRP)
├── CryptoCard (LINK)
├── CryptoCard (SUI)
└── CryptoCard (ONDO)
```

#### 주요 Props

```typescript
interface CryptoWidgetProps {
  symbols?: string[];
  refreshInterval?: number;  // ms, default: 10000
  onCryptoClick?: (symbol: string) => void;
}
```

## 5. 데이터 흐름

1. CryptoWidget 마운트 시 `/api/v1/crypto/quotes` 호출
2. Backend에서 Upbit API로 7개 암호화폐 시세 일괄 조회
3. Upbit 응답을 표준 형식으로 변환하여 반환
4. CryptoCard에 매핑하여 렌더링
5. 10초 간격 자동 갱신 (암호화폐는 24/7 거래)

## 6. Upbit API 제한 사항

| 항목 | 값 |
|------|-----|
| Rate Limit | 초당 10회 / 분당 600회 |
| 인증 | 시세 조회는 인증 불필요 |
| 데이터 지연 | 실시간 (WebSocket 미사용 시 polling) |

## 7. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| Upbit API 장애 | 503 | 캐시 데이터 반환 |
| Rate Limit 초과 | 429 | 재시도 (exponential backoff) |
| 상장 폐지 종목 | 200 | 해당 종목 제외, 나머지 반환 |
