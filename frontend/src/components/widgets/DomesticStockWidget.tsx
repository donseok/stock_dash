"use client";

import { useState } from "react";
import { useDomesticStocks } from "@/hooks/useMarketData";
import { useTickerSettings } from "@/hooks/useTickerSettings";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { TickerSettingsModal } from "@/components/common/TickerSettingsModal";
import { formatPrice, formatVolume } from "@/utils/format";

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
      <Card title="국내주식" headerRight={settingsButton} accent="domestic">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage onRetry={() => refetch()} />}
        {filtered && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2 font-medium">종목</th>
                  <th className="text-right py-2 font-medium">현재가</th>
                  <th className="text-right py-2 font-medium">등락률</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">거래량</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={s.symbol}
                    className={`border-b border-gray-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 1 ? "bg-slate-50/50 dark:bg-slate-800/50" : ""
                      }`}
                  >
                    <td className="py-2.5">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{s.symbol}</div>
                    </td>
                    <td className="text-right font-mono">
                      {formatPrice(s.price, "KRW")}
                    </td>
                    <td className="text-right">
                      <PriceChange change={s.change} changePercent={s.changePercent} badge />
                    </td>
                    <td className="text-right text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {formatVolume(s.volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                표시할 종목이 없습니다. 설정에서 종목을 추가하세요.
              </p>
            )}
          </div>
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
