"use client";

import { useCryptoQuotes } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatPrice, formatVolume } from "@/utils/format";

export function CryptoWidget() {
  const { data: quotes, isLoading, error, refetch } = useCryptoQuotes();

  return (
    <Card title="암호화폐">
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage onRetry={() => refetch()} />}
      {quotes && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left py-2 font-medium">종목</th>
                <th className="text-right py-2 font-medium">현재가</th>
                <th className="text-right py-2 font-medium">등락률</th>
                <th className="text-right py-2 font-medium hidden sm:table-cell">거래량(24h)</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.symbol} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5">
                    <div className="font-medium text-gray-900">{q.symbol}</div>
                    <div className="text-xs text-gray-400">{q.name}</div>
                  </td>
                  <td className="text-right font-mono">
                    {formatPrice(q.price, q.currency)}
                  </td>
                  <td className="text-right">
                    <PriceChange change={q.change} changePercent={q.changePercent} />
                  </td>
                  <td className="text-right text-gray-500 hidden sm:table-cell">
                    {formatVolume(q.volume24h)}
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
