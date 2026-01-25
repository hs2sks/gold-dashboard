# 공공데이터 포털 API 직접 테스트 스크립트
# .env.local 파일에서 API 키를 읽어서 직접 공공데이터 API를 호출합니다

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "공공데이터 포털 API 테스트" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# .env.local 파일에서 API 키 읽기
$envFilePath = ".env.local"

if (-not (Test-Path $envFilePath)) {
    Write-Host "⚠ .env.local 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "  API 키 없이 테스트를 계속합니다 (목 데이터 반환 예상)`n" -ForegroundColor Yellow
    $serviceKey = $null
} else {
    Write-Host "✓ .env.local 파일을 찾았습니다." -ForegroundColor Green
    
    $envContent = Get-Content $envFilePath
    $serviceKeyLine = $envContent | Where-Object { $_ -match "^DATA_GO_KR_SERVICE_KEY=" }
    
    if ($serviceKeyLine) {
        $serviceKey = ($serviceKeyLine -split "=", 2)[1].Trim()
        $maskedKey = $serviceKey.Substring(0, [Math]::Min(10, $serviceKey.Length)) + "***"
        Write-Host "✓ API 키 발견: $maskedKey" -ForegroundColor Green
    } else {
        Write-Host "⚠ DATA_GO_KR_SERVICE_KEY를 찾을 수 없습니다." -ForegroundColor Yellow
        Write-Host "  API 키 없이 테스트를 계속합니다`n" -ForegroundColor Yellow
        $serviceKey = $null
    }
}

Write-Host "`n----------------------------------------" -ForegroundColor Cyan
Write-Host "1. 로컬 API 엔드포인트 테스트" -ForegroundColor Cyan
Write-Host "----------------------------------------`n" -ForegroundColor Cyan

# 로컬 서버 확인
$localUrl = "http://localhost:3000/api/krx-gold"
Write-Host "테스트 URL: $localUrl" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $localUrl -Method GET -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ 로컬 API 응답 성공 (200 OK)" -ForegroundColor Green
        
        $json = $response.Content | ConvertFrom-Json
        
        Write-Host "`n=== 응답 데이터 ===" -ForegroundColor Cyan
        
        if ($json.gold) {
            Write-Host "금 시세:" -ForegroundColor Yellow
            Write-Host "  - 가격: $($json.gold.price) $($json.gold.unit)" -ForegroundColor White
            Write-Host "  - 변동: $($json.gold.change) ($($json.gold.changePercent)%)" -ForegroundColor White
            Write-Host "  - 기준일: $($json.gold.asOf)" -ForegroundColor White
            
            if ($json.gold.warning) {
                Write-Host "  - ⚠ 경고: $($json.gold.warning)" -ForegroundColor Yellow
            }
            if ($json.gold.note) {
                Write-Host "  - 참고: $($json.gold.note)" -ForegroundColor Gray
            }
        }
        
        if ($json.warning) {
            Write-Host "`n⚠ 전체 경고: $($json.warning)" -ForegroundColor Yellow
            Write-Host "  → 캐시된 데이터 또는 목 데이터를 사용 중입니다." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ 로컬 API 호출 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  → 개발 서버가 실행 중인지 확인하세요 (npm run dev)" -ForegroundColor Yellow
}

