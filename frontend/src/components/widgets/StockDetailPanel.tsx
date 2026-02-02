"use client";

import { useState } from "react";
import { useStockDetail } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatPrice, formatVolume } from "@/utils/format";

const SYMBOLS = [
  { symbol: "058610", name: "에스피지", market: "KR" as const },
  { symbol: "247540", name: "에코프로", market: "KR" as const },
  { symbol: "068270", name: "셀트리온", market: "KR" as const },
  { symbol: "GOOG", name: "Alphabet C", market: "US" as const },
  { symbol: "FIGM", name: "Figma", market: "US" as const },
];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-mono text-gray-900">{value}</span>
    </div>
  );
}

export function StockDetailPanel() {
  const [selected, setSelected] = useState(SYMBOLS[0]);
  const { data: detail, isLoading, error, refetch } = useStockDetail(selected.symbol);
  const currency = selected.market === "KR" ? "KRW" : "USD";

  return (
    <Card title="종목 상세정보">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SYMBOLS.map((s) => (
          <button
            key={s.symbol}
            onClick={() => setSelected(s)}
            className={`px-2.5 py-1 text-xs rounded-full border ${
              selected.symbol === s.symbol
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage onRetry={() => refetch()} />}

      {detail && (
        <div>
          <div className="mb-3">
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(detail.price, currency as "KRW" | "USD")}
            </div>
            <PriceChange change={detail.change} changePercent={detail.changePercent} />
          </div>

          <div className="space-y-0">
            <DetailRow label="시가" value={formatPrice(detail.open, currency as "KRW" | "USD")} />
            <DetailRow label="고가" value={formatPrice(detail.high, currency as "KRW" | "USD")} />
            <DetailRow label="저가" value={formatPrice(detail.low, currency as "KRW" | "USD")} />
            <DetailRow label="전일종가" value={formatPrice(detail.prevClose, currency as "KRW" | "USD")} />
            <DetailRow label="거래량" value={formatVolume(detail.volume)} />
            <DetailRow label="52주 최고" value={formatPrice(detail.week52High, currency as "KRW" | "USD")} />
            <DetailRow label="52주 최저" value={formatPrice(detail.week52Low, currency as "KRW" | "USD")} />
            {detail.marketCap && (
              <DetailRow label="시가총액" value={formatVolume(detail.marketCap)} />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
