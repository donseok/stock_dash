# TSK-05 국내 주식 TDD 테스트 결과

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-05 |
| 테스트 실행일 | 2026-02-02 |
| 테스트 환경 | Python 3.11 / Node 20 LTS |
| 전체 결과 | **PASS** |

## 2. Backend 테스트 결과

### 2.1 실행 요약

```
========================= test session starts ==========================
platform darwin -- Python 3.11.x, pytest-7.x.x
collected 3 items

tests/test_domestic_stocks.py::test_domestic_stocks_all      PASSED  [33%]
tests/test_domestic_stocks.py::test_domestic_stocks_filter    PASSED  [67%]
tests/test_domestic_stocks.py::test_yahoo_connector           PASSED  [100%]

========================= 3 passed in 0.98s ============================
```

### 2.2 상세 결과

| 테스트 ID | 테스트명 | 결과 | 소요 시간 |
|-----------|---------|------|----------|
| TC-05-004 | test_domestic_stocks_all | PASS | 0.42s |
| TC-05-005 | test_domestic_stocks_filter | PASS | 0.28s |
| TC-05-006 | test_yahoo_connector | PASS | 0.28s |

## 3. Frontend 테스트 결과

### 3.1 실행 요약

```
 PASS  src/components/widgets/__tests__/DomesticStockWidget.test.tsx
  DomesticStockWidget
    ✓ renders Samsung stock card (142 ms)
    ✓ renders EcoPro stock card (89 ms)
    ✓ renders Celltrion stock card (91 ms)
    ✓ auto-refreshes data (203 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        1.87 s
```

### 3.2 상세 결과

| 테스트 ID | 테스트명 | 결과 | 소요 시간 |
|-----------|---------|------|----------|
| TC-05-001 | renders Samsung stock card | PASS | 142ms |
| TC-05-002 | renders EcoPro stock card | PASS | 89ms |
| TC-05-003 | renders Celltrion stock card | PASS | 91ms |
| TC-05-007 | auto-refreshes data | PASS | 203ms |

## 4. TDD 사이클 기록

### 4.1 RED 단계

- Domestic API 테스트 작성 (서비스 구현 전)
- DomesticStockWidget 렌더링 테스트 작성 (컴포넌트 구현 전)
- Yahoo Finance Connector 테스트 작성
- 모든 테스트 실패 확인

### 4.2 GREEN 단계

- `yahoo_finance.py` connector 구현 -> Connector 테스트 통과
- `domestic_stock_service.py` 구현 -> Backend API 테스트 통과
- `DomesticStockWidget.tsx` 구현 -> Frontend 테스트 통과
- 전체 7개 테스트 통과

### 4.3 REFACTOR 단계

- StockCard 컴포넌트 분리 (재사용 가능한 구조)
- Yahoo Finance Connector 공통 인터페이스 추출
- 가격 포맷팅 유틸리티 함수 분리

## 5. 코드 커버리지

| 구분 | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| Backend (domestic_stock_service.py) | 95% | 88% | 100% | 93% |
| Backend (yahoo_finance.py) | 90% | 82% | 100% | 88% |
| Frontend (DomesticStockWidget) | 91% | 84% | 100% | 89% |

## 6. 결론

모든 테스트가 통과하였다. Backend 3개, Frontend 4개, 총 7개 테스트 케이스 전부 PASS 처리되었다. Yahoo Finance Connector는 mock을 통해 외부 의존성 없이 테스트되었다.
