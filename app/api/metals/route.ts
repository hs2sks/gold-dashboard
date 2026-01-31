import { NextRequest, NextResponse } from 'next/server';

// 캐시 저장소
let cache: {
  data: any;
  timestamp: number;
  lastUpdateDate: string; // 마지막 갱신 날짜 (YYYY-MM-DD)
  updateCount: number; // 오늘 갱신 횟수
} | null = null;

// 전일 가격 저장소 (전일 대비 계산용)
let previousPrices: {
  gold: number | null;
  silver: number | null;
  timestamp: number;
} = {
  gold: null,
  silver: null,
  timestamp: 0,
};

const API_TIMEOUT = 10000; // 10초

// 하루에 두 번만 갱신 (오전 8시, 오후 8시)
const UPDATE_TIMES = [8, 20]; // 한국 시간 기준

// 한국 시간으로 오늘 날짜 가져오기
function getKoreaDate(): string {
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  return koreaTime.toISOString().split('T')[0]; // YYYY-MM-DD
}

// 한국 시간으로 현재 시간 가져오기
function getKoreaTime(): { date: string; hour: number; minute: number } {
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  return {
    date: koreaTime.toISOString().split('T')[0],
    hour: koreaTime.getHours(),
    minute: koreaTime.getMinutes(),
  };
}

// 다음 갱신 시간까지 대기해야 하는지 확인
function shouldUpdate(): boolean {
  const koreaTime = getKoreaTime();
  const today = koreaTime.date;
  
  // 캐시가 없으면 첫 번째 갱신 시간대에 갱신
  if (!cache) {
    // 현재 시간이 갱신 시간대(8시 또는 20시)인지 확인
    const isUpdateTime = UPDATE_TIMES.includes(koreaTime.hour);
    return isUpdateTime;
  }
  
  // 날짜가 바뀌면 갱신 횟수 리셋하고 첫 번째 갱신 시간대에 갱신
  if (cache.lastUpdateDate !== today) {
    const isUpdateTime = UPDATE_TIMES.includes(koreaTime.hour);
    return isUpdateTime;
  }
  
  // 오늘 이미 2번 갱신했으면 갱신하지 않음
  if (cache.updateCount >= 2) {
    return false;
  }
  
  // 갱신 시간대인지 확인 (정확히 8시 또는 20시)
  const isUpdateTime = UPDATE_TIMES.includes(koreaTime.hour);
  
  if (!isUpdateTime) {
    return false;
  }
  
  // 마지막 갱신이 30분 이내면 갱신하지 않음 (중복 방지)
  const lastUpdate = new Date(cache.timestamp);
  const timeSinceLastUpdate = Date.now() - lastUpdate.getTime();
  const thirtyMinutes = 30 * 60 * 1000;
  
  if (timeSinceLastUpdate < thirtyMinutes) {
    return false;
  }
  
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // 하루에 두 번만 갱신하도록 확인
    const shouldUpdateNow = shouldUpdate();
    
    // 갱신할 필요가 없으면 캐시된 데이터 반환
    if (!shouldUpdateNow && cache) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      });
    }

    const METALS_API_KEY = process.env.METALS_API_KEY;
    
    if (!METALS_API_KEY) {
      console.error('METALS_API_KEY not found');
      return NextResponse.json(
        {
          error: 'METALS_API_KEY가 설정되지 않았습니다',
          message: '환경 변수에 METALS_API_KEY를 설정해주세요',
        },
        { status: 500 }
      );
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

      // API 응답 구조 확인 및 디버깅
      console.log('Metals API 응답:', {
        hasMetals: !!data.metals,
        metalsKeys: data.metals ? Object.keys(data.metals) : [],
        gold: data.metals?.gold,
        silver: data.metals?.silver,
      });

      // API 응답 구조에 따라 가격 추출
      // metals.dev API는 { metals: { gold: ..., silver: ... } } 형식
      const currentGoldPrice = data.metals?.gold ?? data.gold ?? 0;
      const currentSilverPrice = data.metals?.silver ?? data.silver ?? 0;
      
      // 가격이 0이거나 유효하지 않으면 에러
      if (!currentGoldPrice || !currentSilverPrice) {
        console.error('Metals API 응답에 유효한 가격이 없습니다:', data);
        throw new Error('API 응답에 유효한 가격 데이터가 없습니다');
      }
      
      // 전일 대비 계산
      const goldChange = previousPrices.gold !== null 
        ? currentGoldPrice - previousPrices.gold 
        : 0;
      const goldChangePercent = previousPrices.gold !== null && previousPrices.gold !== 0
        ? ((currentGoldPrice - previousPrices.gold) / previousPrices.gold) * 100
        : 0;
      
      const silverChange = previousPrices.silver !== null 
        ? currentSilverPrice - previousPrices.silver 
        : 0;
      const silverChangePercent = previousPrices.silver !== null && previousPrices.silver !== 0
        ? ((currentSilverPrice - previousPrices.silver) / previousPrices.silver) * 100
        : 0;

      // API 응답의 실제 timestamp 사용 (없으면 현재 시간)
      const apiTimestamp = data.timestamp || new Date().toISOString();
      const apiDate = new Date(apiTimestamp);
      
      // 한국 시간으로 변환
      const koreaTime = new Date(apiDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      const koreaDate = getKoreaDate();

      // 데이터 정규화
      const normalizedData = {
        gold: {
          symbol: 'XAU/USD',
          price: currentGoldPrice,
          change: goldChange,
          changePercent: goldChangePercent,
          timestamp: apiTimestamp,
          updatedAt: koreaTime.toISOString(), // 실제 갱신 시간 (한국 시간)
        },
        silver: {
          symbol: 'XAG/USD',
          price: currentSilverPrice,
          change: silverChange,
          changePercent: silverChangePercent,
          timestamp: apiTimestamp,
          updatedAt: koreaTime.toISOString(), // 실제 갱신 시간 (한국 시간)
        },
      };

      // 전일 가격 업데이트 (하루에 한 번만 업데이트)
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      if (previousPrices.timestamp < oneDayAgo || previousPrices.gold === null) {
        previousPrices = {
          gold: currentGoldPrice,
          silver: currentSilverPrice,
          timestamp: now,
        };
      }

      // 캐시 업데이트 (갱신 횟수 추적)
      const currentUpdateCount = (cache && cache.lastUpdateDate === koreaDate) 
        ? cache.updateCount + 1 
        : 1;
      
      cache = {
        data: normalizedData,
        timestamp: Date.now(),
        lastUpdateDate: koreaDate,
        updateCount: currentUpdateCount,
      };
      
      console.log(`Metals API 갱신 완료 (${koreaDate} ${currentUpdateCount}/2회)`);

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
    console.error('Error details:', {
      message: error.message,
      name: error.name,
    });

    // 캐시된 데이터가 있으면 반환 (fallback)
    if (cache) {
      console.log('Returning cached data due to API error');
      return NextResponse.json(
        {
          ...cache.data,
          warning: 'Using cached data due to API error',
        },
        { status: 200 }
      );
    }

    // 캐시도 없으면 에러 반환 (mock 데이터 반환하지 않음)
    console.error('No cache available and API failed');
    return NextResponse.json(
      {
        error: 'Failed to fetch metals data',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
