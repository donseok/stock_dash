# TSK-12 종목 교체/커스터마이징 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-12 |
| 테스트 대상 | useTickerSettings Hook, TickerSettingsModal, 위젯 필터링 통합 |
| 관련 요구사항 | FR-012 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Frontend 테스트 | TypeScript 컴파일, Next.js build |
| Backend 테스트 | pytest (기존 28개 회귀 테스트) |
| 수동 테스트 | 브라우저 localStorage 검증 |

## 3. 테스트 케이스

### 3.1 Frontend 빌드 테스트

#### TC-12-001: useTickerSettings Hook 빌드 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-001 |
| 구분 | Build (Frontend) |
| 사전 조건 | `useTickerSettings.ts` 파일 존재 |
| 기대 결과 | TypeScript 컴파일 오류 없음, 빌드 성공 |
| 검증 항목 | WidgetCategory 타입, enabledSymbols 상태, toggleSymbol/resetToDefaults 함수 |

핵심 검증 포인트:
```typescript
// 타입 정의 검증
export type WidgetCategory = "domestic" | "foreign" | "crypto";

// Hook 반환 타입 검증
const {
  allTickers,       // TickerOption[]
  enabledSymbols,   // string[]
  toggleSymbol,     // (symbol: string) => void
  resetToDefaults,  // () => void
  isEnabled,        // (symbol: string) => boolean
} = useTickerSettings("domestic");
```

#### TC-12-002: TickerSettingsModal 컴포넌트 빌드 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-002 |
| 구분 | Build (Frontend) |
| 기대 결과 | TickerSettingsModal 컴포넌트 빌드 성공 |
| 검증 항목 | Props 인터페이스, 체크박스 렌더링, 오버레이 |

```typescript
interface TickerSettingsModalProps {
  category: WidgetCategory;
  isOpen: boolean;
  onClose: () => void;
}
```

#### TC-12-003: localStorage 연동 빌드 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-003 |
| 구분 | Build (Frontend) |
| 기대 결과 | loadSettings/saveSettings 함수 빌드 성공 |
| 검증 항목 | STORAGE_KEY 상수, JSON 파싱, SSR 가드 |

```typescript
const STORAGE_KEY = "stock_dash_tickers";

function loadSettings(): Record<WidgetCategory, string[]> | null {
  if (typeof window === "undefined") return null;
  // localStorage 읽기...
}
```

#### TC-12-004: DomesticStockWidget 필터링 통합 빌드

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-004 |
| 구분 | Build (Frontend) |
| 기대 결과 | DomesticStockWidget에 useTickerSettings + TickerSettingsModal 통합 후 빌드 성공 |
| 검증 항목 | 설정 버튼 렌더링, filtered 배열, 빈 상태 메시지 |

#### TC-12-005: ForeignStockWidget 필터링 통합 빌드

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-005 |
| 구분 | Build (Frontend) |
| 기대 결과 | ForeignStockWidget에 동일 패턴 통합 후 빌드 성공 |

#### TC-12-006: CryptoWidget 필터링 통합 빌드

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-006 |
| 구분 | Build (Frontend) |
| 기대 결과 | CryptoWidget에 동일 패턴 통합 후 빌드 성공 |

#### TC-12-007: 종목 토글 기능 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-007 |
| 구분 | 수동 (Frontend) |
| 사전 조건 | 앱 실행 중, 국내주식 위젯 표시 |
| 입력 | 기어 아이콘 클릭 -> 에코프로 체크박스 해제 -> 확인 |
| 기대 결과 | 국내주식 위젯에서 에코프로 행이 사라짐 |
| 추가 검증 | localStorage에 `{"domestic":["058610","068270"],...}` 저장 확인 |

#### TC-12-008: 기본값 초기화 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-008 |
| 구분 | 수동 (Frontend) |
| 사전 조건 | 일부 종목이 비활성화된 상태 |
| 입력 | 설정 모달 -> 초기화 버튼 클릭 |
| 기대 결과 | 모든 종목 체크박스 활성화, 위젯에 전체 종목 표시 |

#### TC-12-009: 빈 상태 메시지 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-12-009 |
| 구분 | 수동 (Frontend) |
| 사전 조건 | 앱 실행 중 |
| 입력 | 설정 모달에서 모든 종목 체크박스 해제 |
| 기대 결과 | 위젯에 "표시할 종목이 없습니다. 설정에서 종목을 추가하세요." 메시지 표시 |

### 3.2 Backend 회귀 테스트

| 항목 | 내용 |
|------|------|
| 구분 | 회귀 (Backend) |
| 기대 결과 | 기존 28개 테스트 전부 PASS (Backend 변경 없음) |
| 검증 방법 | `python -m pytest tests/ -v` |

## 4. 테스트 실행 방법

```bash
# Frontend 빌드 검증 (TC-12-001 ~ TC-12-006)
cd frontend && npm run build

# Backend 회귀 테스트
cd backend && python -m pytest tests/ -v

# 수동 테스트 (TC-12-007 ~ TC-12-009)
# 1. 앱 실행: cd frontend && npm run dev
# 2. 브라우저에서 http://localhost:3000 접속
# 3. 각 위젯의 기어 아이콘 클릭하여 모달 동작 확인
# 4. 개발자 도구 > Application > localStorage에서 stock_dash_tickers 키 확인
```
