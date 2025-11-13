# CodeBrainer 엔티티 참조 가이드

이 문서는 CodeBrainer 프로젝트의 모든 데이터베이스 엔티티를 정리하여 ERD 작성을 위한 참조 자료로 제공합니다.

---

## 📋 목차

1. [시스템 구조 개요](#시스템-구조-개요)
2. [인증 시스템 엔티티 (Prisma)](#인증-시스템-엔티티-prisma)
3. [채점 시스템 엔티티 (Orchestrator)](#채점-시스템-엔티티-orchestrator)
4. [엔티티 관계도 (ERD)](#엔티티-관계도-erd)
5. [데이터 타입 매핑](#데이터-타입-매핑)
6. [현재 시스템 아키텍처](#현재-시스템-아키텍처)

---

## 시스템 구조 개요

CodeBrainer는 **두 개의 독립적인 시스템**으로 구성되어 있습니다:

| 시스템 | 기술 스택 | 역할 | 관리 엔티티 |
|--------|----------|------|------------|
| **인증 시스템** | Prisma (Next.js) | 사용자 인증 및 세션 관리 | User, Account, Session, VerificationToken |
| **채점 시스템** | JPA/Hibernate (Spring Boot) | 문제 관리 및 코드 채점 | Problem, ProblemTest, ProblemHint, Submission, SubmissionResult |

**연결점**: \`submissions.user_id\` (VARCHAR(36)) ↔ \`User.id\` (String/UUID)

---

## 인증 시스템 엔티티 (Prisma)

### 1. User (사용자)

**테이블명**: \`User\` (Prisma 모델명)  
**관리**: Prisma  
**설명**: 시스템 사용자 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| \`id\` | String | PRIMARY KEY, @default(cuid()) | 사용자 고유 ID (UUID) |
| \`email\` | String | UNIQUE, NOT NULL | 이메일 주소 |
| \`name\` | String | NULL | 사용자 이름 |
| \`provider\` | String | NULL | OAuth 제공자 (google, azure-ad 등) |
| \`image\` | String | NULL | 프로필 이미지 URL |
| \`role\` | UserRole | NOT NULL, DEFAULT 'USER' | 사용자 역할 (USER, ADMIN) |
| \`createdAt\` | DateTime | NOT NULL, DEFAULT NOW() | 생성 시각 |
| \`updatedAt\` | DateTime | NOT NULL, @updatedAt | 수정 시각 |

**Enum**: \`UserRole\`
- \`USER\`: 일반 사용자
- \`ADMIN\`: 관리자

---

## 채점 시스템 엔티티 (Orchestrator)

### 1. Problem (문제)

**테이블명**: \`problems\`  
**관리**: Orchestrator (Spring Boot + Flyway)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| \`id\` | BIGSERIAL | PRIMARY KEY | 문제 고유 ID |
| \`title\` | VARCHAR(255) | NOT NULL | 문제 제목 |
| \`slug\` | VARCHAR(128) | UNIQUE, NOT NULL | URL 친화적 식별자 |
| \`tier\` | VARCHAR(255) | NOT NULL | 난이도 등급 |
| \`level\` | INTEGER | NOT NULL | 난이도 레벨 (1-5) |
| \`time_ms\` | INTEGER | NOT NULL | 시간 제한 (밀리초) |
| \`mem_mb\` | INTEGER | NOT NULL | 메모리 제한 (MB) |
| \`statement_path\` | VARCHAR(255) | NULL | 문제 설명 파일 경로 |
| \`visibility\` | VARCHAR(255) | NOT NULL | 공개 여부 |
| \`version\` | INTEGER | NOT NULL | 문제 버전 |
| \`categories\` | JSONB | NULL | 문제 카테고리 배열 |
| \`languages\` | JSONB | NULL | 지원 언어 배열 |
| \`constraints\` | TEXT | NULL | 제약 조건 설명 |
| \`input_format\` | TEXT | NULL | 입력 형식 설명 |
| \`output_format\` | TEXT | NULL | 출력 형식 설명 |
| \`created_at\` | TIMESTAMPTZ | NOT NULL | 생성 시각 |
| \`updated_at\` | TIMESTAMPTZ | NOT NULL | 수정 시각 |

---

### 2. Submission (제출)

**테이블명**: \`submissions\`

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| \`id\` | BIGSERIAL | PRIMARY KEY | 제출 고유 ID |
| \`user_id\` | VARCHAR(36) | NOT NULL | 사용자 ID (Prisma User와 연결) |
| \`problem_id\` | BIGINT | NOT NULL, FK | 문제 ID |
| \`lang_id\` | VARCHAR(255) | NOT NULL | 언어 (PYTHON, JAVA, CPP 등) |
| \`code_path\` | VARCHAR(255) | NOT NULL | 코드 파일 경로 |
| \`status\` | VARCHAR(255) | NOT NULL | 채점 상태 (QUEUED, RUNNING, COMPLETED, FAILED) |
| \`created_at\` | TIMESTAMPTZ | NOT NULL | 제출 시각 |
| \`updated_at\` | TIMESTAMPTZ | NOT NULL | 수정 시각 |

**Status Enum**:
- \`QUEUED\`: RabbitMQ 큐 대기
- \`RUNNING\`: Judge0 실행 중
- \`COMPLETED\`: 채점 완료
- \`FAILED\`: 시스템 에러

---

### 3. SubmissionResult (제출 결과)

**테이블명**: \`submission_results\`

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| \`id\` | BIGSERIAL | PRIMARY KEY | 결과 고유 ID |
| \`submission_id\` | BIGINT | UNIQUE, NOT NULL, FK | 제출 ID |
| \`compile_ok\` | BOOLEAN | NOT NULL | 컴파일 성공 여부 |
| \`compile_msg\` | TEXT | NULL | 컴파일 메시지 |
| \`summary_json\` | JSONB | NOT NULL | 채점 결과 요약 |
| \`tests_json\` | JSONB | NOT NULL | 테스트케이스별 상세 결과 |

---

## 현재 시스템 아키텍처

### 채점 Flow

\`\`\`
웹 브라우저
  ↓
Next.js Frontend (problem-workspace.tsx)
  ↓ problem.slug 전송
Next.js API (/api/judge/run/route.ts)
  ↓ slug → ID 변환, submitToOrchestrator()
Spring Boot Orchestrator
  ↓ RabbitMQ 발행
SubmissionListener
  ↓
JudgeService (Base64 인코딩)
  ↓
Judge0Client (EC2: http://3.27.95.194:2358)
  ↓ base64_encoded=true
Judge0 코드 실행
  ↓ 폴링
결과 저장 (submission_results)
  ↓
Frontend 결과 표시
\`\`\`

### 핵심 기술

1. **Base64 인코딩**: Judge0Client.java, JudgeService.java에서 UTF-8 처리
2. **RabbitMQ**: 비동기 채점 큐
3. **폴링**: 1초 간격 결과 조회 (최대 60초)
4. **Slug 라우팅**: \`/problems/{slug}\` 형식

---

**마지막 업데이트**: 2025년 1월 (현재 코드 기준)
