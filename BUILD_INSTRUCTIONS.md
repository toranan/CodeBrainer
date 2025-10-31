# CodeBrainer 프로젝트 빌드 및 실행 가이드

## 필수 요구사항

- **Docker Desktop**: 최신 버전 설치 및 실행 중이어야 함
- **Node.js**: v18 이상
- **Git**: 최신 버전
- **포트 확인**: 다음 포트들이 사용 가능해야 함
  - 3000 (Next.js Frontend)
  - 8080 (Spring Boot Orchestrator)
  - 5432 (PostgreSQL)
  - 5672, 15672 (RabbitMQ)
  - 2358 (Judge0 Server)
  - 2359 (Judge0 Worker)
  - 6379 (Redis)

## 프로젝트 구조

```
CodeBrainer/
├── backend/
│   ├── docker-compose.yml          # 백엔드 서비스 오케스트레이션
│   ├── init-judge0-db.sh          # PostgreSQL 초기화 스크립트
│   └── orchestrator/              # Spring Boot 애플리케이션
│       ├── pom.xml
│       └── src/
├── prisma/
│   ├── schema.prisma              # 데이터베이스 스키마 (Single Source of Truth)
│   └── seed.ts                    # 초기 데이터 시딩
├── src/                           # Next.js Frontend
└── package.json
```

## 데이터베이스 구조

프로젝트는 **3개의 분리된 PostgreSQL 데이터베이스**를 사용합니다:

1. **codebrainer** (포트 5432)
   - Frontend (Next.js + Prisma)와 Backend (Orchestrator) 모두 사용
   - Prisma schema가 Single Source of Truth
   - 문제(Problem), 테스트케이스(Testcase), 제출(Submission) 등 저장

2. **judge0** (포트 5432, 별도 스키마)
   - Judge0 서비스 전용 데이터베이스
   - 코드 실행 및 채점 상태 관리

3. **redis** (포트 6379)
   - Judge0 작업 큐 관리

## 단계별 빌드 및 실행 가이드

### 1단계: 저장소 클론 및 브랜치 체크아웃

```bash
git clone https://github.com/toranan/CodeBrainer.git
cd CodeBrainer
git checkout seungwon
```

### 2단계: Docker Desktop 실행

```bash
# macOS
open -a Docker

# Docker가 완전히 시작될 때까지 대기 (약 30초)
```

### 3단계: Backend 서비스 시작

```bash
cd backend

# 모든 서비스를 백그라운드에서 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps
```

**예상 출력:**
```
NAME                        STATUS              PORTS
backend-judge0-1           running             0.0.0.0:2358->2358/tcp
backend-judge0-worker-1    running
backend-orchestrator-1     running             0.0.0.0:8080->8080/tcp
backend-postgres-1         running             0.0.0.0:5432->5432/tcp
backend-rabbitmq-1         running             5672/tcp, 15672/tcp
backend-redis-1            running             0.0.0.0:6379->6379/tcp
```

### 4단계: Judge0 데이터베이스 마이그레이션

Judge0 서비스가 처음 시작되면 데이터베이스 마이그레이션이 필요합니다:

```bash
# Judge0 컨테이너 접속
docker exec -it backend-judge0-1 bash

# 마이그레이션 실행
rails db:migrate

# 컨테이너에서 나가기
exit

# Judge0 서비스 재시작
docker restart backend-judge0-1 backend-judge0-worker-1

# Judge0 정상 작동 확인 (약 10초 후)
curl http://localhost:2358/about
```

### 5단계: Frontend 의존성 설치 및 데이터베이스 초기화

```bash
# 프로젝트 루트로 이동
cd ..

# Node.js 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 적용
npx prisma db push

# 초기 데이터 시딩 (4개의 문제 로드)
npx prisma db seed
```

**시딩 완료 시 출력:**
```
✓ Seeded 4 problems successfully
```

### 6단계: Frontend 개발 서버 시작

```bash
npm run dev
```

Frontend는 http://localhost:3000 에서 접근 가능합니다.

## 서비스 확인

### 1. Frontend 확인
- URL: http://localhost:3000
- 문제 목록 페이지에서 4개의 문제가 표시되어야 함

### 2. Backend Orchestrator API 확인
```bash
# 문제 목록 조회
curl http://localhost:8080/api/problems

# 특정 문제 조회 (slug 사용)
curl http://localhost:8080/api/problems/same-number-hate
```

### 3. Judge0 서비스 확인
```bash
# Judge0 버전 및 상태 확인
curl http://localhost:2358/about

# 간단한 코드 실행 테스트
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "print(\"Hello World\")",
    "language_id": 71,
    "stdin": ""
  }'
```

### 4. RabbitMQ 관리 콘솔
- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

## 서비스 중지 및 재시작

### 모든 서비스 중지
```bash
cd backend
docker-compose down
```

### 데이터 보존하며 서비스 중지
```bash
docker-compose stop
```

### 서비스 재시작
```bash
docker-compose start
```

