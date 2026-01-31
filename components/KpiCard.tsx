'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changePercent?: number;
  note?: string;
  isLoading?: boolean;
  timestamp?: string;
  refreshInterval?: string;
  source?: string;
}

export function KpiCard({
  title,
  value,
  unit,
  change,
  changePercent,
  note,
  isLoading = false,
  timestamp,
  refreshInterval,
  source,
}: KpiCardProps) {
  const isPositive = (change ?? 0) >= 0;

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-muted rounded mb-4"></div>
          <div className="h-8 w-32 bg-muted rounded mb-2"></div>
          <div className="h-4 w-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </h3>
        {note && (
          <p className="text-xs text-muted-foreground mb-2">{note}</p>
        )}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
        {(change !== undefined || changePercent !== undefined) && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {change !== undefined && (
              <span>
                {isPositive ? '+' : ''}
                {change.toLocaleString()}
              </span>
            )}
            {changePercent !== undefined && (
              <span>({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
            )}
          </div>
        )}
        {source && (
          <p className="text-xs text-muted-foreground mt-2">
            📊 출처: {source}
          </p>
        )}
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-1">
            📅 업데이트: {(() => {
              const date = new Date(timestamp);
              // 이미 한국 시간으로 변환된 경우 그대로 사용, 아니면 변환
              const koreaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
              
              // 실제 갱신 시간 표시 (아침 8시/저녁 8시로 고정하지 않음)
              return koreaTime.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
            })()}
            {refreshInterval && <span className="ml-2">({refreshInterval}마다 갱신)</span>}
          </p>
        )}
      </div>
    </div>
  );
}
