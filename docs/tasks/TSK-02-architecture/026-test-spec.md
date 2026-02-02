# TSK-02: 테스트 명세

## 아키텍처 검증 테스트

| ID | 테스트명 | 유형 | 기대 결과 |
|----|---------|------|----------|
| TC-02-01 | API 라우터 통합 | Integration | 모든 엔드포인트 접근 가능 |
| TC-02-02 | 커넥터 폴백 | Unit | API 실패 시 mock 데이터 반환 |
| TC-02-03 | CORS 설정 | Integration | localhost:3000 허용 |
| TC-02-04 | 응답 형식 | API | {data, status, timestamp} 구조 |
| TC-02-05 | 타입 일관성 | Build | TypeScript/Pydantic 타입 일치 |
| TC-02-06 | 프론트엔드 빌드 | Build | 정적 생성 성공 |
