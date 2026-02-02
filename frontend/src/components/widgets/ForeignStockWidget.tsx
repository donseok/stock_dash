"use client";

import { useForeignStocks } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatPrice, formatVolume } from "@/utils/format";

export function ForeignStockWidget() {
  const { data: stocks, isLoading, error, refetch } = useForeignStocks();

  return (
    <Card title="해외주식">
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage onRetry={() => refetch()} />}
      {stocks && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left py-2 font-medium">종목</th>
                <th className="text-right py-2 font-medium">현재가</th>
                <th className="text-right py-2 font-medium">등락률</th>
                <th className="text-right py-2 font-medium hidden sm:table-cell">거래량</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <tr key={s.symbol} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.symbol}</div>
                  </td>
                  <td className="text-right font-mono">
                    {formatPrice(s.price, "USD")}
                  </td>
                  <td className="text-right">
                    <PriceChange change={s.change} changePercent={s.changePercent} />
                  </td>
                  <td className="text-right text-gray-500 hidden sm:table-cell">
                    {formatVolume(s.volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
