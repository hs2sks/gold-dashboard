# 공공데이터 포털 API 엔드포인트 가이드

## 기본 정보

**서비스 URL**: `https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService`

**제공기관**: 금융위원회

**서비스명**: 일반상품시세정보

**데이터 포맷**: JSON, XML

**인증 방식**: 서비스 키 (Service Key)

---

## 사용 가능한 엔드포인트

### 1. 일반상품종가정보 조회
**엔드포인트**: `/getGnrlPrdctClpr`

**설명**: 일반상품의 종가(종료가격) 정보를 조회합니다.

**현재 사용 중**: ✅ (`app/api/krx-gold/route.ts`)

**요청 파라미터**:
- `serviceKey` (필수): 공공데이터 포털에서 발급받은 서비스 키
- `numOfRows` (선택): 한 페이지 결과 수 (기본값: 10)
- `pageNo` (선택): 페이지 번호 (기본값: 1)
- `resultType` (선택): 응답 형식 (`json` 또는 `xml`, 기본값: `xml`)
- `itmKndCd` (선택): 품목종류코드
  - `20`: 금
  - `21`: 은
  - 기타 품목 코드

**예시 요청**:
```bash
curl "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=YOUR_SERVICE_KEY&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

**응답 필드**:
- `basDt`: 기준일자
- `itmsNm`: 품목명
- `clpr`: 종가
- `vs`: 전일대비
- `fltRt`: 등락률
- `mkp`: 시가
- `hipr`: 고가
- `lopr`: 저가
- `trqu`: 거래량
- `trPrc`: 거래대금

---

### 2. 일반상품시가정보 조회
**엔드포인트**: `/getGnrlPrdctOprc`

**설명**: 일반상품의 시가(시작가격) 정보를 조회합니다.

**현재 사용 중**: ❌

**요청 파라미터**:
- `serviceKey` (필수): 서비스 키
- `numOfRows` (선택): 한 페이지 결과 수
- `pageNo` (선택): 페이지 번호
- `resultType` (선택): 응답 형식
- `itmKndCd` (선택): 품목종류코드

**예시 요청**:
```bash
curl "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctOprc?serviceKey=YOUR_SERVICE_KEY&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

---

### 3. 일반상품고가정보 조회
**엔드포인트**: `/getGnrlPrdctHprc`

**설명**: 일반상품의 고가(최고가격) 정보를 조회합니다.

**현재 사용 중**: ❌

**요청 파라미터**: 위와 동일

**예시 요청**:
```bash
curl "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctHprc?serviceKey=YOUR_SERVICE_KEY&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

---

### 4. 일반상품저가정보 조회
**엔드포인트**: `/getGnrlPrdctLprc`

**설명**: 일반상품의 저가(최저가격) 정보를 조회합니다.

**현재 사용 중**: ❌

**요청 파라미터**: 위와 동일

**예시 요청**:
```bash
curl "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctLprc?serviceKey=YOUR_SERVICE_KEY&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

---

## 품목종류코드 (itmKndCd)

| 코드 | 품목명 |
|------|--------|
| 20   | 금     |
| 21   | 은     |
| 기타 | 공공데이터 포털에서 확인 필요 |

---

## 공통 요청 파라미터

### 필수 파라미터
- `serviceKey`: 공공데이터 포털에서 발급받은 서비스 키 (URL 인코딩 필요)

### 선택 파라미터
- `numOfRows`: 한 페이지 결과 수 (기본값: 10, 최대값: 1000)
- `pageNo`: 페이지 번호 (기본값: 1)
- `resultType`: 응답 형식 (`json` 또는 `xml`, 기본값: `xml`)
- `itmKndCd`: 품목종류코드
- `basDt`: 기준일자 (YYYYMMDD 형식)

---

## 응답 구조

