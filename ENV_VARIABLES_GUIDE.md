# 🔑 환경 변수 추가/수정 가이드

배포 후 나중에 API 키를 추가하거나 변경하는 방법을 안내합니다.

---

## 📋 목차

1. [Vercel에서 환경 변수 추가](#1-vercel에서-환경-변수-추가)
2. [Netlify에서 환경 변수 추가](#2-netlify에서-환경-변수-추가)
3. [환경 변수 확인](#3-환경-변수-확인)
4. [문제 해결](#4-문제-해결)

---

## 1. Vercel에서 환경 변수 추가

### 1.1 단계별 가이드

**Step 1: Vercel 대시보드 접속**

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. GitHub 계정으로 로그인
3. 배포한 프로젝트(`gold-dashboard`) 클릭

**Step 2: 환경 변수 메뉴로 이동**

1. 상단 메뉴에서 **"Settings"** 클릭
2. 왼쪽 사이드바에서 **"Environment Variables"** 클릭

**Step 3: 환경 변수 추가**

1. **"Add New"** 버튼 클릭
2. 다음 정보 입력:
   ```
   Key: METALS_API_KEY
   Value: [실제 API 키 값]
   Environment: 
     ☑ Production
     ☑ Preview
     ☑ Development
   ```
3. **"Save"** 클릭

**Step 4: 다른 환경 변수도 추가**

같은 방법으로 다음 변수들도 추가:

- `EXCHANGE_RATE_API_KEY` - 환율 API 키
- `DATA_GO_KR_SERVICE_KEY` - 공공데이터 서비스 키

**Step 5: 재배포 (중요!)**

환경 변수를 추가/수정한 후에는 **반드시 재배포**해야 적용됩니다:

1. 상단 메뉴에서 **"Deployments"** 탭 클릭
2. 가장 최근 배포 항목의 **"⋯"** (점 3개) 메뉴 클릭
3. **"Redeploy"** 선택
4. **"Redeploy"** 버튼 클릭
5. 약 1-2분 후 재배포 완료

### 1.2 환경 변수 수정하기

1. **Settings** > **Environment Variables** 메뉴
2. 수정할 변수의 **"Edit"** 버튼 클릭
3. Value 값 수정
4. **"Save"** 클릭
5. **재배포** (위 Step 5 참조)

### 1.3 환경 변수 삭제하기

1. **Settings** > **Environment Variables** 메뉴
2. 삭제할 변수의 **"Delete"** 버튼 클릭
3. 확인 후 삭제
4. **재배포** (위 Step 5 참조)

---

## 2. Netlify에서 환경 변수 추가

### 2.1 단계별 가이드

**Step 1: Netlify 대시보드 접속**

1. [Netlify 대시보드](https://app.netlify.com/) 접속
2. 배포한 사이트 선택

**Step 2: 환경 변수 메뉴로 이동**

1. **"Site settings"** 클릭
2. 왼쪽 메뉴에서 **"Environment variables"** 클릭

**Step 3: 환경 변수 추가**

1. **"Add a variable"** 버튼 클릭
2. Key와 Value 입력:
   ```
   Key: METALS_API_KEY
   Value: [실제 API 키 값]
   ```
3. **"Save"** 클릭

**Step 4: 재배포**

1. **"Deploys"** 탭 클릭
2. 최신 배포의 **"Trigger deploy"** > **"Clear cache and deploy site"** 클릭

---

## 3. 환경 변수 확인

### 3.1 재배포 후 확인

1. **사이트 접속**: 배포된 URL로 접속
2. **기능 테스트**:
   - KPI 카드에 실제 데이터가 표시되는지 확인
   - API 엔드포인트가 실제 데이터를 반환하는지 확인
3. **브라우저 콘솔 확인**:
   - F12 > Console 탭에서 에러 확인
   - "API key not found" 같은 메시지가 없어야 함

### 3.2 API 엔드포인트 직접 테스트

브라우저에서 다음 URL로 직접 확인:

- 국제 금/은 시세: `https://your-site.vercel.app/api/metals`
- 환율: `https://your-site.vercel.app/api/fx`
- 국내 금/은 시세: `https://your-site.vercel.app/api/krx-gold`

**정상 작동 시**: 실제 데이터가 JSON 형식으로 반환됨
**문제 있을 시**: Mock 데이터가 반환되거나 에러 메시지 표시

---

## 4. 문제 해결

### 4.1 환경 변수가 적용되지 않는 경우

**증상**: 환경 변수를 추가했는데도 여전히 mock 데이터가 표시됨

**해결 방법**:

1. ✅ **재배포 확인**: 환경 변수 추가 후 반드시 재배포했는지 확인
2. ✅ **변수명 확인**: 대소문자 정확히 일치하는지 확인
   - 올바름: `METALS_API_KEY`
   - 잘못됨: `metals_api_key`, `Metals_Api_Key`
3. ✅ **값 확인**: API 키 값에 공백이나 특수문자가 포함되지 않았는지 확인
4. ✅ **Environment 선택**: Production, Preview, Development 중 필요한 환경 모두 선택했는지 확인

### 4.2 재배포가 실패하는 경우

**증상**: "Redeploy" 클릭했는데 실패함

**해결 방법**:

1. **배포 로그 확인**: Deployments 탭에서 실패한 배포의 로그 확인
2. **빌드 에러 확인**: 로컬에서 `npm run build` 실행하여 에러 확인
3. **GitHub 연동 확인**: GitHub 저장소와 정상 연동되어 있는지 확인

### 4.3 API 키가 유효하지 않은 경우

**증상**: 환경 변수는 추가했는데 API 호출이 실패함

**해결 방법**:

1. **API 키 유효성 확인**: 
   - Metals API: [metals.dev](https://metals.dev/) 대시보드에서 키 확인
   - ExchangeRate API: [exchangerate-api.com](https://www.exchangerate-api.com/) 대시보드에서 키 확인
   - 공공데이터: [data.go.kr](https://www.data.go.kr/) 마이페이지에서 키 확인
2. **할당량 확인**: 무료 플랜의 월 사용량 제한을 초과했는지 확인
3. **키 재발급**: 문제가 계속되면 API 키를 재발급받아 새로 입력

---

## 5. 자주 묻는 질문 (FAQ)

### Q1: 환경 변수를 추가한 후 재배포하지 않으면?

**A**: 환경 변수가 적용되지 않습니다. 반드시 재배포해야 합니다.

### Q2: 일부 환경 변수만 추가해도 되나요?

**A**: 네! 필요한 것만 추가하면 됩니다. 없는 변수는 자동으로 mock 데이터를 사용합니다.

### Q3: 환경 변수를 여러 개 한 번에 추가할 수 있나요?

**A**: Vercel에서는 하나씩 추가해야 합니다. Netlify도 마찬가지입니다.

### Q4: 환경 변수 값에 특수문자가 포함되어야 하나요?

**A**: 공공데이터 포털의 서비스 키는 URL 인코딩된 값(예: `ABC%2B123%3D`)을 사용해야 합니다. 다른 API 키는 그대로 입력하면 됩니다.

### Q5: 환경 변수를 삭제하면 어떻게 되나요?

**A**: 해당 API는 자동으로 mock 데이터를 사용합니다. 사이트는 정상 작동하지만 실제 데이터는 아닙니다.

---

## 6. 빠른 참조

### 필요한 환경 변수 목록

```
METALS_API_KEY              # 국제 금/은 시세 (metals.dev)
EXCHANGE_RATE_API_KEY       # 원-달러 환율 (exchangerate-api.com)
DATA_GO_KR_SERVICE_KEY      # 국내 금/은 시세 (data.go.kr)
```

### 재배포 명령어 (Vercel CLI 사용 시)

```bash
# 프로젝트 디렉토리에서
vercel --prod
```

### 재배포 자동화

GitHub에 push하면 자동으로 재배포되며, 새로 추가한 환경 변수도 함께 적용됩니다:

```bash
git add .
git commit -m "Update"
git push
```

---

**마지막 업데이트**: 2026-01-25

**관련 문서**:
- [API 키 발급 가이드](./API_SETUP_GUIDE.md)
- [배포 가이드](./DEPLOYMENT_GUIDE.md)
