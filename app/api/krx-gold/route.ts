import { NextRequest, NextResponse } from 'next/server';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

// 캐시 저장소
let cache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 (하루)
const API_TIMEOUT = 15000; // 15초

export async function GET(request: NextRequest) {
  try {
    // 캐시 확인
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
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
          price: 82500,
          unit: 'KRW/g',
          change: 500,
          changePercent: 0.61,
          asOf: new Date().toISOString(),
          note: '공공데이터는 실시간이 아닐 수 있습니다',
        },
        silver: {
          symbol: 'KRX Silver',
          price: 1050,
          unit: 'KRW/g',
          change: 20,
          changePercent: 1.94,
          asOf: new Date().toISOString(),
          note: '공공데이터는 실시간이 아닐 수 있습니다',
        },
      };
      
      cache = {
        data: mockData,
        timestamp: Date.now(),
      };
      
      return NextResponse.json(mockData);
    }

    // 공공데이터 API 호출
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      // 금융위원회_일반상품시세정보 API 사용
      // 금 시세 조회 (itmKndCd=20 : 금, 21 : 은)
      // 공공데이터 API는 서비스 키를 URL 인코딩해야 할 수 있음
      const encodedServiceKey = encodeURIComponent(SERVICE_KEY);
      
      // 공공데이터 API 엔드포인트
      const apiBaseUrl = 'https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService';
      // XML 형식으로 요청 (공공데이터 API는 XML이 기본)
      const goldUrl = `${apiBaseUrl}/getGnrlPrdctClpr?serviceKey=${encodedServiceKey}&numOfRows=10&pageNo=1&resultType=xml&itmKndCd=20`;
      
      console.log('KRX API 호출:', {
        url: `${apiBaseUrl}/getGnrlPrdctClpr`,
        serviceKeyLength: SERVICE_KEY.length,
        serviceKeyEncoded: encodedServiceKey.length !== SERVICE_KEY.length,
        resultType: 'xml',
      });
      
      const response = await fetch(goldUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml, text/xml, */*',
        },
      });

      clearTimeout(timeoutId);

      // 응답 본문 읽기
      const responseText = await response.text();
      let data: any;
      
      // XML 또는 JSON 파싱 시도
      try {
        // 먼저 JSON으로 시도
        data = JSON.parse(responseText);
      } catch (jsonError) {
        try {
          // JSON 실패 시 XML로 파싱
          data = await parseXML(responseText);
          // XML 구조를 JSON과 동일하게 변환
          if (data.response) {
            const xmlResponse = data.response;
            data = {
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
          }
        } catch (xmlError) {
          // XML 파싱도 실패한 경우
          console.error('KRX API Response (not JSON/XML):', responseText.substring(0, 500));
          throw new Error(`API returned invalid response. Status: ${response.status}. This may indicate the API endpoint is incorrect or the service is unavailable.`);
        }
      }

      if (!response.ok) {
        console.error('KRX API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: `${apiBaseUrl}/getGnrlPrdctClpr`,
          resultCode: data.response?.header?.resultCode,
          resultMsg: data.response?.header?.resultMsg,
        });
        
        // 공공데이터 API는 200 OK를 반환하지만 resultCode로 오류를 표시
        if (data.response?.header?.resultCode) {
          // XML에서 파싱된 경우 배열일 수 있음
          const resultCode = Array.isArray(data.response.header.resultCode) 
            ? data.response.header.resultCode[0] 
            : data.response.header.resultCode;
          const resultMsg = Array.isArray(data.response.header.resultMsg)
            ? data.response.header.resultMsg[0]
            : (data.response.header.resultMsg || 'Unknown error');
          
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
        
        // 404 또는 다른 HTTP 오류
        if (response.status === 404) {
          throw new Error('API 엔드포인트를 찾을 수 없습니다 (404). API 엔드포인트가 변경되었거나 서비스가 중단되었을 수 있습니다. 공공데이터 포털에서 최신 API 문서를 확인하세요.');
        }
        throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
      }
      
      // 공공데이터 API 오류 응답 확인 (HTTP 200이지만 resultCode로 오류 표시)
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
        console.error('KRX API Error:', {
          resultCode: resultCode,
          resultMsg: resultMsg,
        });
        
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
      
      // 공공데이터 응답 구조 파싱
      const items = data.response?.body?.items?.item;
      const goldItems = Array.isArray(items) ? items : items ? [items] : [];
      
      // 최신 금 시세 데이터 (첫 번째 항목)
      // XML에서 파싱된 경우 배열의 첫 번째 요소를 가져옴
      const latestGold = goldItems[0];
      
      // clpr, vs, fltRt, basDt 값 추출 (XML의 경우 배열일 수 있음)
      const getValue = (obj: any, key: string): string => {
        if (!obj) return '';
        const value = obj[key];
        if (Array.isArray(value)) return value[0] || '';
        return value || '';
      };
      
      const clpr = getValue(latestGold, 'clpr');
      const vs = getValue(latestGold, 'vs');
      const fltRt = getValue(latestGold, 'fltRt');
      const basDt = getValue(latestGold, 'basDt');
      
      // 데이터 정규화
      const normalizedData = {
        gold: {
          symbol: 'KRX Gold',
          price: clpr ? parseFloat(clpr) : 82500, // 종가
          unit: 'KRW/g',
          change: vs ? parseFloat(vs) : 0, // 전일대비
          changePercent: fltRt ? parseFloat(fltRt) : 0, // 등락률
          asOf: basDt || new Date().toISOString().split('T')[0], // 기준일자
          note: '공공데이터는 실시간이 아닐 수 있습니다',
        },
        silver: {
          symbol: 'KRX Silver',
          price: 1050, // 은 시세는 별도 API 호출 필요 (itmKndCd=21)
          unit: 'KRW/g',
          change: 20,
          changePercent: 1.94,
          asOf: new Date().toISOString().split('T')[0],
          note: '공공데이터는 실시간이 아닐 수 있습니다',
        },
      };

      // 캐시 업데이트
      cache = {
        data: normalizedData,
        timestamp: Date.now(),
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
    const mockData = {
      gold: {
        symbol: 'KRX Gold',
        price: 82500,
        unit: 'KRW/g',
        change: 500,
        changePercent: 0.61,
        asOf: new Date().toISOString(),
        note: '공공데이터는 실시간이 아닐 수 있습니다',
        warning: 'Using mock data due to API error',
      },
      silver: {
        symbol: 'KRX Silver',
        price: 1050,
        unit: 'KRW/g',
        change: 20,
        changePercent: 1.94,
        asOf: new Date().toISOString(),
        note: '공공데이터는 실시간이 아닐 수 있습니다',
        warning: 'Using mock data due to API error',
      },
    };

    return NextResponse.json(mockData, { status: 200 });
  }
}
