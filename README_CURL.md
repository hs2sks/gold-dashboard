# curl로 공공데이터 API 확인하기

## Windows (PowerShell)

```powershell
# PowerShell에서 실행
.\check-api-curl.ps1
```

## Linux/macOS (Bash)

```bash
# 실행 권한 부여 (최초 1회)
chmod +x check-api-curl.sh

# 실행
./check-api-curl.sh
```

## 직접 curl 명령어 사용

### 1. 서비스 키 확인

`.env.local` 파일에서 `DATA_GO_KR_SERVICE_KEY` 값을 확인합니다.

### 2. curl 명령어 실행

**Windows (PowerShell):**
```powershell
# 서비스 키를 변수에 저장 (실제 키로 교체)
$serviceKey = "YOUR_SERVICE_KEY_HERE"

# URL 인코딩
$encodedKey = [System.Web.HttpUtility]::UrlEncode($serviceKey)

# API 호출
curl.exe -X GET "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=$encodedKey&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

**Linux/macOS:**
```bash
# 서비스 키를 변수에 저장 (실제 키로 교체)
SERVICE_KEY="YOUR_SERVICE_KEY_HERE"

# URL 인코딩 (Python 사용)
ENCODED_KEY=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SERVICE_KEY'))")

# API 호출
curl -X GET "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=${ENCODED_KEY}&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
```

### 3. 응답 확인

**성공 응답 (resultCode: 00):**
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

**오류 응답 예시:**

- **CODE-01**: API 신청 미승인
- **CODE-03**: 서비스 키 오류
- **CODE-05**: 일일 트래픽 초과
- **404**: API 엔드포인트를 찾을 수 없음

### 4. JSON 응답 파싱 (jq 사용)

**Linux/macOS:**
```bash
# jq 설치 (Ubuntu/Debian)
sudo apt-get install jq

# jq 설치 (macOS)
brew install jq

# 응답 파싱
curl -s "API_URL" | jq '.response.header.resultCode'
curl -s "API_URL" | jq '.response.body.items.item[0]'
```

**Windows (PowerShell):**
```powershell
# JSON 파싱
$response = curl.exe -s "API_URL" | ConvertFrom-Json
$response.response.header.resultCode
$response.response.body.items.item[0]
```

## 문제 해결

### curl이 없는 경우

**Windows 10 이상:**
- curl은 기본 제공됩니다
- 없다면 [curl 공식 사이트](https://curl.se/download.html)에서 다운로드

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install curl

# CentOS/RHEL
sudo yum install curl
```

**macOS:**
- curl은 기본 제공됩니다

### 인코딩 문제

서비스 키에 특수문자(`+`, `/`, `=`)가 포함된 경우 URL 인코딩이 필요합니다.

**PowerShell:**
```powershell
[System.Web.HttpUtility]::UrlEncode($serviceKey)
```

**Bash (Python 사용):**
```bash
python3 -c "import urllib.parse; print(urllib.parse.quote('$SERVICE_KEY'))"
```

## 참고

- 공공데이터 포털: https://www.data.go.kr/
- API 신청: https://www.data.go.kr/data/15094805/openapi.do
- 일반 인증키(Encoding) 사용 필수
