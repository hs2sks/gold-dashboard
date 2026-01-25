# Gold Dashboard API 테스트 스크립트
# 모든 API 엔드포인트의 상태를 확인합니다

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Gold Dashboard API 테스트 시작" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$endpoints = @(
    @{Name="금/은 국제 시세"; Path="/api/metals"},
    @{Name="KRX 금 시세"; Path="/api/krx-gold"},
    @{Name="환율 (USD/KRW)"; Path="/api/fx"},
    @{Name="뉴스"; Path="/api/news"},
    @{Name="매매 추천"; Path="/api/recommendations"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "테스트 중: $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "URL: $baseUrl$($endpoint.Path)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$($endpoint.Path)" -Method GET -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ 성공 (200 OK)" -ForegroundColor Green
            
            # JSON 파싱 시도
            try {
                $json = $response.Content | ConvertFrom-Json
                
                # warning이나 error 필드 확인
                if ($json.warning) {
                    Write-Host "  ⚠ 경고: $($json.warning)" -ForegroundColor Yellow
                } elseif ($json.error) {
                    Write-Host "  ⚠ 에러: $($json.error)" -ForegroundColor Yellow
                } else {
                    Write-Host "  → 데이터 정상 수신" -ForegroundColor Green
                }
                
                # 응답 크기 표시
                Write-Host "  → 응답 크기: $($response.Content.Length) bytes" -ForegroundColor Gray
            } catch {
                Write-Host "  ⚠ JSON 파싱 실패" -ForegroundColor Yellow
            }
        } else {
            Write-Host "✗ 실패 (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ 요청 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "테스트 완료" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "상세 데이터를 보려면 브라우저에서 URL을 직접 방문하세요." -ForegroundColor Gray
Write-Host "예: http://localhost:3000/api/metals`n" -ForegroundColor Gray