### 성공 응답 (resultCode: "00")
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL_SERVICE"
    },
    "body": {
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 1,
      "items": {
        "item": [
          {
            "basDt": "20240125",
            "itmsNm": "금",
            "clpr": "82500",
            "vs": "500",
            "fltRt": "0.61",
            "mkp": "82000",
            "hipr": "83000",
            "lopr": "81900",
            "trqu": "1000",
            "trPrc": "82500000"
          }
        ]
      }
    }
  }
}
```

### 오류 응답
```json
{
  "response": {
    "header": {
      "resultCode": "03",
      "resultMsg": "SERVICE_KEY_IS_NOT_REGISTERED_ERROR"
    },
    "body": null
  }
}
```

---

## 오류 코드

| 코드 | 설명 | 해결 방법 |
|------|------|-----------|
| 00   | 정상 | - |
| 01   | API 신청 미승인 | 공공데이터 포털에서 API 활용신청 승인 확인 |
| 03   | 서비스 키 오류 | 서비스 키 확인 (일반 인증키 Encoding 사용) |
| 05   | 일일 트래픽 초과 | 내일 다시 시도 또는 유료 플랜 고려 |
| 10   | 잘못된 요청 파라미터 | 요청 파라미터 확인 |

---

## 현재 프로젝트에서의 사용

### 구현된 엔드포인트
- ✅ `/getGnrlPrdctClpr` - `app/api/krx-gold/route.ts`에서 사용 중
  - 금 시세 조회 (itmKndCd=20)
  - 은 시세 조회 (itmKndCd=21)
  - 시가/고가/저가/종가 정보 포함
  - 과거 데이터 조회 지원 (date 파라미터)

### 사용 예시

#### 최신 데이터 조회
```typescript
// GET /api/krx-gold
const response = await fetch('/api/krx-gold');
const data = await response.json();
// 응답: { gold: {...}, silver: {...} }
```

#### 과거 데이터 조회
```typescript
// GET /api/krx-gold?date=20240125
const response = await fetch('/api/krx-gold?date=20240125');
const data = await response.json();
// 응답: { gold: {...}, silver: {...} }
```

#### 응답 구조
```typescript
{
  gold: {
    symbol: 'KRX Gold',
    price: 82500,        // 종가
    open: 82000,         // 시가
    high: 83000,         // 고가
    low: 81900,          // 저가
    unit: 'KRW/g',
    change: 500,          // 전일대비
    changePercent: 0.61, // 등락률
    volume: 1000,        // 거래량
    amount: 82500000,    // 거래대금
    asOf: '20240125',    // 기준일자
    note: '공공데이터는 실시간이 아닐 수 있습니다'
  },
  silver: {
    symbol: 'KRX Silver',
    price: 1050,         // 종가
    open: 1030,          // 시가
    high: 1060,          // 고가
    low: 1025,           // 저가
    unit: 'KRW/g',
    change: 20,           // 전일대비
    changePercent: 1.94, // 등락률
    volume: 500,        // 거래량
    amount: 525000,      // 거래대금
    asOf: '20240125',    // 기준일자
    note: '공공데이터는 실시간이 아닐 수 있습니다'
  }
}
```

---

## 추가 구현 가능한 기능

다음 엔드포인트들을 추가로 구현할 수 있습니다:

1. **시가/고가/저가 정보 조회**
   - 시가: `/getGnrlPrdctOprc`
   - 고가: `/getGnrlPrdctHprc`
   - 저가: `/getGnrlPrdctLprc`

2. **은 시세 조회**
   - 현재는 금만 조회 중 (`itmKndCd=20`)
   - 은 시세도 조회 가능 (`itmKndCd=21`)

3. **과거 데이터 조회**
   - `basDt` 파라미터로 특정 날짜 데이터 조회

---

## 참고 자료

- [공공데이터 포털](https://www.data.go.kr/)
- [금융위원회_일반상품시세정보 API 상세](https://www.data.go.kr/data/15094805/openapi.do)
- [API 활용신청](https://www.data.go.kr/data/15094805/openapi.do)

---

**마지막 업데이트**: 2026-01-25
