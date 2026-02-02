# TSK-12 종목 교체/커스터마이징 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-12 |
| 관련 요구사항 | FR-012 (Ticker Replacement/Customization) |
| 구현 상태 | 완료 |
| Backend 테스트 | 28/28 PASS (변경 없음, 회귀 테스트) |
| Frontend 빌드 | 성공 (152kB) |

## 2. 구현 파일 목록

### 2.1 Frontend (신규)

| 파일 경로 | 설명 | 변경 유형 |
|-----------|------|-----------|
| `frontend/src/hooks/useTickerSettings.ts` | 카테고리별 종목 설정 관리 Hook | 신규 |
| `frontend/src/components/common/TickerSettingsModal.tsx` | 종목 설정 모달 컴포넌트 | 신규 |

### 2.2 Frontend (수정)

| 파일 경로 | 설명 | 변경 유형 |
|-----------|------|-----------|
| `frontend/src/components/widgets/DomesticStockWidget.tsx` | 국내주식 위젯에 필터링/설정 통합 | 수정 |
| `frontend/src/components/widgets/ForeignStockWidget.tsx` | 해외주식 위젯에 필터링/설정 통합 | 수정 |
| `frontend/src/components/widgets/CryptoWidget.tsx` | 암호화폐 위젯에 필터링/설정 통합 | 수정 |

### 2.3 Backend

변경 없음 (Frontend 전용 기능)

## 3. 핵심 구현 내용

### 3.1 useTickerSettings Hook

```typescript
// frontend/src/hooks/useTickerSettings.ts
"use client";

import { useState, useCallback, useEffect } from "react";

export type WidgetCategory = "domestic" | "foreign" | "crypto";

interface TickerOption {
  symbol: string;
  name: string;
}

const DEFAULT_TICKERS: Record<WidgetCategory, TickerOption[]> = {
  domestic: [
    { symbol: "058610", name: "에스피지" },
    { symbol: "247540", name: "에코프로" },
    { symbol: "068270", name: "셀트리온" },
  ],
  foreign: [
    { symbol: "GOOG", name: "Alphabet C" },
    { symbol: "FIGM", name: "Figma" },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "XRP", name: "XRP" },
    { symbol: "LINK", name: "Chainlink" },
    { symbol: "SUI", name: "Sui" },
    { symbol: "ONDO", name: "Ondo Finance" },
  ],
};

const STORAGE_KEY = "stock_dash_tickers";

function loadSettings(): Record<WidgetCategory, string[]> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSettings(settings: Record<WidgetCategory, string[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useTickerSettings(category: WidgetCategory) {
  const defaults = DEFAULT_TICKERS[category];
  const defaultSymbols = defaults.map((t) => t.symbol);

  const [enabledSymbols, setEnabledSymbols] = useState<string[]>(defaultSymbols);

  useEffect(() => {
    const saved = loadSettings();
    if (saved && saved[category]) {
      setEnabledSymbols(saved[category]);
    }
  }, [category]);

  const toggleSymbol = useCallback(
    (symbol: string) => {
      setEnabledSymbols((prev) => {
        const next = prev.includes(symbol)
          ? prev.filter((s) => s !== symbol)
          : [...prev, symbol];
        const saved = loadSettings() || {
          domestic: DEFAULT_TICKERS.domestic.map((t) => t.symbol),
          foreign: DEFAULT_TICKERS.foreign.map((t) => t.symbol),
          crypto: DEFAULT_TICKERS.crypto.map((t) => t.symbol),
        };
        saved[category] = next;
        saveSettings(saved);
        return next;
      });
    },
    [category]
  );

  const resetToDefaults = useCallback(() => {
    setEnabledSymbols(defaultSymbols);
    const saved = loadSettings() || {
      domestic: DEFAULT_TICKERS.domestic.map((t) => t.symbol),
      foreign: DEFAULT_TICKERS.foreign.map((t) => t.symbol),
      crypto: DEFAULT_TICKERS.crypto.map((t) => t.symbol),
    };
    saved[category] = defaultSymbols;
    saveSettings(saved);
  }, [category, defaultSymbols]);

  return {
    allTickers: defaults,
    enabledSymbols,
    toggleSymbol,
    resetToDefaults,
    isEnabled: (symbol: string) => enabledSymbols.includes(symbol),
  };
}
```

### 3.2 TickerSettingsModal 컴포넌트

