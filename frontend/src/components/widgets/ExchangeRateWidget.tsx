"use client";

import { useExchangeRates } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatNumber } from "@/utils/format";

export function ExchangeRateWidget() {
  const { data: rates, isLoading, error, refetch } = useExchangeRates();

  return (
    <Card title="환율">
      {isLoading && <LoadingSpinner size="sm" />}
      {error && <ErrorMessage onRetry={() => refetch()} />}
      {rates && (
        <div className="space-y-3">
          {rates.map((r) => (
            <div
              key={`${r.baseCurrency}/${r.quoteCurrency}`}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <div className="text-sm font-medium text-gray-900">
                {r.baseCurrency}/{r.quoteCurrency}
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-medium">
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
