# curl을 사용한 공공데이터 API 활성화 여부 확인 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "curl로 공공데이터 API 확인" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# .env.local 파일 확인
$envFilePath = ".env.local"

if (-not (Test-Path $envFilePath)) {
    Write-Host "[X] .env.local 파일이 없습니다." -ForegroundColor Red
    Write-Host "    프로젝트 루트에 .env.local 파일을 생성하고 DATA_GO_KR_SERVICE_KEY를 설정하세요." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "[OK] .env.local 파일을 찾았습니다." -ForegroundColor Green

# 서비스 키 읽기
$envContent = Get-Content $envFilePath -Encoding UTF8
$serviceKeyLine = $envContent | Where-Object { $_ -match "^DATA_GO_KR_SERVICE_KEY=" }

if (-not $serviceKeyLine) {
    Write-Host "[X] DATA_GO_KR_SERVICE_KEY를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "    .env.local 파일에 다음을 추가하세요:" -ForegroundColor Yellow
    Write-Host "    DATA_GO_KR_SERVICE_KEY=여기에_서비스_키_입력" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

$serviceKey = ($serviceKeyLine -split "=", 2)[1].Trim()

if ([string]::IsNullOrWhiteSpace($serviceKey)) {
    Write-Host "[X] 서비스 키가 비어있습니다." -ForegroundColor Red
    Write-Host ""
    exit 1
}

# 서비스 키 일부만 표시 (보안)
$maskedKey = if ($serviceKey.Length -gt 15) {
    $serviceKey.Substring(0, 10) + "..." + $serviceKey.Substring($serviceKey.Length - 5)
} else {
    $serviceKey.Substring(0, [Math]::Min(5, $serviceKey.Length)) + "***"
}

Write-Host "[OK] 서비스 키 발견: $maskedKey" -ForegroundColor Green
Write-Host ""

# URL 인코딩
$encodedKey = [System.Web.HttpUtility]::UrlEncode($serviceKey)
$apiUrl = "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=$encodedKey&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "curl로 API 호출 중..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: https://apis.data.go.kr/...GetGeneralProductInfoService/getGnrlPrdctClpr" -ForegroundColor Gray
Write-Host "파라미터: itmKndCd=20 (금 시세)" -ForegroundColor Gray
Write-Host ""

# curl 명령어 실행
try {
    $response = curl.exe -s -w "`nHTTP_CODE:%{http_code}" -X GET "$apiUrl" 2>&1
    
    # HTTP 코드 추출
    $httpCode = ""
    $jsonResponse = ""
    
    if ($response -match "HTTP_CODE:(\d+)") {
        $httpCode = $matches[1]
        $jsonResponse = $response -replace "HTTP_CODE:\d+", "" | Out-String
    } else {
        $jsonResponse = $response | Out-String
    }
    
    Write-Host "=== 응답 결과 ===" -ForegroundColor Cyan
    Write-Host "HTTP 상태 코드: $httpCode" -ForegroundColor White
    Write-Host ""
    
    if ($httpCode -eq "200") {
        Write-Host "[OK] HTTP 응답 성공 - 200 OK" -ForegroundColor Green
        Write-Host ""
        
        # JSON 파싱
        try {
            $json = $jsonResponse | ConvertFrom-Json
            
            if ($json.response.header) {
                $header = $json.response.header
                Write-Host "=== API 응답 결과 ===" -ForegroundColor Cyan
                Write-Host "resultCode: $($header.resultCode)" -ForegroundColor White
                Write-Host "resultMsg: $($header.resultMsg)" -ForegroundColor White
                Write-Host ""
                
                if ($header.resultCode -eq "00") {
                    Write-Host "[SUCCESS] API 호출 성공! 공공데이터 API가 정상적으로 활성화되어 있습니다!" -ForegroundColor Green
                    Write-Host ""
                    
                    # 데이터 확인
                    if ($json.response.body.items) {
                        $items = $json.response.body.items.item
                        if ($items) {
                            $itemArray = if ($items -is [array]) { $items } else { @($items) }
                            if ($itemArray.Count -gt 0) {
                                $latest = $itemArray[0]
                                Write-Host "=== 최신 금 시세 데이터 ===" -ForegroundColor Cyan
                                Write-Host "기준일자: $($latest.basDt)" -ForegroundColor White
                                Write-Host "종가: $($latest.clpr) 원/g" -ForegroundColor White
                                Write-Host "전일대비: $($latest.vs) 원" -ForegroundColor White
                                Write-Host "등락률: $($latest.fltRt) %" -ForegroundColor White
                            }
                        }
                    }
                } elseif ($header.resultCode -eq "03") {
                    Write-Host "[ERROR] 서비스 키 오류 (CODE-03)" -ForegroundColor Red
                    Write-Host "  원인: 서비스 키가 잘못되었거나 인코딩 문제" -ForegroundColor Yellow
                    Write-Host "  해결: 공공데이터 포털에서 '일반 인증키(Encoding)'를 다시 복사하세요" -ForegroundColor Yellow
                } elseif ($header.resultCode -eq "01") {
                    Write-Host "[ERROR] API 신청 미승인 (CODE-01)" -ForegroundColor Red
                    Write-Host "  원인: '금융위원회_일반상품시세정보' API 신청이 승인되지 않음" -ForegroundColor Yellow
                    Write-Host "  해결: 마이페이지 > 오픈API > 활용신청 내역에서 승인 상태 확인" -ForegroundColor Yellow
                } elseif ($header.resultCode -eq "05") {
                    Write-Host "[ERROR] 일일 트래픽 초과 (CODE-05)" -ForegroundColor Red
                    Write-Host "  원인: 일일 API 호출 한도를 초과했습니다" -ForegroundColor Yellow
                    Write-Host "  해결: 내일 다시 시도하거나 유료 플랜을 고려하세요" -ForegroundColor Yellow
                } else {
                    Write-Host "[ERROR] API 오류 (CODE-$($header.resultCode))" -ForegroundColor Red
                    Write-Host "  메시지: $($header.resultMsg)" -ForegroundColor Yellow
                }
            } else {
                Write-Host "[WARNING] 예상하지 못한 응답 형식입니다." -ForegroundColor Yellow
                Write-Host "응답 내용 (처음 500자):" -ForegroundColor Gray
                Write-Host $jsonResponse.Substring(0, [Math]::Min(500, $jsonResponse.Length)) -ForegroundColor Gray
            }
        } catch {
            Write-Host "[ERROR] JSON 파싱 실패" -ForegroundColor Red
            Write-Host "응답 내용 (처음 500자):" -ForegroundColor Gray
            Write-Host $jsonResponse.Substring(0, [Math]::Min(500, $jsonResponse.Length)) -ForegroundColor Gray
        }
    } elseif ($httpCode -eq "404") {
        Write-Host "[ERROR] API 엔드포인트를 찾을 수 없습니다 (404)" -ForegroundColor Red
        Write-Host ""
        Write-Host "  원인 분석:" -ForegroundColor Cyan
        Write-Host "  - API 엔드포인트가 잘못되었거나" -ForegroundColor White
        Write-Host "  - API 신청이 승인되지 않았거나" -ForegroundColor White
        Write-Host "  - 서비스 키가 잘못되었을 수 있습니다" -ForegroundColor White
        Write-Host ""
        Write-Host "  해결 방법:" -ForegroundColor Cyan
        Write-Host "  1. 공공데이터 포털에서 '일반 인증키(Encoding)' 확인" -ForegroundColor White
        Write-Host "  2. API 신청 승인 상태 확인" -ForegroundColor White
        Write-Host "  3. 서비스 키를 .env.local에 다시 입력" -ForegroundColor White
    } else {
        Write-Host "[ERROR] HTTP 응답 실패 - $httpCode" -ForegroundColor Red
        Write-Host "응답 내용 (처음 500자):" -ForegroundColor Gray
        Write-Host $jsonResponse.Substring(0, [Math]::Min(500, $jsonResponse.Length)) -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] curl 실행 실패" -ForegroundColor Red
    Write-Host "  오류: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  curl이 설치되어 있는지 확인하세요." -ForegroundColor Yellow
    Write-Host "  Windows 10 이상에서는 curl이 기본 제공됩니다." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "확인 완료" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
