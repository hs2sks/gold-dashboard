# 🚀 배포 체크리스트

외부 접속 가능한 금/은 시세 대시보드 배포를 위한 간단한 체크리스트입니다.

---

## ✅ 1단계: 사전 준비 (5분)

- [ ] GitHub 계정 생성 또는 로그인
- [ ] Vercel 계정 생성 ([vercel.com](https://vercel.com))
  - GitHub 계정으로 간편 가입 추천
- [ ] API 키 준비 (없어도 mock 데이터로 작동 가능)
  - [ ] Metals API 키 ([metals.dev](https://metals.dev/))
  - [ ] 공공데이터 포털 서비스 키 ([data.go.kr](https://www.data.go.kr/))

---

## ✅ 2단계: 코드 GitHub에 업로드 (3분)

### 방법 1: GitHub Desktop 사용 (초보자 추천)

1. [ ] [GitHub Desktop](https://desktop.github.com/) 다운로드 및 설치
2. [ ] GitHub Desktop에서 로그인
3. [ ] "Create a New Repository" 클릭
4. [ ] 이름: `gold-dashboard`, Path: 현재 폴더 선택
5. [ ] "Create Repository" → "Publish repository" 클릭

### 방법 2: 명령어 사용

```bash
cd gold-dashboard

git init
git add .
git commit -m "Initial commit"

# GitHub에서 새 저장소 생성 후 (https://github.com/new)
git remote add origin https://github.com/your-username/gold-dashboard.git
git branch -M main
git push -u origin main
```

---

## ✅ 3단계: Vercel 배포 (5분)

1. [ ] [Vercel](https://vercel.com) 로그인
2. [ ] **"Add New Project"** 클릭
3. [ ] **"Import Git Repository"** 선택
4. [ ] `gold-dashboard` 저장소 선택 → **"Import"**
5. [ ] 설정 확인:
   - Framework: Next.js ✓ (자동 감지)
   - Root Directory: `./` ✓
   - Build Command: `npm run build` ✓

6. [ ] **환경 변수 추가** (Environment Variables 섹션):
   ```
   METALS_API_KEY = [당신의_Metals_API_키]
   EXCHANGE_RATE_API_KEY = [당신의_환율_API_키]
   DATA_GO_KR_SERVICE_KEY = [당신의_공공데이터_서비스_키]
   ```
   
7. [ ] **"Deploy"** 클릭

8. [ ] 배포 완료 대기 (2-3분)

---

## ✅ 4단계: 확인 및 테스트 (2분)

배포 완료 후 제공된 URL(예: `https://gold-dashboard-xxx.vercel.app`)에서:

- [ ] 페이지가 정상적으로 로드되는지 확인
- [ ] KPI 카드에 데이터가 표시되는지 확인
- [ ] TradingView 차트가 작동하는지 확인
- [ ] 뉴스가 표시되는지 확인
- [ ] AI 구매 제안이 표시되는지 확인
- [ ] 모바일에서도 테스트 (반응형 확인)

---

## ✅ 5단계: 공유 및 사용

이제 완료되었습니다! 🎉

- ✅ 제공된 URL을 **북마크에 저장**
- ✅ 스마트폰 홈 화면에 추가 가능
- ✅ 어디서든 인터넷만 있으면 접속 가능!

**당신의 대시보드 URL**: `https://your-project.vercel.app`

---

## 🔄 코드 업데이트 방법

코드를 수정하고 다시 배포하려면:

### GitHub Desktop 사용:

1. [ ] 코드 수정
2. [ ] GitHub Desktop에서 "Commit" 버튼 클릭
3. [ ] "Push origin" 버튼 클릭
4. [ ] 1-2분 후 자동으로 재배포 완료!

### 명령어 사용:

```bash
git add .
git commit -m "업데이트 내용 설명"
git push
```

→ Vercel이 자동으로 감지하고 재배포합니다!

---

## 🌐 선택사항: 커스텀 도메인 연결

무료 URL 대신 자신의 도메인(예: `gold.mydomain.com`)을 사용하려면:

1. [ ] 도메인 구매 (가비아, 후이즈 등, 연간 1-2만원)
2. [ ] Vercel 프로젝트 설정 → "Domains" 메뉴
3. [ ] 도메인 추가 및 DNS 설정
4. [ ] 10-30분 후 적용 완료

자세한 내용은 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 참조

---

## ❓ 문제 해결

### "Build failed" 에러

```bash
# 로컬에서 먼저 빌드 테스트
npm run build

# 에러 있으면 수정 후 다시 push
```

### 환경 변수 인식 안 됨

- Vercel 프로젝트 설정 → Environment Variables 확인
- 변수명이 정확한지 확인
- Deployments 탭에서 "Redeploy" 클릭

### API 데이터 안 나옴

- API 키가 유효한지 확인
- Mock 데이터는 나오는지 확인 (API 키 없이도 작동)
- 브라우저 콘솔(F12)에서 에러 확인

---

## 📚 추가 자료

- 📖 [상세 배포 가이드](./DEPLOYMENT_GUIDE.md)
- 📖 [API 키 발급 가이드](./API_SETUP_GUIDE.md)
- 📖 [README](./README.md)

---

**예상 소요 시간**: 15-20분

**비용**: 무료 (Vercel + 무료 URL 사용 시)

**난이도**: ⭐⭐☆☆☆ (초보자도 가능)

---

**마지막 업데이트**: 2026-01-25
