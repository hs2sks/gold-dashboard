'use client';

import { useEffect, useRef } from 'react';

interface TradingViewEmbedProps {
  symbol: string;
  title?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export function TradingViewEmbed({ symbol, title }: TradingViewEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // TradingView 스크립트가 이미 로드되었는지 확인
    if (scriptLoadedRef.current) {
      initWidget();
      return;
    }

    // TradingView 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      initWidget();
    };
    document.head.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  const initWidget = () => {
    if (containerRef.current && window.TradingView) {
      containerRef.current.innerHTML = '';
      
      new window.TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: 'D',
        timezone: 'Asia/Seoul',
        theme: 'light',
        style: '1',
        locale: 'kr',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: containerRef.current.id,
        hide_top_toolbar: false,
        save_image: false,
        studies: [],
      });
    }
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      {title && (
        <div className="p-4 border-b">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      <div className="relative w-full h-[400px]">
        <div
          ref={containerRef}
          id={`tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
