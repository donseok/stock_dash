"use client";

import { useTickerSettings, WidgetCategory } from "@/hooks/useTickerSettings";

interface TickerSettingsModalProps {
  category: WidgetCategory;
  isOpen: boolean;
  onClose: () => void;
}

export function TickerSettingsModal({
  category,
  isOpen,
  onClose,
}: TickerSettingsModalProps) {
  const { allTickers, enabledSymbols, toggleSymbol, resetToDefaults } =
    useTickerSettings(category);

  if (!isOpen) return null;

  const title =
    category === "domestic"
      ? "국내주식 종목 설정"
      : category === "foreign"
      ? "해외주식 종목 설정"
      : "암호화폐 종목 설정";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {allTickers.map((t) => (
            <label
              key={t.symbol}
              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={enabledSymbols.includes(t.symbol)}
                onChange={() => toggleSymbol(t.symbol)}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">{t.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{t.symbol}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={resetToDefaults}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
