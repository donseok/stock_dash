---
active: true
iteration: 1
max_iterations: 30
completion_promise: "프로젝트 개발 완료"
started_at: "2026-02-02T04:57:28Z"
---

프로젝트를 개발해줘.

## 0. 변수 정의

아래 변수를 문서 전체에서 치환하여 사용하세요:

- PROJECT_NAME = stock_dash

## 1. 참고문서

- 프로젝트명: 
- 폴더: /Users/jerry/stock_dash/docs
- 문서: PRD, TRD, WBS 참고

## 2. Task별 문서 생성 (단계별)

| 단계 | 문서 | 설명 |
| --- | --- | --- |
| 설계 | [010-design.md](http://010-design.md/) | 설계문서 (infra면 [010-tech-design.md](http://010-tech-design.md/)) |
| 설계 | [011-ui-design.md](http://011-ui-design.md/) | UI설계 (화면 Task만) |
| 설계 | [025-traceability-matrix.md](http://025-traceability-matrix.md/) | 추적성 매트릭스 |
| 설계 | [026-test-spec.md](http://026-test-spec.md/) | 테스트 명세 |
| 구현 | [070-tdd-test-result.md](http://070-tdd-test-result.md/) | TDD 테스트 결과 |
| 구현 | [071-e2e-test-result.md](http://071-e2e-test-result.md/) | E2E 테스트 결과 (화면 Task만) |
| 완료 | [030-implementation.md](http://030-implementation.md/) | 구현 보고서 |
| 완료 | [080-user-manual.md](http://080-user-manual.md/) | 유저 매뉴얼 |

## 3. 개발 워크플로우

**설계** → **구현/테스트** → **완료** 순서로 진행

### 3.1 설계 단계

- PRD/TRD 분석 → 설계문서 작성 → 테스트 명세 작성

### 3.2 구현/테스트 단계

- TDD: 테스트 코드 먼저 작성 → 구현 → 테스트 통과 확인
- 화면: E2E 테스트 수행
- 메뉴 등록 완료

### 3.3 완료 단계

- 빌드 검증 (pnpm build)
- 문서 업데이트 → 리팩토링

## 4. 일관성 검증

- PRD 요구사항 ID가 설계문서에 모두 반영되었는지 확인
- 추적성 매트릭스로 요구사항 ↔ 설계 ↔ 테스트 매핑 검증
- 설계문서의 컴포넌트 구조/API 명세와 실제 코드 비교
- 테스트 명세의 테스트 케이스가 모두 구현되었는지 확인

## 5. 리팩토링 지침

- 3회 이상 반복 코드 → 공통 함수/컴포넌트 추출
- 재사용 UI → components/common/ 분리
- 공통 유틸리티 → lib/utils/ 분리
- 중복 타입 → types/ 통합
- 함수당 20줄 이하, 조건 중첩 3단계 이하 유지

## 6. Git 커밋

### 커밋 시점

- 각 Task 완료 시 커밋
- 테스트 통과 후 커밋 (빌드 실패 코드 커밋 금지)

### 커밋 메시지 형식

- feat(/TSK-XX-XX): 새 기능 추가
- fix(/TSK-XX-XX): 버그 수정
- docs(/TSK-XX-XX): 문서 변경
- refactor(/TSK-XX-XX): 리팩토링
- test(/TSK-XX-XX): 테스트 추가/수정

## 7. 완료 조건

- 모든 Task 완료 시 프로젝트 개발 완료 출력
- WBS의 모든 Task status가 완료[xx] 상태


