import { NextRequest, NextResponse } from 'next/server';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

// 캐시 저장소
let cache: {
  data: any;
  timestamp: number;
  date?: string;
} | null = null;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 (하루)
const API_TIMEOUT = 20000; // 20초 (여러 API 호출을 위해 증가)

// API 응답 파싱 헬퍼 함수
function parseApiResponse(responseText: string, parseXML: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      // 먼저 JSON으로 시도
      const jsonData = JSON.parse(responseText);
      resolve(jsonData);
    } catch (jsonError) {
      try {
        // JSON 실패 시 XML로 파싱
        const xmlData = await parseXML(responseText);
        // XML 구조를 JSON과 동일하게 변환
        if (xmlData.response) {
          const xmlResponse = xmlData.response;
          const normalizedData = {
            response: {
              header: {
                resultCode: xmlResponse.header?.[0]?.resultCode?.[0] || '',
                resultMsg: xmlResponse.header?.[0]?.resultMsg?.[0] || '',
              },
              body: {
                numOfRows: xmlResponse.body?.[0]?.numOfRows?.[0] || '',
                pageNo: xmlResponse.body?.[0]?.pageNo?.[0] || '',
                totalCount: xmlResponse.body?.[0]?.totalCount?.[0] || '',
                items: {
                  item: xmlResponse.body?.[0]?.items?.[0]?.item || [],
                },
              },
            },
          };
          resolve(normalizedData);
        } else {
          resolve(xmlData);
        }
      } catch (xmlError) {
        reject(new Error(`Failed to parse response as JSON or XML`));
      }
    }
  });
}

// API 호출 헬퍼 함수
async function callApi(
  url: string,
  controller: AbortController,
  parseXML: any
): Promise<any> {
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'Accept': 'application/xml, text/xml, application/json, */*',
    },
  });

  const responseText = await response.text();

  // 404 오류인 경우 응답 본문 확인
  if (!response.ok) {
    // 공공데이터 API는 때때로 404를 반환하지만 응답 본문에 오류 정보가 있을 수 있음
    if (response.status === 404) {
      console.error('API 404 오류 - 응답 본문:', responseText.substring(0, 500));
      console.error('API 404 오류 - 요청 URL:', url.substring(0, url.indexOf('serviceKey') + 20) + '...');
      
      // 응답 본문에 오류 정보가 있는지 확인
      if (responseText.includes('SERVICE_KEY') || responseText.includes('인증')) {
        throw new Error('서비스 키 오류 (404). 공공데이터 포털에서 "일반 인증키(Encoding)"를 확인하고, API 활용신청이 승인되었는지 확인하세요.');
      }
      
      throw new Error(`API 엔드포인트를 찾을 수 없습니다 (404). API 엔드포인트가 변경되었거나 서비스가 중단되었을 수 있습니다. 공공데이터 포털에서 최신 API 문서를 확인하세요.`);
    }
    throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
  }

  const data = await parseApiResponse(responseText, parseXML);

  // 오류 응답 확인
  const resultCode = data.response?.header?.resultCode 
    ? (Array.isArray(data.response.header.resultCode) 
        ? data.response.header.resultCode[0] 
        : data.response.header.resultCode)
    : null;
  const resultMsg = data.response?.header?.resultMsg
    ? (Array.isArray(data.response.header.resultMsg)
        ? data.response.header.resultMsg[0]
        : data.response.header.resultMsg)
    : 'Unknown error';

  if (resultCode && resultCode !== '00') {
    if (resultCode === '03') {
      throw new Error('서비스 키 오류 (CODE-03). 공공데이터 포털에서 "일반 인증키(Encoding)"를 확인하세요.');
    } else if (resultCode === '01') {
      throw new Error('API 신청 미승인 (CODE-01). 공공데이터 포털에서 "금융위원회_일반상품시세정보" API 활용신청 승인 상태를 확인하세요.');
    } else if (resultCode === '05') {
      throw new Error('일일 트래픽 초과 (CODE-05). 내일 다시 시도하거나 유료 플랜을 고려하세요.');
    } else {
      throw new Error(`API 오류: ${resultMsg} (CODE-${resultCode})`);
    }
  }

  return data;
}

