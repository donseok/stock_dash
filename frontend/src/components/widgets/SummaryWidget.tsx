"use client";

import { useMemo } from "react";
import { useDomesticStocks, useForeignStocks, useCryptoQuotes, useMarketIndices } from "@/hooks/useMarketData";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface SummaryCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: "emerald" | "rose" | "amber" | "blue" | "violet";
}

function SummaryCard({ title, value, subtitle, icon, color }: SummaryCardProps) {
    const colorClasses = {
        emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
        rose: "from-rose-500 to-rose-600 shadow-rose-500/25",
        amber: "from-amber-500 to-amber-600 shadow-amber-500/25",
        blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
        violet: "from-violet-500 to-violet-600 shadow-violet-500/25",
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
                {icon}
            </div>
            <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{title}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
                {subtitle && <div className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</div>}
            </div>
        </div>
    );
}

export function SummaryWidget() {
    const { data: domesticStocks } = useDomesticStocks();
    const { data: foreignStocks } = useForeignStocks();
    const { data: cryptoQuotes } = useCryptoQuotes();
    const { data: indices, isLoading } = useMarketIndices();

    const stats = useMemo(() => {
        const allAssets = [
            ...(domesticStocks || []),
            ...(foreignStocks || []),
            ...(cryptoQuotes || []),
        ];

        const gainers = allAssets.filter((a) => a.changePercent > 0);
        const losers = allAssets.filter((a) => a.changePercent < 0);

        const topGainer = allAssets.reduce(
            (max, a) => (a.changePercent > max.changePercent ? a : max),
            { name: "-", changePercent: -Infinity }
        );
        const topLoser = allAssets.reduce(
            (min, a) => (a.changePercent < min.changePercent ? a : min),
            { name: "-", changePercent: Infinity }
        );

        // KOSPI index
        const kospi = indices?.find((i) => i.symbol === "KOSPI");
        const nasdaq = indices?.find((i) => i.symbol === "NASDAQ");

        return {
            gainersCount: gainers.length,
            losersCount: losers.length,
            topGainer: topGainer.name !== "-" ? topGainer : null,
            topLoser: topLoser.name !== "-" ? topLoser : null,
            kospi,
            nasdaq,
            totalAssets: allAssets.length,
        };
    }, [domesticStocks, foreignStocks, cryptoQuotes, indices]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm h-20 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <SummaryCard
                title="상승 종목"
                value={stats.gainersCount}
                subtitle={stats.topGainer ? `Top: ${stats.topGainer.name} +${stats.topGainer.changePercent.toFixed(2)}%` : undefined}
                color="emerald"
                icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                }
            />
            <SummaryCard
                title="하락 종목"
                value={stats.losersCount}
                subtitle={stats.topLoser ? `Top: ${stats.topLoser.name} ${stats.topLoser.changePercent.toFixed(2)}%` : undefined}
                color="rose"
                icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                    </svg>
                }
            />
            <SummaryCard
                title="KOSPI"
                value={stats.kospi ? stats.kospi.value.toLocaleString() : "-"}
                subtitle={stats.kospi ? `${stats.kospi.changePercent >= 0 ? "+" : ""}${stats.kospi.changePercent.toFixed(2)}%` : undefined}
                color="blue"
                icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                }
            />
            <SummaryCard
                title="NASDAQ"
                value={stats.nasdaq ? stats.nasdaq.value.toLocaleString() : "-"}
                subtitle={stats.nasdaq ? `${stats.nasdaq.changePercent >= 0 ? "+" : ""}${stats.nasdaq.changePercent.toFixed(2)}%` : undefined}
                color="violet"
                icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
            />
        </div>
    );
}
