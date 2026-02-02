"use client";

import { useMemo } from "react";
import { useDomesticStocks, useForeignStocks, useCryptoQuotes } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface HeatmapItem {
    symbol: string;
    name: string;
    changePercent: number;
    type: "domestic" | "foreign" | "crypto";
}

function getColorByChange(changePercent: number): string {
    if (changePercent >= 5) return "bg-red-600 dark:bg-red-500";
    if (changePercent >= 3) return "bg-red-500 dark:bg-red-400";
    if (changePercent >= 1) return "bg-red-400 dark:bg-red-300";
    if (changePercent > 0) return "bg-red-300 dark:bg-red-200";
    if (changePercent === 0) return "bg-gray-300 dark:bg-gray-600";
    if (changePercent > -1) return "bg-blue-300 dark:bg-blue-200";
    if (changePercent > -3) return "bg-blue-400 dark:bg-blue-300";
    if (changePercent > -5) return "bg-blue-500 dark:bg-blue-400";
    return "bg-blue-600 dark:bg-blue-500";
}

function getTextColorByChange(changePercent: number): string {
    if (Math.abs(changePercent) >= 3) return "text-white";
    if (Math.abs(changePercent) >= 1) return "text-white dark:text-gray-900";
    return "text-gray-700 dark:text-gray-300";
}

export function HeatmapWidget() {
    const { data: domesticStocks, isLoading: loadingDomestic } = useDomesticStocks();
    const { data: foreignStocks, isLoading: loadingForeign } = useForeignStocks();
    const { data: cryptoQuotes, isLoading: loadingCrypto } = useCryptoQuotes();

    const isLoading = loadingDomestic || loadingForeign || loadingCrypto;

    const items = useMemo((): HeatmapItem[] => {
        const result: HeatmapItem[] = [];

        domesticStocks?.forEach((s) => {
            result.push({
                symbol: s.symbol,
                name: s.name,
                changePercent: s.changePercent,
                type: "domestic",
            });
        });

        foreignStocks?.forEach((s) => {
            result.push({
                symbol: s.symbol,
                name: s.name,
                changePercent: s.changePercent,
                type: "foreign",
            });
        });

        cryptoQuotes?.forEach((q) => {
            result.push({
                symbol: q.symbol,
                name: q.name,
                changePercent: q.changePercent,
                type: "crypto",
            });
        });

        return result.sort((a, b) => b.changePercent - a.changePercent);
    }, [domesticStocks, foreignStocks, cryptoQuotes]);

    const typeLabels = {
        domestic: "KR",
        foreign: "US",
        crypto: "₿",
    };

    return (
        <Card title="시장 히트맵" accent="chart">
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-2 mb-4 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">하락</span>
                        <div className="flex gap-0.5">
                            <div className="w-4 h-3 bg-blue-600 dark:bg-blue-500 rounded-sm" />
                            <div className="w-4 h-3 bg-blue-400 dark:bg-blue-300 rounded-sm" />
                            <div className="w-4 h-3 bg-blue-300 dark:bg-blue-200 rounded-sm" />
                            <div className="w-4 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm" />
                            <div className="w-4 h-3 bg-red-300 dark:bg-red-200 rounded-sm" />
                            <div className="w-4 h-3 bg-red-400 dark:bg-red-300 rounded-sm" />
                            <div className="w-4 h-3 bg-red-600 dark:bg-red-500 rounded-sm" />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">상승</span>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
                        {items.map((item) => (
                            <div
                                key={`${item.type}-${item.symbol}`}
                                className={`relative p-2 rounded-lg ${getColorByChange(item.changePercent)} transition-all hover:scale-105 hover:z-10 cursor-pointer group`}
                            >
                                <div className={`text-xs font-bold ${getTextColorByChange(item.changePercent)} truncate`}>
                                    {item.name}
                                </div>
                                <div className={`text-[10px] ${getTextColorByChange(item.changePercent)} opacity-75`}>
                                    {typeLabels[item.type]} · {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                                </div>

                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-gray-300">{item.symbol}</div>
                                    <div className={item.changePercent >= 0 ? "text-red-400" : "text-blue-400"}>
                                        {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {items.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            데이터를 불러오는 중...
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