// 데이터 추출 헬퍼 함수
function getValue(obj: any, key: string): string {
  if (!obj) return '';
  const value = obj[key];
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

// 품목 데이터 정규화 함수
function normalizeItemData(item: any) {
  return {
    basDt: getValue(item, 'basDt'), // 기준일자
    itmsNm: getValue(item, 'itmsNm'), // 품목명
    clpr: getValue(item, 'clpr') ? parseFloat(getValue(item, 'clpr')) : null, // 종가
    mkp: getValue(item, 'mkp') ? parseFloat(getValue(item, 'mkp')) : null, // 시가
    hipr: getValue(item, 'hipr') ? parseFloat(getValue(item, 'hipr')) : null, // 고가
    lopr: getValue(item, 'lopr') ? parseFloat(getValue(item, 'lopr')) : null, // 저가
    vs: getValue(item, 'vs') ? parseFloat(getValue(item, 'vs')) : null, // 전일대비
    fltRt: getValue(item, 'fltRt') ? parseFloat(getValue(item, 'fltRt')) : null, // 등락률
    trqu: getValue(item, 'trqu') ? parseFloat(getValue(item, 'trqu')) : null, // 거래량
    trPrc: getValue(item, 'trPrc') ? parseFloat(getValue(item, 'trPrc')) : null, // 거래대금
  };
}

export async function GET(request: NextRequest) {
  // 쿼리 파라미터에서 날짜 추출 (YYYYMMDD 형식)
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date'); // YYYYMMDD 형식
  const date = dateParam || null;

  try {

    // 캐시 확인 (날짜가 같으면 캐시 사용)
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION && cache.date === date) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      });
    }

    const SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY;
    
    if (!SERVICE_KEY) {
      console.warn('DATA_GO_KR_SERVICE_KEY not found, returning mock data');
      const mockData = {
        gold: {
          symbol: 'KRX Gold',
          price: 82500, // 종가
          open: 82000, // 시가
          high: 83000, // 고가
          low: 81900, // 저가
          unit: 'KRW/g',
          change: 500,
          changePercent: 0.61,
          asOf: date || new Date().toISOString().split('T')[0],
          updatedAt: (() => {
            const now = new Date();
            const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
            const hour = koreaTime.getHours();
            if (hour < 8) {
              const yesterday = new Date(koreaTime);
              yesterday.setDate(yesterday.getDate() - 1);
              yesterday.setHours(20, 0, 0, 0);
              return yesterday.toISOString();
            } else if (hour < 20) {
              koreaTime.setHours(8, 0, 0, 0);
              return koreaTime.toISOString();
            } else {
              koreaTime.setHours(20, 0, 0, 0);
              return koreaTime.toISOString();
            }
          })(),
          note: '전일 마지막 데이터입니다. 공공데이터는 실시간이 아닐 수 있습니다',
        },
        silver: {
          symbol: 'KRX Silver',
          price: null, // 종가 (데이터 없음)
          open: null, // 시가
          high: null, // 고가
          low: null, // 저가
          unit: 'KRW/g',
          change: null,
          changePercent: null,
          asOf: date || new Date().toISOString().split('T')[0],
          note: '국내 은 시세는 공공데이터 포털에서 제공되지 않습니다. KRX 금시장에는 은 상품이 상장되어 있지 않습니다.',
          unavailable: true, // 데이터 사용 불가능
        },
      };
      
      cache = {
        data: mockData,
        timestamp: Date.now(),
        date: date || undefined,
      };
      
      return NextResponse.json(mockData);
    }

    // 공공데이터 API 호출
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      // 공공데이터 포털 서비스 키는 이미 인코딩되어 있을 수 있으므로 확인
      // 일반 인증키(Encoding)를 사용해야 함
      let serviceKeyToUse = SERVICE_KEY;
      
      // 서비스 키가 이미 URL 인코딩되어 있는지 확인 (특수문자 % 포함 여부)
      // 만약 이미 인코딩되어 있다면 다시 인코딩하지 않음
      if (!SERVICE_KEY.includes('%')) {
        serviceKeyToUse = encodeURIComponent(SERVICE_KEY);
      }
      
      const apiBaseUrl = 'https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService';
      
      // 날짜 파라미터 추가 (있으면)
      const dateParamStr = date ? `&basDt=${date}` : '';
      
      // 금 시세 조회 (getGoldPriceInfo 엔드포인트 사용)
      // 참고: 이 API는 금 시세만 제공하며, 은 시세는 별도 엔드포인트가 없을 수 있음
      const goldUrl = `${apiBaseUrl}/getGoldPriceInfo?serviceKey=${serviceKeyToUse}&numOfRows=10&pageNo=1&resultType=xml${dateParamStr}`;
      
      // 은 시세는 별도 엔드포인트가 있는지 시도 (없으면 금 시세만 사용)
      const silverUrl = `${apiBaseUrl}/getSilverPriceInfo?serviceKey=${serviceKeyToUse}&numOfRows=10&pageNo=1&resultType=xml${dateParamStr}`;
      
      console.log('KRX API 호출:', {
        apiBaseUrl,
        serviceKeyLength: SERVICE_KEY.length,
        serviceKeyEncoded: serviceKeyToUse !== SERVICE_KEY,
        goldUrl: `${apiBaseUrl}/getGoldPriceInfo${dateParamStr ? '?basDt=' + date : ''}`,
        silverUrl: `${apiBaseUrl}/getSilverPriceInfo${dateParamStr ? '?basDt=' + date : ''}`,
        date: date || '최신',
      });
      
      // 금 시세 조회 (은 시세는 실패해도 계속 진행)
      const goldResponse = await callApi(goldUrl, controller, parseXML);
      
      // 은 시세 조회 시도 (실패해도 계속 진행)
      let silverResponse = null;
      try {
        silverResponse = await callApi(silverUrl, controller, parseXML);
      } catch (silverError: any) {
        console.warn('은 시세 API 호출 실패 (은 시세 엔드포인트가 없을 수 있음):', silverError.message);
        // 은 시세가 없어도 계속 진행
      }

      clearTimeout(timeoutId);

      // 금 시세 데이터 파싱
      // getGoldPriceInfo는 여러 금 상품을 반환 (금 99.99_1kg, 미니금 99.99_100g 등)
      // 가장 최신 데이터이면서 가장 큰 단위인 "금 99.99_1kg" (srtnCd: 04020000)를 찾음
      const goldItems = goldResponse.response?.body?.items?.item;
      const goldItemList = Array.isArray(goldItems) ? goldItems : goldItems ? [goldItems] : [];
      
      // 기준일자가 같으면 가장 최신 데이터, 또는 첫 번째 항목 사용
      // 금 99.99_1kg (srtnCd: 04020000)를 우선 찾고, 없으면 첫 번째 항목 사용
      let latestGold = null;
      const gold1kg = goldItemList.find((item: any) => {
        const srtnCd = getValue(item, 'srtnCd');
        return srtnCd === '04020000'; // 금 99.99_1kg
      });
      
      if (gold1kg) {
        latestGold = normalizeItemData(gold1kg);
      } else if (goldItemList.length > 0) {
        latestGold = normalizeItemData(goldItemList[0]);
      }
      
      // 전일 데이터 찾기 (같은 상품의 전일 데이터)
      let previousGold = null;
      if (latestGold && goldItemList.length > 1) {
        // 기준일자가 다른 항목 중에서 같은 상품(srtnCd)의 전일 데이터 찾기
        const latestDate = latestGold.basDt;
        const previousItems = goldItemList.filter((item: any) => {
          const itemDate = getValue(item, 'basDt');
          const itemSrtnCd = getValue(item, 'srtnCd');
          return itemDate < latestDate && itemSrtnCd === getValue(gold1kg || goldItemList[0], 'srtnCd');
        });
        
        if (previousItems.length > 0) {
          // 가장 최근의 전일 데이터 선택
          previousItems.sort((a: any, b: any) => {
            const dateA = getValue(a, 'basDt');
            const dateB = getValue(b, 'basDt');
            return dateB.localeCompare(dateA);
          });
          previousGold = normalizeItemData(previousItems[0]);
        }
      }
      
      // 은 시세 데이터 파싱 (있으면)
      let latestSilver = null;
      if (silverResponse) {
        const silverItems = silverResponse.response?.body?.items?.item;
        const silverItemList = Array.isArray(silverItems) ? silverItems : silverItems ? [silverItems] : [];
        if (silverItemList.length > 0) {
          latestSilver = normalizeItemData(silverItemList[0]);
        }
      }
      
      // 한국 시간으로 업데이트 시간 설정 (아침 8시 또는 저녁 8시)
      function getKoreaUpdateTime(): Date {
        const now = new Date();
        const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
        const hour = koreaTime.getHours();
        
        // 현재 시간이 오전 8시 이전이면 전일 저녁 8시, 그 외에는 오늘 아침 8시 또는 저녁 8시
        if (hour < 8) {
          // 전일 저녁 8시
          const yesterday = new Date(koreaTime);
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(20, 0, 0, 0);
          return yesterday;
        } else if (hour < 20) {
          // 오늘 아침 8시
          koreaTime.setHours(8, 0, 0, 0);
          return koreaTime;
        } else {
          // 오늘 저녁 8시
          koreaTime.setHours(20, 0, 0, 0);
          return koreaTime;
        }
      }
      
      // 전일 데이터 사용 (API는 전일 마지막 데이터를 반환)
      const displayGold = latestGold;
      const updateTime = getKoreaUpdateTime();
      
      // 데이터 정규화
      const normalizedData = {
        gold: {
          symbol: 'KRX Gold',
          price: displayGold?.clpr || 82500, // 종가 (전일 데이터)
          open: displayGold?.mkp || null, // 시가
          high: displayGold?.hipr || null, // 고가
          low: displayGold?.lopr || null, // 저가
          unit: 'KRW/g',
          change: displayGold?.vs || 0, // 전일대비
          changePercent: displayGold?.fltRt || 0, // 등락률
          volume: displayGold?.trqu || null, // 거래량
          amount: displayGold?.trPrc || null, // 거래대금
          asOf: displayGold?.basDt || date || new Date().toISOString().split('T')[0], // 기준일자
          updatedAt: updateTime.toISOString(), // 한국 시간 기준 업데이트 시간
          note: '전일 마지막 데이터입니다. 공공데이터는 실시간이 아닐 수 있습니다',
        },
        silver: {
          symbol: 'KRX Silver',
          price: latestSilver?.clpr || null, // 종가 (데이터 없으면 null)
          open: latestSilver?.mkp || null, // 시가
          high: latestSilver?.hipr || null, // 고가
          low: latestSilver?.lopr || null, // 저가
          unit: 'KRW/g',
          change: latestSilver?.vs || null, // 전일대비
          changePercent: latestSilver?.fltRt || null, // 등락률
          volume: latestSilver?.trqu || null, // 거래량
          amount: latestSilver?.trPrc || null, // 거래대금
          asOf: latestSilver?.basDt || date || new Date().toISOString().split('T')[0], // 기준일자
          note: latestSilver ? '공공데이터는 실시간이 아닐 수 있습니다' : '국내 은 시세는 공공데이터 포털에서 제공되지 않습니다. KRX 금시장에는 은 상품이 상장되어 있지 않습니다.',
          unavailable: !latestSilver, // 데이터 사용 불가능 여부 표시
        },
      };

      // 캐시 업데이트
      cache = {
        data: normalizedData,
        timestamp: Date.now(),
        date: date || undefined,
      };

      return NextResponse.json(normalizedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
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
    console.error('KRX Gold API error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 200),
    });

    // 캐시된 데이터가 있으면 반환 (fallback)
    if (cache) {
      console.log('Returning cached data due to API error');
      return NextResponse.json(
        {
          ...cache.data,
          warning: 'Using cached data due to API error',
          error: error.message,
        },
        { status: 200 }
      );
    }

    // 목 데이터 반환
    // 한국 시간으로 업데이트 시간 설정
    const now = new Date();
    const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const hour = koreaTime.getHours();
    let updateTime: Date;
    if (hour < 8) {
      const yesterday = new Date(koreaTime);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(20, 0, 0, 0);
      updateTime = yesterday;
    } else if (hour < 20) {
      koreaTime.setHours(8, 0, 0, 0);
      updateTime = koreaTime;
    } else {
      koreaTime.setHours(20, 0, 0, 0);
      updateTime = koreaTime;
    }
    
    const mockData = {
      gold: {
        symbol: 'KRX Gold',
        price: 82500, // 종가
        open: 82000, // 시가
        high: 83000, // 고가
        low: 81900, // 저가
        unit: 'KRW/g',
        change: 500,
        changePercent: 0.61,
        asOf: date || new Date().toISOString().split('T')[0],
        updatedAt: updateTime.toISOString(),
        note: '전일 마지막 데이터입니다. 공공데이터는 실시간이 아닐 수 있습니다',
        warning: 'Using mock data due to API error',
      },
        silver: {
          symbol: 'KRX Silver',
          price: null, // 종가 (데이터 없음)
          open: null, // 시가
          high: null, // 고가
          low: null, // 저가
          unit: 'KRW/g',
          change: null,
          changePercent: null,
          asOf: date || new Date().toISOString().split('T')[0],
          note: '국내 은 시세는 공공데이터 포털에서 제공되지 않습니다. KRX 금시장에는 은 상품이 상장되어 있지 않습니다.',
          unavailable: true, // 데이터 사용 불가능
          warning: 'Using mock data due to API error',
        },
    };

    return NextResponse.json(mockData, { status: 200 });
  }
}
