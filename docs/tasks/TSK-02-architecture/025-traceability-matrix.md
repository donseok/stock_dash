# TSK-02: 추적성 매트릭스

## 요구사항 → 아키텍처 → 구현 매핑

| PRD ID | 요구사항 | 아키텍처 컴포넌트 | 구현 |
|--------|---------|-----------------|------|
| FR-001 | 웹 대시보드 | Presentation Layer | Next.js App |
| FR-002 | 실시간 차트 | Lightweight Charts | StockChartWidget |
| FR-003 | 국내주식 | Yahoo Finance Connector | connectors/stock.py |
| FR-004 | 해외주식 | Yahoo Finance Connector | connectors/stock.py |
| FR-005 | 암호화폐 | Upbit Connector | connectors/upbit.py |
| FR-006 | 금/은 시세 | metals.live Connector | connectors/metals.py |
| FR-007 | 환율 | er-api Connector | connectors/exchange_rate.py |
| FR-008 | 국내지수 | Yahoo Finance Connector | connectors/market_index.py |
| FR-009 | 해외지수 | Yahoo Finance Connector | connectors/market_index.py |
| FR-010 | 뉴스 | NewsAPI Connector | connectors/news.py |
| FR-011 | 종목정보 | Stock API | api/v1/stocks.py |
| FR-012 | 종목교체 | TickerSelector (계획) | StockChartWidget symbols |
| NFR-001 | 갱신 5초 | TanStack Query stale | hooks/useMarketData.ts |
| NFR-002 | 로딩 3초 | SSG + Splitting | next.config.mjs |
| NFR-003 | 가용성 | Fallback Pattern | connectors/*.py |
| NFR-004 | UI/UX | Tailwind + Components | components/ |
