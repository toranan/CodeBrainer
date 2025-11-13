# Gemini AI 코드 리뷰 기능

## 개요
정답 처리된 제출 코드에 대해 Google Gemini AI를 활용하여 자동으로 코드 리뷰를 생성하고 프론트엔드에 표시하는 기능입니다.

## 아키텍처

### 백엔드 (Orchestrator)

#### 1. 데이터베이스 스키마
**테이블: `code_reviews`**
```sql
CREATE TABLE IF NOT EXISTS code_reviews (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    review_content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    suggestions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(submission_id)
);
```

- Migration 파일: `V9__create_code_reviews_table.sql`
- 각 제출당 하나의 리뷰만 저장 (UNIQUE constraint)

#### 2. 엔티티 및 레포지토리
- **CodeReview.java**: 코드 리뷰 엔티티
- **CodeReviewRepository.java**: JPA 레포지토리
  - `findBySubmissionId(Long submissionId)`: 제출 ID로 리뷰 조회
  - `existsBySubmissionId(Long submissionId)`: 리뷰 존재 여부 확인

#### 3. 서비스 계층

**GeminiAIService.java**
- Google Gemini API (REST) 호출
- 프롬프트 생성 및 리뷰 파싱
- 주요 메서드:
  - `generateCodeReview(String code, String problemTitle, String problemStatement, String languageId)`

**CodeReviewService.java**
- 코드 리뷰 생성 및 관리
- 주요 메서드:
  - `generateReview(Long submissionId)`: 새 리뷰 생성
  - `getReview(Long submissionId)`: 기존 리뷰 조회
- 검증 로직:
  - 제출 상태가 COMPLETED인지 확인
  - 모든 테스트 케이스를 통과했는지 확인 (verdict == "AC")

#### 4. API 엔드포인트

**CodeReviewController.java**
```
POST   /api/code-reviews/submissions/{submissionId}  - 리뷰 생성
GET    /api/code-reviews/submissions/{submissionId}  - 리뷰 조회
```

#### 5. 설정

**application.yml**
```yaml
gemini:
  api-key: ${GEMINI_API_KEY:}
  model: ${GEMINI_MODEL:gemini-1.5-flash}
  enabled: ${GEMINI_ENABLED:false}
```

**환경 변수 설정 필요:**
```bash
export GEMINI_API_KEY="your-api-key-here"
export GEMINI_ENABLED=true
```

### 프론트엔드 (Next.js)

#### 1. API 라우트 업데이트
**src/app/api/ai/review/route.ts**
- Orchestrator 백엔드의 코드 리뷰 API 호출
- Gemini 리뷰를 프론트엔드 형식으로 파싱
- `submissionId`를 받아서 해당 제출의 리뷰 조회/생성

#### 2. 타입 정의 업데이트
**src/types/problem.ts**
```typescript
export interface JudgeRunResponse {
  status: "PENDING" | "AC" | "WA" | "TLE" | "RE" | "CE";
  results: SubmissionResultItem[];
  compileLog?: string;
  submissionId?: number;  // 추가됨
}
```

#### 3. 컴포넌트 업데이트
**src/components/problem/problem-workspace.tsx**
- `fetchAiReview(submissionId?: number)`: submissionId 파라미터 추가
- 제출 성공 시 `submissionId`를 AI 리뷰 API에 전달

#### 4. Judge API 업데이트
**src/app/api/judge/run/route.ts**
- Orchestrator 제출 응답에 `submissionId` 포함하도록 수정

## 동작 흐름

### 1. 사용자가 코드를 제출
```
Frontend → POST /api/judge/run (mode: "submit")
         → Orchestrator POST /api/submissions
         ← submissionId 반환
```

### 2. 제출이 정답(AC)인 경우
```
Frontend → 제출 결과 표시
         → AI 리뷰 요청: POST /api/ai/review
         → Next.js API Route
         → Orchestrator POST /api/code-reviews/submissions/{submissionId}
         → GeminiAIService.generateCodeReview()
         → Gemini API 호출
         ← 리뷰 생성 완료
         ← 프론트엔드에 리뷰 표시
```

### 3. 리뷰 재조회
```
Frontend → POST /api/ai/review (with submissionId)
         → Orchestrator GET /api/code-reviews/submissions/{submissionId}
         ← 기존 리뷰 반환 (캐시됨)
```

## Gemini 프롬프트 구조

