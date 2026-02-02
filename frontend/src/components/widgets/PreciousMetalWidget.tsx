"use client";

import { usePreciousMetals } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatPrice } from "@/utils/format";

const metalNames: Record<string, string> = {
  gold: "금 (Gold)",
  silver: "은 (Silver)",
};

export function PreciousMetalWidget() {
  const { data: metals, isLoading, error, refetch } = usePreciousMetals();

  return (
    <Card title="귀금속 시세">
      {isLoading && <LoadingSpinner size="sm" />}
      {error && <ErrorMessage onRetry={() => refetch()} />}
      {metals && (
        <div className="space-y-3">
          {metals.map((m) => (
            <div
              key={m.metal}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {metalNames[m.metal] || m.metal}
                </div>
                <div className="text-xs text-gray-400">
                  {formatPrice(m.pricePerGram, "USD")}/g
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-medium">
                  {formatPrice(m.pricePerOz, "USD")}/oz
                </div>
                <PriceChange
                  change={m.change}
                  changePercent={m.changePercent}
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
