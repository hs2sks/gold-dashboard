# curl로 공공데이터 API 확인하기

## 빠른 테스트 방법

### 방법 1: PowerShell에서 직접 실행

```powershell
# 1. .env.local 파일에서 서비스 키 확인
Get-Content .env.local | Select-String "DATA_GO_KR_SERVICE_KEY"

# 2. 서비스 키를 변수에 저장 (위에서 확인한 키를 복사)
$serviceKey = "여기에_서비스_키_붙여넣기"

# 3. URL 인코딩
$encodedKey = [System.Web.HttpUtility]::UrlEncode($serviceKey)

# 4. curl로 API 호출
curl.exe -X GET "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=$encodedKey&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

### 방법 2: 한 줄 명령어 (서비스 키 직접 입력)

```powershell
# 서비스 키를 직접 입력하여 테스트
$key = "YOUR_SERVICE_KEY"; curl.exe -X GET "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=$([System.Web.HttpUtility]::UrlEncode($key))&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

### 방법 3: .env.local에서 자동으로 읽어서 실행

PowerShell에서 다음 스크립트를 실행:

```powershell
$envContent = Get-Content ".env.local" -Encoding UTF8
$serviceKey = ($envContent | Where-Object { $_ -match "^DATA_GO_KR_SERVICE_KEY=" } -split "=", 2)[1].Trim()
$encodedKey = [System.Web.HttpUtility]::UrlEncode($serviceKey)
curl.exe -X GET "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=$encodedKey&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

## 응답 확인

### 성공 응답 (API 활성화됨)

```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL_SERVICE"
    },
    "body": {
      "items": {
        "item": [
          {
            "basDt": "20240125",
            "clpr": "82500",
            "vs": "500",
            "fltRt": "0.61"
          }
        ]
      }
    }
  }
}
```

**resultCode가 "00"이면 API가 정상적으로 활성화되어 있습니다!**

### 오류 응답

#### CODE-01: API 신청 미승인
```json
{
  "response": {
    "header": {
      "resultCode": "01",
      "resultMsg": "APPLICATION_ERROR"
    }
  }
}
```
**해결**: 공공데이터 포털에서 API 활용신청 승인 대기

#### CODE-03: 서비스 키 오류
```json
{
  "response": {
    "header": {
      "resultCode": "03",
      "resultMsg": "NO_AUTH"
    }
  }
}
```
**해결**: "일반 인증키(Encoding)"를 사용하는지 확인

#### CODE-05: 일일 트래픽 초과
```json
{
  "response": {
    "header": {
      "resultCode": "05",
      "resultMsg": "SERVICE_TIME_OUT"
    }
  }
}
```
**해결**: 내일 다시 시도하거나 유료 플랜 고려

#### 404 오류: API 엔드포인트를 찾을 수 없음
```
API not found
```
**해결**: 
- API 신청 승인 상태 확인
- 서비스 키 확인
- API 엔드포인트가 변경되었는지 확인

## JSON 응답 파싱 (PowerShell)

```powershell
# 응답을 JSON으로 파싱
$response = curl.exe -s "API_URL" | ConvertFrom-Json
$response.response.header.resultCode
$response.response.header.resultMsg

# 데이터 확인
$response.response.body.items.item[0]
```

## JSON 응답 파싱 (jq 사용 - Linux/macOS)

```bash
# jq 설치
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS

# resultCode 확인
curl -s "API_URL" | jq '.response.header.resultCode'

# 데이터 확인
curl -s "API_URL" | jq '.response.body.items.item[0]'
```

## 참고 사항

1. **서비스 키 인코딩**: 서비스 키에 특수문자가 포함된 경우 URL 인코딩이 필요합니다.
2. **일반 인증키(Encoding) 사용**: 공공데이터 포털에서 "일반 인증키(Encoding)"를 사용해야 합니다.
3. **API 신청**: API를 사용하려면 먼저 공공데이터 포털에서 활용신청을 해야 합니다.
   - 신청 링크: https://www.data.go.kr/data/15094805/openapi.do

## 문제 해결

### curl이 없는 경우

**Windows 10 이상**: curl은 기본 제공됩니다.
**Windows 7/8**: [curl 공식 사이트](https://curl.se/download.html)에서 다운로드

### 인코딩 문제

PowerShell에서 URL 인코딩:
```powershell
[System.Web.HttpUtility]::UrlEncode($serviceKey)
```

### 응답이 HTML인 경우

404 오류나 API 엔드포인트 문제일 수 있습니다. 공공데이터 포털에서 최신 API 문서를 확인하세요.
