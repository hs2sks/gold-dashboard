import { NextRequest, NextResponse } from 'next/server';

// 캐시 저장소
let cache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12시간
const API_TIMEOUT = 10000; // 10초

export async function GET(request: NextRequest) {
  try {
    // 캐시 확인
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=3600',
        },
      });
    }

    const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
    
    if (!EXCHANGE_RATE_API_KEY) {
      console.warn('EXCHANGE_RATE_API_KEY not found, using fallback API');
      // API 키가 없으면 무료 API 사용 (fallback)
      const fallbackData = await fetchFallbackRate();
      return NextResponse.json(fallbackData, {
        headers: {
          'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=3600',
        },
      });
    }

    // ExchangeRate-API.com 호출 (API 키 사용)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      // API 응답 확인
      if (data.result !== 'success') {
        throw new Error(data['error-type'] || 'API request was not successful');
      }

      // 데이터가 없거나 rates가 없으면 에러
      if (!data.conversion_rates || !data.conversion_rates.KRW) {
        throw new Error('Invalid API response: missing rates data');
      }

      // 데이터 정규화
      const normalizedData = {
        rate: data.conversion_rates.KRW,
        base: data.base_code || 'USD',
        target: 'KRW',
        timestamp: data.time_last_update_utc || new Date().toISOString(),
      };

      // 캐시 업데이트
      cache = {
        data: normalizedData,
        timestamp: Date.now(),
      };

      return NextResponse.json(normalizedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=3600',
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('FX API error:', error);

    // 캐시된 데이터가 있으면 반환 (fallback)
    if (cache) {
      return NextResponse.json(
        {
          ...cache.data,
          warning: 'Using cached data due to API error',
        },
        { status: 200 }
      );
    }

    // 캐시도 없으면 목 데이터 반환
    const mockData = {
      rate: 1330.50,
      base: 'USD',
      target: 'KRW',
      timestamp: new Date().toISOString(),
      warning: 'Using mock data due to API error',
    };

    return NextResponse.json(mockData, { status: 200 });
  }
}

// Fallback API (API 키 없을 때)
async function fetchFallbackRate() {
  try {
    const response = await fetch(
      'https://api.exchangerate.host/latest?base=USD&symbols=KRW',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Fallback API failed');
    }

    const data = await response.json();

    return {
      rate: data.rates?.KRW || 1330.50,
      base: 'USD',
      target: 'KRW',
      timestamp: data.date || new Date().toISOString().split('T')[0],
      warning: 'Using fallback API (no API key)',
    };
  } catch (error) {
    return {
      rate: 1330.50,
      base: 'USD',
      target: 'KRW',
      timestamp: new Date().toISOString(),
      warning: 'Using mock data',
    };
  }
}
