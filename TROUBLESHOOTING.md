# 문제 해결 가이드

## "API not found" 오류 해결

### 증상
- `API not found` 또는 `404` 오류 발생
- 공공데이터 API 호출 실패

### 원인별 해결 방법

#### 1. API 신청 미승인 (가장 흔한 원인)

**확인 방법:**
1. https://www.data.go.kr/ 접속
2. 로그인 > 마이페이지 > 오픈API > 활용신청 내역
3. "금융위원회_일반상품시세정보" API 승인 상태 확인

**해결:**
- 승인 대기 중: 1-2일 대기
- 반려됨: 사유 확인 후 재신청
- 신청 안 함: API 활용신청 진행

**API 신청 링크:**
- https://www.data.go.kr/data/15094805/openapi.do

---

#### 2. 서비스 키 오류

**확인 사항:**
- ✅ "일반 인증키(Encoding)" 사용 (Decoding 아님)
- ✅ 서비스 키 전체 복사 (앞뒤 공백 없음)
- ✅ `.env.local` 파일에 올바르게 입력

**확인 방법:**
```powershell
# 프로젝트 폴더에서 실행
.\check-service-key.ps1
```

**해결:**
1. 공공데이터 포털 > 마이페이지 > 오픈API > 개발계정
2. "일반 인증키(Encoding)" 복사
3. `.env.local` 파일에 다시 입력
4. 서버 재시작

---

#### 3. API 엔드포인트 변경

**확인 방법:**
1. 공공데이터 포털에서 API 문서 확인
2. 최신 엔드포인트 URL 확인

**현재 사용 중인 엔드포인트:**
```
https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr
```

**직접 테스트:**
브라우저에서 다음 URL 테스트 (서비스 키를 실제 키로 교체):
```
https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=YOUR_SERVICE_KEY&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20
```

---

#### 4. 공공데이터 API 오류 코드

| 코드 | 의미 | 해결 방법 |
|------|------|----------|
| **00** | 성공 | 정상 작동 |
| **01** | API 신청 미승인 | 활용신청 승인 대기 |
| **03** | 서비스 키 오류 | Encoding 키 확인 |
| **05** | 일일 트래픽 초과 | 내일 재시도 또는 유료 플랜 |

---

### 단계별 체크리스트

#### Step 1: API 신청 상태 확인
- [ ] 공공데이터 포털 로그인
- [ ] 마이페이지 > 오픈API > 활용신청 내역
- [ ] "금융위원회_일반상품시세정보" 승인 상태 확인
- [ ] 승인됨: Step 2로 진행
- [ ] 미승인: 승인 대기 또는 재신청

#### Step 2: 서비스 키 확인
- [ ] 마이페이지 > 오픈API > 개발계정
- [ ] "일반 인증키(Encoding)" 확인
- [ ] `.env.local` 파일에 입력
- [ ] `check-service-key.ps1` 스크립트 실행

#### Step 3: 직접 API 테스트
- [ ] 브라우저에서 API URL 직접 테스트
- [ ] `resultCode: "00"` 확인
- [ ] 오류 코드 확인 및 해결

#### Step 4: 서버 재시작
```bash
# 서버 종료 (Ctrl+C)
# 캐시 삭제
rm -rf .next  # Mac/Linux
rmdir /s .next  # Windows

# 재시작
npm run dev
```

---

### 빠른 진단 명령어

```powershell
# 1. 서비스 키 확인
.\check-service-key.ps1

# 2. 로컬 API 테스트
.\test-apis.ps1

# 3. 공공데이터 API 직접 테스트
.\test-public-api.ps1
```

---

### 여전히 문제가 있다면

1. **터미널 로그 확인**
   - 서버 실행 중 터미널의 상세 에러 메시지 확인
   - `KRX API Error Response:` 메시지 확인

2. **브라우저 개발자 도구**
   - F12 > Network 탭
   - `/api/krx-gold` 요청 확인
   - 응답 내용 확인

3. **공공데이터 포털 고객센터**
   - 전화: 1577-5771
   - 이메일: help@data.go.kr

---

### 임시 해결책

API가 작동하지 않아도 대시보드는 정상 작동합니다:
- 목(mock) 데이터 자동 사용
- 캐시된 데이터 사용 (있는 경우)
- 다른 API는 정상 작동 (국제 금/은, 환율 등)

---

**마지막 업데이트**: 2026-01-25
