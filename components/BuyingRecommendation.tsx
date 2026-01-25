'use client';

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Minus } from 'lucide-react';

interface TechnicalSignals {
  trend: 'bullish' | 'bearish' | 'neutral';
  momentum: 'strong' | 'moderate' | 'weak';
  volatility: 'high' | 'medium' | 'low';
}

interface Recommendation {
  metal: 'gold' | 'silver';
  action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reasons: string[];
  technicalSignals: TechnicalSignals;
}

interface BuyingRecommendationProps {
  recommendation: Recommendation;
  price: number;
  isLoading?: boolean;
}

const actionConfig = {
  strong_buy: {
    label: '적극 매수',
    color: 'text-green-700 bg-green-50 border-green-200',
    icon: TrendingUp,
    description: '현재 매수 적기로 판단됩니다',
  },
  buy: {
    label: '매수',
    color: 'text-green-600 bg-green-50 border-green-100',
    icon: TrendingUp,
    description: '매수를 고려할 만한 시점입니다',
  },
  hold: {
    label: '보유',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    icon: Minus,
    description: '관망하는 것이 좋습니다',
  },
  sell: {
    label: '매도',
    color: 'text-red-600 bg-red-50 border-red-100',
    icon: TrendingDown,
    description: '매도를 고려할 시점입니다',
  },
  strong_sell: {
    label: '적극 매도',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: TrendingDown,
    description: '매도 권장 시점입니다',
  },
};

const trendConfig = {
  bullish: { label: '상승', color: 'text-green-600' },
  bearish: { label: '하락', color: 'text-red-600' },
  neutral: { label: '중립', color: 'text-gray-600' },
};

const momentumConfig = {
  strong: { label: '강함', color: 'text-blue-600' },
  moderate: { label: '보통', color: 'text-blue-500' },
  weak: { label: '약함', color: 'text-gray-500' },
};

const volatilityConfig = {
  high: { label: '높음', color: 'text-orange-600' },
  medium: { label: '보통', color: 'text-yellow-600' },
  low: { label: '낮음', color: 'text-green-600' },
};

export function BuyingRecommendation({
  recommendation,
  price,
  isLoading = false,
}: BuyingRecommendationProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const config = actionConfig[recommendation.action];
  const Icon = config.icon;
  const metalName = recommendation.metal === 'gold' ? '금' : '은';

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{metalName} 구매 제안</h3>
        <span className="text-sm text-muted-foreground">
          현재가: ${price.toLocaleString()}
        </span>
      </div>

      {/* 주요 제안 */}
      <div
        className={`rounded-lg border p-4 mb-4 ${config.color}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-6 h-6" />
          <span className="text-xl font-bold">{config.label}</span>
          <span className="ml-auto text-sm font-medium">
            신뢰도: {recommendation.confidence}%
          </span>
        </div>
        <p className="text-sm">{config.description}</p>
      </div>

      {/* 기술적 지표 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">추세</p>
          <p
            className={`text-sm font-semibold ${
              trendConfig[recommendation.technicalSignals.trend].color
            }`}
          >
            {trendConfig[recommendation.technicalSignals.trend].label}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">모멘텀</p>
          <p
            className={`text-sm font-semibold ${
              momentumConfig[recommendation.technicalSignals.momentum].color
            }`}
          >
            {momentumConfig[recommendation.technicalSignals.momentum].label}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">변동성</p>
          <p
            className={`text-sm font-semibold ${
              volatilityConfig[recommendation.technicalSignals.volatility].color
            }`}
          >
            {volatilityConfig[recommendation.technicalSignals.volatility].label}
          </p>
        </div>
      </div>

      {/* 분석 이유 */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">
          분석 근거:
        </h4>
        <ul className="space-y-2">
          {recommendation.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 경고 */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            이 제안은 기술적 분석에 기반한 참고용이며, 투자 조언이 아닙니다.
            실제 투자 시 전문가와 상담하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}
