# ⚡ 빠른 시작 가이드

금/은 시세 대시보드를 외부에서 접속 가능하도록 배포하는 **가장 빠른 방법**입니다.

---

## 🎯 목표

집에서만 보던 대시보드를 **인터넷만 있으면 어디서든 볼 수 있도록** 만들기!

---

## ⏱️ 소요 시간

- **자동 스크립트 사용**: 15분
- **수동 배포**: 20분

---

## 🚀 방법 1: 자동 배포 스크립트 (추천)

### Windows 사용자

```powershell
# 1. 프로젝트 폴더로 이동
cd gold-dashboard

# 2. 스크립트 실행
.\deploy.ps1
```

### Mac/Linux 사용자

```bash
# 1. 프로젝트 폴더로 이동
cd gold-dashboard

# 2. 실행 권한 부여
chmod +x deploy.sh

# 3. 스크립트 실행
./deploy.sh
```

### 스크립트가 하는 일

1. ✅ 환경 확인 (Git, Node.js)
2. ✅ 프로젝트 빌드 테스트
3. ✅ Git 저장소 초기화
4. ✅ GitHub 연동 가이드
5. ✅ Vercel 배포 안내

---

## 📝 방법 2: 수동 배포 (3단계)

### Step 1: GitHub에 코드 업로드

```bash
cd gold-dashboard

# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub에 새 저장소 생성 후 (https://github.com/new)
git remote add origin https://github.com/your-username/gold-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Vercel 가입 및 연동

1. [Vercel](https://vercel.com) 접속
2. **GitHub 계정으로 로그인**
3. **"Add New Project"** 클릭
4. **gold-dashboard** 저장소 선택
5. **"Import"** 클릭

### Step 3: 환경 변수 설정 및 배포

1. **Environment Variables** 섹션에서:
   ```
   METALS_API_KEY = [당신의_API_키]
   DATA_GO_KR_SERVICE_KEY = [당신의_서비스_키]
   ```
   
2. **"Deploy"** 클릭

3. 2-3분 후 완료!

---

## ✅ 완료!

배포가 완료되면:

```
https://gold-dashboard-xxx.vercel.app
```

이런 URL이 생성됩니다. 이제 **어디서든 접속 가능**합니다! 🎉

### 활용 방법

- 📱 **스마트폰 홈 화면에 추가** (앱처럼 사용)
- 💼 **회사에서 접속** (인터넷만 있으면 OK)
- ☕ **카페에서 확인** (실시간 시세 체크)
- 🌏 **여행 중에도 접속** (전 세계 어디서든)

---

## 🔄 업데이트 방법

코드를 수정하고 다시 배포하려면:

```bash
git add .
git commit -m "업데이트 내용"
git push
```

→ Vercel이 자동으로 재배포! (1-2분 소요)

---

## 💡 Tips

### Tip 1: 북마크 저장

제공받은 URL을 브라우저 북마크에 저장하세요.

### Tip 2: 스마트폰 홈 화면 추가

**iOS (iPhone/iPad):**
1. Safari에서 접속
2. 공유 버튼 → "홈 화면에 추가"

**Android:**
1. Chrome에서 접속
2. 메뉴(⋮) → "홈 화면에 추가"

### Tip 3: 다크모드

시스템 설정에 따라 자동으로 다크모드 적용됩니다.

---

## ❓ 문제 해결

### "Git이 설치되어 있지 않습니다"

**해결**: [Git 다운로드](https://git-scm.com/downloads)

### "Node.js가 설치되어 있지 않습니다"

**해결**: [Node.js 다운로드](https://nodejs.org/)

### "Build failed"

**해결**:
```bash
npm run build
```
로컬에서 빌드 테스트 후 에러 수정

### 환경 변수 인식 안 됨

**해결**:
- Vercel 프로젝트 설정에서 환경 변수 재확인
- "Redeploy" 버튼 클릭

---

## 📚 추가 문서

더 자세한 정보가 필요하다면:

- 📖 **[배포 가이드 (DEPLOYMENT_GUIDE.md)](./DEPLOYMENT_GUIDE.md)**
  - Vercel, Netlify, VPS 등 모든 배포 방법
  - 도메인 연결 방법
  - 문제 해결 가이드

- ✅ **[배포 체크리스트 (DEPLOY_CHECKLIST.md)](./DEPLOY_CHECKLIST.md)**
  - 단계별 체크리스트
  - 놓친 부분 확인

- 🔑 **[API 키 발급 가이드 (API_SETUP_GUIDE.md)](./API_SETUP_GUIDE.md)**
  - Metals API 키 발급
  - 공공데이터 포털 키 발급

---

## 🎉 축하합니다!

이제 당신의 금/은 시세 대시보드가 전 세계에 공개되었습니다! 🌏

**무료로**, **HTTPS 보안 적용되어**, **어디서든 접속 가능**합니다!

---

**마지막 업데이트**: 2026-01-25
