# TSK-09 환율 추적성 매트릭스

## 1. 개요

본 문서는 TSK-09 (Exchange Rates) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-007 | Exchange rates (USD/KRW) | ExchangeRateWidget 설계 | `components/widgets/ExchangeRateWidget.tsx` | TC-09-001 ~ TC-09-007 | 완료 |
| FR-007.1 | USD/KRW 환율 표시 | RateDisplay 설계 | `ExchangeRateWidget.tsx` | TC-09-001 | 완료 |
| FR-007.2 | 등락 정보 표시 | ChangeInfo 설계 | `ExchangeRateWidget.tsx` | TC-09-002 | 완료 |
| FR-007.3 | 고가/저가 표시 | HighLow 설계 | `ExchangeRateWidget.tsx` | TC-09-003 | 완료 |
| FR-007.4 | 환율 API | `/api/v1/exchange/rates` | `routers/exchange.py`, `connectors/exchange_rate.py` | TC-09-004 ~ TC-09-007 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| ExchangeRateWidget | `frontend/src/components/widgets/ExchangeRateWidget.tsx` | 메인 위젯 |
| ExchangeRateService | `backend/app/services/exchange_rate_service.py` | 환율 서비스 |
| ExchangeRateConnector | `backend/app/connectors/exchange_rate.py` | ER-API 커넥터 |
| Exchange Router | `backend/app/routers/exchange.py` | API 라우터 |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-09-001 | Unit (FE) | USD/KRW 환율 렌더링 | FR-007.1 |
| TC-09-002 | Unit (FE) | 등락 정보 표시 | FR-007.2 |
| TC-09-003 | Unit (FE) | 고가/저가 표시 | FR-007.3 |
| TC-09-004 | Unit (BE) | Exchange API 정상 조회 | FR-007.4 |
| TC-09-005 | Unit (BE) | ER-API Connector mock | FR-007.4 |
| TC-09-006 | Unit (BE) | ER-API Connector 에러 처리 | FR-007.4 |
| TC-09-007 | Integration | E2E 환율 위젯 | FR-007 |

## 5. 역방향 의존성 (이 태스크에 의존하는 태스크)

| 의존 태스크 | 의존 항목 | 설명 |
|------------|----------|------|
| TSK-08 | 환율 데이터 | 귀금속 KRW 환산 |
| TSK-06 | 환율 데이터 | 해외 주식 참고 환율 |

## 6. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