# 공공데이터 API 키가 있을 때만 직접 테스트
if ($serviceKey) {
    Write-Host "`n----------------------------------------" -ForegroundColor Cyan
    Write-Host "2. 공공데이터 포털 API 직접 테스트" -ForegroundColor Cyan
    Write-Host "----------------------------------------`n" -ForegroundColor Cyan
    
    $publicApiUrl = "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=$serviceKey&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"
    
    Write-Host "테스트 URL: https://apis.data.go.kr/...GetGeneralProductInfoService/getGnrlPrdctClpr" -ForegroundColor Gray
    Write-Host "파라미터: itmKndCd=20 (금 시세)`n" -ForegroundColor Gray
    
    try {
        $publicResponse = Invoke-WebRequest -Uri $publicApiUrl -Method GET -ErrorAction Stop
        
        if ($publicResponse.StatusCode -eq 200) {
            Write-Host "✓ 공공데이터 API 응답 성공 (200 OK)" -ForegroundColor Green
            
            $publicJson = $publicResponse.Content | ConvertFrom-Json
            
            Write-Host "`n=== API 응답 구조 ===" -ForegroundColor Cyan
            
            # 응답 헤더 확인
            if ($publicJson.response.header) {
                $header = $publicJson.response.header
                Write-Host "헤더:" -ForegroundColor Yellow
                Write-Host "  - resultCode: $($header.resultCode)" -ForegroundColor White
                Write-Host "  - resultMsg: $($header.resultMsg)" -ForegroundColor White
                
                if ($header.resultCode -eq "00") {
                    Write-Host "  ✓ API 호출 성공!" -ForegroundColor Green
                } else {
                    Write-Host "  ✗ API 오류 코드: $($header.resultCode)" -ForegroundColor Red
                }
            }
            
            # 데이터 확인
            if ($publicJson.response.body) {
                $body = $publicJson.response.body
                Write-Host "`n바디:" -ForegroundColor Yellow
                Write-Host "  - numOfRows: $($body.numOfRows)" -ForegroundColor White
                Write-Host "  - pageNo: $($body.pageNo)" -ForegroundColor White
                Write-Host "  - totalCount: $($body.totalCount)" -ForegroundColor White
                
                if ($body.items) {
                    $items = $body.items.item
                    
                    if ($items) {
                        Write-Host "`n  ✓ 데이터 항목 발견!" -ForegroundColor Green
                        
                        # 배열인지 단일 객체인지 확인
                        if ($items -is [Array]) {
                            Write-Host "  → $($items.Count)개의 데이터 항목" -ForegroundColor White
                            $firstItem = $items[0]
                        } else {
                            Write-Host "  → 1개의 데이터 항목" -ForegroundColor White
                            $firstItem = $items
                        }
                        
                        Write-Host "`n  첫 번째 데이터:" -ForegroundColor Yellow
                        Write-Host "    - 종가 (clpr): $($firstItem.clpr)" -ForegroundColor White
                        Write-Host "    - 전일대비 (vs): $($firstItem.vs)" -ForegroundColor White
                        Write-Host "    - 등락률 (fltRt): $($firstItem.fltRt)" -ForegroundColor White
                        Write-Host "    - 기준일자 (basDt): $($firstItem.basDt)" -ForegroundColor White
                        
                        if ($firstItem.itmNm) {
                            Write-Host "    - 품목명 (itmNm): $($firstItem.itmNm)" -ForegroundColor White
                        }
                    } else {
                        Write-Host "  ⚠ 데이터 항목이 비어있습니다" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "`n  ⚠ items 필드가 없습니다" -ForegroundColor Yellow
                }
            }
            
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host "✗ 공공데이터 API 호출 실패" -ForegroundColor Red
        Write-Host "  오류: $errorMsg`n" -ForegroundColor Red
        
        if ($errorMsg -match "404") {
            Write-Host "→ 404 오류: API 엔드포인트를 찾을 수 없습니다." -ForegroundColor Yellow
            Write-Host "  가능한 원인:" -ForegroundColor Yellow
            Write-Host "  1. 서비스 명칭이 변경되었을 수 있습니다" -ForegroundColor Gray
            Write-Host "  2. API가 비활성화되었을 수 있습니다" -ForegroundColor Gray
            Write-Host "  3. 공공데이터 포털에서 API 활용 신청이 필요합니다" -ForegroundColor Gray
        } elseif ($errorMsg -match "403") {
            Write-Host "→ 403 오류: 접근 권한이 없습니다." -ForegroundColor Yellow
            Write-Host "  API 키를 확인하세요:" -ForegroundColor Yellow
            Write-Host "  1. 공공데이터 포털에서 API 활용 신청을 했는지 확인" -ForegroundColor Gray
            Write-Host "  2. 인증키가 올바른지 확인 (URL 인코딩된 키 사용)" -ForegroundColor Gray
            Write-Host "  3. API 키의 트래픽이 소진되었는지 확인" -ForegroundColor Gray
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "테스트 완료" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if (-not $serviceKey) {
    Write-Host "💡 API 키 설정 방법:" -ForegroundColor Cyan
    Write-Host "  1. 공공데이터 포털에서 '금융위원회_일반상품시세정보' API 신청" -ForegroundColor Gray
    Write-Host "     https://www.data.go.kr/data/15094805/openapi.do" -ForegroundColor Gray
    Write-Host "  2. .env.local 파일에 다음 내용 추가:" -ForegroundColor Gray
    Write-Host "     DATA_GO_KR_SERVICE_KEY=여기에_인증키_입력" -ForegroundColor Gray
    Write-Host "  3. 개발 서버 재시작 (npm run dev)`n" -ForegroundColor Gray
}
