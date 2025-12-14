# PowerShell 스크립트 - 패치노트 크롤링 테스트

# 배포된 URL (본인의 Vercel URL로 변경하세요)
$DEPLOYED_URL = "https://your-domain.vercel.app"

# CRON_SECRET (환경 변수에서 가져오거나 직접 입력)
$CRON_SECRET = if ($env:CRON_SECRET) { $env:CRON_SECRET } else { "your_cron_secret_here" }

Write-Host "패치노트 크롤링 테스트 시작..." -ForegroundColor Green
Write-Host "URL: $DEPLOYED_URL/api/cron/patch-note" -ForegroundColor Cyan
Write-Host ""

# API 호출
try {
    $response = Invoke-RestMethod -Uri "$DEPLOYED_URL/api/cron/patch-note" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $CRON_SECRET"
            "Content-Type" = "application/json"
        } `
        -ErrorAction Stop
    
    Write-Host "성공!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "오류 발생:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "응답: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "테스트 완료!" -ForegroundColor Green

