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

    const METALS_API_KEY = process.env.METALS_API_KEY;
    
    if (!METALS_API_KEY) {
      console.warn('METALS_API_KEY not found, returning mock data');
      const mockData = {
        gold: {
          symbol: 'XAU/USD',
          price: 2043.50,
          change: 15.30,
          changePercent: 0.75,
          timestamp: new Date().toISOString(),
        },
        silver: {
          symbol: 'XAG/USD',
          price: 24.85,
          change: 0.45,
          changePercent: 1.84,
          timestamp: new Date().toISOString(),
        },
      };
      
      cache = {
        data: mockData,
        timestamp: Date.now(),
      };
      
      return NextResponse.json(mockData);
    }

    // Metals API 호출 (timeout 포함)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(
        `https://api.metals.dev/v1/latest?api_key=${METALS_API_KEY}&currency=USD&unit=toz`,
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

      // 데이터 정규화
      const normalizedData = {
        gold: {
          symbol: 'XAU/USD',
          price: data.metals?.gold || 0,
          change: 0,
          changePercent: 0,
          timestamp: data.timestamp || new Date().toISOString(),
        },
        silver: {
          symbol: 'XAG/USD',
          price: data.metals?.silver || 0,
          change: 0,
          changePercent: 0,
          timestamp: data.timestamp || new Date().toISOString(),
        },
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
    console.error('Metals API error:', error);

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

    return NextResponse.json(
      {
        error: 'Failed to fetch metals data',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
