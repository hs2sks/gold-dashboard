# 📚 문서 인덱스

금/은 시세 대시보드 프로젝트의 모든 문서를 한눈에 볼 수 있습니다.

---

## 🚀 시작하기

### 1️⃣ 로컬 실행 (집에서만 사용)

**[README.md](./README.md)** - 프로젝트 개요 및 로컬 실행 방법

```bash
npm install
npm run dev
# http://localhost:3000 에서 확인
```

### 2️⃣ 외부 배포 (어디서든 접속)

**[⚡ QUICKSTART.md](./QUICKSTART.md)** - 가장 빠른 배포 방법 (15분)

```powershell
# Windows
.\deploy.ps1

# Mac/Linux
./deploy.sh
```

---

## 📖 상세 가이드

### 배포 관련

| 문서 | 설명 | 난이도 | 소요 시간 |
|------|------|--------|-----------|
| **[⚡ QUICKSTART.md](./QUICKSTART.md)** | 가장 빠른 배포 방법 | ⭐☆☆☆☆ | 15분 |
| **[✅ DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** | 단계별 배포 체크리스트 | ⭐⭐☆☆☆ | 20분 |
| **[📘 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | 모든 배포 방법 상세 설명 | ⭐⭐⭐☆☆ | 필요시 |

### API 설정 관련

| 문서 | 설명 | 난이도 | 소요 시간 |
|------|------|--------|-----------|
| **[🔑 API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)** | API 키 발급 및 설정 | ⭐⭐☆☆☆ | 10-15분 |

### 프로젝트 정보

| 문서 | 설명 |
|------|------|
| **[README.md](./README.md)** | 프로젝트 개요, 기능, 기술 스택 |
| **[package.json](./package.json)** | 의존성 및 스크립트 |
| **[tsconfig.json](./tsconfig.json)** | TypeScript 설정 |

---

## 🎯 사용 시나리오별 가이드

### 시나리오 1: "빨리 배포하고 싶어요!"

1. **[⚡ QUICKSTART.md](./QUICKSTART.md)** 읽기
2. `deploy.ps1` 또는 `deploy.sh` 실행
3. 15분 후 완료! 🎉

### 시나리오 2: "천천히 따라하며 배포하고 싶어요"

1. **[✅ DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** 읽기
2. 체크리스트 따라하기
3. 막히면 **[📘 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** 참조

### 시나리오 3: "로컬에서만 사용할래요"

1. **[README.md](./README.md)** 읽기
2. `npm install` → `npm run dev`
3. 완료!

### 시나리오 4: "API 키를 발급받고 싶어요"

1. **[🔑 API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)** 읽기
2. Metals API 가입 (무료)
3. 공공데이터 포털 가입 (무료)
4. `.env.local` 파일에 키 입력

### 시나리오 5: "자세한 배포 옵션을 알고 싶어요"

1. **[📘 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** 읽기
2. Vercel, Netlify, VPS 등 선택
3. 도메인 연결 (선택사항)

---

## 📂 프로젝트 구조

```
gold-dashboard/
├── 📄 문서
│   ├── README.md                    # 프로젝트 개요
│   ├── QUICKSTART.md                # ⚡ 빠른 배포 가이드
│   ├── DEPLOYMENT_GUIDE.md          # 📘 상세 배포 가이드
│   ├── DEPLOY_CHECKLIST.md          # ✅ 배포 체크리스트
│   ├── API_SETUP_GUIDE.md           # 🔑 API 키 발급 가이드
│   └── DOCS_INDEX.md                # 📚 이 문서
│
├── 🔧 배포 스크립트
│   ├── deploy.ps1                   # Windows 자동 배포
│   └── deploy.sh                    # Mac/Linux 자동 배포
│
├── 💻 소스 코드
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API 라우트
│   │   │   ├── metals/route.ts      # 국제 금/은 시세
│   │   │   ├── fx/route.ts          # 환율
│   │   │   ├── krx-gold/route.ts    # 국내 금/은 시세
│   │   │   ├── news/route.ts        # 뉴스
│   │   │   └── recommendations/route.ts  # AI 구매 제안
│   │   ├── page.tsx                 # 메인 페이지
│   │   ├── layout.tsx               # 레이아웃
│   │   └── globals.css              # 글로벌 스타일
│   │
│   ├── components/                  # 리액트 컴포넌트
│   │   ├── KpiCard.tsx              # KPI 카드
│   │   ├── NewsPanel.tsx            # 뉴스 패널
│   │   ├── TradingViewEmbed.tsx     # 차트
│   │   └── BuyingRecommendation.tsx # AI 제안
│   │
│   └── lib/                         # 유틸리티
│       └── utils.ts                 # 헬퍼 함수
│
├── ⚙️ 설정 파일
│   ├── package.json                 # 의존성
│   ├── tsconfig.json                # TypeScript 설정
│   ├── next.config.ts               # Next.js 설정
│   └── tailwind.config.js           # Tailwind CSS 설정
│
└── 🔐 환경 변수
    └── .env.local                   # API 키 (직접 생성)
```

---

## 🔗 빠른 링크

### 📝 문서

- [프로젝트 개요](./README.md)
- [빠른 배포](./QUICKSTART.md)
- [배포 가이드](./DEPLOYMENT_GUIDE.md)
- [배포 체크리스트](./DEPLOY_CHECKLIST.md)
- [API 키 발급](./API_SETUP_GUIDE.md)

### 🌐 외부 링크

- [Vercel](https://vercel.com) - 무료 호스팅 (추천)
- [Netlify](https://www.netlify.com) - 무료 호스팅 대안
- [Metals API](https://metals.dev) - 국제 금/은 시세 API
- [공공데이터 포털](https://www.data.go.kr) - 국내 금/은 시세 API
- [GitHub](https://github.com) - 코드 저장소

### 🛠️ 개발 도구

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs)

---

## ❓ FAQ

### Q: 어떤 문서를 먼저 읽어야 하나요?

**A**: 목적에 따라 다릅니다:
- **빠르게 배포**: [QUICKSTART.md](./QUICKSTART.md)
- **천천히 배포**: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
- **로컬 실행**: [README.md](./README.md)
- **API 키 발급**: [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)

### Q: 배포하는 데 비용이 드나요?

**A**: 아니요! Vercel 무료 플랜으로 완전 무료 배포 가능합니다.

### Q: API 키가 없어도 작동하나요?

**A**: 네! API 키 없이도 목(mock) 데이터로 작동합니다.

### Q: 배포 후 코드를 수정하려면?

**A**: GitHub에 push만 하면 자동으로 재배포됩니다.

```bash
git add .
git commit -m "수정 내용"
git push
```

### Q: 모바일에서도 사용 가능한가요?

**A**: 네! 반응형 디자인으로 모든 기기에서 작동합니다.

---

## 📊 진행 상황 추적

### 배포 체크리스트

- [ ] 프로젝트 이해 ([README.md](./README.md))
- [ ] API 키 발급 ([API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)) - 선택사항
- [ ] 로컬 실행 테스트 (`npm run dev`)
- [ ] GitHub 계정 생성
- [ ] Vercel 계정 생성
- [ ] GitHub에 코드 업로드
- [ ] Vercel 배포
- [ ] 배포 확인
- [ ] 스마트폰에 추가
- [ ] 완료! 🎉

---

## 💬 도움이 필요하신가요?

- 📧 GitHub Issues에 질문하기
- 📖 해당 가이드 문서 자세히 읽기
- 🔍 에러 메시지 검색하기

---

## 🎯 추천 학습 경로

### 초보자 (처음 배포하는 경우)

1. [README.md](./README.md) - 프로젝트 이해 (5분)
2. [QUICKSTART.md](./QUICKSTART.md) - 빠른 배포 (15분)
3. [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) - API 키 발급 (10분)

**총 소요 시간**: 약 30분

### 중급자 (배포 경험 있음)

1. [README.md](./README.md) - 프로젝트 이해 (3분)
2. 직접 배포 (Vercel CLI 사용) (5분)
3. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 고급 옵션 (필요시)

**총 소요 시간**: 약 10분

### 고급자 (커스터마이징 원함)

1. 소스 코드 분석
2. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 모든 배포 옵션
3. 커스텀 도메인 연결
4. CI/CD 파이프라인 구축

**총 소요 시간**: 자유

---

## 🌟 다음 단계

배포를 완료하셨나요? 축하합니다! 🎉

이제 다음을 할 수 있습니다:

- ✨ 코드를 커스터마이징하여 자신만의 대시보드 만들기
- 🌐 커스텀 도메인 연결하기
- 📱 스마트폰 홈 화면에 추가하기
- 📊 더 많은 기능 추가하기
- 🤝 프로젝트에 기여하기 (Pull Request)

---

**마지막 업데이트**: 2026-01-25

**프로젝트 버전**: 0.1.0
