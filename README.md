# 금/은 시세 대시보드

실시간 국제 금/은 시세, 국내 시세(KRX), 원-달러 환율 및 관련 뉴스를 확인할 수 있는 대시보드입니다.

---

## 📚 문서 목록

- ⚡ **[빠른 배포 가이드 (QUICKSTART.md)](./QUICKSTART.md)** - 15분 안에 배포하기
- 📘 **[상세 배포 가이드 (DEPLOYMENT_GUIDE.md)](./DEPLOYMENT_GUIDE.md)** - 모든 배포 방법
- ✅ **[배포 체크리스트 (DEPLOY_CHECKLIST.md)](./DEPLOY_CHECKLIST.md)** - 단계별 체크리스트
- 🔑 **[API 키 발급 가이드 (API_SETUP_GUIDE.md)](./API_SETUP_GUIDE.md)** - API 키 발급 방법
- 📚 **[문서 인덱스 (DOCS_INDEX.md)](./DOCS_INDEX.md)** - 모든 문서 한눈에 보기

---

## 기능

- 📊 **국제 금/은 시세 (XAU/USD, XAG/USD)**: Metals API를 통한 실시간 시세
- 🏦 **국내 금/은 시세 (KRX)**: 공공데이터를 활용한 국내 시세
- 💱 **원-달러 환율**: USD/KRW 환율 정보
- 📈 **TradingView 차트**: 4개의 인터랙티브 차트 제공
- 🤖 **AI 구매 제안**: 기술적 분석 기반 금/은 매수/매도 추천
- 📰 **관련 뉴스**: Google News RSS를 통한 최신 뉴스
- 🔄 **자동 갱신**: 60초마다 데이터 자동 갱신

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: SWR (데이터 페칭 및 캐싱)
- **차트**: TradingView Widget
- **아이콘**: Lucide React
- **날짜 처리**: date-fns

## 설치 및 실행

### 0. 외부 접속 (배포)

**집이 아닌 다른 장소에서도 인터넷을 통해 접속하고 싶다면?**

#### 🚀 빠른 배포 (15-20분 소요)

**자동 배포 스크립트 사용:**

```powershell
# Windows PowerShell
cd gold-dashboard
.\deploy.ps1
```

```bash
# Mac/Linux
cd gold-dashboard
chmod +x deploy.sh
./deploy.sh
```

스크립트가 자동으로:
- ✅ 환경 확인 (Git, Node.js)
- ✅ 프로젝트 빌드 테스트
- ✅ Git 저장소 초기화
- ✅ GitHub 연동 가이드
- ✅ Vercel 배포 안내

#### 📚 상세 가이드

- 📘 **[배포 가이드 (DEPLOYMENT_GUIDE.md)](./DEPLOYMENT_GUIDE.md)** - 모든 배포 방법 상세 설명
- ✅ **[배포 체크리스트 (DEPLOY_CHECKLIST.md)](./DEPLOY_CHECKLIST.md)** - 단계별 체크리스트

**배포 후 혜택:**
- ✨ **Vercel 무료 배포** (5-10분 안에 완료)
- 🌐 전 세계 어디서든 접속 가능
- 🔒 HTTPS 자동 적용
- 💰 완전 무료!
- 📱 모바일에서도 접속 가능

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정 (선택사항)

`.env.local` 파일을 생성하고 다음 API 키를 설정하세요:

```env
METALS_API_KEY=your_metals_api_key_here
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key_here
DATA_GO_KR_SERVICE_KEY=your_data_go_kr_service_key_here
```

**참고**: API 키가 없어도 목 데이터를 사용하여 대시보드를 실행할 수 있습니다.

#### 📘 API 키 발급 상세 가이드

**자세한 API 키 발급 및 설정 방법은 [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)를 참조하세요.**

