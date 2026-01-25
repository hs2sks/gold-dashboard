# 배포 가이드 (Deployment Guide)

금/은 시세 대시보드를 외부에서도 접속 가능하도록 배포하는 방법을 안내합니다.

---

## 📋 목차

1. [Vercel 배포 (추천)](#1-vercel-배포-추천)
2. [Netlify 배포](#2-netlify-배포)
3. [클라우드 VPS 배포](#3-클라우드-vps-배포)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [도메인 연결](#5-도메인-연결)
6. [문제 해결](#6-문제-해결)

---

## 1. Vercel 배포 (추천)

**Vercel**은 Next.js를 개발한 회사에서 제공하는 무료 호스팅 서비스입니다.

### 1.1 장점

- ✅ **완전 무료** (개인 프로젝트)
- ✅ **자동 HTTPS** 적용
- ✅ **글로벌 CDN** 제공
- ✅ **자동 배포** (Git push 시)
- ✅ **쉬운 설정** (클릭 몇 번으로 완료)
- ✅ **무제한 대역폭**

### 1.2 배포 방법

#### 방법 A: GitHub 연동 (추천)

**Step 1: GitHub에 코드 업로드**

```bash
# 프로젝트 디렉토리로 이동
cd gold-dashboard

# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit"

# GitHub에 새 저장소 생성 후 연결
git remote add origin https://github.com/your-username/gold-dashboard.git
git branch -M main
git push -u origin main
```

**Step 2: Vercel 계정 생성**

1. [Vercel](https://vercel.com) 접속
2. **"Sign Up"** 클릭
3. **GitHub 계정으로 로그인** (추천)

**Step 3: 프로젝트 배포**

1. Vercel 대시보드에서 **"Add New Project"** 클릭
2. **"Import Git Repository"** 선택
3. GitHub 저장소 목록에서 `gold-dashboard` 선택
4. **"Import"** 클릭

**Step 4: 설정 확인**

- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: `./` (또는 프로젝트 루트)
- **Build Command**: `npm run build` (자동 설정)
- **Output Directory**: `.next` (자동 설정)

**Step 5: 환경 변수 추가**

1. **"Environment Variables"** 섹션 펼치기
2. 다음 변수 추가:
   ```
   Name: METALS_API_KEY
   Value: [your_metals_api_key]
   
   Name: EXCHANGE_RATE_API_KEY
   Value: [your_exchange_rate_api_key]
   
   Name: DATA_GO_KR_SERVICE_KEY
   Value: [your_data_go_kr_service_key]
   ```
3. **"Deploy"** 클릭

**Step 6: 배포 완료!**

- 약 2-3분 후 배포 완료
- 제공된 URL(예: `https://gold-dashboard-xxx.vercel.app`)로 접속 가능
- 이제 어디서든 인터넷만 있으면 접속 가능합니다! 🎉

#### 방법 B: Vercel CLI (명령어)

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 디렉토리로 이동
cd gold-dashboard

# 배포 (처음 실행 시 로그인 필요)
vercel

# 프로덕션 배포
vercel --prod
```

### 1.3 자동 배포 설정

GitHub 연동 시 자동으로 활성화됩니다:

- **main 브랜치**에 push → 프로덕션 자동 배포
- **다른 브랜치**에 push → 미리보기 배포

### 1.4 무료 플랜 제한사항

- 월 100GB 대역폭 (일반적으로 충분함)
- 동시 빌드: 1개
- 배포 횟수: 무제한
- 프로젝트 수: 무제한

---

## 2. Netlify 배포

**Netlify**는 Vercel의 대안으로 유사한 서비스를 제공합니다.

### 2.1 배포 방법

**Step 1: Netlify 계정 생성**

1. [Netlify](https://www.netlify.com) 접속
2. **"Sign Up"** 클릭
3. GitHub 계정으로 로그인

**Step 2: 프로젝트 배포**

1. **"Add new site"** > **"Import an existing project"** 클릭
2. **"Deploy with GitHub"** 선택
3. 저장소 선택: `gold-dashboard`
4. 빌드 설정:
   ```
   Build command: npm run build
   Publish directory: .next
   ```

**Step 3: 환경 변수 추가**

1. **"Site settings"** > **"Environment variables"** 메뉴
2. 다음 변수 추가:
   ```
   METALS_API_KEY=[your_api_key]
   DATA_GO_KR_SERVICE_KEY=[your_service_key]
   ```

**Step 4: 배포**

- **"Deploy site"** 클릭
- 제공된 URL(예: `https://gold-dashboard-xxx.netlify.app`)로 접속

### 2.2 Next.js 플러그인 설치 (선택)

더 나은 Next.js 지원을 위해:

```bash
npm install -D @netlify/plugin-nextjs
```

`netlify.toml` 파일 생성:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 3. 클라우드 VPS 배포

더 많은 제어권이 필요하다면 VPS를 사용할 수 있습니다.

### 3.1 AWS Lightsail / DigitalOcean / Vultr

**비용**: 월 $5-10 정도

**Step 1: VPS 생성**

1. 서비스 선택 (AWS Lightsail 추천)
2. Ubuntu 22.04 LTS 선택
3. 인스턴스 생성

**Step 2: 서버 설정**

```bash
# SSH 접속
ssh ubuntu@your-server-ip

# Node.js 설치 (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2

# 프로젝트 클론
git clone https://github.com/your-username/gold-dashboard.git
cd gold-dashboard

# 의존성 설치
npm install

# 환경 변수 설정
nano .env.local
# (API 키 입력)

# 프로덕션 빌드
npm run build

# PM2로 실행
pm2 start npm --name "gold-dashboard" -- start
pm2 startup
pm2 save
```

**Step 3: Nginx 리버스 프록시 설정**

```bash
# Nginx 설치
sudo apt update
sudo apt install nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/gold-dashboard

# 다음 내용 입력:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/gold-dashboard /etc/nginx/sites-enabled/

# Nginx 재시작
sudo systemctl restart nginx
```

**Step 4: SSL 인증서 설치 (HTTPS)**

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com
```

### 3.2 비용 비교

| 서비스 | 월 비용 | 장점 | 단점 |
|--------|---------|------|------|
| Vercel | 무료 | 간편, 자동화 | 제한된 제어권 |
| Netlify | 무료 | 간편, 자동화 | 제한된 제어권 |
| AWS Lightsail | $5-10 | 완전한 제어권 | 수동 설정 필요 |
| DigitalOcean | $6-12 | 완전한 제어권 | 수동 설정 필요 |

---

## 4. 환경 변수 설정

배포 환경에서 환경 변수를 안전하게 설정하는 방법입니다.

### 4.1 Vercel

1. 프로젝트 **"Settings"** > **"Environment Variables"**
2. 변수 추가:
   - `METALS_API_KEY`
   - `EXCHANGE_RATE_API_KEY`
   - `DATA_GO_KR_SERVICE_KEY`
3. **Environment**: Production, Preview, Development 모두 선택

### 4.2 Netlify

1. **"Site settings"** > **"Environment variables"**
2. **"Add a variable"** 클릭
3. 다음 변수 추가:
   - `METALS_API_KEY`
   - `EXCHANGE_RATE_API_KEY`
   - `DATA_GO_KR_SERVICE_KEY`

### 4.3 주의사항

- ⚠️ **절대 GitHub에 API 키를 커밋하지 마세요**
- ⚠️ `.env.local` 파일은 `.gitignore`에 포함되어야 합니다
- ✅ 배포 플랫폼의 환경 변수 기능만 사용하세요

---

## 5. 도메인 연결

무료 URL 대신 자신의 도메인을 사용할 수 있습니다.

### 5.1 도메인 구매

- [가비아](https://www.gabia.com/)
- [후이즈](https://www.whois.co.kr/)
- [Cloudflare](https://www.cloudflare.com/)
- [Namecheap](https://www.namecheap.com/)

**비용**: 연간 약 1만-2만원

### 5.2 Vercel에 도메인 연결

**Step 1: 도메인 추가**

1. Vercel 프로젝트 **"Settings"** > **"Domains"**
2. 도메인 입력 (예: `gold-dashboard.com`)
3. **"Add"** 클릭

**Step 2: DNS 설정**

도메인 등록업체에서 다음 레코드 추가:

```
Type: A
Name: @ (또는 비워둠)
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Step 3: 확인**

- 10-30분 후 적용됨
- HTTPS 자동 활성화

### 5.3 Netlify에 도메인 연결

1. **"Domain settings"** > **"Add custom domain"**
2. 도메인 입력
3. DNS 레코드 추가 (Netlify에서 제공하는 값)

---

## 6. 문제 해결

### 6.1 빌드 에러

**증상**: "Build failed" 메시지

**해결**:

```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 후 수정
# 수정 후 다시 push
```

### 6.2 환경 변수 인식 안 됨

**증상**: API가 mock 데이터만 반환

**해결**:
1. 배포 플랫폼에서 환경 변수 확인
2. 변수명이 정확한지 확인 (`METALS_API_KEY`)
3. 재배포 (Redeploy) 실행

### 6.3 API 호출 실패

**증상**: "Failed to fetch" 에러

**해결**:
1. API 키가 유효한지 확인
2. CORS 설정 확인
3. 배포 로그에서 상세 에러 확인

### 6.4 느린 로딩

**증상**: 페이지가 느리게 로드됨

**해결**:
- Vercel/Netlify는 글로벌 CDN 사용하므로 대부분 빠름
- API 응답 시간 확인 (외부 API 문제일 수 있음)
- 캐싱 설정 확인

### 6.5 배포 후 변경사항 반영 안 됨

**증상**: 코드 수정했는데 사이트에 반영 안 됨

**해결**:
1. 브라우저 캐시 삭제 (Ctrl + Shift + R)
2. Vercel/Netlify에서 재배포
3. 배포 로그에서 최신 커밋 확인

---

## 7. 추천 배포 프로세스

### 7.1 개발 → 배포 워크플로우

```bash
# 1. 로컬에서 개발
npm run dev

# 2. 테스트
npm run build
npm start

# 3. Git 커밋
git add .
git commit -m "Update: 기능 추가"

# 4. GitHub에 push
git push origin main

# 5. 자동 배포 (Vercel/Netlify)
# → 1-2분 후 자동으로 배포 완료!
```

### 7.2 Best Practices

- ✅ **main 브랜치**: 프로덕션 환경
- ✅ **develop 브랜치**: 개발 환경 (미리보기)
- ✅ **feature 브랜치**: 새 기능 개발
- ✅ **Pull Request**: 코드 리뷰 후 병합
- ✅ **환경 변수**: 플랫폼에서 관리
- ✅ **모니터링**: 배포 로그 정기 확인

---

## 8. 배포 후 확인사항

### 8.1 기능 테스트

- [ ] 대시보드 페이지 로드
- [ ] KPI 카드에 데이터 표시
- [ ] TradingView 차트 작동
- [ ] 뉴스 패널 표시
- [ ] AI 구매 제안 표시
- [ ] 60초 자동 갱신 작동
- [ ] 모바일 반응형 확인

### 8.2 성능 확인

- [Lighthouse](https://developers.google.com/web/tools/lighthouse) 테스트
- [PageSpeed Insights](https://pagespeed.web.dev/) 테스트
- 목표: Performance 90+ 점수

### 8.3 SEO 및 메타데이터

`app/layout.tsx`에 메타데이터 추가:

```typescript
export const metadata = {
  title: '금/은 시세 대시보드',
  description: '실시간 금/은 시세, 환율, 뉴스를 확인할 수 있는 대시보드',
  keywords: '금시세, 은시세, 환율, 금투자, KRX',
  openGraph: {
    title: '금/은 시세 대시보드',
    description: '실시간 금/은 시세 확인',
    type: 'website',
  },
};
```

---

## 9. 비용 예상

### 9.1 완전 무료 방식

- **호스팅**: Vercel/Netlify (무료)
- **도메인**: 없음 (제공된 URL 사용)
- **API**: Metals API 무료 플랜 (월 100회 제한)

**총 비용**: 0원

### 9.2 커스텀 도메인 방식

- **호스팅**: Vercel/Netlify (무료)
- **도메인**: 연간 1만-2만원
- **API**: Metals API 무료 플랜

**총 비용**: 연간 약 1만-2만원

### 9.3 프로 방식

- **호스팅**: Vercel Pro (월 $20)
- **도메인**: 연간 1만원
- **API**: Metals API 유료 플랜 (월 $10)

**총 비용**: 월 약 3만원 + 연간 도메인 비용

---

## 10. 자주 묻는 질문 (FAQ)

### Q1: 완전 무료로 배포할 수 있나요?

**A**: 네! Vercel 또는 Netlify를 사용하면 완전 무료로 배포 가능합니다. 제공된 URL(예: `xxx.vercel.app`)을 사용하면 됩니다.

### Q2: 배포 후 코드를 수정하려면?

**A**: GitHub에 push만 하면 자동으로 재배포됩니다.

```bash
git add .
git commit -m "수정사항"
git push
```

### Q3: 개인 도메인 없이도 사용 가능한가요?

**A**: 네! Vercel/Netlify에서 제공하는 무료 URL을 사용할 수 있습니다.

### Q4: 배포 후 API 키를 바꾸려면?

**A**: 배포 플랫폼의 환경 변수 설정에서 변경 후 재배포하면 됩니다.

### Q5: 모바일에서도 잘 작동하나요?

**A**: 네! 반응형 디자인으로 모든 기기에서 작동합니다.

### Q6: 배포 시간은 얼마나 걸리나요?

**A**: 처음 배포는 5-10분, 이후 업데이트는 1-2분 정도 걸립니다.

### Q7: 트래픽 제한이 있나요?

**A**: Vercel 무료 플랜은 월 100GB 대역폭 제공 (개인 사용에 충분함)

---

## 결론

**가장 추천하는 방법**: 

1. ✨ **Vercel + GitHub 연동** (무료, 쉬움, 자동화)
2. 🌐 **커스텀 도메인 연결** (선택사항, 연간 1-2만원)
3. 🔑 **환경 변수로 API 키 관리** (보안)

이 방법으로 **5-10분 안에 전 세계 어디서든 접속 가능한 대시보드**를 만들 수 있습니다!

---

**마지막 업데이트**: 2026-01-25

**문의**: GitHub Issues 또는 프로젝트 저장소
