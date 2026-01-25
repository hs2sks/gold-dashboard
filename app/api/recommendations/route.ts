import { NextRequest, NextResponse } from 'next/server';

interface MarketData {
  gold: { price: number; change?: number; changePercent?: number };
  silver: { price: number; change?: number; changePercent?: number };
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

function analyzeMetalPrice(
  metal: 'gold' | 'silver',
  price: number,
  change: number = 0,
  changePercent: number = 0,
  goldSilverRatio?: number
): Recommendation {
  const reasons: string[] = [];
  let score = 50; // 중립에서 시작 (0-100)

  // 1. 가격 변동률 분석
  if (changePercent > 2) {
    score -= 15;
    reasons.push(`단기 급등 (${changePercent.toFixed(2)}%) - 조정 가능성`);
  } else if (changePercent > 0.5) {
    score -= 5;
    reasons.push(`상승 추세 - 신중한 접근 권장`);
  } else if (changePercent < -2) {
    score += 15;
    reasons.push(`단기 급락 (${changePercent.toFixed(2)}%) - 매수 기회 가능`);
  } else if (changePercent < -0.5) {
    score += 10;
    reasons.push(`하락 추세 - 매수 타이밍 접근`);
  }

  // 2. 절대 가격 수준 분석 (역사적 평균 기준)
  if (metal === 'gold') {
    if (price > 2100) {
      score -= 10;
      reasons.push('금 가격이 고점 수준 - 고점 부담');
    } else if (price < 1900) {
      score += 10;
      reasons.push('금 가격이 저점 수준 - 매수 기회');
    }
  } else {
    if (price > 26) {
      score -= 10;
      reasons.push('은 가격이 고점 수준 - 고점 부담');
    } else if (price < 22) {
      score += 10;
      reasons.push('은 가격이 저점 수준 - 매수 기회');
    }
  }

  // 3. 금/은 비율 분석 (은에만 적용)
  if (metal === 'silver' && goldSilverRatio) {
    if (goldSilverRatio > 85) {
      score += 15;
      reasons.push(`금/은 비율 높음 (${goldSilverRatio.toFixed(1)}) - 은이 상대적으로 저평가`);
    } else if (goldSilverRatio < 70) {
      score -= 10;
      reasons.push(`금/은 비율 낮음 (${goldSilverRatio.toFixed(1)}) - 은이 상대적으로 고평가`);
    }
  }

  // 4. 변동성 분석
  const absChangePercent = Math.abs(changePercent);
  let volatility: 'high' | 'medium' | 'low';
  if (absChangePercent > 3) {
    volatility = 'high';
    reasons.push('높은 변동성 - 리스크 관리 필요');
  } else if (absChangePercent > 1) {
    volatility = 'medium';
  } else {
    volatility = 'low';
    score += 5;
    reasons.push('안정적인 가격 흐름');
  }

  // 5. 안전자산 선호도 (기본적으로 긍정적)
  score += 5;
  reasons.push('안전자산으로서의 가치 유지');

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
    // 캐시 확인
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
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

    // 금 분석
    const goldRecommendation = analyzeMetalPrice(
      'gold',
      metalsData.gold.price,
      metalsData.gold.change,
      metalsData.gold.changePercent,
      goldSilverRatio
    );

    // 은 분석
    const silverRecommendation = analyzeMetalPrice(
      'silver',
      metalsData.silver.price,
      metalsData.silver.change,
      metalsData.silver.changePercent,
      goldSilverRatio
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
