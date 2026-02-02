# TSK-08 귀금속 추적성 매트릭스

## 1. 개요

본 문서는 TSK-08 (Precious Metals) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-006 | Gold/Silver prices | PreciousMetalWidget 설계 | `components/widgets/PreciousMetalWidget.tsx` | TC-08-001 ~ TC-08-007 | 완료 |
| FR-006.1 | Gold(XAU) 시세 표시 | MetalCard 설계 | `PreciousMetalWidget.tsx` | TC-08-001 | 완료 |
| FR-006.2 | Silver(XAG) 시세 표시 | MetalCard 설계 | `PreciousMetalWidget.tsx` | TC-08-002 | 완료 |
| FR-006.3 | KRW 환산가 표시 | 환율 연동 설계 | `PreciousMetalWidget.tsx` | TC-08-003 | 완료 |
| FR-006.4 | 귀금속 API | `/api/v1/metals/quotes` | `routers/metals.py`, `connectors/metals.py` | TC-08-004 ~ TC-08-007 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| PreciousMetalWidget | `frontend/src/components/widgets/PreciousMetalWidget.tsx` | 메인 위젯 |
| MetalCard | `frontend/src/components/widgets/MetalCard.tsx` | 개별 귀금속 카드 |
| MetalService | `backend/app/services/metal_service.py` | 귀금속 서비스 |
| MetalsConnector | `backend/app/connectors/metals.py` | metals.live 커넥터 |
| Metals Router | `backend/app/routers/metals.py` | API 라우터 |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-08-001 | Unit (FE) | Gold MetalCard 렌더링 | FR-006.1 |
| TC-08-002 | Unit (FE) | Silver MetalCard 렌더링 | FR-006.2 |
| TC-08-003 | Unit (FE) | KRW 환산가 표시 | FR-006.3 |
| TC-08-004 | Unit (BE) | Metals API 정상 조회 | FR-006.4 |
| TC-08-005 | Unit (BE) | Metals Connector mock | FR-006.4 |
| TC-08-006 | Unit (BE) | Metals Connector 에러 처리 | FR-006.4 |
| TC-08-007 | Integration | E2E 위젯 렌더링 | FR-006 |

## 5. 의존성 매핑

| 의존 태스크 | 의존 항목 | 설명 |
|------------|----------|------|
| TSK-09 | 환율 데이터 | KRW 환산가 계산을 위한 USD/KRW 환율 |

## 6. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
