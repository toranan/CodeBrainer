# CodeBrainer Docker 환경 구축 가이드

이 문서는 팀원들이 CodeBrainer 프로젝트와 동일한 Docker 개발 환경을 구축하는 방법을 설명합니다.

---

## 📋 목차

1. [필수 요구사항](#필수-요구사항)
2. [1단계: 저장소 클론](#1단계-저장소-클론)
3. [2단계: Docker Desktop 설치 및 실행](#2단계-docker-desktop-설치-및-실행)
4. [3단계: 포트 확인](#3단계-포트-확인)
5. [4단계: 백엔드 서비스 시작](#4단계-백엔드-서비스-시작)
6. [5단계: Judge0 초기 설정](#5단계-judge0-초기-설정)
7. [6단계: 프론트엔드 설정](#6단계-프론트엔드-설정)
8. [7단계: 전체 시스템 확인](#7단계-전체-시스템-확인)
9. [문제 해결](#문제-해결)
10. [일상적인 개발 워크플로우](#일상적인-개발-워크플로우)

---

## 필수 요구사항

### 1. 필수 소프트웨어

| 소프트웨어 | 최소 버전 | 다운로드 링크 |
|-----------|----------|--------------|
| **Docker Desktop** | 4.0 이상 | [Docker Desktop 다운로드](https://www.docker.com/products/docker-desktop) |
| **Node.js** | v18 이상 | [Node.js 다운로드](https://nodejs.org/) |
| **Git** | 2.0 이상 | [Git 다운로드](https://git-scm.com/downloads) |

### 2. 시스템 요구사항

- **RAM**: 최소 8GB (권장: 16GB 이상)
- **디스크 공간**: 최소 10GB 여유 공간
- **운영체제**: 
  - macOS 10.15 이상
  - Windows 10/11 (64-bit)
  - Linux (Ubuntu 20.04 이상)

### 3. 포트 요구사항

다음 포트들이 **사용 가능해야** 합니다:

| 포트 | 서비스 | 설명 |
|------|--------|------|
| `3000` | Next.js Frontend | 웹 애플리케이션 |
| `8080` | Spring Boot Orchestrator | 백엔드 API |
| `5432` | PostgreSQL | 데이터베이스 |
| `5672` | RabbitMQ | 메시지 큐 |
| `15672` | RabbitMQ Management | 관리 콘솔 |
| `2358` | Judge0 Server | 채점 서버 |
| `6379` | Redis | 캐시/큐 |

---

## 1단계: 저장소 클론

### 1.1 GitHub 저장소 클론

```bash
# 저장소 클론
git clone https://github.com/toranan/CodeBrainer.git

# 프로젝트 디렉토리로 이동
cd CodeBrainer
```

### 1.2 브랜치 확인 및 체크아웃

```bash
# 사용 가능한 브랜치 확인
git branch -a

# dev 브랜치로 체크아웃 (또는 사용할 브랜치)
git checkout dev

# 최신 코드 가져오기
git pull origin dev
```

---

## 2단계: Docker Desktop 설치 및 실행

### 2.1 Docker Desktop 설치

#### macOS
1. [Docker Desktop for Mac 다운로드](https://www.docker.com/products/docker-desktop/)
2. `.dmg` 파일 실행 및 설치
3. 애플리케이션 폴더에서 Docker 실행

#### Windows
1. [Docker Desktop for Windows 다운로드](https://www.docker.com/products/docker-desktop/)
2. `.exe` 파일 실행 및 설치
3. 재부팅 후 Docker Desktop 실행

### 2.2 Docker Desktop 실행 확인

```bash
# Docker가 정상 실행 중인지 확인
docker --version
# 예상 출력: Docker version 24.x.x 또는 그 이상

# Docker Compose 확인
docker compose version
# 예상 출력: Docker Compose version v2.x.x 또는 그 이상
```

### 2.3 Docker Desktop 완전히 시작 대기

Docker Desktop을 처음 실행하면 초기화에 시간이 걸립니다.

**확인 방법:**
- macOS: 메뉴바에서 Docker 아이콘이 초록색이 되면 준비 완료
- Windows: 시스템 트레이에서 Docker 아이콘이 초록색이 되면 준비 완료

**대기 시간:** 약 1-2분

---

## 3단계: 포트 확인

### 3.1 포트 사용 여부 확인

#### macOS/Linux
```bash
# 8080 포트 확인
lsof -i :8080

# 5432 포트 확인
lsof -i :5432

# 3000 포트 확인
lsof -i :3000

# 포트를 사용 중인 프로세스 종료 (필요시)
kill -9 <PID>
```

#### Windows
```powershell
# 8080 포트 확인
netstat -ano | findstr :8080

# 5432 포트 확인
netstat -ano | findstr :5432

# 포트를 사용 중인 프로세스 종료 (필요시)
taskkill /PID <PID> /F
```

### 3.2 포트 충돌 해결

만약 포트가 이미 사용 중이라면:

1. **다른 프로젝트가 사용 중**: 해당 프로젝트를 중지하거나 포트를 변경
2. **이전 Docker 컨테이너가 실행 중**: `docker ps -a`로 확인 후 정리

```bash
# 실행 중인 모든 컨테이너 확인
docker ps -a

# 모든 컨테이너 중지 및 제거 (주의: 다른 프로젝트도 영향받을 수 있음)
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
```

---

## 4단계: 백엔드 서비스 시작

### 4.1 백엔드 디렉토리로 이동

```bash
cd backend
```

### 4.2 Docker Compose로 모든 서비스 시작

```bash
# 모든 서비스를 백그라운드에서 시작
docker compose up -d
```

**처음 실행 시:**
- Docker 이미지 다운로드 (약 5-10분 소요)
- 컨테이너 빌드 및 시작
- 데이터베이스 초기화

**예상 출력:**
```
[+] Running 6/6
 ✔ Container backend-postgres-1     Healthy
 ✔ Container backend-redis-1         Started
 ✔ Container backend-rabbitmq-1      Healthy
 ✔ Container backend-judge0-1        Started
 ✔ Container backend-orchestrator-1  Started
```

### 4.3 서비스 상태 확인

```bash
# 모든 서비스 상태 확인
docker compose ps
```

**정상 상태일 때 예상 출력:**
```
NAME                        STATUS              PORTS
backend-judge0-1           running             0.0.0.0:2358->2358/tcp
backend-orchestrator-1     running             0.0.0.0:8080->8080/tcp
backend-postgres-1         running             0.0.0.0:5432->5432/tcp
backend-rabbitmq-1         running             5672/tcp, 0.0.0.0:15672->15672/tcp
backend-redis-1            running             0.0.0.0:6379->6379/tcp
```

### 4.4 서비스 로그 확인

```bash
# 모든 서비스 로그 확인 (실시간)
docker compose logs -f

# 특정 서비스 로그만 확인
docker compose logs -f orchestrator
docker compose logs -f postgres
docker compose logs -f judge0
```

**로그에서 확인할 점:**
- `orchestrator`: Spring Boot 애플리케이션이 정상 시작되었는지
- `postgres`: 데이터베이스 연결 성공 여부
- `judge0`: Judge0 서버가 정상 시작되었는지

---

## 5단계: Judge0 초기 설정

### 5.1 Judge0 데이터베이스 마이그레이션

Judge0는 처음 시작할 때 데이터베이스 마이그레이션이 필요합니다.

```bash
# Judge0 컨테이너 접속
docker compose exec judge0 bash

# Rails 마이그레이션 실행
rails db:migrate

# 마이그레이션 완료 확인
# (아무 오류 메시지가 없으면 성공)

# 컨테이너에서 나가기
exit
```

### 5.2 Judge0 서비스 재시작

```bash
# Judge0 컨테이너 재시작
docker compose restart judge0

# 재시작 후 약 10-15초 대기
sleep 10
```

### 5.3 Judge0 정상 작동 확인

```bash
# Judge0 정보 조회 (정상 작동 확인)
curl http://localhost:2358/about
```

**예상 출력:**
```json
{
  "version": "1.13.1",
  "languages": [...]
}
```

**만약 연결이 안 된다면:**
```bash
# Judge0 로그 확인
docker compose logs judge0

# Judge0 컨테이너 재시작
docker compose restart judge0
```

---

## 6단계: 프론트엔드 설정

### 6.1 프로젝트 루트로 이동

```bash
cd ..
# 또는
cd /Users/anseung-won/Desktop/동국대학교/3-2/CodeBrainer
```

### 6.2 Node.js 의존성 설치

```bash
# npm 패키지 설치
npm install
```

**예상 소요 시간:** 2-5분

### 6.3 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다:

```bash
# .env.local 파일 생성 (존재하지 않는 경우)
touch .env.local
```

`.env.local` 파일 내용:
```env
# 데이터베이스 연결
DATABASE_URL="postgresql://codebrainer:codebrainer@localhost:5432/codebrainer?schema=public"

# Judge0 API URL
JUDGE0_BASE_URL=http://localhost:2358

# NextAuth 설정 (개발용)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

### 6.4 Prisma 클라이언트 생성

```bash
# Prisma 클라이언트 생성
npx prisma generate
```

### 6.5 데이터베이스 스키마 적용

```bash
# Prisma 스키마를 데이터베이스에 적용
npx prisma db push
```

**예상 출력:**
```
✔ Generated Prisma Client
✔ Pushed schema to database
```

### 6.6 초기 데이터 시딩

```bash
# 초기 문제 데이터 로드
npx prisma db seed
```

**예상 출력:**
```
✓ Seeded 4 problems successfully
```

---

## 7단계: 전체 시스템 확인

### 7.1 프론트엔드 개발 서버 시작

```bash
# 개발 서버 시작
npm run dev
```

**예상 출력:**
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
```

브라우저에서 `http://localhost:3000` 접속하여 확인하세요.

### 7.2 각 서비스 개별 확인

#### 1️⃣ Frontend 확인
- **URL**: http://localhost:3000
- **확인 사항**: 문제 목록 페이지가 표시되어야 함

#### 2️⃣ Backend Orchestrator API 확인

```bash
# 문제 목록 조회
curl http://localhost:8080/api/problems

# 특정 문제 조회 (slug 사용)
curl http://localhost:8080/api/problems/same-number-hate
```

**예상 응답:** JSON 형식의 문제 데이터

#### 3️⃣ Judge0 서비스 확인

```bash
# Judge0 정보 확인
curl http://localhost:2358/about

# 지원 언어 목록 확인
curl http://localhost:2358/languages
```

#### 4️⃣ RabbitMQ Management Console 확인
- **URL**: http://localhost:15672
- **Username**: `guest`
- **Password**: `guest`
- **확인 사항**: 큐 및 메시지 상태 모니터링 가능

#### 5️⃣ PostgreSQL 확인

```bash
# PostgreSQL 컨테이너 접속
docker compose exec postgres psql -U codebrainer -d codebrainer

# 테이블 목록 확인
\dt

# 문제 테이블 조회
SELECT id, title, slug FROM problems LIMIT 5;

# 나가기
\q
```

---

## 문제 해결

### ❌ 문제 1: Docker 데몬에 연결할 수 없음

**증상:**
```
Cannot connect to the Docker daemon
```

**해결 방법:**

1. **Docker Desktop이 실행 중인지 확인**
   ```bash
   # macOS
   open -a Docker
   
   # Windows
   # 시작 메뉴에서 "Docker Desktop" 실행
   ```

2. **Docker Desktop이 완전히 시작될 때까지 대기** (1-2분)

3. **Docker 재시작**
   - Docker Desktop에서 `Troubleshoot` → `Restart` 클릭

---

### ❌ 문제 2: 포트가 이미 사용 중

**증상:**
```
Error: port is already allocated
```

**해결 방법:**

#### macOS/Linux
```bash
# 사용 중인 포트 확인
lsof -i :8080
lsof -i :5432

# 프로세스 종료
kill -9 <PID>
```

#### Windows
```powershell
# 사용 중인 포트 확인
netstat -ano | findstr :8080

# 프로세스 종료
taskkill /PID <PID> /F
```

#### 다른 Docker 프로젝트와 충돌하는 경우
```bash
# 모든 Docker 컨테이너 중지
docker stop $(docker ps -q)

# 현재 프로젝트만 재시작
cd backend
docker compose up -d
```

---

### ❌ 문제 3: Judge0 연결 실패

**증상:**
```
ResourceAccessException: I/O error on POST request
Connection refused
```

**해결 방법:**

1. **Judge0 마이그레이션 실행**
   ```bash
   cd backend
   docker compose exec judge0 rails db:migrate
   docker compose restart judge0
   ```

2. **Judge0 로그 확인**
   ```bash
   docker compose logs judge0
   ```

3. **Judge0 재시작**
   ```bash
   docker compose restart judge0
   sleep 15
   curl http://localhost:2358/about
   ```

---

### ❌ 문제 4: Orchestrator 500 에러

**증상:**
```
relation "problems" does not exist
```

**해결 방법:**

1. **데이터베이스 스키마 확인**
   ```bash
   # 프로젝트 루트에서
   npx prisma db push
   ```

2. **Prisma 클라이언트 재생성**
   ```bash
   npx prisma generate
   ```

3. **Orchestrator 재시작**
   ```bash
   cd backend
   docker compose restart orchestrator
   ```

---

### ❌ 문제 5: npm install 실패

**증상:**
```
npm ERR! network timeout
npm ERR! connection refused
```

**해결 방법:**

1. **네트워크 확인**
   ```bash
   # 인터넷 연결 확인
   ping google.com
   ```

2. **npm 캐시 정리**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **다른 레지스트리 사용 (선택사항)**
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```

---

### ❌ 문제 6: Prisma 연결 실패

**증상:**
```
Can't reach database server
```

**해결 방법:**

1. **PostgreSQL 컨테이너 확인**
   ```bash
   cd backend
   docker compose ps postgres
   ```

2. **PostgreSQL 재시작**
   ```bash
   docker compose restart postgres
   sleep 10
   ```

3. **DATABASE_URL 확인**
   - `.env.local` 파일의 `DATABASE_URL`이 올바른지 확인
   - 포트가 `5432`인지 확인
   - 사용자명과 비밀번호가 `codebrainer`인지 확인

---

## 일상적인 개발 워크플로우

### 🟢 하루 시작 시

```bash
# 1. 프로젝트 디렉토리로 이동
cd /Users/anseung-won/Desktop/동국대학교/3-2/CodeBrainer

# 2. 최신 코드 가져오기
git pull origin dev

# 3. 백엔드 서비스 시작
cd backend
docker compose up -d

# 4. 서비스 상태 확인
docker compose ps

# 5. 프론트엔드 개발 서버 시작
cd ..
npm run dev
```

### 🔴 하루 종료 시

```bash
# 1. 프론트엔드 서버 중지
# (Ctrl + C)

# 2. 백엔드 서비스 중지 (선택사항 - 데이터 보존)
cd backend
docker compose stop

# 또는 완전히 제거하고 싶다면
# docker compose down
```

### 🔄 코드 변경 후 재시작

#### 프론트엔드 코드 변경
```bash
# 자동으로 핫 리로드됨 (서버 재시작 불필요)
```

#### 백엔드 코드 변경
```bash
cd backend

# Orchestrator 재빌드 및 재시작
docker compose up -d --build orchestrator

# 로그 확인
docker compose logs -f orchestrator
```

#### 데이터베이스 스키마 변경
```bash
# 1. prisma/schema.prisma 수정

# 2. 스키마 적용
npx prisma db push

# 3. Prisma 클라이언트 재생성
npx prisma generate
```

### 🧹 환경 초기화 (필요시)

**⚠️ 주의: 모든 데이터가 삭제됩니다!**

```bash
cd backend

# 1. 모든 컨테이너와 볼륨 삭제
docker compose down -v

# 2. 서비스 재시작
docker compose up -d

# 3. Judge0 마이그레이션
docker compose exec judge0 rails db:migrate
docker compose restart judge0

# 4. 프론트엔드 데이터베이스 초기화
cd ..
npx prisma db push
npx prisma db seed
```

---

## 유용한 Docker 명령어 모음

### 서비스 관리

```bash
# 모든 서비스 시작
docker compose up -d

# 모든 서비스 중지
docker compose stop

# 모든 서비스 중지 및 제거
docker compose down

# 특정 서비스만 재시작
docker compose restart orchestrator

# 특정 서비스 재빌드
docker compose up -d --build orchestrator
```

### 로그 확인

```bash
# 모든 서비스 로그
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f orchestrator

# 최근 100줄만 확인
docker compose logs --tail=100 orchestrator
```

### 컨테이너 접속

```bash
# PostgreSQL 접속
docker compose exec postgres psql -U codebrainer -d codebrainer

# Judge0 접속
docker compose exec judge0 bash

# Orchestrator 접속
docker compose exec orchestrator sh
```

### 리소스 사용량 확인

```bash
# 컨테이너 리소스 사용량
docker stats

# 볼륨 크기 확인
docker system df -v
```

---

## 팀 협업 시 주의사항

### ✅ 공유해야 할 것

1. **환경 변수 파일 (.env.local)**
   - 민감한 정보는 제외
   - `.env.example` 파일 제공 권장

2. **Docker Compose 설정 변경사항**
   - `docker-compose.yml` 변경 시 팀원들에게 알림

3. **데이터베이스 스키마 변경**
   - Prisma 마이그레이션 파일 커밋
   - 스키마 변경 전 팀원들과 논의

### ❌ 공유하지 말아야 할 것

1. **실제 비밀번호/토큰**
   - `.env.local` 파일 자체는 커밋하지 않기
   - `.gitignore`에 추가

2. **개인 로컬 설정**
   - IDE 설정, 개인 스크립트 등

---

## 추가 리소스

- [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) - 상세한 빌드 가이드
- [BACKEND_API_DOCS.md](./BACKEND_API_DOCS.md) - 백엔드 API 문서
- [JUDGE0_SETUP.md](./JUDGE0_SETUP.md) - Judge0 설정 가이드

---

## 질문이나 문제가 있나요?

1. **GitHub Issues에 등록**: 프로젝트 이슈 트래커 활용
2. **팀 채널에 질문**: Slack/Discord 등 팀 소통 채널 활용
3. **문서 개선 제안**: 이 문서를 더 나은 내용으로 개선하는 것도 환영합니다!

---

**마지막 업데이트**: 2024년 1월