```typescript
// frontend/src/components/common/TickerSettingsModal.tsx
"use client";

import { useTickerSettings, WidgetCategory } from "@/hooks/useTickerSettings";

interface TickerSettingsModalProps {
  category: WidgetCategory;
  isOpen: boolean;
  onClose: () => void;
}

export function TickerSettingsModal({
  category,
  isOpen,
  onClose,
}: TickerSettingsModalProps) {
  const { allTickers, enabledSymbols, toggleSymbol, resetToDefaults } =
    useTickerSettings(category);

  if (!isOpen) return null;

  const title =
    category === "domestic"
      ? "국내주식 종목 설정"
      : category === "foreign"
      ? "해외주식 종목 설정"
      : "암호화폐 종목 설정";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            &times;
          </button>
        </div>
        <div className="space-y-2 mb-4">
          {allTickers.map((t) => (
            <label key={t.symbol} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={enabledSymbols.includes(t.symbol)}
                onChange={() => toggleSymbol(t.symbol)}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">{t.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{t.symbol}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-between">
          <button onClick={resetToDefaults} className="text-xs text-gray-500 hover:text-gray-700">
            초기화
          </button>
          <button onClick={onClose} className="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 위젯 통합 패턴 (DomesticStockWidget 예시)

```typescript
// frontend/src/components/widgets/DomesticStockWidget.tsx
import { useState } from "react";
import { useDomesticStocks } from "@/hooks/useMarketData";
import { useTickerSettings } from "@/hooks/useTickerSettings";
import { TickerSettingsModal } from "@/components/common/TickerSettingsModal";

export function DomesticStockWidget() {
  const { data: stocks, isLoading, error, refetch } = useDomesticStocks();
  const { enabledSymbols } = useTickerSettings("domestic");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filtered = stocks?.filter((s) => enabledSymbols.includes(s.symbol));

  const settingsButton = (
    <button
      onClick={() => setSettingsOpen(true)}
      className="text-gray-400 hover:text-gray-600 text-sm"
      title="종목 설정"
    >
      &#9881;
    </button>
  );

  return (
    <>
      <Card title="국내주식" headerRight={settingsButton}>
        {/* filtered 데이터로 테이블 렌더링 */}
        {filtered?.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            표시할 종목이 없습니다. 설정에서 종목을 추가하세요.
          </p>
        )}
      </Card>
      <TickerSettingsModal
        category="domestic"
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
```

ForeignStockWidget과 CryptoWidget도 동일한 패턴으로 통합되었다. 각각 `useTickerSettings("foreign")`, `useTickerSettings("crypto")`를 사용한다.

## 4. 주요 설계 패턴

### 4.1 Hook을 통한 상태 관리

- `useTickerSettings`는 React의 `useState` + `useEffect` + `useCallback`으로 구현
- localStorage 동기화는 `toggleSymbol`과 `resetToDefaults` 호출 시 즉시 수행
- SSR 환경에서의 안전성을 위해 `typeof window === "undefined"` 가드 적용

### 4.2 카테고리 기반 분리

```typescript
type WidgetCategory = "domestic" | "foreign" | "crypto";
```

- 각 위젯은 자신의 카테고리만 관리
- localStorage에는 모든 카테고리를 하나의 객체로 저장
- 다른 카테고리의 설정에 영향을 주지 않음

### 4.3 필터링 전략

- API는 전체 데이터를 반환 (Backend 변경 없음)
- Frontend에서 `enabledSymbols`로 클라이언트 사이드 필터링
- 불필요한 API 요청 없이 즉시 반영

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 저장소 | localStorage | 서버 불필요, 즉시 접근, 영구 저장 |
| 저장 키 | `stock_dash_tickers` | 앱 전용 네임스페이스 |
| 필터링 위치 | 클라이언트 사이드 | Backend 변경 최소화, 즉시 반영 |
| 기본값 | 전체 종목 활성 | 초기 사용자 경험 최적화 |
| 모달 닫기 방식 | 3가지 (확인/X/오버레이) | 사용 편의성 |
| 빈 상태 처리 | 안내 메시지 표시 | 사용자에게 복구 방법 안내 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend (회귀) | 28 | 28 | 0 | 100% |
| Frontend 빌드 | - | 성공 (152kB) | - | - |
| **합계** | **28** | **28 PASS + 빌드 성공** | **0** | **100%** |
