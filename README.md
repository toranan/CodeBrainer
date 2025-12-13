# 🧠 CodeBrainer

> AI 기반 알고리즘 학습 플랫폼 - 문제 풀이부터 AI 코드 리뷰까지

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen)](https://spring.io/projects/spring-boot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CodeBrainer는 알고리즘 문제 풀이, 실시간 채점, AI 코드 리뷰 및 힌트 제공 기능을 갖춘 통합 학습 플랫폼입니다.

🔗 **Live Demo**: [code-brainer.vercel.app](https://code-brainer.vercel.app)

---

## ✨ 주요 기능

### � 문제 풀이
- **실시간 코드 에디터** (Monaco Editor) - Python, Java, C++, JavaScript 등 다양한 언어 지원
- **즉시 채점** - Judge0 엔진 기반 빠르고 정확한 코드 실행
- **상세한 피드백** - 테스트 케이스별 결과, 실행 시간, 메모리 사용량

### 🤖 AI 보조 모드
- **AI 코드 리뷰** (Gemini API) - 정답 제출 시 코드 품질 분석 및 개선점 제안
- **AI 힌트** - 오답 시 정답 코드 없이 방향성만 제시하는 맞춤형 힌트
- **출제 의도 분석** - 문제가 요구하는 알고리즘 카테고리 준수 여부 검증

### 📊 학습 관리
- **마이페이지** - 제출 이력, 해결 문제, 추천 알고리즘 통계
- **모의고사** - 난이도별 시간 제한 문제 세트
- **진행 상황 추적** - 문제별 정답률, 언어별 제출 통계

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크, App Router
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Monaco Editor** - VS Code 기반 코드 에디터
- **React Query** - 서버 상태 관리

### Backend
- **Spring Boot 3.2** - Java 백엔드 프레임워크
- **Spring Data JPA** - ORM, Hibernate
- **PostgreSQL** - 관계형 데이터베이스
- **Supabase Storage** - 문제 파일 및 테스트 케이스 저장

### 코드 채점 & AI
- **[Judge0](https://github.com/judge0/judge0)** (MIT License) - 코드 실행 및 채점 엔진
- **Google Gemini API** - AI 코드 리뷰 및 힌트 생성

### 배포
- **Vercel** - Frontend 호스팅
- **Railway** - Backend 호스팅 (Spring Boot + PostgreSQL)

---

## 🚀 빠른 시작

### 🌐 배포된 서비스 바로 사용하기

**CodeBrainer는 이미 배포되어 있습니다! 설치 없이 바로 사용하세요.**

🔗 **Live Demo**: [code-brainer.vercel.app](https://code-brainer.vercel.app)

1. 링크 접속
2. 회원가입 / 로그인
3. 문제 선택 및 코드 작성
4. **AI 보조모드 ON** → AI 힌트 및 코드 리뷰 활용

---

## 💻 로컬 개발 환경 설정 (개발자용)

### 사전 요구사항
- Node.js 18+
- Java 21+
- Docker & Docker Compose (Judge0 채점 엔진)
- PostgreSQL 13+

### 1️⃣ 저장소 클론
```bash
git clone https://github.com/toranan/CodeBrainer.git
cd CodeBrainer
```

### 2️⃣ 환경 변수 설정

**Frontend (`.env.local`)**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend URLs (로컬 개발)
NEXT_PUBLIC_AUTH_BACKEND_URL=http://localhost:8081
NEXT_PUBLIC_ORCHESTRATOR_URL=http://localhost:8080
```

**Backend Orchestrator (`backend/orchestrator/src/main/resources/application.yml`)**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/codebrainer
    username: postgres
    password: YOUR_PASSWORD

gemini:
  api-key: ${GEMINI_API_KEY}
  
supabase:
  url: ${SUPABASE_URL}
  key: ${SUPABASE_SERVICE_ROLE_KEY}
```

### 3️⃣ Judge0 실행 (Docker)
```bash
cd backend
docker-compose -f docker-compose.judge0-linux.yml up -d
```

### 4️⃣ 백엔드 실행

**Option A: Maven (Orchestrator - 추천)**
```bash
cd backend/orchestrator
./mvnw spring-boot:run
```

**Option B: Gradle (Auth Backend)**
```bash
cd backend/src
./gradlew bootRun
```

> **Note**: 로컬 개발 시 Orchestrator(포트 8080)만 실행해도 대부분의 기능을 사용할 수 있습니다.

### 5️⃣ 프론트엔드 실행
```bash
npm install
npm run dev
```

✅ `http://localhost:3000`에서 접속 가능

---

## � 프로젝트 구조

```
CodeBrainer/
├── src/                          # Next.js Frontend
│   ├── app/
│   │   ├── problems/            # 문제 목록 및 상세
│   │   ├── me/                  # 마이페이지
│   │   └── api/                 # Next.js API Routes
│   └── components/
│       ├── problem/             # 코드 에디터, 제출 결과
│       └── layout/              # 헤더, 푸터
├── backend/
│   ├── src/                     # Auth Backend (Spring Boot)
│   └── orchestrator/            # Orchestrator - 채점 및 AI 서비스
│       ├── judge0/              # Judge0 클라이언트
│       ├── service/
│       │   ├── JudgeService     # 코드 채점
│       │   └── GeminiAIService  # AI 리뷰/힌트
│       └── storage/             # Supabase Storage 연동
└── docker-compose.judge0.yml    # Judge0 설정
```

---

## � 보안

- ✅ **환경 변수 관리** - API 키 및 민감 정보는 환경 변수로 관리
- ✅ **비밀번호 암호화** - BCrypt 해싱
- ✅ **ORM 사용** - SQL Injection 방지
- ✅ **CORS 설정** - 허용된 도메인만 접근 가능

---

## 🙏 오픈소스 크레딧

이 프로젝트는 다음 오픈소스 프로젝트를 사용합니다:

- **[Judge0](https://github.com/judge0/judge0)** - MIT License
  - 코드 실행 및 채점 엔진
- **Google Gemini API** - AI 코드 분석 및 힌트 생성
- **Supabase** - PostgreSQL 데이터베이스 및 Storage

---

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 📧 문의

- **GitHub Issues**: 버그 리포트 및 기능 제안
- **Pull Requests**: 기여 환영합니다!

---

**Made with ❤️ by CodeBrainer Team**
