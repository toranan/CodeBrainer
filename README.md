# CodeBrainer - 알고리즘 학습 플랫폼

알고리즘 문제 풀이, 모의고사, AI 코드 리뷰까지 제공하는 프로그래밍 학습 플랫폼입니다.

## 🚀 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **NextAuth.js** - 인증 (OAuth 지원)

### Backend
- **Spring Boot 3.2.0** - Java 백엔드 프레임워크
- **Spring Security** - 인증/인가
- **Spring Data JPA** - ORM
- **JWT** - 토큰 기반 인증
- **PostgreSQL** - 데이터베이스
- **Gradle** - 빌드 도구

## 📋 주요 기능

### ✅ 구현 완료
- **회원가입/로그인**
  - 이메일/비밀번호 기반 인증
  - BCrypt 비밀번호 암호화
  - JWT 토큰 발급 및 관리
  - 중복 이메일 검증
  - 로그인 상태 유지 (localStorage)

### 🔜 예정
- 문제 목록 및 상세
- 코드 제출 및 채점
- 모의고사 기능
- AI 코드 리뷰

## 🛠️ 설치 및 실행

### 사전 요구사항
- Node.js 18+ 
- Java 21+
- PostgreSQL 13+
- Gradle 8+ (Wrapper 포함)

### 1️⃣ PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE codebrainer;

# 종료
\q
```

### 2️⃣ 환경 변수 설정

**Backend (`backend/src/main/resources/application.yml`)**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/codebrainer
    username: postgres
    password: YOUR_PASSWORD  # 본인의 PostgreSQL 비밀번호

jwt:
  secret: YOUR_JWT_SECRET_KEY  # 최소 256비트
  expiration: 86400000  # 24시간
```

**Frontend (`.env.local`)**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/codebrainer"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"
```

### 3️⃣ 백엔드 실행

```bash
cd backend

# Windows
.\gradlew.bat bootRun

# Mac/Linux
./gradlew bootRun
```

✅ 백엔드가 `http://localhost:8080/api`에서 실행됩니다.

### 4️⃣ 프론트엔드 실행

```bash
# 프로젝트 루트 디렉토리
npm install
npm run dev
```

✅ 프론트엔드가 `http://localhost:3000`에서 실행됩니다.

## 📡 API 엔드포인트

### 인증 (Authentication)

#### 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**응답 (201 Created)**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "role": "USER",
  "createdAt": "2025-10-31T16:00:00"
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 (200 OK)**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "role": "USER",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "loggedInAt": "2025-10-31T16:00:00"
}
```

#### 이메일 중복 확인
```http
GET /api/auth/check-email?email=user@example.com
```

**응답 (200 OK)**
```json
{
  "available": false,
  "message": "이미 사용 중인 이메일입니다"
}
```

## 🗄️ 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    provider VARCHAR(50),  -- 'local', 'google', 'azure-ad'
    image VARCHAR(500),
    role VARCHAR(20) NOT NULL,  -- 'USER', 'ADMIN'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 보안

- **비밀번호**: BCrypt 해싱 (솔트 자동 생성)
- **JWT 토큰**: HS256 알고리즘, 24시간 유효
- **CORS**: localhost:3000, localhost:3001 허용
- **CSRF**: REST API이므로 비활성화
- **세션**: Stateless (JWT 기반)

## 📁 프로젝트 구조

```
CodeBrainer/
├── backend/                    # Spring Boot 백엔드
│   ├── src/main/java/com/codebrainer/
│   │   ├── config/            # 설정 (Security, JWT)
│   │   ├── controller/        # REST API 컨트롤러
│   │   ├── dto/              # 데이터 전송 객체
│   │   ├── entity/           # JPA 엔티티
│   │   ├── repository/       # JPA 리포지토리
│   │   └── service/          # 비즈니스 로직
│   └── src/main/resources/
│       └── application.yml   # 애플리케이션 설정
├── src/                       # Next.js 프론트엔드
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signin/       # 로그인 페이지
│   │   │   └── signup/       # 회원가입 페이지
│   │   └── layout.tsx        # 전역 레이아웃
│   └── components/
│       └── layout/
│           └── header.tsx    # 헤더 컴포넌트
├── prisma/
│   └── schema.prisma         # Prisma 스키마
└── README.md
```

## 🐛 트러블슈팅

### 백엔드가 실행되지 않을 때
```bash
# Gradle 캐시 삭제
cd backend
.\gradlew.bat clean

# 다시 실행
.\gradlew.bat bootRun
```

### 데이터베이스 연결 오류
- PostgreSQL이 실행 중인지 확인
- `application.yml`의 비밀번호가 올바른지 확인
- 데이터베이스 `codebrainer`가 생성되었는지 확인

### 프론트엔드가 백엔드와 통신하지 못할 때
- 백엔드가 `http://localhost:8080`에서 실행 중인지 확인
- CORS 설정 확인 (`SecurityConfig.java`)
- 브라우저 콘솔에서 네트워크 탭 확인

## 👥 팀원

- **ryeong** - 백엔드 인증 시스템 개발

## 📝 라이선스

MIT License

## 📧 문의

프로젝트에 대한 문의사항은 이슈를 등록해주세요.
