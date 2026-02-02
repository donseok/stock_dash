# TSK-12: 위젯 프레임워크 - 설계문서

## 1. 개요

대시보드 위젯을 관리하는 프레임워크 구조를 설계한다. 각 데이터 모듈(주식, 암호화폐, 귀금속, 환율, 지수, 뉴스)을 독립적인 위젯으로 구현한다.

## 2. 위젯 구조

### 위젯 타입

| 위젯 | 컴포넌트 | 데이터 소스 |
|------|---------|-----------|
| stock-chart | StockChartWidget | /api/v1/stocks/{symbol}/chart |
| domestic-stock | DomesticStockWidget | /api/v1/stocks/domestic |
| foreign-stock | ForeignStockWidget | /api/v1/stocks/foreign |
| crypto-price | CryptoWidget | /api/v1/crypto/quotes |
| precious-metal | PreciousMetalWidget | /api/v1/metals/quotes |
| exchange-rate | ExchangeRateWidget | /api/v1/exchange/rates |
| market-index | MarketIndicesBar | /api/v1/indices/quotes |
| news-feed | NewsWidget | /api/v1/news |

### 공통 위젯 패턴

```tsx
<Card title="위젯 제목" headerRight={<설정 UI>}>
  {isLoading && <LoadingSpinner />}
  {error && <ErrorMessage onRetry={refetch} />}
  {data && <위젯 콘텐츠 />}
</Card>
```

## 3. 데이터 패칭 전략

- TanStack Query 기반 자동 데이터 갱신
- staleTime: 5초
- refetchInterval: 10초
- retry: 2회
- 각 위젯이 독립적으로 데이터 관리

## 4. 종목 교체 구조 (FR-012)

현재 StockChartWidget에서 종목 선택 버튼으로 구현:
- 삼성전자 (005930)
- LG에너지솔루션 (373220)
- 셀트리온 (068270)

향후 확장: Context/Provider 기반 전역 종목 상태 관리

## 5. PRD 매핑

| FR | 위젯 |
|----|------|
| FR-002 | StockChartWidget |
| FR-003 | DomesticStockWidget |
| FR-004 | ForeignStockWidget |
| FR-005 | CryptoWidget |
| FR-006 | PreciousMetalWidget |
| FR-007 | ExchangeRateWidget |
| FR-008/009 | MarketIndicesBar |
| FR-010 | NewsWidget |
| FR-012 | StockChartWidget (종목 교체) |
