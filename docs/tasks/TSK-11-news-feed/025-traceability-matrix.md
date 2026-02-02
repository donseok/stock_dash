# TSK-11 뉴스 피드 추적성 매트릭스

## 1. 개요

본 문서는 TSK-11 (News Feed) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-010 | News feed | NewsWidget 설계 | `components/widgets/NewsWidget.tsx` | TC-11-001 ~ TC-11-008 | 완료 |
| FR-010.1 | 뉴스 목록 표시 | NewsCard 설계 | `NewsWidget.tsx` | TC-11-001 | 완료 |
| FR-010.2 | 뉴스 상세 (제목/요약/출처/시간) | NewsCard 상세 설계 | `NewsWidget.tsx` | TC-11-002 | 완료 |
| FR-010.3 | 뉴스 원문 링크 | 외부 링크 설계 | `NewsWidget.tsx` | TC-11-003 | 완료 |
| FR-010.4 | 뉴스 API | `/api/v1/news` | `routers/news.py`, `connectors/news.py` | TC-11-004 ~ TC-11-007 | 완료 |
| FR-010.5 | Mock fallback | Mock 뉴스 설계 | `connectors/news.py` | TC-11-006 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| NewsWidget | `frontend/src/components/widgets/NewsWidget.tsx` | 메인 위젯 |
| NewsCard | `frontend/src/components/widgets/NewsCard.tsx` | 개별 뉴스 카드 |
| NewsService | `backend/app/services/news_service.py` | 뉴스 서비스 |
| NewsConnector | `backend/app/connectors/news.py` | NewsAPI 커넥터 + mock |
| News Router | `backend/app/routers/news.py` | API 라우터 |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-11-001 | Unit (FE) | 뉴스 목록 렌더링 | FR-010.1 |
| TC-11-002 | Unit (FE) | NewsCard 상세 표시 | FR-010.2 |
| TC-11-003 | Unit (FE) | 외부 링크 동작 | FR-010.3 |
| TC-11-004 | Unit (BE) | News API 정상 조회 (live) | FR-010.4 |
| TC-11-005 | Unit (BE) | News API 카테고리 필터 | FR-010.4 |
| TC-11-006 | Unit (BE) | News API mock fallback | FR-010.5 |
| TC-11-007 | Unit (BE) | News Connector 에러 처리 | FR-010.4 |
| TC-11-008 | Integration | E2E 뉴스 위젯 | FR-010 |

## 5. Mock Fallback 흐름

```
NewsAPI 호출 시도
  ├─ 성공 → source_type: "live" 반환
  └─ 실패 (키 없음, 장애, Rate Limit)
       └─ Mock 데이터 반환 → source_type: "mock"
```

## 6. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
