# 공공데이터 포털 서비스 키 확인 스크립트
# Encoding 키인지 Decoding 키인지 확인하고 API 테스트를 수행합니다

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "공공데이터 포털 서비스 키 확인" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# .env.local 파일에서 서비스 키 읽기
$envFilePath = ".env.local"

if (-not (Test-Path $envFilePath)) {
    Write-Host "✗ .env.local 파일이 없습니다." -ForegroundColor Red
    Write-Host "  프로젝트 루트에 .env.local 파일을 생성하고 DATA_GO_KR_SERVICE_KEY를 설정하세요.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env.local 파일을 찾았습니다." -ForegroundColor Green

$envContent = Get-Content $envFilePath
$serviceKeyLine = $envContent | Where-Object { $_ -match "^DATA_GO_KR_SERVICE_KEY=" }

if (-not $serviceKeyLine) {
    Write-Host "✗ DATA_GO_KR_SERVICE_KEY를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "  .env.local 파일에 다음을 추가하세요:" -ForegroundColor Yellow
    Write-Host "  DATA_GO_KR_SERVICE_KEY=여기에_서비스_키_입력`n" -ForegroundColor Gray
    exit 1
}

$serviceKey = ($serviceKeyLine -split "=", 2)[1].Trim()

if ([string]::IsNullOrWhiteSpace($serviceKey)) {
    Write-Host "✗ 서비스 키가 비어있습니다." -ForegroundColor Red
    exit 1
}

# 서비스 키 일부만 표시 (보안)
$maskedKey = if ($serviceKey.Length -gt 15) {
    $serviceKey.Substring(0, 10) + "..." + $serviceKey.Substring($serviceKey.Length - 5)
} else {
    $serviceKey.Substring(0, [Math]::Min(5, $serviceKey.Length)) + "***"
}

Write-Host "✓ 서비스 키 발견: $maskedKey`n" -ForegroundColor Green

# Encoding 키인지 확인
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "1. 서비스 키 타입 확인" -ForegroundColor Cyan
Write-Host "----------------------------------------`n" -ForegroundColor Cyan

$isEncoded = $false
$encodedChars = @('%2B', '%2F', '%3D', '%25', '%20', '%26', '%3F', '%3A', '%3B', '%40', '%23', '%24', '%5B', '%5D')

foreach ($char in $encodedChars) {
    if ($serviceKey -like "*$char*") {
        $isEncoded = $true
        break
    }
}

if ($isEncoded) {
    Write-Host "✓ Encoding 키로 보입니다 (URL 인코딩된 특수문자 포함)" -ForegroundColor Green
    Write-Host "  예: %2B (+), %2F (/), %3D (=) 등이 포함되어 있음`n" -ForegroundColor Gray
} else {
    Write-Host "⚠ Decoding 키일 수 있습니다 (일반 텍스트)" -ForegroundColor Yellow
    Write-Host "  공공데이터 포털에서 '일반 인증키(Encoding)'를 사용해야 합니다`n" -ForegroundColor Yellow
    
    Write-Host "  확인 방법:" -ForegroundColor Cyan
    Write-Host "  1. https://www.data.go.kr/ 접속" -ForegroundColor White
    Write-Host "  2. 로그인 > 마이페이지 > 오픈API > 개발계정" -ForegroundColor White
    Write-Host "  3. '일반 인증키(Encoding)' 복사" -ForegroundColor White
    Write-Host "  4. '일반 인증키(Decoding)'이 아닌 Encoding 키 사용`n" -ForegroundColor White
}

# 서비스 키 길이 확인
Write-Host "서비스 키 길이: $($serviceKey.Length) 문자" -ForegroundColor Gray
if ($serviceKey.Length -lt 20) {
    Write-Host "⚠ 서비스 키가 너무 짧습니다. 전체 키가 복사되었는지 확인하세요." -ForegroundColor Yellow
}
Write-Host ""

# API 테스트
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "2. 공공데이터 API 직접 테스트" -ForegroundColor Cyan
Write-Host "----------------------------------------`n" -ForegroundColor Cyan

# Encoding 키로 테스트
$encodedKey = [System.Web.HttpUtility]::UrlEncode($serviceKey)
$testUrl = 'https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=' + $encodedKey + '&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20'

Write-Host "테스트 URL: https://apis.data.go.kr/...GetGeneralProductInfoService/getGnrlPrdctClpr" -ForegroundColor Gray
Write-Host "파라미터: itmKndCd=20 (금 시세)`n" -ForegroundColor Gray

try {
    Write-Host "API 호출 중..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $testUrl -Method GET -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ HTTP 응답 성공 - 200 OK" -ForegroundColor Green
        Write-Host ""
        
        $json = $response.Content | ConvertFrom-Json
        
        # 응답 헤더 확인
        if ($json.response.header) {
            $header = $json.response.header
            Write-Host "=== API 응답 결과 ===" -ForegroundColor Cyan
            Write-Host "resultCode: $($header.resultCode)" -ForegroundColor White
            Write-Host "resultMsg: $($header.resultMsg)" -ForegroundColor White
            
            if ($header.resultCode -eq "00") {
                Write-Host "`n✓✓✓ API 호출 성공! 서비스 키가 정상 작동합니다! ✓✓✓" -ForegroundColor Green
                
                # 데이터 확인
                if ($json.response.body.items) {
                    $items = $json.response.body.items.item
                    if ($items) {
                        $itemArray = if ($items -is [array]) { $items } else { @($items) }
                        if ($itemArray.Count -gt 0) {
                            $latest = $itemArray[0]
                            Write-Host "`n=== 최신 금 시세 데이터 ===" -ForegroundColor Cyan
                            Write-Host "기준일자: $($latest.basDt)" -ForegroundColor White
                            Write-Host "종가: $($latest.clpr) 원/g" -ForegroundColor White
                            Write-Host "전일대비: $($latest.vs) 원" -ForegroundColor White
                            Write-Host "등락률: $($latest.fltRt) %" -ForegroundColor White
                        }
                    }
                }
            } elseif ($header.resultCode -eq "03") {
                Write-Host "`n✗ 서비스 키 오류 (CODE-03)" -ForegroundColor Red
                Write-Host "  원인: 서비스 키가 잘못되었거나 인코딩 문제" -ForegroundColor Yellow
                Write-Host "  해결: 공공데이터 포털에서 '일반 인증키(Encoding)'를 다시 복사하세요" -ForegroundColor Yellow
            } elseif ($header.resultCode -eq "01") {
                Write-Host "`n✗ API 신청 미승인 (CODE-01)" -ForegroundColor Red
                Write-Host "  원인: '금융위원회_일반상품시세정보' API 신청이 승인되지 않음" -ForegroundColor Yellow
                Write-Host "  해결: 마이페이지 > 오픈API > 활용신청 내역에서 승인 상태 확인" -ForegroundColor Yellow
            } else {
                Write-Host "`n✗ API 오류 (CODE-$($header.resultCode))" -ForegroundColor Red
                Write-Host "  메시지: $($header.resultMsg)" -ForegroundColor Yellow
            }
        }
    }
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "✗ API 호출 실패" -ForegroundColor Red
    Write-Host "  오류: $errorMessage`n" -ForegroundColor Yellow
    
    if ($errorMessage -like "*404*") {
        Write-Host "  원인 분석:" -ForegroundColor Cyan
        Write-Host "  - API 엔드포인트가 잘못되었거나" -ForegroundColor White
        Write-Host "  - 서비스 키가 잘못되었을 수 있습니다" -ForegroundColor White
        Write-Host "`n  해결 방법:" -ForegroundColor Cyan
        Write-Host "  1. 공공데이터 포털에서 '일반 인증키(Encoding)' 확인" -ForegroundColor White
        Write-Host "  2. API 신청 승인 상태 확인" -ForegroundColor White
        Write-Host "  3. 서비스 키를 .env.local에 다시 입력" -ForegroundColor White
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "확인 완료" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "참고: 공공데이터 포털에서 서비스 키 확인 방법" -ForegroundColor Gray
Write-Host "  https://www.data.go.kr/" -ForegroundColor White
Write-Host "  > 로그인 > 마이페이지 > 오픈API > 개발계정" -ForegroundColor White
Write-Host "  > '일반 인증키(Encoding)' 복사`n" -ForegroundColor White
