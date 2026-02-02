"use client";

import { useMemo, useState, useEffect } from "react";
import { useDomesticStocks, useForeignStocks, useCryptoQuotes } from "@/hooks/useMarketData";

interface AlertItem {
    symbol: string;
    name: string;
    changePercent: number;
    type: "domestic" | "foreign" | "crypto";
}

export function AlertBanner() {
    const { data: domesticStocks } = useDomesticStocks();
    const { data: foreignStocks } = useForeignStocks();
    const { data: cryptoQuotes } = useCryptoQuotes();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const significantChanges = useMemo(() => {
        const items: AlertItem[] = [];

        domesticStocks?.forEach((s) => {
            if (Math.abs(s.changePercent) >= 3) {
                items.push({ symbol: s.symbol, name: s.name, changePercent: s.changePercent, type: "domestic" });
            }
        });

        foreignStocks?.forEach((s) => {
            if (Math.abs(s.changePercent) >= 3) {
                items.push({ symbol: s.symbol, name: s.name, changePercent: s.changePercent, type: "foreign" });
            }
        });

        cryptoQuotes?.forEach((q) => {
            if (Math.abs(q.changePercent) >= 5) {
                items.push({ symbol: q.symbol, name: q.name, changePercent: q.changePercent, type: "crypto" });
            }
        });

        return items.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    }, [domesticStocks, foreignStocks, cryptoQuotes]);

    useEffect(() => {
        if (significantChanges.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % significantChanges.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [significantChanges.length]);

    if (!isVisible || significantChanges.length === 0) {
        return null;
    }

    const current = significantChanges[currentIndex];
    const isUp = current.changePercent > 0;

    const typeLabels = {
        domestic: "국내",
        foreign: "해외",
        crypto: "암호화폐",
    };

    return (
        <div
            className={`relative overflow-hidden animate-slide-in ${isUp
                    ? "bg-gradient-to-r from-red-500 to-rose-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
        >
            <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isUp ? "bg-white/20" : "bg-white/20"
                        }`}>
                        {isUp ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex items-center gap-2 text-white">
                        <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded font-medium">
                            {typeLabels[current.type]}
                        </span>
                        <span className="font-semibold">{current.name}</span>
                        <span className="text-sm opacity-75">({current.symbol})</span>
                        <span className="font-bold">
                            {isUp ? "+" : ""}{current.changePercent.toFixed(2)}%
                        </span>
                    </div>

                    {/* Pagination */}
                    {significantChanges.length > 1 && (
                        <div className="flex items-center gap-1 ml-4">
                            {significantChanges.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? "bg-white" : "bg-white/40"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/70 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
