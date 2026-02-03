"use client";

import { useState, useEffect, useRef } from "react";
import { useTickerSettings, WidgetCategory } from "@/hooks/useTickerSettings";
import { useStockSearch } from "@/hooks/useMarketData";
import type { StockSearchResult } from "@/types/market";

interface TickerSettingsModalProps {
  category: WidgetCategory;
  isOpen: boolean;
  onClose: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function TickerSettingsModal({
  category,
  isOpen,
  onClose,
}: TickerSettingsModalProps) {
  const {
    allTickers,
    enabledSymbols,
    toggleSymbol,
    addCustomStock,
    removeCustomStock,
    resetToDefaults,
  } = useTickerSettings(category);

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const isCrypto = category === "crypto";
  const marketFilter = category === "domestic" ? "KR" : category === "foreign" ? "US" : null;

  const { data: searchResults, isLoading: isSearching } = useStockSearch(
    debouncedQuery,
    !isCrypto && debouncedQuery.length > 0
  );

  const filteredResults = searchResults?.filter((r) => {
    if (!marketFilter) return true;
    return r.market === marketFilter;
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search on modal close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setShowResults(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const title =
    category === "domestic"
      ? "국내주식 종목 설정"
      : category === "foreign"
      ? "해외주식 종목 설정"
      : "암호화폐 종목 설정";

  const handleAddStock = (result: StockSearchResult) => {
    addCustomStock(result);
    setSearchQuery("");
    setShowResults(false);
  };

  const existingSymbols = new Set(allTickers.map((t) => t.symbol));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg w-80 p-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Search Input (hide for crypto) */}
        {!isCrypto && (
          <div ref={searchRef} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder={category === "domestic" ? "종목코드 검색 (예: 005930)" : "Search stocks (e.g., AAPL)"}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-slate-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {/* Search Results Dropdown */}
            {showResults && debouncedQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                {isSearching && (
                  <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                    검색 중...
                  </div>
                )}
                {!isSearching && filteredResults?.length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                    검색 결과가 없습니다
                  </div>
                )}
                {!isSearching &&
                  filteredResults?.map((r) => {
                    const alreadyAdded = existingSymbols.has(r.symbol);
                    return (
                      <div
                        key={r.yahooSymbol}
                        className={`px-3 py-2 flex items-center justify-between ${
                          alreadyAdded
                            ? "opacity-50"
                            : "hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer"
                        }`}
                        onClick={() => !alreadyAdded && handleAddStock(r)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                            {r.name}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {r.symbol} · {r.exchange}
                          </div>
                        </div>
                        {alreadyAdded ? (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                            추가됨
                          </span>
                        ) : (
                          <button
                            className="ml-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-lg font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddStock(r);
                            }}
                          >
                            +
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Ticker List */}
        <div className="space-y-2 mb-4 overflow-y-auto flex-1">
          {allTickers.map((t) => (
            <label
              key={t.symbol}
              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={enabledSymbols.includes(t.symbol)}
                onChange={() => toggleSymbol(t.symbol)}
                className="rounded border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 dark:focus:ring-slate-500 bg-white dark:bg-slate-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex-1">
                {t.name}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t.symbol}
              </span>
              {!t.isDefault && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeCustomStock(t.symbol);
                  }}
                  className="ml-1 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-sm font-bold"
                  title="종목 삭제"
                >
                  &times;
                </button>
              )}
            </label>
          ))}
        </div>

        <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={resetToDefaults}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs bg-gray-900 dark:bg-slate-600 text-white rounded hover:bg-gray-800 dark:hover:bg-slate-500"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
