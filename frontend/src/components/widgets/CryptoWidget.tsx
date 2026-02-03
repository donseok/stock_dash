"use client";

import { useState } from "react";
import { useCryptoQuotes, useExchangeRates } from "@/hooks/useMarketData";
import { useTickerSettings } from "@/hooks/useTickerSettings";
import { Card } from "@/components/common/Card";
import { PriceChange } from "@/components/common/PriceChange";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { TickerSettingsModal } from "@/components/common/TickerSettingsModal";
import { formatPrice, formatVolume } from "@/utils/format";

const CRYPTO_ICONS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  SUI: "https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png",
  ONDO: "https://assets.coingecko.com/coins/images/26580/small/ONDO.png",
};

export function CryptoWidget() {
  const { data: quotes, isLoading, error, refetch } = useCryptoQuotes();
  const { data: exchangeRates } = useExchangeRates();
  const { enabledSymbols } = useTickerSettings("crypto");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filtered = quotes?.filter((q) => enabledSymbols.includes(q.symbol));

  // Get USD/KRW rate for conversion
  const usdKrwRate = exchangeRates?.find(
    (r) => r.baseCurrency === "USD" && r.quoteCurrency === "KRW"
  )?.rate || 1450;

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
                <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2 font-medium">종목</th>
                  <th className="text-right py-2 font-medium">현재가</th>
                  <th className="text-right py-2 font-medium">등락률</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">거래량(24h)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => {
                  const usdPrice = q.price / usdKrwRate;
                  return (
                    <tr
                      key={q.symbol}
                      className={`border-b border-gray-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 1 ? "bg-slate-50/50 dark:bg-slate-800/50" : ""
                        }`}
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          {CRYPTO_ICONS[q.symbol] && (
                            <img
                              src={CRYPTO_ICONS[q.symbol]}
                              alt={q.symbol}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{q.symbol}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{q.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right font-mono">
                        <div>{formatPrice(q.price, "KRW")}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formatPrice(usdPrice, "USD")}
                        </div>
                      </td>
                      <td className="text-right">
                        <PriceChange change={q.change} changePercent={q.changePercent} badge />
                      </td>
                      <td className="text-right text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {formatVolume(q.volume24h)}
                      </td>
                    </tr>
                  );
                })}
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
