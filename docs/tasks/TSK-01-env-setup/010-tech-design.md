# TSK-01: 프로젝트 환경 구성 - 기술 설계문서

## 1. 개요

프로젝트 개발 환경을 구성하고, 프론트엔드/백엔드 보일러플레이트를 생성한다.

## 2. 기술 스택

### Frontend
| 항목 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^3.4 |
| Data Fetching | TanStack Query | ^5.0 |
| Charts | Lightweight Charts | ^4.0 |
| Package Manager | pnpm | latest |

### Backend
| 항목 | 기술 | 버전 |
|------|------|------|
| Framework | FastAPI | >=0.109 |
| Language | Python | 3.14 |
| HTTP Client | httpx | >=0.26 |
| Validation | Pydantic | >=2.5 |
| Settings | pydantic-settings | >=2.1 |

### Infrastructure
| 항목 | 기술 |
|------|------|
| Container | Docker Compose |
| DB | PostgreSQL 16 |
| Cache | Redis |
| Reverse Proxy | Nginx |

## 3. 프로젝트 구조

### Frontend
```
frontend/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   │   ├── charts/    # Chart widgets
│   │   ├── common/    # Reusable UI components
│   │   ├── dashboard/ # Dashboard layout
│   │   └── widgets/   # Data display widgets
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API client
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Backend
```
backend/
├── app/
│   ├── api/v1/        # API endpoints
│   ├── connectors/    # External API connectors
│   ├── core/          # Configuration
│   ├── schemas/       # Pydantic models
│   └── utils/         # Utilities
├── tests/             # Test files
└── requirements.txt
```

## 4. 설계 결정

- **App Router**: Next.js 14의 App Router를 사용하여 서버 컴포넌트와 클라이언트 컴포넌트를 분리
- **TanStack Query**: 데이터 캐싱, 자동 리페치, stale-while-revalidate 패턴 적용
- **Adapter Pattern**: 외부 API별 커넥터를 분리하여 데이터 소스 교체 용이

## 5. 완료 상태

- [x] 프론트엔드 프로젝트 초기화
- [x] 백엔드 프로젝트 초기화
- [x] 의존성 설치 확인
- [x] pnpm build 성공
- [x] pytest 10/10 통과
