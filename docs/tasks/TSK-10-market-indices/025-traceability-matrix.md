# TSK-10 시장 지수 추적성 매트릭스

## 1. 개요

본 문서는 TSK-10 (Market Indices) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-008 | Domestic indices (KOSPI, KOSDAQ) | MarketIndicesBar 설계 | `components/widgets/MarketIndicesBar.tsx` | TC-10-001 ~ TC-10-003 | 완료 |
| FR-008.1 | KOSPI 지수 표시 | IndexBadge 설계 | `MarketIndicesBar.tsx` | TC-10-001 | 완료 |
| FR-008.2 | KOSDAQ 지수 표시 | IndexBadge 설계 | `MarketIndicesBar.tsx` | TC-10-002 | 완료 |
| FR-009 | Foreign indices (DOW, NASDAQ) | MarketIndicesBar 설계 | `components/widgets/MarketIndicesBar.tsx` | TC-10-003 ~ TC-10-005 | 완료 |
| FR-009.1 | DOW 지수 표시 | IndexBadge 설계 | `MarketIndicesBar.tsx` | TC-10-003 | 완료 |
| FR-009.2 | NASDAQ 지수 표시 | IndexBadge 설계 | `MarketIndicesBar.tsx` | TC-10-004 | 완료 |
| FR-008/009.3 | 지수 API + Connector | `/api/v1/indices/quotes` | `connectors/market_index.py` | TC-10-005 ~ TC-10-008 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| MarketIndicesBar | `frontend/src/components/widgets/MarketIndicesBar.tsx` | 지수 인디케이터 바 |
| IndexBadge | `frontend/src/components/widgets/IndexBadge.tsx` | 개별 지수 배지 |
| MarketIndexService | `backend/app/services/market_index_service.py` | 시장 지수 서비스 |
| MarketIndexConnector | `backend/app/connectors/market_index.py` | 지수 데이터 커넥터 |
| Indices Router | `backend/app/routers/indices.py` | API 라우터 (TSK-06과 공유) |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-10-001 | Unit (FE) | KOSPI IndexBadge 렌더링 | FR-008.1 |
| TC-10-002 | Unit (FE) | KOSDAQ IndexBadge 렌더링 | FR-008.2 |
| TC-10-003 | Unit (FE) | DOW IndexBadge 렌더링 | FR-009.1 |
| TC-10-004 | Unit (FE) | NASDAQ IndexBadge 렌더링 | FR-009.2 |
| TC-10-005 | Unit (BE) | Indices API 전체 조회 | FR-008/009.3 |
| TC-10-006 | Unit (BE) | Indices API domestic 필터 | FR-008/009.3 |
| TC-10-007 | Unit (BE) | Market Index Connector mock | FR-008/009.3 |
| TC-10-008 | Unit (BE) | Market Index Connector 에러 | FR-008/009.3 |

## 5. TSK-06과의 관계

TSK-06 (Foreign Markets)과 TSK-10 (Market Indices)는 `/api/v1/indices/quotes` API를 공유한다. TSK-06은 해외 지수(foreign) 필터를, TSK-10은 전체(all) 또는 국내(domestic) 필터를 주로 사용한다.

## 6. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
