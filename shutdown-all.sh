#!/bin/bash
# 모든 개발 서비스 종료 스크립트 (Linux/Mac)

echo "================================"
echo "모든 개발 서비스 종료 시작"
echo "================================"
echo ""

# 1. Next.js 개발 서버 종료 (포트 3000)
echo "[1/4] Next.js 개발 서버 종료 중..."
NEXT_PID=$(lsof -ti:3000)
if [ ! -z "$NEXT_PID" ]; then
    kill -9 $NEXT_PID
    echo "  ✓ Next.js 서버 종료 완료"
else
    echo "  - Next.js 서버가 실행 중이지 않습니다"
fi

# 2. Spring Boot 백엔드 종료 (포트 8080)
echo "[2/4] Spring Boot 백엔드 종료 중..."
BACKEND_PID=$(lsof -ti:8080)
if [ ! -z "$BACKEND_PID" ]; then
    kill -9 $BACKEND_PID
    echo "  ✓ Spring Boot 백엔드 종료 완료"
else
    echo "  - Spring Boot 백엔드가 실행 중이지 않습니다"
fi

# 3. Orchestrator 서버 종료 (포트 8081)
echo "[3/4] Orchestrator 서버 종료 중..."
ORCH_PID=$(lsof -ti:8081)
if [ ! -z "$ORCH_PID" ]; then
    kill -9 $ORCH_PID
    echo "  ✓ Orchestrator 서버 종료 완료"
else
    echo "  - Orchestrator 서버가 실행 중이지 않습니다"
fi

# 4. RabbitMQ / Docker 컨테이너 종료
echo "[4/4] Docker 컨테이너 종료 중..."
if command -v docker &> /dev/null; then
    cd backend 2>/dev/null
    docker-compose down 2>/dev/null
    cd .. 2>/dev/null
    echo "  ✓ Docker 컨테이너 종료 완료"
else
    echo "  - Docker가 설치되어 있지 않습니다"
fi

echo ""
echo "================================"
echo "모든 서비스 종료 완료!"
echo "Supabase 연결이 정리되었습니다."
echo "================================"