### 특정 서비스만 재시작
```bash
docker-compose restart orchestrator
docker-compose restart judge0
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f orchestrator
docker-compose logs -f judge0
```

## 데이터베이스 리셋

데이터베이스를 완전히 초기화하고 싶을 때:

```bash
# 1. 모든 컨테이너와 볼륨 삭제
cd backend
docker-compose down -v

# 2. 서비스 재시작
docker-compose up -d

# 3. Judge0 마이그레이션 (4단계 참고)
docker exec -it backend-judge0-1 rails db:migrate
docker restart backend-judge0-1 backend-judge0-worker-1

# 4. Frontend 데이터베이스 초기화 (5단계 참고)
cd ..
npx prisma db push
npx prisma db seed
```

## 문제 해결 (Troubleshooting)

### 1. Docker 데몬 에러
**증상**: `Cannot connect to the Docker daemon`
**해결**:
```bash
open -a Docker
# Docker Desktop이 완전히 시작될 때까지 대기
```

### 2. Judge0 연결 실패
**증상**: `ResourceAccessException: I/O error on POST request`
**해결**:
```bash
docker exec -it backend-judge0-1 rails db:migrate
docker restart backend-judge0-1 backend-judge0-worker-1
```

### 3. Orchestrator 500 에러
**증상**: `relation "problems" does not exist`
**원인**: Orchestrator가 snake_case 테이블을 찾지만, Prisma는 PascalCase 테이블 생성
**해결**: Orchestrator JPA 엔티티가 Prisma 스키마와 일치하는지 확인 필요

### 4. 포트 충돌
**증상**: `port is already allocated`
**해결**:
```bash
# 포트 사용 중인 프로세스 확인 (macOS)
lsof -i :8080
lsof -i :5432

# 프로세스 종료
kill -9 <PID>
```

### 5. Frontend 빌드 에러
**증상**: TypeScript 또는 Next.js 에러
**해결**:
```bash
# node_modules 삭제 및 재설치
rm -rf node_modules package-lock.json
npm install

# Prisma 클라이언트 재생성
npx prisma generate
```

## 개발 워크플로우

### 데이터베이스 스키마 변경
1. `prisma/schema.prisma` 수정
2. `npx prisma db push` 실행
3. 필요시 `prisma/seed.ts` 업데이트 후 `npx prisma db seed` 실행
4. Backend JPA 엔티티도 함께 수정 필요

### 문제 추가
```bash
# seed.ts에 문제 데이터 추가 후
npx prisma db seed
```

### Backend 코드 변경
```bash
# Orchestrator 재빌드 및 재시작
cd backend
docker-compose up -d --build orchestrator
```

## 주요 API 엔드포인트

### Orchestrator API (포트 8080)
- `GET /api/problems` - 모든 문제 목록
- `GET /api/problems/{slug}` - 특정 문제 상세
- `POST /api/submissions` - 코드 제출
- `GET /api/submissions/{id}` - 제출 결과 조회

### Judge0 API (포트 2358)
- `POST /submissions` - 코드 실행 요청
- `GET /submissions/{token}` - 실행 결과 조회
- `GET /about` - Judge0 정보
- `GET /languages` - 지원 언어 목록

## 프로젝트 아키텍처

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Next.js    │────────▶│ Orchestrator │────────▶│   Judge0    │
│  Frontend   │         │  (Spring)    │         │   Server    │
│  (Port 3000)│         │  (Port 8080) │         │  (Port 2358)│
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │                       │                        │
       ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (Port 5432)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ codebrainer │  │   judge0    │  │    redis    │       │
│  │     DB      │  │     DB      │  │   (Queue)   │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 기술 스택

- **Frontend**: Next.js 15.5.4, React, TypeScript, Prisma ORM
- **Backend**: Spring Boot 3.3.5, Java 21, JPA/Hibernate
- **Database**: PostgreSQL 15, Redis
- **Judge Engine**: Judge0 v1.13.1
- **Message Queue**: RabbitMQ
- **Containerization**: Docker, Docker Compose

## 다음 단계 (TODO)

현재 프로젝트는 기본 인프라가 구축된 상태이며, 다음 기능들이 구현 대기 중입니다:

1. ✅ 문제 목록 표시
2. ✅ Judge0 통합
3. ⏳ End-to-End 채점 시스템 완성
4. ⏳ Frontend에서 코드 제출 및 결과 표시
5. ⏳ 사용자 인증 및 제출 이력
6. ⏳ 실시간 채점 상태 업데이트

## 참고 사항

- **Prisma가 Single Source of Truth**: 모든 데이터베이스 스키마 변경은 Prisma schema를 통해 이루어집니다.
- **Orchestrator는 읽기 전용**: Backend Orchestrator는 Prisma가 생성한 테이블을 읽기만 합니다.
- **Judge0는 독립적**: Judge0는 자체 데이터베이스를 사용하며 Orchestrator를 통해 접근합니다.