```
당신은 전문 코드 리뷰어입니다. 다음 알고리즘 문제에 대한 제출 코드를 리뷰해주세요.

문제: [문제 제목]
문제 설명: [문제 설명]
프로그래밍 언어: [언어]

제출된 코드:
```[언어]
[코드]
```

다음 관점에서 코드를 리뷰해주세요:
1. 코드가 문제의 요구사항을 올바르게 해결했는지
2. 알고리즘의 시간 복잡도와 공간 복잡도
3. 코드의 가독성과 구조
4. 개선할 수 있는 부분이나 더 효율적인 접근 방법
5. 1-5점 사이의 코드 품질 점수 (5점 만점)

리뷰는 한국어로 작성하고, 건설적이고 교육적인 톤으로 작성해주세요.
```

## 에러 처리

1. **Gemini API 비활성화**: 기능이 비활성화되어 있다는 메시지 반환
2. **API 키 미설정**: IllegalStateException 발생
3. **제출 상태 불완전**: "완료된 제출만 리뷰 가능" 에러
4. **테스트 미통과**: "모든 테스트를 통과한 제출만 리뷰 가능" 에러
5. **코드 읽기 실패**: 스토리지 접근 에러

## 비용 최적화

- **모델 선택**: `gemini-1.5-flash` 사용 (빠르고 저렴)
- **캐싱**: 제출당 한 번만 리뷰 생성 (UNIQUE constraint)
- **조건부 활성화**: `GEMINI_ENABLED` 플래그로 제어

## 보안 고려사항

1. **API 키 관리**: 환경 변수로 관리, 코드에 하드코딩 금지
2. **권한 검증**: 제출 소유자만 리뷰 조회 가능하도록 추가 구현 필요
3. **Rate Limiting**: Gemini API 호출 횟수 제한 고려

## 테스트 시나리오

### 성공 케이스
1. 정답(AC) 제출 → 리뷰 생성 성공
2. 이미 리뷰가 있는 제출 → 기존 리뷰 반환

### 실패 케이스
1. 오답 제출 → 리뷰 생성 거부
2. 컴파일 에러 → 리뷰 생성 거부
3. API 키 없음 → 에러 메시지
4. Gemini API 장애 → 에러 메시지

## 향후 개선 사항

1. **비동기 처리**: 리뷰 생성을 백그라운드 작업으로 처리
2. **알림**: 리뷰 생성 완료 시 사용자에게 알림
3. **리뷰 편집**: 사용자가 리뷰에 메모 추가 기능
4. **통계**: 평균 평점, 리뷰 개수 등 통계 기능
5. **다국어 지원**: 영어 리뷰 생성 옵션
6. **커스텀 프롬프트**: 교육자가 리뷰 프롬프트 커스터마이징

## 의존성

**Maven (pom.xml)**
```xml
<dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-aiplatform</artifactId>
    <version>3.35.0</version>
</dependency>
```

## 관련 파일

### Backend
- `backend/orchestrator/src/main/resources/db/migration/V9__create_code_reviews_table.sql`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/domain/CodeReview.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/repository/CodeReviewRepository.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/service/GeminiAIService.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/service/CodeReviewService.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/controller/CodeReviewController.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/CodeReviewResponse.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/config/GeminiProperties.java`

### Frontend
- `src/app/api/ai/review/route.ts`
- `src/app/api/judge/run/route.ts`
- `src/components/problem/problem-workspace.tsx`
- `src/types/problem.ts`

## 설정 예시

### 로컬 개발 환경
```bash
# .env.local 또는 환경 변수 설정
GEMINI_API_KEY=AIzaSy...
GEMINI_ENABLED=true
GEMINI_MODEL=gemini-1.5-flash
```

### Docker 환경
```yaml
# docker-compose.yml
services:
  orchestrator:
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GEMINI_ENABLED=true
```

## API 문서 업데이트

`docs/BACKEND_API_DOCS.md`에 다음 섹션 추가 필요:

```markdown
### 코드 리뷰 API

#### POST /api/code-reviews/submissions/{submissionId}
정답 제출에 대한 AI 코드 리뷰를 생성합니다.

**응답:**
```json
{
  "reviewId": 1,
  "submissionId": 123,
  "reviewContent": "AI가 생성한 리뷰 내용...",
  "rating": 4,
  "suggestions": null,
  "createdAt": "2025-01-12T10:30:00Z"
}
```

#### GET /api/code-reviews/submissions/{submissionId}
기존 코드 리뷰를 조회합니다.
```
