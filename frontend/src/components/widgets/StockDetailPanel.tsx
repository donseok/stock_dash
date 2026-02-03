"use client";

import { useState, useMemo } from "react";
import { useStockDetail } from "@/hooks/useMarketData";
import { useTickerSettings } from "@/hooks/useTickerSettings";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatPrice, formatVolume } from "@/utils/format";

interface SymbolOption {
  symbol: string;
  yahooSymbol?: string;
  name: string;
  market: "KR" | "US";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-slate-700">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xs font-mono text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

function Week52Bar({ current, low, high }: { current: number; low: number; high: number }) {
  const range = high - low;
  const pct = range > 0 ? ((current - low) / range) * 100 : 50;

  return (
    <div className="mt-3 mb-1">
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-1">
        <span>52주 최저</span>
        <span>52주 최고</span>
      </div>
      <div className="relative h-2 rounded-full bg-gray-100 dark:bg-slate-700">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-red-400"
          style={{ width: `${Math.min(Math.max(pct, 2), 100)}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-slate-300 border-2 border-primary-500 shadow-sm"
          style={{ left: `calc(${Math.min(Math.max(pct, 2), 98)}% - 6px)` }}
        />
      </div>
    </div>
  );
}

export function StockDetailPanel() {
  const domesticSettings = useTickerSettings("domestic");
  const foreignSettings = useTickerSettings("foreign");

  // Build combined list of enabled symbols from both domestic and foreign
  const symbols: SymbolOption[] = useMemo(() => {
    const domesticSymbols = domesticSettings.allTickers
      .filter((t) => domesticSettings.enabledSymbols.includes(t.symbol))
      .map((t) => ({
        symbol: t.symbol,
        yahooSymbol: t.yahooSymbol,
        name: t.name,
        market: "KR" as const,
      }));

    const foreignSymbols = foreignSettings.allTickers
      .filter((t) => foreignSettings.enabledSymbols.includes(t.symbol))
      .map((t) => ({
        symbol: t.symbol,
        yahooSymbol: t.yahooSymbol,
        name: t.name,
        market: "US" as const,
      }));

    return [...domesticSymbols, ...foreignSymbols];
  }, [
    domesticSettings.allTickers,
    domesticSettings.enabledSymbols,
    foreignSettings.allTickers,
    foreignSettings.enabledSymbols,
  ]);

  const [selected, setSelected] = useState<SymbolOption | null>(null);

  // Auto-select first symbol when list changes
  const effectiveSelected = selected && symbols.some((s) => s.symbol === selected.symbol)
    ? selected
    : symbols[0] || null;

  const { data: detail, isLoading, error, refetch } = useStockDetail(
    effectiveSelected?.symbol || "",
    effectiveSelected?.yahooSymbol
  );

  const currency = effectiveSelected?.market === "KR" ? "KRW" : "USD";

  if (symbols.length === 0) {
    return (
      <Card title="종목 상세정보" accent="chart">
        <p className="text-xs text-gray-400 text-center py-4">
          표시할 종목이 없습니다. 국내/해외 주식 위젯에서 종목을 추가하세요.
        </p>
      </Card>
    );
  }

  return (
    <Card title="종목 상세정보" accent="chart">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {symbols.map((s) => (
          <button
            key={s.symbol}
            onClick={() => setSelected(s)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${effectiveSelected?.symbol === s.symbol
                ? s.market === "KR"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-indigo-600 text-white border-indigo-600"
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
            <div className={`text-xl font-bold ${detail.change >= 0 ? "text-up" : "text-down"}`}>
              {formatPrice(detail.price, currency as "KRW" | "USD")}
            </div>
            <PriceChange change={detail.change} changePercent={detail.changePercent} badge />
          </div>

          <div className="space-y-0">
            <DetailRow label="시가" value={formatPrice(detail.open, currency as "KRW" | "USD")} />
            <DetailRow label="고가" value={formatPrice(detail.high, currency as "KRW" | "USD")} />
            <DetailRow label="저가" value={formatPrice(detail.low, currency as "KRW" | "USD")} />
            <DetailRow label="전일종가" value={formatPrice(detail.prevClose, currency as "KRW" | "USD")} />
            <DetailRow label="거래량" value={formatVolume(detail.volume)} />
            {detail.marketCap && (
              <DetailRow label="시가총액" value={formatVolume(detail.marketCap)} />
            )}
          </div>

          <Week52Bar
            current={detail.price}
            low={detail.week52Low}
            high={detail.week52High}
          />
          <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            <span>{formatPrice(detail.week52Low, currency as "KRW" | "USD")}</span>
            <span>{formatPrice(detail.week52High, currency as "KRW" | "USD")}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
