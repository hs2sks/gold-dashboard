# 간단한 curl 테스트 스크립트
# .env.local에서 서비스 키를 읽어서 curl로 API를 호출합니다

# .env.local 파일 읽기
$envContent = Get-Content ".env.local" -Encoding UTF8
$serviceKeyLine = $envContent | Where-Object { $_ -match "^DATA_GO_KR_SERVICE_KEY=" }

if ($serviceKeyLine) {
    $serviceKey = ($serviceKeyLine -split "=", 2)[1].Trim()
    $encodedKey = [System.Web.HttpUtility]::UrlEncode($serviceKey)
    
    Write-Host "curl로 API 호출 중..." -ForegroundColor Cyan
    Write-Host ""
    
    # curl 명령어 실행
    $url = "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=$encodedKey&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
    
    curl.exe -X GET $url
    
    Write-Host ""
    Write-Host "위 응답에서 resultCode를 확인하세요:" -ForegroundColor Yellow
    Write-Host "  - 00: 성공 (API 활성화됨)" -ForegroundColor Green
    Write-Host "  - 01: API 신청 미승인" -ForegroundColor Red
    Write-Host "  - 03: 서비스 키 오류" -ForegroundColor Red
    Write-Host "  - 05: 일일 트래픽 초과" -ForegroundColor Red
} else {
    Write-Host "DATA_GO_KR_SERVICE_KEY를 찾을 수 없습니다." -ForegroundColor Red
}
