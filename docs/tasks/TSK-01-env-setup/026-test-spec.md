# TSK-01: 테스트 명세

## 1. 테스트 범위

프로젝트 환경 구성의 정상 동작을 검증한다.

## 2. 테스트 케이스

| ID | 테스트명 | 유형 | 기대 결과 |
|----|---------|------|----------|
| TC-01-01 | 프론트엔드 빌드 | Build | pnpm build 성공 |
| TC-01-02 | 백엔드 임포트 | Unit | main.py 임포트 에러 없음 |
| TC-01-03 | 루트 엔드포인트 | API | GET / → 200, status: running |
| TC-01-04 | 헬스체크 | API | GET /health → 200, status: healthy |
| TC-01-05 | 암호화폐 API | API | GET /api/v1/crypto/quotes → 200 |
| TC-01-06 | 귀금속 API | API | GET /api/v1/metals/quotes → 200 |
| TC-01-07 | 환율 API | API | GET /api/v1/exchange/rates → 200 |
| TC-01-08 | 시장지수 API | API | GET /api/v1/indices/quotes → 200 |
| TC-01-09 | 국내주식 API | API | GET /api/v1/stocks/domestic → 200 |
| TC-01-10 | 해외주식 API | API | GET /api/v1/stocks/foreign → 200 |
| TC-01-11 | 뉴스 API | API | GET /api/v1/news → 200 |
| TC-01-12 | 차트 API | API | GET /api/v1/stocks/{symbol}/chart → 200 |

## 3. 테스트 결과

- **총 테스트**: 10개
- **통과**: 10개
- **실패**: 0개
- **경고**: 0개
