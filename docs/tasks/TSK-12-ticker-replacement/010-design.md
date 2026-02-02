# TSK-12 종목 교체/커스터마이징 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-12 |
| 태스크명 | Ticker Replacement/Customization (종목 교체/커스터마이징) |
| 관련 요구사항 | FR-012 (Ticker Replacement) |
| 우선순위 | 높음 |
| 상태 | 완료 |

## 2. 목적

사용자가 대시보드의 각 위젯 카테고리(국내주식, 해외주식, 암호화폐)별로 표시할 종목(ticker)을 선택/해제할 수 있도록 한다. 설정은 localStorage에 영구 저장되어 브라우저를 닫았다 열어도 유지된다. 설정 변경 시 위젯 데이터가 즉시 필터링되어 반영된다.

## 3. 대상 카테고리 및 종목

### 3.1 국내주식 (domestic)

| 종목코드 | 종목명 | 기본 상태 |
|----------|--------|-----------|
| 058610 | 에스피지 | 활성 |
| 247540 | 에코프로 | 활성 |
| 068270 | 셀트리온 | 활성 |

### 3.2 해외주식 (foreign)

| 종목코드 | 종목명 | 기본 상태 |
|----------|--------|-----------|
| GOOG | Alphabet C | 활성 |
| FIGM | Figma | 활성 |

### 3.3 암호화폐 (crypto)

| 종목코드 | 종목명 | 기본 상태 |
|----------|--------|-----------|
| BTC | Bitcoin | 활성 |
| ETH | Ethereum | 활성 |
| SOL | Solana | 활성 |
| XRP | XRP | 활성 |
| LINK | Chainlink | 활성 |
| SUI | Sui | 활성 |
| ONDO | Ondo Finance | 활성 |

## 4. 아키텍처

### 4.1 시스템 구성도

```
[Frontend Only - 백엔드 변경 없음]

useTickerSettings(category)          localStorage
  ├─ enabledSymbols                    "stock_dash_tickers"
  ├─ toggleSymbol(symbol)  ──save──>   { domestic: [...], foreign: [...], crypto: [...] }
  ├─ resetToDefaults()     ──save──>
  └─ isEnabled(symbol)     <──load──

TickerSettingsModal
  ├─ 체크박스 리스트 (종목별 on/off)
  ├─ 초기화 버튼
  └─ 확인 버튼

DomesticStockWidget / ForeignStockWidget / CryptoWidget
  ├─ useTickerSettings(category)
  ├─ filtered = data.filter(enabledSymbols)
  └─ headerRight = ⚙ 설정 버튼 -> TickerSettingsModal
```

### 4.2 상태 관리 설계

#### useTickerSettings Hook

```typescript
export type WidgetCategory = "domestic" | "foreign" | "crypto";

export function useTickerSettings(category: WidgetCategory) {
  // 반환값:
  // - allTickers: 해당 카테고리의 전체 종목 목록
  // - enabledSymbols: 현재 활성화된 종목 코드 배열
  // - toggleSymbol(symbol): 종목 활성/비활성 토글
  // - resetToDefaults(): 기본값으로 초기화
  // - isEnabled(symbol): 특정 종목 활성 여부 확인
}
```

#### localStorage 스키마

```json
{
  "stock_dash_tickers": {
    "domestic": ["058610", "247540", "068270"],
    "foreign": ["GOOG", "FIGM"],
    "crypto": ["BTC", "ETH", "SOL", "XRP", "LINK", "SUI", "ONDO"]
  }
}
```

### 4.3 컴포넌트 설계

#### TickerSettingsModal

```
TickerSettingsModal
├── Overlay (bg-black/30, 클릭 시 닫기)
├── Modal Container (w-80, bg-white, rounded-lg)
│   ├── Header
│   │   ├── 제목 ("국내주식 종목 설정" / "해외주식 종목 설정" / "암호화폐 종목 설정")
│   │   └── 닫기 버튼 (×)
│   ├── Checkbox List
│   │   ├── [✓] 에스피지  058610
│   │   ├── [✓] 에코프로  247540
│   │   └── [✓] 셀트리온  068270
│   └── Footer
│       ├── 초기화 버튼
│       └── 확인 버튼
└──
```

#### 위젯 통합 패턴

```typescript
// 모든 대상 위젯에 동일한 패턴 적용
export function DomesticStockWidget() {
  const { data: stocks } = useDomesticStocks();
  const { enabledSymbols } = useTickerSettings("domestic");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filtered = stocks?.filter((s) => enabledSymbols.includes(s.symbol));

  return (
    <>
      <Card title="국내주식" headerRight={settingsButton}>
        {/* filtered 데이터로 렌더링 */}
      </Card>
      <TickerSettingsModal category="domestic" isOpen={settingsOpen} onClose={...} />
    </>
  );
}
```

## 5. 데이터 흐름

1. 위젯 마운트 시 `useTickerSettings(category)` Hook이 localStorage에서 설정 로드
2. 저장된 설정이 없으면 기본값(전체 종목 활성) 사용
3. 위젯은 API로 전체 종목 데이터를 조회한 후, `enabledSymbols`로 필터링하여 표시
4. 사용자가 설정 아이콘(기어) 클릭 시 `TickerSettingsModal` 오픈
5. 체크박스 토글 시 `toggleSymbol()` 호출 -> state 업데이트 + localStorage 저장
6. state 변경으로 위젯이 즉시 리렌더링되어 필터링 결과 반영
7. 초기화 버튼 클릭 시 `resetToDefaults()` 호출 -> 모든 종목 활성화

## 6. 저장 전략

| 항목 | 값 |
|------|-----|
| 저장소 | `window.localStorage` |
| 키 | `stock_dash_tickers` |
| 형식 | JSON 문자열 |
| 저장 시점 | `toggleSymbol()` 또는 `resetToDefaults()` 호출 즉시 |
| 로드 시점 | Hook 마운트 시 (`useEffect` 내) |
| SSR 안전성 | `typeof window === "undefined"` 가드 처리 |

## 7. 에러 처리

| 에러 상황 | 처리 방식 |
|-----------|-----------|
| localStorage 파싱 실패 | try-catch로 null 반환, 기본값 사용 |
| localStorage 접근 불가 (시크릿 모드 등) | 기본값으로 폴백 |
| 모든 종목 비활성화 | "표시할 종목이 없습니다. 설정에서 종목을 추가하세요." 안내 메시지 |
| SSR 환경 (window 미정의) | `typeof window === "undefined"` 가드 |
