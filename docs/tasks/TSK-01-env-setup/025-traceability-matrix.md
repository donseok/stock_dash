# TSK-01: 추적성 매트릭스

## 요구사항 → 설계 → 테스트 매핑

| PRD 요구사항 | 설계 항목 | 구현 파일 | 테스트 |
|-------------|----------|----------|--------|
| FR-001: 웹 대시보드 포털 | Next.js 14 App Router | frontend/src/app/ | pnpm build 성공 |
| NFR-002: 초기 로딩 3초 이내 | SSG + Code Splitting | next.config.mjs | 빌드 번들 사이즈 확인 |
| TRD: FastAPI 백엔드 | FastAPI app + CORS | backend/app/main.py | test_root, test_health |
| TRD: REST API v1 | API Router 구조 | backend/app/api/v1/ | test_*_quotes, test_news |
| TRD: 외부 API 커넥터 | Adapter 패턴 커넥터 | backend/app/connectors/ | 각 API 엔드포인트 테스트 |
