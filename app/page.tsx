'use client';

import { KpiCard } from '@/components/KpiCard';
import { NewsPanel } from '@/components/NewsPanel';
import { TradingViewEmbed } from '@/components/TradingViewEmbed';
import { BuyingRecommendation } from '@/components/BuyingRecommendation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  // API 호출 - 12시간마다 갱신
  const { data: metalsData, isLoading: metalsLoading } = useSWR(
    '/api/metals',
    fetcher,
    { refreshInterval: 12 * 60 * 60 * 1000 } // 12시간
  );

  const { data: fxData, isLoading: fxLoading } = useSWR(
    '/api/fx',
    fetcher,
    { refreshInterval: 12 * 60 * 60 * 1000 } // 12시간
  );

  const { data: krxData, isLoading: krxLoading } = useSWR(
    '/api/krx-gold',
    fetcher,
    { refreshInterval: 24 * 60 * 60 * 1000 } // 24시간마다 갱신
  );

  const { data: newsData, isLoading: newsLoading } = useSWR(
    '/api/news',
    fetcher,
    { refreshInterval: 300000 } // 5분마다 갱신
  );

  const { data: recommendationsData, isLoading: recommendationsLoading } = useSWR(
    '/api/recommendations',
    fetcher,
    { refreshInterval: 300000 } // 5분마다 갱신
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">금/은 시세 대시보드</h1>
          <p className="text-muted-foreground">
            실시간 국제 금/은 시세, 국내 시세, 환율 및 관련 뉴스를 확인하세요
          </p>
        </header>

        {/* KPI 카드 그리드 - 6개 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">시세 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              title="국제 금 시세 (XAU/USD)"
              value={metalsData?.gold?.price || 0}
              unit="USD/oz"
              change={metalsData?.gold?.change}
              changePercent={metalsData?.gold?.changePercent}
              isLoading={metalsLoading}
              timestamp={metalsData?.gold?.timestamp}
              refreshInterval="12시간"
              source="Metals API (metals.dev)"
            />
            <KpiCard
              title="국제 은 시세 (XAG/USD)"
              value={metalsData?.silver?.price || 0}
              unit="USD/oz"
              change={metalsData?.silver?.change}
              changePercent={metalsData?.silver?.changePercent}
              isLoading={metalsLoading}
              timestamp={metalsData?.silver?.timestamp}
              refreshInterval="12시간"
              source="Metals API (metals.dev)"
            />
            <KpiCard
              title="원-달러 환율 (USD/KRW)"
              value={fxData?.rate || 0}
              unit="KRW"
              isLoading={fxLoading}
              timestamp={fxData?.timestamp}
              refreshInterval="12시간"
              source="ExchangeRate-API (exchangerate-api.com)"
            />
            <KpiCard
              title="국내 금 시세 (KRX)"
              value={krxData?.gold?.price || 0}
              unit={krxData?.gold?.unit || 'KRW/g'}
              change={krxData?.gold?.change}
              changePercent={krxData?.gold?.changePercent}
              note={krxData?.gold?.note}
              isLoading={krxLoading}
              timestamp={krxData?.gold?.asOf}
              refreshInterval="24시간"
              source="공공데이터포털 (data.go.kr)"
            />
            <KpiCard
              title="국내 은 시세 (KRX)"
              value={krxData?.silver?.price || 0}
              unit={krxData?.silver?.unit || 'KRW/g'}
              change={krxData?.silver?.change}
              changePercent={krxData?.silver?.changePercent}
              note={krxData?.silver?.note}
              isLoading={krxLoading}
              timestamp={krxData?.silver?.asOf}
              refreshInterval="24시간"
              source="공공데이터포털 (data.go.kr)"
            />
            <KpiCard
              title="금/은 비율"
              value={
                metalsData?.gold?.price && metalsData?.silver?.price
                  ? (metalsData.gold.price / metalsData.silver.price).toFixed(2)
                  : 0
              }
              note={
                metalsData?.gold?.price && metalsData?.silver?.price
                  ? (() => {
                      const ratio = metalsData.gold.price / metalsData.silver.price;
                      if (ratio > 80) return '🔵 은 저평가 (역사적 평균 대비 높음)';
                      if (ratio < 60) return '🟡 금 저평가 (역사적 평균 대비 낮음)';
                      return '⚪ 적정 수준 (역사적 평균 범위)';
                    })()
                  : undefined
              }
              isLoading={metalsLoading}
            />
          </div>
        </section>

        {/* TradingView 차트 - 4개 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">차트</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TradingViewEmbed symbol="XAUUSD" title="금 (XAU/USD)" />
            <TradingViewEmbed symbol="XAGUSD" title="은 (XAG/USD)" />
            <TradingViewEmbed symbol="FX_IDC:USDKRW" title="원-달러 환율 (USD/KRW)" />
            <TradingViewEmbed symbol="GC1!" title="금 선물 (Futures)" />
          </div>
        </section>

        {/* 구매 제안 섹션 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">AI 구매 제안</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recommendationsData?.recommendations?.gold && (
              <BuyingRecommendation
                recommendation={recommendationsData.recommendations.gold}
                price={metalsData?.gold?.price || 0}
                isLoading={recommendationsLoading || metalsLoading}
              />
            )}
            {recommendationsData?.recommendations?.silver && (
              <BuyingRecommendation
                recommendation={recommendationsData.recommendations.silver}
                price={metalsData?.silver?.price || 0}
                isLoading={recommendationsLoading || metalsLoading}
              />
            )}
          </div>
          {recommendationsData?.marketContext && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p>
                <strong>금/은 비율:</strong> {recommendationsData.marketContext.goldSilverRatio}
                {' · '}
                <strong>업데이트:</strong>{' '}
                {new Date(recommendationsData.marketContext.timestamp).toLocaleString('ko-KR')}
              </p>
            </div>
          )}
        </section>

        {/* 뉴스 패널 */}
        <section>
          <NewsPanel news={newsData?.news || []} isLoading={newsLoading} />
        </section>
      </div>
    </div>
  );
}
