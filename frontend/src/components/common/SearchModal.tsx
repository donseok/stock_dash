"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SearchItem {
    symbol: string;
    name: string;
    type: "domestic" | "foreign" | "crypto";
}

const ALL_ITEMS: SearchItem[] = [
    { symbol: "058610", name: "에스피지", type: "domestic" },
    { symbol: "247540", name: "에코프로", type: "domestic" },
    { symbol: "068270", name: "셀트리온", type: "domestic" },
    { symbol: "GOOG", name: "Alphabet C", type: "foreign" },
    { symbol: "NVDA", name: "Nvidia", type: "foreign" },
    { symbol: "BTC", name: "비트코인", type: "crypto" },
    { symbol: "ETH", name: "이더리움", type: "crypto" },
    { symbol: "SOL", name: "솔라나", type: "crypto" },
    { symbol: "XRP", name: "리플", type: "crypto" },
    { symbol: "LINK", name: "체인링크", type: "crypto" },
    { symbol: "SUI", name: "수이", type: "crypto" },
    { symbol: "ONDO", name: "온도파이낸스", type: "crypto" },
];

const typeLabels = {
    domestic: { label: "국내", bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    foreign: { label: "해외", bg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    crypto: { label: "암호화폐", bg: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
};

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (item: SearchItem) => void;
}

export function SearchModal({ isOpen, onClose, onSelect }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);

    const filtered = query.trim()
        ? ALL_ITEMS.filter(
            (item) =>
                item.symbol.toLowerCase().includes(query.toLowerCase()) ||
                item.name.toLowerCase().includes(query.toLowerCase())
        )
        : recentSearches.length > 0
            ? recentSearches
            : ALL_ITEMS.slice(0, 5);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery("");
            setSelectedIndex(0);
            const saved = localStorage.getItem("recentSearches");
            if (saved) {
                try {
                    setRecentSearches(JSON.parse(saved));
                } catch {
                    localStorage.removeItem("recentSearches");
                }
            }
        }
    }, [isOpen]);

    const handleSelect = useCallback((item: SearchItem) => {
        // Save to recent searches
        const newRecent = [item, ...recentSearches.filter((r) => r.symbol !== item.symbol)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem("recentSearches", JSON.stringify(newRecent));

        onSelect?.(item);
        onClose();

        // Scroll to the widget section
        const sectionMap: Record<string, string> = {
            domestic: "국내주식",
            foreign: "해외주식",
            crypto: "암호화폐",
        };
        // Simple scroll to top for now
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [onClose, onSelect, recentSearches]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && filtered[selectedIndex]) {
            handleSelect(filtered[selectedIndex]);
        } else if (e.key === "Escape") {
            onClose();
        }
    }, [filtered, selectedIndex, handleSelect, onClose]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="종목명 또는 심볼 검색..."
                        className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    />
                    <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-slate-700 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                    {query.trim() === "" && recentSearches.length > 0 && (
                        <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500">최근 검색</div>
                    )}
                    {filtered.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">
                            검색 결과가 없습니다
                        </div>
                    ) : (
                        <div className="py-2">
                            {filtered.map((item, index) => (
                                <button
                                    key={item.symbol}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${index === selectedIndex ? "bg-primary-50 dark:bg-primary-900/20" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeLabels[item.type].bg}`}>
                                            {typeLabels[item.type].label}
                                        </span>
                                        <div className="text-left">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                            <div className="text-xs text-gray-400">{item.symbol}</div>
                                        </div>
                                    </div>
                                    {index === selectedIndex && (
                                        <kbd className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                            Enter
                                        </kbd>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">↓</kbd>
                            <span>이동</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">Enter</kbd>
                            <span>선택</span>
                        </span>
                    </div>
                    <span>Ctrl+K로 열기</span>
                </div>
            </div>
        </div>
    );
}
