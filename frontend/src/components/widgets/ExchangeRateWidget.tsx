"use client";

import { useExchangeRates } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatNumber } from "@/utils/format";

const currencyFlags: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  JPY: "\u00A5",
  CNY: "\u00A5",
  GBP: "\u00A3",
  KRW: "\u20A9",
};

export function ExchangeRateWidget() {
  const { data: rates, isLoading, error, refetch } = useExchangeRates();

  return (
    <Card title="환율" accent="forex">
      {isLoading && <LoadingSpinner size="sm" />}
      {error && <ErrorMessage onRetry={() => refetch()} />}
      {rates && (
        <div className="space-y-2.5">
          {rates.map((r) => (
            <div
              key={`${r.baseCurrency}/${r.quoteCurrency}`}
              className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-cyan-50/50 to-slate-50 border border-cyan-100/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-mono text-cyan-600">
                  {currencyFlags[r.baseCurrency] || r.baseCurrency}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {r.baseCurrency}/{r.quoteCurrency}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-semibold text-gray-900">
                  {formatNumber(r.rate, 2)}
                </div>
                <PriceChange
                  change={r.change}
                  changePercent={r.changePercent}
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
