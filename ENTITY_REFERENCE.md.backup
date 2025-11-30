# CodeBrainer 엔티티 참조 가이드

이 문서는 CodeBrainer 프로젝트의 모든 데이터베이스 엔티티를 정리하여 ERD 작성을 위한 참조 자료로 제공합니다.

---

## 📋 목차

1. [시스템 구조 개요](#시스템-구조-개요)
2. [인증 시스템 엔티티 (Prisma)](#인증-시스템-엔티티-prisma)
3. [채점 시스템 엔티티 (Orchestrator)](#채점-시스템-엔티티-orchestrator)
4. [엔티티 관계도 (ERD)](#엔티티-관계도-erd)
5. [데이터 타입 매핑](#데이터-타입-매핑)

---

## 시스템 구조 개요

CodeBrainer는 **두 개의 독립적인 시스템**으로 구성되어 있습니다:

| 시스템 | 기술 스택 | 역할 | 관리 엔티티 |
|--------|----------|------|------------|
| **인증 시스템** | Prisma (Next.js) | 사용자 인증 및 세션 관리 | User, Account, Session, VerificationToken |
| **채점 시스템** | JPA/Hibernate (Spring Boot) | 문제 관리 및 코드 채점 | Problem, ProblemTest, ProblemHint, Submission, SubmissionResult |

**연결점**: `submissions.user_id` (VARCHAR(36)) ↔ `users.id` (UUID String)

---

## 인증 시스템 엔티티 (Prisma)

### 1. User (사용자)

**테이블명**: `users`  
**관리**: Prisma  
**설명**: 시스템 사용자 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | VARCHAR(36) | PRIMARY KEY, @default(cuid()) | 사용자 고유 ID (UUID) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 |
| `name` | VARCHAR(255) | NULL | 사용자 이름 |
| `provider` | VARCHAR(255) | NULL | OAuth 제공자 (google, azure-ad 등) |
| `image` | VARCHAR(255) | NULL | 프로필 이미지 URL |
| `role` | ENUM | NOT NULL, DEFAULT 'USER' | 사용자 역할 (USER, ADMIN) |
| `createdAt` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 시각 |
| `updatedAt` | TIMESTAMPTZ | NOT NULL, @updatedAt | 수정 시각 |

**관계**:
- `Account[]` (1:N) - OAuth 계정 정보
- `Session[]` (1:N) - 세션 정보

**Enum**: `UserRole`
- `USER`: 일반 사용자
- `ADMIN`: 관리자

---

### 2. Account (OAuth 계정)

**테이블명**: `accounts`  
**관리**: Prisma  
**설명**: OAuth 제공자별 계정 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | VARCHAR(36) | PRIMARY KEY, @default(cuid()) | 계정 고유 ID |
| `userId` | VARCHAR(36) | NOT NULL, FK → users(id) | 사용자 ID |
| `type` | VARCHAR(255) | NOT NULL | 계정 타입 (oauth, email 등) |
| `provider` | VARCHAR(255) | NOT NULL | OAuth 제공자 (google, azure-ad 등) |
| `providerAccountId` | VARCHAR(255) | NOT NULL | 제공자 계정 ID |
| `refresh_token` | TEXT | NULL | 리프레시 토큰 |
| `access_token` | TEXT | NULL | 액세스 토큰 |
| `expires_at` | INTEGER | NULL | 토큰 만료 시각 (Unix timestamp) |
| `token_type` | VARCHAR(255) | NULL | 토큰 타입 |
| `scope` | VARCHAR(255) | NULL | OAuth 스코프 |
| `id_token` | TEXT | NULL | ID 토큰 |
| `session_state` | VARCHAR(255) | NULL | 세션 상태 |

**관계**:
- `User` (N:1) - 소유자

**인덱스**:
- `UNIQUE(provider, providerAccountId)` - 제공자별 계정 고유성 보장

---

### 3. Session (세션)

**테이블명**: `sessions`  
**관리**: Prisma  
**설명**: 사용자 로그인 세션을 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | VARCHAR(36) | PRIMARY KEY, @default(cuid()) | 세션 고유 ID |
| `sessionToken` | VARCHAR(255) | UNIQUE, NOT NULL | 세션 토큰 |
| `userId` | VARCHAR(36) | NOT NULL, FK → users(id) | 사용자 ID |
| `expires` | TIMESTAMPTZ | NOT NULL | 만료 시각 |

**관계**:
- `User` (N:1) - 소유자

---

### 4. VerificationToken (인증 토큰)

**테이블명**: `verification_tokens`  
**관리**: Prisma  
**설명**: 이메일 인증 등에 사용되는 토큰을 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `identifier` | VARCHAR(255) | NOT NULL | 식별자 (이메일 등) |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | 인증 토큰 |
| `expires` | TIMESTAMPTZ | NOT NULL | 만료 시각 |

**인덱스**:
- `UNIQUE(identifier, token)` - 식별자와 토큰 조합 고유성 보장

---

## 채점 시스템 엔티티 (Orchestrator)

### 1. Problem (문제)

**테이블명**: `problems`  
**관리**: Orchestrator (Spring Boot + Flyway)  
**설명**: 코딩 문제의 메타데이터를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | BIGSERIAL | PRIMARY KEY | 문제 고유 ID |
| `title` | VARCHAR(255) | NOT NULL | 문제 제목 |
| `slug` | VARCHAR(128) | UNIQUE, NOT NULL | URL 친화적 식별자 |
| `tier` | VARCHAR(32) | NOT NULL | 난이도 등급 (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND) |
| `level` | INTEGER | NOT NULL | 등급 내 난이도 레벨 (1-5) |
| `time_ms` | INTEGER | NOT NULL | 시간 제한 (밀리초) |
| `mem_mb` | INTEGER | NOT NULL | 메모리 제한 (MB) |
| `statement_path` | VARCHAR(255) | NOT NULL | 문제 설명 파일 경로 |
| `visibility` | VARCHAR(32) | NOT NULL | 공개 여부 (PUBLIC, PRIVATE) |
| `version` | INTEGER | NOT NULL | 문제 버전 |
| `categories` | JSONB | NULL | 문제 카테고리 배열 (예: ["DP", "그리디"]) |
| `languages` | JSONB | NULL | 지원 언어 배열 (예: ["PYTHON", "JAVA", "CPP"]) |
| `constraints` | TEXT | NULL | 제약 조건 설명 |
| `input_format` | TEXT | NULL | 입력 형식 설명 |
| `output_format` | TEXT | NULL | 출력 형식 설명 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 시각 |

**관계**:
- `ProblemTest[]` (1:N) - 테스트케이스
- `ProblemHint[]` (1:N) - 힌트
- `Submission[]` (1:N) - 제출 이력

**인덱스**:
- `UNIQUE(slug)` - 슬러그 고유성 보장

---

### 2. ProblemTest (테스트케이스)

**테이블명**: `problem_tests`  
**관리**: Orchestrator  
**설명**: 문제의 테스트케이스를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | BIGSERIAL | PRIMARY KEY | 테스트케이스 고유 ID |
| `problem_id` | BIGINT | NOT NULL, FK → problems(id) ON DELETE CASCADE | 문제 ID |
| `case_no` | INTEGER | NOT NULL | 테스트케이스 번호 |
| `in_path` | VARCHAR(255) | NOT NULL | 입력 파일 경로 |
| `out_path` | VARCHAR(255) | NOT NULL | 출력 파일 경로 |
| `is_hidden` | BOOLEAN | NOT NULL, DEFAULT FALSE | 숨김 여부 (예제는 false) |
| `explanation` | TEXT | NULL | 테스트케이스 설명 |

**관계**:
- `Problem` (N:1) - 소속 문제

**인덱스**:
- `INDEX(problem_id, case_no)` - 문제별 테스트케이스 번호

---

### 3. ProblemHint (힌트)

**테이블명**: `problem_hints`  
**관리**: Orchestrator  
**설명**: 문제 풀이 힌트를 단계별로 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | BIGSERIAL | PRIMARY KEY | 힌트 고유 ID |
| `problem_id` | BIGINT | NOT NULL, FK → problems(id) ON DELETE CASCADE | 문제 ID |
| `tier` | VARCHAR(16) | NOT NULL | 힌트 난이도 등급 |
| `stage` | SMALLINT | NOT NULL | 힌트 단계 (1, 2, 3...) |
| `title` | VARCHAR(200) | NOT NULL | 힌트 제목 |
| `content_md` | TEXT | NOT NULL | 힌트 내용 (Markdown) |
| `lang` | VARCHAR(8) | DEFAULT 'ko' | 언어 코드 |
| `is_active` | BOOLEAN | DEFAULT TRUE | 활성화 여부 |
| `version` | INTEGER | DEFAULT 1 | 힌트 버전 |
| `source` | VARCHAR(32) | DEFAULT 'manual' | 힌트 출처 |
| `reviewer_id` | BIGINT | NULL | 검토자 ID |
| `wait_seconds` | INTEGER | DEFAULT 0 | 힌트 오픈까지 대기 시간 (초) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 수정 시각 |

**관계**:
- `Problem` (N:1) - 소속 문제

**인덱스**:
- `UNIQUE(problem_id, stage, lang)` - 문제별 단계별 언어별 고유성 보장

---

### 4. Submission (제출)

**테이블명**: `submissions`  
**관리**: Orchestrator  
**설명**: 사용자의 코드 제출 이력을 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | BIGSERIAL | PRIMARY KEY | 제출 고유 ID |
| `user_id` | VARCHAR(36) | NOT NULL | 사용자 ID (Prisma User.id와 연결) |
| `problem_id` | BIGINT | NOT NULL, FK → problems(id) ON DELETE CASCADE | 문제 ID |
| `lang_id` | VARCHAR(32) | NOT NULL | 언어 식별자 (PYTHON, JAVA, CPP 등) |
| `code_path` | VARCHAR(512) | NOT NULL | 제출된 코드 파일 경로 |
| `status` | VARCHAR(32) | NOT NULL | 채점 상태 (QUEUED, RUNNING, COMPLETED, FAILED) |
| `hint_usage_count` | INTEGER | NOT NULL, DEFAULT 0 | 제출 시 사용된 힌트 개수 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 제출 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 시각 |

**관계**:
- `Problem` (N:1) - 제출된 문제
- `SubmissionResult` (1:1) - 채점 결과

**인덱스**:
- `INDEX(problem_id)` - 문제별 조회
- `INDEX(status)` - 상태별 조회
- `INDEX(user_id, problem_id)` - 사용자별 문제별 조회

**Enum**: `Status`
- `QUEUED`: 채점 대기 중
- `RUNNING`: 채점 진행 중
- `COMPLETED`: 채점 완료
- `FAILED`: 채점 실패

**⚠️ 중요**: `user_id`는 VARCHAR(36)으로 Prisma `users.id` (UUID)와 연결됩니다. FK 제약조건은 없지만 논리적으로 연결됩니다.

---

### 5. SubmissionResult (제출 결과)

**테이블명**: `submission_results`  
**관리**: Orchestrator  
**설명**: 제출의 채점 결과를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | BIGSERIAL | PRIMARY KEY | 결과 고유 ID |
| `submission_id` | BIGINT | NOT NULL, FK → submissions(id) ON DELETE CASCADE | 제출 ID |
| `compile_ok` | BOOLEAN | NOT NULL | 컴파일 성공 여부 |
| `compile_msg` | TEXT | NULL | 컴파일 메시지/에러 |
| `summary_json` | JSONB | NOT NULL | 채점 결과 요약 (통과/전체 개수 등) |
| `tests_json` | JSONB | NOT NULL | 각 테스트케이스별 상세 결과 |

**관계**:
- `Submission` (1:1) - 제출 정보

**인덱스**:
- `UNIQUE(submission_id)` - 제출당 하나의 결과만 존재

**JSON 구조 예시**:

`summary_json`:
```json
{
  "passed": 8,
  "total": 10,
  "timeMs": 150,
  "memoryKb": 8192
}
```

`tests_json`:
```json
[
  {
    "caseNo": 1,
    "verdict": "AC",
    "timeMs": 120,
    "memoryKb": 8000,
    "stderr": null
  },
  {
    "caseNo": 2,
    "verdict": "WA",
    "timeMs": 130,
    "memoryKb": 8100,
    "stderr": "AssertionError"
  }
]
```

---

## 엔티티 관계도 (ERD)

### 전체 관계도

```
┌─────────────────────────────────────────────────────────────┐
│                    인증 시스템 (Prisma)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐    │
│  │   User   │◄───┐    │ Account │         │ Session  │    │
│  │          │    │    │         │         │          │    │
│  │ id (PK)  │    │    │ id (PK) │         │ id (PK)  │    │
│  │ email    │    │    │ userId  │────┐    │ userId   │────┤
│  │ name     │    │    │provider │    │    │ token    │    │
│  │ role     │    │    └─────────┘    │    └──────────┘    │
│  └──────────┘    │                    │                    │
│       │          │                    │                    │
│       └──────────┴────────────────────┘                    │
│                                                               │
│  ┌──────────────────┐                                       │
│  │VerificationToken │                                       │
│  │  identifier      │                                       │
│  │  token (PK)      │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (논리적 연결)
                            │ user_id: VARCHAR(36)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 채점 시스템 (Orchestrator)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐                                               │
│  │ Problem  │                                               │
│  │          │                                               │
│  │ id (PK)  │                                               │
│  │ title    │                                               │
│  │ slug     │                                               │
│  │ tier     │                                               │
│  │ level    │                                               │
│  └────┬─────┘                                               │
│       │                                                      │
│       ├──────────┬──────────┐                              │
│       │          │          │                              │
│       ▼          ▼          ▼                              │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐                     │
│  │Problem  │ │Problem  │ │Submission│                     │
│  │  Test   │ │  Hint   │ │          │                     │
│  │         │ │         │ │ id (PK)  │                     │
│  │ id (PK) │ │ id (PK) │ │ user_id  │◄─── 논리적 연결     │
│  │problem_│ │problem_ │ │problem_id│                     │
│  │id (FK)  │ │id (FK)  │ │  (FK)    │                     │
│  └─────────┘ └─────────┘ └────┬─────┘                     │
│                                │                            │
│                                ▼                            │
│                          ┌──────────────┐                  │
│                          │Submission     │                  │
│                          │   Result     │                  │
│                          │              │                  │
│                          │ id (PK)      │                  │
│                          │ submission_id│                  │
│                          │   (FK)       │                  │
│                          └──────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 관계 요약

#### 인증 시스템 (Prisma)
- `User` 1:N `Account` (OAuth 계정)
- `User` 1:N `Session` (로그인 세션)
- `VerificationToken` (독립적, 관계 없음)

#### 채점 시스템 (Orchestrator)
- `Problem` 1:N `ProblemTest` (테스트케이스)
- `Problem` 1:N `ProblemHint` (힌트)
- `Problem` 1:N `Submission` (제출)
- `Submission` 1:1 `SubmissionResult` (채점 결과)

#### 시스템 간 연결
- `submissions.user_id` (VARCHAR(36)) ↔ `users.id` (UUID String)
  - **물리적 FK 없음** (다른 데이터베이스 시스템이므로)
  - **논리적 연결**: 애플리케이션 레벨에서 관리

---

## 데이터 타입 매핑

### Prisma → PostgreSQL

| Prisma 타입 | PostgreSQL 타입 | 설명 |
|------------|----------------|------|
| `String` | `VARCHAR(255)` | 기본 문자열 |
| `String @db.Text` | `TEXT` | 긴 텍스트 |
| `String @id @default(cuid())` | `VARCHAR(36)` | UUID (cuid 형식) |
| `DateTime` | `TIMESTAMPTZ` | 타임스탬프 |
| `Int` | `INTEGER` | 정수 |
| `Boolean` | `BOOLEAN` | 불린 |
| `Json` | `JSONB` | JSON 데이터 |

### JPA → PostgreSQL

| Java 타입 | JPA 어노테이션 | PostgreSQL 타입 | 설명 |
|----------|---------------|-----------------|------|
| `Long` | `@Id @GeneratedValue` | `BIGSERIAL` | 자동 증가 ID |
| `String` | `@Column` | `VARCHAR(n)` | 문자열 |
| `String` | `@Column(columnDefinition = "text")` | `TEXT` | 긴 텍스트 |
| `String` | `@Column(length = 36)` | `VARCHAR(36)` | UUID |
| `Integer` | `@Column` | `INTEGER` | 정수 |
| `Boolean` | `@Column` | `BOOLEAN` | 불린 |
| `List<String>` | `@JdbcTypeCode(SqlTypes.JSON)` | `JSONB` | JSON 배열 |
| `OffsetDateTime` | `@Column` | `TIMESTAMPTZ` | 타임스탬프 |
| `enum` | `@Enumerated(EnumType.STRING)` | `VARCHAR` | Enum 문자열 |

---

## 주요 변경 이력

### V7 마이그레이션 (최신)
- `submissions.user_id`: `BIGINT` → `VARCHAR(36)`
- Prisma User 테이블의 UUID와 호환되도록 변경

### V6 마이그레이션
- `problems.input_format`, `problems.output_format` 추가
- `problem_tests.explanation` 추가

### V5 마이그레이션
- `problems.languages` (JSONB) 추가
- `problems.constraints` (TEXT) 추가

### V4 마이그레이션
- `problems.slug` (VARCHAR(128), UNIQUE) 추가

### V3 마이그레이션
- `problems.categories` (JSONB) 추가

### V2 마이그레이션
- `problem_hints` 테이블 생성

### V1 마이그레이션
- 초기 스키마 생성: `problems`, `problem_tests`, `submissions`, `submission_results`

---

## ERD 작성 시 참고사항

### 1. 두 시스템 분리 표시
- 인증 시스템과 채점 시스템을 명확히 구분하여 표시
- 다른 색상이나 영역으로 구분 권장

### 2. 논리적 연결 표시
- `submissions.user_id` ↔ `users.id` 연결은 점선으로 표시
- FK 제약조건이 없음을 명시

### 3. 인덱스 표시
- 성능 최적화를 위한 인덱스 표시 권장
- 특히 `submissions(user_id, problem_id)` 복합 인덱스

### 4. 데이터 타입 명시
- 모든 컬럼의 데이터 타입을 명확히 표시
- 특히 `user_id`의 VARCHAR(36) 타입 강조

### 5. 관계 카디널리티
- `Problem` 1:N `ProblemTest`
- `Problem` 1:N `ProblemHint`
- `Problem` 1:N `Submission`
- `Submission` 1:1 `SubmissionResult`
- `User` 1:N `Account`
- `User` 1:N `Session`

---

## 다음 단계

이 문서를 기반으로 다음 도구로 ERD를 작성할 수 있습니다:

1. **draw.io / diagrams.net**: 무료 온라인 ERD 도구
2. **dbdiagram.io**: 코드 기반 ERD 작성
3. **MySQL Workbench**: 시각적 ERD 도구
4. **pgAdmin**: PostgreSQL 전용 도구

**권장**: `dbdiagram.io` 사용 시 아래와 같은 코드로 시작할 수 있습니다:

```dbml
// 인증 시스템 (Prisma)
Table users {
  id varchar(36) [pk]
  email varchar(255) [unique]
  name varchar(255)
  role varchar(10)
  created_at timestamptz
  updated_at timestamptz
}

Table accounts {
  id varchar(36) [pk]
  user_id varchar(36) [ref: > users.id]
  provider varchar(255)
  provider_account_id varchar(255)
  // ... 기타 컬럼
}

// 채점 시스템 (Orchestrator)
Table problems {
  id bigserial [pk]
  title varchar(255)
  slug varchar(128) [unique]
  tier varchar(32)
  // ... 기타 컬럼
}

Table submissions {
  id bigserial [pk]
  user_id varchar(36) // 논리적 연결: users.id
  problem_id bigint [ref: > problems.id]
  // ... 기타 컬럼
}
```

---

**마지막 업데이트**: 2024년 1월

