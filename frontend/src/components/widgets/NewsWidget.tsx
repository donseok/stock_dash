"use client";

import { useNews } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { formatDateTime } from "@/utils/format";

export function NewsWidget() {
  const { data: articles, isLoading, error, refetch } = useNews(10);

  return (
    <Card title="뉴스">
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage onRetry={() => refetch()} />}
      {articles && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                {article.title}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{article.source}</span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-400">
                  {formatDateTime(article.publishedAt)}
                </span>
              </div>
              {article.relatedSymbols.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {article.relatedSymbols.slice(0, 3).map((sym) => (
                    <span
                      key={sym}
                      className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded"
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
