# TSK-03: 대시보드 레이아웃 - 설계문서

## 1. 개요

주식 웹 포털의 메인 대시보드 레이아웃을 구현한다. 반응형 그리드 시스템, 위젯 배치, 헤더, 시장지수 바를 포함한다.

## 2. 컴포넌트 구조

```
Dashboard
├── Header                  # 상단 고정 헤더
├── MarketIndicesBar        # 시장지수 티커 바
└── Grid Container          # 12칼럼 반응형 그리드
    ├── StockChartWidget    # 주식 차트 (8col)
    ├── ExchangeRateWidget  # 환율 (4col)
    ├── PreciousMetalWidget # 귀금속 시세 (4col)
    ├── DomesticStockWidget # 국내주식 (6col)
    ├── ForeignStockWidget  # 해외주식 (6col)
    ├── CryptoWidget        # 암호화폐 (8col)
    └── NewsWidget          # 뉴스 (4col)
```

## 3. 레이아웃 사양

### 브레이크포인트
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px (그리드 활성화)
- `xl`: 1280px
- `2xl`: 1536px

### 그리드 시스템
- 12칼럼 CSS Grid (`grid-cols-12`)
- gap: `1rem` (16px)
- max-width: 1920px
- padding: 1rem

### 색상 체계
- 상승: `#ef4444` (red-500)
- 하락: `#3b82f6` (blue-500)
- 배경: `#f9fafb` (gray-50)
- 카드: `#ffffff`

## 4. 반응형 동작

| 화면 크기 | 레이아웃 |
|----------|---------|
| < 1024px | 1칼럼 스택 |
| >= 1024px | 12칼럼 그리드 |

## 5. PRD 매핑

- FR-001: 웹 대시보드 포털 → Dashboard 컴포넌트
- FR-008, FR-009: 시장지수 → MarketIndicesBar
- NFR-004: UI/UX 품질 → 반응형 디자인, Tailwind CSS
