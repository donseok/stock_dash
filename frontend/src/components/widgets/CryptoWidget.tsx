"use client";

import { useState } from "react";
import { useCryptoQuotes } from "@/hooks/useMarketData";
import { useTickerSettings } from "@/hooks/useTickerSettings";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { TickerSettingsModal } from "@/components/common/TickerSettingsModal";
import { formatPrice, formatVolume } from "@/utils/format";

export function CryptoWidget() {
  const { data: quotes, isLoading, error, refetch } = useCryptoQuotes();
  const { enabledSymbols } = useTickerSettings("crypto");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filtered = quotes?.filter((q) => enabledSymbols.includes(q.symbol));

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
      <Card title="암호화폐" headerRight={settingsButton} accent="crypto">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage onRetry={() => refetch()} />}
        {filtered && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-200">
                  <th className="text-left py-2 font-medium">종목</th>
                  <th className="text-right py-2 font-medium">현재가</th>
                  <th className="text-right py-2 font-medium">등락률</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">거래량(24h)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => (
                  <tr
                    key={q.symbol}
                    className={`border-b border-gray-50 hover:bg-slate-50 transition-colors ${
                      i % 2 === 1 ? "bg-slate-50/50" : ""
                    }`}
                  >
                    <td className="py-2.5">
                      <div className="font-medium text-gray-900">{q.symbol}</div>
                      <div className="text-xs text-gray-400">{q.name}</div>
                    </td>
                    <td className="text-right font-mono">
                      {formatPrice(q.price, q.currency)}
                    </td>
                    <td className="text-right">
                      <PriceChange change={q.change} changePercent={q.changePercent} badge />
                    </td>
                    <td className="text-right text-gray-500 hidden sm:table-cell">
                      {formatVolume(q.volume24h)}
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
        category="crypto"
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
