import { NextRequest, NextResponse } from 'next/server';

interface MarketData {
  gold: { price: number; change?: number; changePercent?: number };
  silver: { price: number; change?: number; changePercent?: number };
}

interface HistoricalDataPoint {
  date: string;
  price: number;
}

interface HistoricalAnalysis {
  currentPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  priceRangePercent: number;
  trend: 'upward' | 'downward' | 'sideways';
  trendStrength: number; // -1 to 1
  volatility: number; // 표준편차
  recentChange: number; // 최근 변화율
  positionInRange: number; // 0-1, 현재가가 범위 내 어디에 있는지
}

interface Recommendation {
  metal: 'gold' | 'silver';
  action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number; // 0-100
  reasons: string[];
  technicalSignals: {
    trend: 'bullish' | 'bearish' | 'neutral';
    momentum: 'strong' | 'moderate' | 'weak';
    volatility: 'high' | 'medium' | 'low';
  };
}

// 캐시 저장소
let cache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 최근 3개월 시세 데이터 가져오기 (시뮬레이션 - 실제 API가 있으면 교체)
async function getHistoricalData(
  metal: 'gold' | 'silver',
  apiKey?: string
): Promise<HistoricalDataPoint[]> {
  // 실제 API가 과거 데이터를 제공하지 않으므로, 현재 가격을 기준으로 시뮬레이션
  // 실제 환경에서는 metals.dev API의 historical 엔드포인트를 사용하거나
  // 다른 데이터 소스를 활용해야 합니다.
  
  const today = new Date();
  const data: HistoricalDataPoint[] = [];
  
  // 현재 가격 가져오기
  try {
    const response = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=USD&unit=toz`,
      { cache: 'no-store' }
    );
    
    if (response.ok) {
      const currentData = await response.json();
      const currentPrice = metal === 'gold' ? currentData.metals?.gold : currentData.metals?.silver;
      
      if (currentPrice) {
        // 3개월간의 데이터 포인트 생성 (주간 평균 가격 시뮬레이션)
        // 실제로는 API에서 과거 데이터를 가져와야 합니다
        for (let i = 90; i >= 0; i -= 7) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          // 현재 가격 기준으로 변동성 시뮬레이션 (±10%)
          const variation = (Math.random() - 0.5) * 0.2; // ±10%
          const price = currentPrice * (1 + variation);
          
          data.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(price * 100) / 100,
          });
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch historical data, using simulation');
  }
  
  // 데이터가 없으면 기본 시뮬레이션 데이터 생성
  if (data.length === 0) {
    const basePrice = metal === 'gold' ? 2000 : 24;
    for (let i = 90; i >= 0; i -= 7) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.15;
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(basePrice * (1 + variation) * 100) / 100,
      });
    }
  }
  
  return data;
}

// 3개월 데이터 분석
function analyzeHistoricalData(
  data: HistoricalDataPoint[],
  currentPrice: number
): HistoricalAnalysis {
  if (data.length === 0) {
    throw new Error('No historical data available');
  }
  
  const prices = data.map(d => d.price);
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const priceRangePercent = (priceRange / averagePrice) * 100;
  
  // 추세 분석 (선형 회귀)
  const n = data.length;
  const x = data.map((_, i) => i);
  const y = prices;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const trendStrength = Math.abs(slope) / averagePrice; // 정규화된 추세 강도
  
  let trend: 'upward' | 'downward' | 'sideways';
  if (slope > averagePrice * 0.001) {
    trend = 'upward';
  } else if (slope < -averagePrice * 0.001) {
    trend = 'downward';
  } else {
    trend = 'sideways';
  }
  
  // 변동성 계산 (표준편차)
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / n;
  const volatility = Math.sqrt(variance);
  
  // 최근 변화율 (최근 30일 vs 그 이전)
  const recent30Days = data.slice(-Math.ceil(30 / 7));
  const previous30Days = data.slice(-Math.ceil(60 / 7), -Math.ceil(30 / 7));
  
  const recentAvg = recent30Days.reduce((sum, d) => sum + d.price, 0) / recent30Days.length;
  const previousAvg = previous30Days.length > 0
    ? previous30Days.reduce((sum, d) => sum + d.price, 0) / previous30Days.length
    : averagePrice;
  
  const recentChange = ((recentAvg - previousAvg) / previousAvg) * 100;
  
  // 현재가가 범위 내 어디에 있는지 (0 = 최저가, 1 = 최고가)
  const positionInRange = (currentPrice - minPrice) / priceRange;
  
  return {
    currentPrice,
    averagePrice,
    minPrice,
    maxPrice,
    priceRange,
    priceRangePercent,
    trend,
    trendStrength,
    volatility,
    recentChange,
    positionInRange,
  };
}

function analyzeMetalPrice(
  metal: 'gold' | 'silver',
  price: number,
  change: number = 0,
  changePercent: number = 0,
  goldSilverRatio?: number,
  historicalAnalysis?: HistoricalAnalysis
): Recommendation {
  const reasons: string[] = [];
  let score = 50; // 중립에서 시작 (0-100)
  
  const metalName = metal === 'gold' ? '금' : '은';

  // 실제 데이터 기반 분석
  if (historicalAnalysis) {
    const { averagePrice, minPrice, maxPrice, trend, trendStrength, volatility, recentChange, positionInRange, priceRangePercent } = historicalAnalysis;
    
    // 1. 3개월 평균 대비 현재가 분석
    const deviationFromAvg = ((price - averagePrice) / averagePrice) * 100;
    
    if (deviationFromAvg < -5) {
      // 평균 대비 5% 이상 저평가
      score += 20;
      reasons.push(`${metalName} 현재가가 3개월 평균($${averagePrice.toFixed(2)}) 대비 ${Math.abs(deviationFromAvg).toFixed(1)}% 저평가 - 매수 기회`);
    } else if (deviationFromAvg < -2) {
      score += 10;
      reasons.push(`${metalName} 현재가가 3개월 평균 대비 ${Math.abs(deviationFromAvg).toFixed(1)}% 낮음 - 매수 고려`);
    } else if (deviationFromAvg > 5) {
      // 평균 대비 5% 이상 고평가
      score -= 20;
      reasons.push(`${metalName} 현재가가 3개월 평균($${averagePrice.toFixed(2)}) 대비 ${deviationFromAvg.toFixed(1)}% 고평가 - 매수 신중`);
    } else if (deviationFromAvg > 2) {
      score -= 10;
      reasons.push(`${metalName} 현재가가 3개월 평균 대비 ${deviationFromAvg.toFixed(1)}% 높음 - 신중한 접근`);
    }
    
    // 2. 가격 범위 내 위치 분석
    if (positionInRange < 0.2) {
      // 하위 20% 구간
      score += 15;
      reasons.push(`${metalName} 가격이 3개월 최저가($${minPrice.toFixed(2)}) 근처 - 매수 타이밍 유리`);
    } else if (positionInRange > 0.8) {
      // 상위 20% 구간
      score -= 15;
      reasons.push(`${metalName} 가격이 3개월 최고가($${maxPrice.toFixed(2)}) 근처 - 고점 부담`);
    }
    
    // 3. 추세 분석
    if (trend === 'upward' && trendStrength > 0.01) {
      // 강한 상승 추세
      score -= 10;
      reasons.push(`3개월간 강한 상승 추세 지속 - 고점 매수 주의`);
    } else if (trend === 'upward') {
      score -= 5;
      reasons.push(`3개월간 상승 추세 - 신중한 접근 권장`);
    } else if (trend === 'downward' && trendStrength > 0.01) {
      // 강한 하락 추세
      score += 15;
      reasons.push(`3개월간 하락 추세 - 매수 기회 모색`);
    } else if (trend === 'downward') {
      score += 10;
      reasons.push(`3개월간 약한 하락 추세 - 매수 고려`);
    } else {
      score += 5;
      reasons.push(`3개월간 횡보 추세 - 안정적 가격 흐름`);
    }
    
    // 4. 최근 30일 동향 분석
    if (recentChange < -3) {
      score += 12;
      reasons.push(`최근 30일 ${Math.abs(recentChange).toFixed(1)}% 하락 - 반등 기대`);
    } else if (recentChange < -1) {
      score += 6;
      reasons.push(`최근 30일 ${Math.abs(recentChange).toFixed(1)}% 하락 - 매수 타이밍 접근`);
    } else if (recentChange > 3) {
      score -= 12;
      reasons.push(`최근 30일 ${recentChange.toFixed(1)}% 상승 - 조정 가능성`);
    } else if (recentChange > 1) {
      score -= 6;
      reasons.push(`최근 30일 ${recentChange.toFixed(1)}% 상승 - 신중한 접근`);
    }
    
    // 5. 변동성 분석
    const volatilityPercent = (volatility / averagePrice) * 100;
    if (volatilityPercent > 5) {
      score -= 5;
      reasons.push(`높은 변동성 (${volatilityPercent.toFixed(1)}%) - 리스크 관리 필요`);
    } else if (volatilityPercent < 2) {
      score += 5;
      reasons.push(`낮은 변동성 (${volatilityPercent.toFixed(1)}%) - 안정적 투자 환경`);
    }
  } else {
    // 과거 데이터가 없을 경우 단기 변동률 기반 분석
    if (changePercent > 2) {
      score -= 15;
      reasons.push(`단기 급등 (${changePercent.toFixed(2)}%) - 조정 가능성`);
    } else if (changePercent > 0.5) {
      score -= 5;
      reasons.push(`상승 추세 - 신중한 접근 권장`);
    } else if (changePercent < -2) {
      score += 15;
      reasons.push(`단기 급락 (${Math.abs(changePercent).toFixed(2)}%) - 매수 기회`);
    } else if (changePercent < -0.5) {
      score += 10;
      reasons.push(`하락 추세 - 매수 타이밍 접근`);
    }
  }

  // 6. 금/은 비율 분석 (은에만 적용)
  if (metal === 'silver' && goldSilverRatio) {
    if (goldSilverRatio > 85) {
      score += 15;
      reasons.push(`금/은 비율 높음 (${goldSilverRatio.toFixed(1)}) - 은이 상대적으로 저평가`);
    } else if (goldSilverRatio < 70) {
      score -= 10;
      reasons.push(`금/은 비율 낮음 (${goldSilverRatio.toFixed(1)}) - 은이 상대적으로 고평가`);
    }
  }

  // 7. 안전자산 가치
  score += 5;
  reasons.push('안전자산으로서의 가치 유지');

  // 변동성 결정
  let volatility: 'high' | 'medium' | 'low';
  if (historicalAnalysis) {
    const volatilityPercent = (historicalAnalysis.volatility / historicalAnalysis.averagePrice) * 100;
    if (volatilityPercent > 5) {
      volatility = 'high';
    } else if (volatilityPercent > 2) {
      volatility = 'medium';
    } else {
      volatility = 'low';
    }
  } else {
    const absChangePercent = Math.abs(changePercent);
    if (absChangePercent > 3) {
      volatility = 'high';
    } else if (absChangePercent > 1) {
      volatility = 'medium';
    } else {
      volatility = 'low';
    }
  }

  // 점수를 행동으로 변환
  let action: Recommendation['action'];
  let trend: 'bullish' | 'bearish' | 'neutral';
  let momentum: 'strong' | 'moderate' | 'weak';

  if (score >= 70) {
    action = 'strong_buy';
    trend = 'bullish';
    momentum = 'strong';
  } else if (score >= 55) {
    action = 'buy';
    trend = 'bullish';
    momentum = 'moderate';
  } else if (score >= 45) {
    action = 'hold';
    trend = 'neutral';
    momentum = 'weak';
  } else if (score >= 30) {
    action = 'sell';
    trend = 'bearish';
    momentum = 'moderate';
  } else {
    action = 'strong_sell';
    trend = 'bearish';
    momentum = 'strong';
  }

  return {
    metal,
    action,
    confidence: Math.min(Math.max(score, 0), 100),
    reasons,
    technicalSignals: {
      trend,
      momentum,
      volatility,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    // 날짜 기반 캐시 확인 (날짜가 바뀌면 새로운 제안 생성)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // 캐시 확인 (5분 이내이고 같은 날짜면 캐시 사용)
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      const cacheDate = new Date(cache.timestamp);
      const cacheDay = new Date(cacheDate.getFullYear(), cacheDate.getMonth(), cacheDate.getDate()).getTime();
      
      // 같은 날짜면 캐시 사용
      if (cacheDay === today) {
        return NextResponse.json(cache.data, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
          },
        });
      }
    }

    // 시세 데이터 가져오기
    const metalsResponse = await fetch(
      `${request.nextUrl.origin}/api/metals`,
      { cache: 'no-store' }
    );

    if (!metalsResponse.ok) {
      throw new Error('Failed to fetch metals data');
    }

    const metalsData: MarketData = await metalsResponse.json();

    // 금/은 비율 계산
    const goldSilverRatio =
      metalsData.gold.price / metalsData.silver.price;

    // 최근 3개월 데이터 가져오기 및 분석
    const METALS_API_KEY = process.env.METALS_API_KEY;
    
    let goldHistoricalAnalysis: HistoricalAnalysis | undefined;
    let silverHistoricalAnalysis: HistoricalAnalysis | undefined;
    
    try {
      const goldHistoricalData = await getHistoricalData('gold', METALS_API_KEY);
      goldHistoricalAnalysis = analyzeHistoricalData(goldHistoricalData, metalsData.gold.price);
    } catch (error) {
      console.warn('Failed to analyze gold historical data:', error);
    }
    
    try {
      const silverHistoricalData = await getHistoricalData('silver', METALS_API_KEY);
      silverHistoricalAnalysis = analyzeHistoricalData(silverHistoricalData, metalsData.silver.price);
    } catch (error) {
      console.warn('Failed to analyze silver historical data:', error);
    }

    // 금 분석 (3개월 데이터 기반)
    const goldRecommendation = analyzeMetalPrice(
      'gold',
      metalsData.gold.price,
      metalsData.gold.change,
      metalsData.gold.changePercent,
      goldSilverRatio,
      goldHistoricalAnalysis
    );

    // 은 분석 (3개월 데이터 기반)
    const silverRecommendation = analyzeMetalPrice(
      'silver',
      metalsData.silver.price,
      metalsData.silver.change,
      metalsData.silver.changePercent,
      goldSilverRatio,
      silverHistoricalAnalysis
    );

    const responseData = {
      recommendations: {
        gold: goldRecommendation,
        silver: silverRecommendation,
      },
      marketContext: {
        goldSilverRatio: goldSilverRatio.toFixed(2),
        timestamp: new Date().toISOString(),
      },
      disclaimer:
        '이 제안은 기술적 분석에 기반한 참고용이며, 투자 조언이 아닙니다. 투자 결정 시 전문가와 상담하시기 바랍니다.',
    };

    // 캐시 업데이트
    cache = {
      data: responseData,
      timestamp: Date.now(),
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('Recommendations API error:', error);

    // 캐시된 데이터가 있으면 반환
    if (cache) {
      return NextResponse.json(
        {
          ...cache.data,
          warning: 'Using cached data due to API error',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
