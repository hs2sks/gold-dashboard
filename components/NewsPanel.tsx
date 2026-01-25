'use client';

import { ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
}

interface NewsPanelProps {
  news: NewsItem[];
  isLoading?: boolean;
}

export function NewsPanel({ news, isLoading = false }: NewsPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">금/은 관련 뉴스</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
              <div className="h-4 w-1/4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">금/은 관련 뉴스</h2>
        <p className="text-muted-foreground">뉴스를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">금/은 관련 뉴스</h2>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium mb-2 line-clamp-2 hover:underline">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">{item.source}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(item.publishedAt), 'PPp', { locale: ko })}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
