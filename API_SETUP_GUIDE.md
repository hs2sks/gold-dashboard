# API 키 설정 가이드

이 가이드는 금/은 시세 대시보드에서 실제 API 데이터를 사용하기 위한 API 키 발급 및 설정 방법을 설명합니다.

> **참고**: API 키가 없어도 목(mock) 데이터로 대시보드를 사용할 수 있습니다.

---

## 📋 목차

1. [Metals API 키 발급](#1-metals-api-키-발급)
2. [ExchangeRate API 키 발급](#2-exchangerate-api-키-발급)
3. [공공데이터 포털 API 키 발급](#3-공공데이터-포털-api-키-발급)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [설정 확인](#5-설정-확인)

---

## 1. Metals API 키 발급

Metals API는 국제 금/은 시세(XAU/USD, XAG/USD) 데이터를 제공합니다.

### 1.1 회원가입

1. [Metals API 웹사이트](https://metals.dev/) 접속
2. 우측 상단의 **"Sign Up"** 또는 **"Get Started"** 클릭
3. 이메일과 비밀번호로 회원가입
   - 또는 Google 계정으로 간편 가입 가능

### 1.2 플랜 선택

1. 로그인 후 대시보드 페이지로 이동
2. **Free Plan** 선택 (무료)
   - 월 100회 API 호출 제한
   - 일일 업데이트
   - 기본 기능 사용 가능

### 1.3 API 키 확인

1. 대시보드에서 **"API Keys"** 메뉴 클릭
2. API Key가 자동으로 생성되어 표시됩니다
3. **복사** 버튼을 클릭하여 API 키를 복사

```
예시: 1a2b3c4d5e6f7g8h9i0j
```

### 1.4 사용 예시

```bash
# API 테스트 (터미널에서 실행)
curl "https://api.metals.dev/v1/latest?api_key=YOUR_API_KEY&currency=USD&unit=toz"
```

---

## 2. ExchangeRate API 키 발급

ExchangeRate API는 정확한 원-달러 환율(USD/KRW) 데이터를 제공합니다.

### 2.1 회원가입

1. [ExchangeRate-API 웹사이트](https://www.exchangerate-api.com/) 접속
2. 상단의 **"Get Free Key"** 또는 **"Sign Up"** 클릭
3. 이메일 주소 입력
4. 이메일로 받은 링크 클릭하여 계정 활성화

### 2.2 플랜 선택

1. 이메일 인증 후 자동으로 **Free Plan** 활성화
   - 월 1,500회 API 호출 제한
   - 정확한 실시간 환율
   - 165개 통화 지원

### 2.3 API 키 확인

1. 로그인 후 대시보드로 자동 이동
2. **"Your API Key"** 섹션에 API 키 표시
3. **Copy** 버튼을 클릭하여 API 키를 복사

```
예시: a1b2c3d4e5f6g7h8i9j0k1l2
```

### 2.4 사용 예시

```bash
# API 테스트 (터미널에서 실행)
curl "https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/USD"
```

**참고**: API 키 없이도 무료 API(exchangerate.host)를 사용할 수 있지만, 정확도가 낮을 수 있습니다.

---

## 3. 공공데이터 포털 API 키 발급

공공데이터 포털은 국내 금/은 시세(KRX) 데이터를 제공합니다.

### 2.1 회원가입

1. [공공데이터 포털](https://www.data.go.kr/) 접속
2. 우측 상단의 **"회원가입"** 클릭
3. 본인인증 후 회원정보 입력
   - 실명 인증 필요
   - 휴대폰 또는 아이핀 인증

### 2.2 API 신청

1. 로그인 후 검색창에 **"일반상품시세정보"** 검색
   - 또는 **"금융위원회_일반상품시세정보"** 검색
   - 링크: https://www.data.go.kr/data/15094805/openapi.do
2. **"금융위원회_일반상품시세정보"** API 선택
   - 금시세, 석유시세, 배출권시세 포함
3. **"활용신청"** 버튼 클릭

### 2.3 활용 정보 입력

1. **활용목적**: "개인 학습용" 또는 "프로젝트 개발"
2. **상세기능정보**: 
   - "금시세 조회" 체크
   - "은시세 조회" 체크 (있는 경우)
3. **라이선스 표시**: "동의함" 체크
4. **신청하기** 클릭

### 2.4 승인 대기

- 일반적으로 **즉시 승인**됩니다
- 경우에 따라 1-2일 소요될 수 있습니다

### 2.5 API 키 확인

1. **"마이페이지"** > **"오픈API"** > **"개발계정"** 메뉴로 이동
2. **"일반 인증키(Encoding)"** 확인
3. **인증키** 복사 (URL 인코딩된 키 사용)

```
예시: ABC123def456GHI789jkl%2B%2FmnoPQR%3D%3D
```

### 2.6 사용 예시

```bash
# API 테스트 (터미널에서 실행)
# 금 시세 조회 (itmKndCd=20: 금, 21: 은)
curl "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=YOUR_SERVICE_KEY&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

---

## 4. 환경 변수 설정

### 4.1 .env.local 파일 생성

프로젝트 루트 디렉토리(`gold-dashboard/`)에 `.env.local` 파일을 생성합니다.

```bash
# Windows
cd gold-dashboard
type nul > .env.local

# Mac/Linux
cd gold-dashboard
touch .env.local
```

### 4.2 API 키 입력

`.env.local` 파일을 편집기로 열고 다음 내용을 입력합니다:

```env
# Metals API (국제 금/은 시세)
METALS_API_KEY=여기에_Metals_API_키_입력

# ExchangeRate API (원-달러 환율)
EXCHANGE_RATE_API_KEY=여기에_ExchangeRate_API_키_입력

# 공공데이터 포털 (국내 금/은 시세)
DATA_GO_KR_SERVICE_KEY=여기에_공공데이터_인증키_입력
```

### 4.3 실제 예시

```env
# 예시 (실제 키로 교체하세요)
METALS_API_KEY=1a2b3c4d5e6f7g8h9i0j
EXCHANGE_RATE_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2
DATA_GO_KR_SERVICE_KEY=ABC123def456GHI789jkl%2B%2FmnoPQR%3D%3D
```

### 4.4 주의사항

- ⚠️ `.env.local` 파일은 **절대 공개하지 마세요**
- ⚠️ Git에 커밋하지 마세요 (`.gitignore`에 포함되어 있음)
- ⚠️ 키 앞뒤로 **공백이나 따옴표를 넣지 마세요**

---

## 5. 설정 확인

### 5.1 개발 서버 재시작

환경 변수를 설정한 후에는 개발 서버를 재시작해야 합니다.

```bash
# 서버가 실행 중이면 Ctrl+C로 종료 후
npm run dev
```

### 5.2 데이터 확인

1. 브라우저에서 http://localhost:3000 접속
2. KPI 카드에 실제 시세 데이터가 표시되는지 확인
3. 브라우저 개발자 도구(F12) > Console 탭에서 에러 확인

### 5.3 API 엔드포인트 직접 테스트

브라우저에서 다음 URL로 직접 확인:

- 국제 금/은 시세: http://localhost:3000/api/metals
- 환율: http://localhost:3000/api/fx
- 국내 금/은 시세: http://localhost:3000/api/krx-gold
- 뉴스: http://localhost:3000/api/news
- 구매 제안: http://localhost:3000/api/recommendations

### 5.4 문제 해결

#### API 키가 작동하지 않는 경우

1. **키 복사 확인**
   - 공백이나 개행이 포함되지 않았는지 확인
   - 전체 키가 복사되었는지 확인

2. **환경 변수 재확인**
   ```bash
   # Windows PowerShell
   $env:METALS_API_KEY
   
   # Mac/Linux
   echo $METALS_API_KEY
   ```

3. **서버 로그 확인**
   - 터미널에서 에러 메시지 확인
   - "METALS_API_KEY not found" 메시지가 나오면 환경 변수 미설정 상태

4. **캐시 문제**
   ```bash
   # Next.js 캐시 삭제
   rm -rf .next
   # 또는 Windows에서
   rmdir /s .next
   
   # 재시작
   npm run dev
   ```

#### 공공데이터 API 404 오류 해결

**증상**: `API responded with status: 404` 오류 발생

**원인 및 해결 방법:**

1. **서비스 키 확인**
   - 마이페이지 > 오픈API > 개발계정에서 **일반 인증키(Encoding)** 확인
   - URL 인코딩된 키를 사용해야 함 (예: `ABC%2B123%3D`)
   - Decoding 키가 아닌 **Encoding 키** 사용

2. **API 신청 상태 확인**
   - 마이페이지 > 오픈API > 활용신청 내역에서 승인 상태 확인
   - 승인 대기 중이면 1-2일 기다리기
   - 반려된 경우 사유 확인 후 재신청

3. **API 엔드포인트 확인**
   - 공공데이터 포털에서 API 문서 확인
   - 엔드포인트 URL이 변경되었는지 확인
   - 현재 사용 중인 URL:
     ```
     https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr
     ```

4. **서비스 키 인코딩 문제**
   - 서비스 키에 특수문자(`+`, `/`, `=`)가 포함된 경우 URL 인코딩 필요
   - 코드에서 자동으로 인코딩하도록 수정됨

5. **직접 API 테스트**
   ```bash
   # 브라우저에서 직접 테스트 (서비스 키를 실제 키로 교체)
   https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=YOUR_SERVICE_KEY&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20
   ```
   - 404가 나오면: API 엔드포인트 문제 또는 서비스 키 문제
   - 다른 오류가 나오면: 오류 메시지 확인

6. **대안: 목 데이터 사용**
   - API 키가 없거나 문제가 있으면 자동으로 목 데이터 사용
   - 대시보드는 정상 작동하지만 실제 데이터는 아님

#### 공공데이터 API 승인이 안 된 경우

1. 마이페이지에서 신청 상태 확인
2. 승인 대기 중이면 1-2일 기다리기
3. 반려된 경우 사유 확인 후 재신청

#### 할당량 초과

- **Metals API**: 무료 플랜은 월 100회 제한
  - 대시보드는 12시간마다 갱신하므로 약 60회/월 사용
  - ✅ 무료 플랜으로 충분
- **ExchangeRate API**: 무료 플랜은 월 1,500회 제한
  - 대시보드는 12시간마다 갱신하므로 약 60회/월 사용
  - ✅ 무료 플랜으로 충분
- **공공데이터**: 일일 1000회 제한
  - 대시보드는 24시간마다 갱신하므로 약 30회/월 사용
  - ✅ 충분함

---

## 6. API 키 없이 사용하기

API 키 없이도 대시보드를 체험할 수 있습니다.

### 목 데이터 제공

- 모든 API는 키가 없으면 자동으로 **목(mock) 데이터**를 반환합니다
- 실제 데이터는 아니지만 대시보드의 모든 기능을 테스트할 수 있습니다

### 목 데이터 특징

- ✅ 현실적인 가격 범위
- ✅ 변동률 포함
- ✅ 모든 컴포넌트 정상 작동
- ❌ 실시간 데이터 아님
- ❌ 뉴스는 예시 데이터

---

## 7. 보안 권장사항

### 환경 변수 보안

1. **절대 공개하지 않기**
   - GitHub, GitLab 등에 업로드 금지
   - 스크린샷, 블로그 포스팅 시 주의

2. **정기적으로 키 갱신**
   - 유출 의심 시 즉시 재발급

3. **권한 제한**
   - API 키는 읽기 전용으로만 사용
   - 불필요한 권한 부여하지 않기

### .gitignore 확인

`.gitignore` 파일에 다음이 포함되어 있는지 확인:

```gitignore
# 환경 변수
.env
.env.local
.env.*.local
```

---

## 8. 추가 자료

### 공식 문서

- [Metals API Documentation](https://metals.dev/docs)
- [ExchangeRate-API Documentation](https://www.exchangerate-api.com/docs)
- [공공데이터 포털 가이드](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do)

### 문의

- 프로젝트 이슈: GitHub Issues
- 공공데이터 포털: 고객센터 (1577-5771)

---

**마지막 업데이트**: 2026-01-25
