import { NextRequest, NextResponse } from 'next/server';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

// 캐시 저장소
let cache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5분
const API_TIMEOUT = 10000; // 10초

interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
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

    // 검색할 키워드들
    const keywords = [
      'gold price',
      'silver price',
      '금시세',
      '금값',
      'precious metals'
    ];

    const allNews: NewsItem[] = [];

    // 각 키워드로 Google News RSS 조회
    for (const keyword of keywords) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const encodedKeyword = encodeURIComponent(keyword);
        const rssUrl = `https://news.google.com/rss/search?q=${encodedKeyword}&hl=ko&gl=KR&ceid=KR:ko`;

        const response = await fetch(rssUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const xml = await response.text();
        const result: any = await parseXML(xml);

        // RSS 파싱
        const items = result?.rss?.channel?.[0]?.item || [];
        
        for (const item of items.slice(0, 5)) { // 각 키워드당 상위 5개
          allNews.push({
            title: item.title?.[0] || '',
            source: item.source?.[0]?._ || item.source?.[0] || 'Unknown',
            publishedAt: item.pubDate?.[0] || new Date().toISOString(),
            url: item.link?.[0] || '',
          });
        }
      } catch (error) {
        console.error(`Error fetching news for keyword "${keyword}":`, error);
        continue;
      }
    }

    // URL 중복 제거
    const uniqueNews = allNews.filter(
      (news, index, self) =>
        index === self.findIndex((n) => n.url === news.url)
    );

    // 날짜순 정렬 (최신순)
    uniqueNews.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // 상위 20개만 반환
    const topNews = uniqueNews.slice(0, 20);

    const responseData = {
      news: topNews,
      count: topNews.length,
      lastUpdated: new Date().toISOString(),
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
    console.error('News API error:', error);

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

    // 목 데이터 반환
    const mockData = {
      news: [
        {
          title: '금 가격 상승세 지속, 안전자산 선호 현상',
          source: 'Example News',
          publishedAt: new Date().toISOString(),
          url: 'https://example.com/news1',
        },
        {
          title: '은 시세 변동성 확대, 산업 수요 증가 영향',
          source: 'Example News',
          publishedAt: new Date().toISOString(),
          url: 'https://example.com/news2',
        },
      ],
      count: 2,
      lastUpdated: new Date().toISOString(),
      warning: 'Using mock data due to API error',
    };

    return NextResponse.json(mockData, { status: 200 });
  }
}