간단 요약:
- **Metals API**: [metals.dev](https://metals.dev/)에서 무료 API 키 발급
- **공공데이터 포털**: [data.go.kr](https://www.data.go.kr/)에서 일반인증키 발급

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 대시보드를 확인하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
gold-dashboard/
├── app/
│   ├── api/
│   │   ├── metals/route.ts           # 국제 금/은 시세 API
│   │   ├── fx/route.ts                # 환율 API
│   │   ├── krx-gold/route.ts         # 국내 금/은 시세 API
│   │   ├── news/route.ts              # 뉴스 API
│   │   └── recommendations/route.ts   # 구매 제안 API
│   ├── page.tsx                       # 메인 대시보드 페이지
│   ├── layout.tsx                     # 루트 레이아웃
│   └── globals.css                    # 글로벌 스타일
├── components/
│   ├── KpiCard.tsx                    # KPI 카드 컴포넌트
│   ├── NewsPanel.tsx                  # 뉴스 패널 컴포넌트
│   ├── TradingViewEmbed.tsx           # TradingView 차트 컴포넌트
│   └── BuyingRecommendation.tsx       # 구매 제안 컴포넌트
└── lib/
    └── utils.ts                       # 유틸리티 함수
```

## API 엔드포인트

### `/api/metals`
국제 금/은 시세 (XAU/USD, XAG/USD)를 반환합니다.
- 캐시: 60초
- Fallback: 이전 캐시 데이터 또는 목 데이터

### `/api/fx`
USD/KRW 환율을 반환합니다.
- 캐시: 60초
- Fallback: 이전 캐시 데이터 또는 목 데이터

### `/api/krx-gold`
국내 금/은 시세 (KRX)를 반환합니다.
- 캐시: 60초
- 참고: 공공데이터는 실시간이 아닐 수 있습니다

### `/api/news`
금/은 관련 뉴스를 반환합니다.
- 캐시: 5분
- 소스: Google News RSS

### `/api/recommendations`
금/은 구매 제안을 반환합니다.
- 캐시: 5분
- 분석: 기술적 지표 기반 (가격 변동, 금/은 비율, 변동성 등)
- 참고: 투자 조언이 아닌 참고용 정보입니다

## 주요 기능

### 1. KPI 카드
- 국제 금 시세 (XAU/USD)
- 국제 은 시세 (XAG/USD)
- 원-달러 환율
- 국내 금 시세 (KRX)
- 국내 은 시세 (KRX)
- 금/은 비율

### 2. TradingView 차트
- 금 (XAU/USD)
- 은 (XAG/USD)
- 원-달러 환율 (USD/KRW)
- 금 선물 (Futures)

### 3. 뉴스 패널
- 여러 키워드로 검색된 최신 뉴스
- URL 중복 제거
- 날짜순 정렬
- 외부 링크 지원

### 4. AI 구매 제안 ✨
- **기술적 분석 기반 추천**: 가격 변동률, 절대 가격 수준, 금/은 비율, 변동성 등 종합 분석
- **5단계 액션**: 적극 매수 / 매수 / 보유 / 매도 / 적극 매도
- **신뢰도 점수**: 0-100% 신뢰도 표시
- **상세 분석 근거**: 각 추천의 이유를 명확하게 제시
- **기술적 지표**: 추세(상승/하락/중립), 모멘텀(강/중/약), 변동성(고/중/저)
- **면책사항**: 투자 조언이 아닌 참고용 정보임을 명시

## 특징

- ✅ **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- ✅ **오류 처리**: API 오류 시 캐시 데이터 또는 목 데이터 사용
- ✅ **타임아웃 처리**: 느린 API 응답 방지
- ✅ **자동 갱신**: 백그라운드에서 자동으로 데이터 갱신
- ✅ **로딩 상태**: 스켈레톤 UI로 로딩 표시
- ✅ **다크 모드**: 시스템 설정에 따른 자동 다크 모드 지원
- ✅ **AI 기반 분석**: 기술적 지표를 활용한 매수/매도 타이밍 제안

## 사용 팁

### 구매 제안 활용법

1. **신뢰도 확인**: 70% 이상의 신뢰도를 가진 제안에 주목하세요
2. **복합 분석**: 여러 지표를 종합적으로 판단하세요
   - 추세: 전반적인 가격 방향성
   - 모멘텀: 가격 변화의 강도
   - 변동성: 리스크 수준
3. **금/은 비율 활용**: 비율이 높을 때(>85) 은이 저평가, 낮을 때(<70) 은이 고평가
4. **분석 근거 읽기**: 각 제안의 이유를 꼭 확인하세요
5. **투자 주의**: 이 제안은 참고용이며 실제 투자는 전문가와 상담하세요

### 대시보드 활용 시나리오

- **아침 체크**: 전날 대비 시세 변화 확인
- **매수 타이밍**: AI 제안이 "매수" 이상일 때 고려
- **뉴스 모니터링**: 시세에 영향을 주는 뉴스 파악
- **차트 분석**: TradingView로 상세 기술적 분석

## 라이선스

MIT

## 기여

이슈나 풀 리퀘스트를 환영합니다!
