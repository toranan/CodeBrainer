#!/usr/bin/env pwsh
# 모든 개발 서비스 종료 스크립트 (Windows PowerShell)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "모든 개발 서비스 종료 시작" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Next.js 개발 서버 종료 (포트 3000)
Write-Host "[1/4] Next.js 개발 서버 종료 중..." -ForegroundColor Yellow
$nextProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*next*dev*"
}
if ($nextProcess) {
    Stop-Process -Id $nextProcess.Id -Force
    Write-Host "  ✓ Next.js 서버 종료 완료" -ForegroundColor Green
} else {
    Write-Host "  - Next.js 서버가 실행 중이지 않습니다" -ForegroundColor Gray
}

# 2. Spring Boot 백엔드 종료 (포트 8080)
Write-Host "[2/4] Spring Boot 백엔드 종료 중..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($port8080) {
    $javaPid = $port8080.OwningProcess
    Stop-Process -Id $javaPid -Force
    Write-Host "  ✓ Spring Boot 백엔드 종료 완료" -ForegroundColor Green
} else {
    Write-Host "  - Spring Boot 백엔드가 실행 중이지 않습니다" -ForegroundColor Gray
}

# 3. Orchestrator 서버 종료 (포트 8081)
Write-Host "[3/4] Orchestrator 서버 종료 중..." -ForegroundColor Yellow
$port8081 = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
if ($port8081) {
    $javaPid = $port8081.OwningProcess
    Stop-Process -Id $javaPid -Force
    Write-Host "  ✓ Orchestrator 서버 종료 완료" -ForegroundColor Green
} else {
    Write-Host "  - Orchestrator 서버가 실행 중이지 않습니다" -ForegroundColor Gray
}

# 4. RabbitMQ / Docker 컨테이너 종료
Write-Host "[4/4] Docker 컨테이너 종료 중..." -ForegroundColor Yellow
$dockerRunning = docker ps -q 2>$null
if ($dockerRunning) {
    docker-compose -f backend/docker-compose.yml down 2>$null
    Write-Host "  ✓ Docker 컨테이너 종료 완료" -ForegroundColor Green
} else {
    Write-Host "  - Docker 컨테이너가 실행 중이지 않습니다" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "모든 서비스 종료 완료!" -ForegroundColor Green
Write-Host "Supabase 연결이 정리되었습니다." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

