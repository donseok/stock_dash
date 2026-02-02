# TSK-12 위젯 프레임워크 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-12 |
| 관련 요구사항 | NFR-001 ~ NFR-004 |
| 구현 상태 | 완료 |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/common/Card.tsx` | 공통 카드 컴포넌트 | ~30 |
| `frontend/src/components/common/LoadingSpinner.tsx` | 로딩 스피너 | ~25 |
| `frontend/src/components/common/ErrorMessage.tsx` | 에러 메시지 | ~30 |
| `frontend/src/components/common/PriceChange.tsx` | 가격 변동 표시 | ~40 |
| `frontend/src/hooks/useMarketData.ts` | 8개 커스텀 hook | ~120 |
| `frontend/src/services/api.ts` | API 서비스 레이어 | ~80 |
| `frontend/src/utils/format.ts` | 포맷팅 유틸리티 | ~60 |
| `frontend/src/types/market.ts` | TypeScript 타입 정의 | ~90 |
| `frontend/src/types/api.ts` | API 관련 타입 | ~20 |
| `frontend/src/app/providers.tsx` | TanStack Query Provider | ~25 |

## 3. 핵심 구현 내용

### 3.1 Card 컴포넌트

```typescript
interface CardProps {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, headerRight, children, className }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {headerRight}
      </div>
      {children}
    </div>
  );
}
```

### 3.2 TanStack Query Hook 패턴

```typescript
export function useCryptoQuotes() {
  return useQuery({
    queryKey: ['crypto', 'quotes'],
    queryFn: () => marketApi.getCryptoQuotes(),
    staleTime: 5000,
    refetchInterval: 10000,
    retry: 2,
  });
}
```

### 3.3 API 서비스

```typescript
export const marketApi = {
  getCryptoQuotes: () => fetchApi<CryptoQuote[]>('/api/v1/crypto/quotes'),
  getMetalsQuotes: () => fetchApi<PreciousMetalQuote[]>('/api/v1/metals/quotes'),
  getExchangeRates: () => fetchApi<ExchangeRate[]>('/api/v1/exchange/rates'),
  // ...
};
```

## 4. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 상태 관리 | TanStack Query v5 | 서버 상태 관리에 최적화 |
| 스타일링 | Tailwind CSS | 유틸리티 기반 빠른 개발 |
| 타입 시스템 | TypeScript 5 | 컴파일 타임 타입 안전성 |
| 컴포넌트 패턴 | 합성(Composition) | 유연한 컴포넌트 조합 |

## 5. 테스트 결과 요약

| 구분 | 결과 |
|------|------|
| Frontend 빌드 | 성공 (150kB) |
| Backend API | 10/10 PASS |
| Schema 검증 | 7/7 PASS |
