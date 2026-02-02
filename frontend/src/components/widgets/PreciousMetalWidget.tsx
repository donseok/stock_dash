"use client";

import { usePreciousMetals } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatPrice } from "@/utils/format";

const metalConfig: Record<string, { name: string; color: string; bg: string }> = {
  gold: { name: "금 (Gold)", color: "text-amber-600", bg: "from-amber-50/60 to-slate-50" },
  silver: { name: "은 (Silver)", color: "text-slate-500", bg: "from-slate-100/60 to-slate-50" },
};

export function PreciousMetalWidget() {
  const { data: metals, isLoading, error, refetch } = usePreciousMetals();

  return (
    <Card title="귀금속 시세" accent="gold">
      {isLoading && <LoadingSpinner size="sm" />}
      {error && <ErrorMessage onRetry={() => refetch()} />}
      {metals && (
        <div className="space-y-2.5">
          {metals.map((m) => {
            const config = metalConfig[m.metal] || { name: m.metal, color: "text-gray-600", bg: "from-gray-50 to-slate-50" };
            return (
              <div
                key={m.metal}
                className={`flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r ${config.bg} border border-amber-100/40`}
              >
                <div>
                  <div className={`text-sm font-medium ${config.color}`}>
                    {config.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatPrice(m.pricePerGram, "USD")}/g
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-semibold text-gray-900">
                    {formatPrice(m.pricePerOz, "USD")}/oz
                  </div>
                  <PriceChange
                    change={m.change}
                    changePercent={m.changePercent}
                    className="text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
