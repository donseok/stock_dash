"use client";

import { useNews } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatDateTime } from "@/utils/format";

const categoryColors: Record<string, string> = {
  stock: "bg-emerald-50 text-emerald-700",
  crypto: "bg-violet-50 text-violet-700",
  commodity: "bg-amber-50 text-amber-700",
  market: "bg-blue-50 text-blue-700",
  forex: "bg-cyan-50 text-cyan-700",
  business: "bg-slate-100 text-slate-600",
};

export function NewsWidget() {
  const { data: articles, isLoading, error, refetch } = useNews(10);

  return (
    <Card title="뉴스" accent="news">
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage onRetry={() => refetch()} />}
      {articles && (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                {article.title}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {article.category && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[article.category] || categoryColors.business}`}>
                    {article.category}
                  </span>
                )}
                <span className="text-[11px] text-gray-500 font-medium">{article.source}</span>
                <span className="text-[11px] text-gray-300">|</span>
                <span className="text-[11px] text-gray-400">
                  {formatDateTime(article.publishedAt)}
                </span>
              </div>
              {article.relatedSymbols.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {article.relatedSymbols.slice(0, 3).map((sym) => (
                    <span
                      key={sym}
                      className="text-[10px] px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded font-mono"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
