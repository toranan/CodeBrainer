# 마이페이지 API 테스트 가이드

## 구현 완료된 기능

- ✅ 내가 푼 문제 목록 조회
- ✅ 복습 추천 (단건)
- ✅ 복습 추천 (일괄)
- ✅ 마이 차트 데이터 조회

## API 엔드포인트

### 1. 내가 푼 문제 목록

```bash
GET http://localhost:8080/api/me/problems?userId=1&page=0&size=20

# 파라미터:
# - userId (필수): 사용자 ID
# - status (선택): 제출 상태 (기본: AC만)
# - page (기본: 0): 페이지 번호
# - size (기본: 20, 최대: 50): 페이지 크기
# - sort (기본: created_at,desc): 정렬 기준
```

**응답 예시:**
```json
{
  "content": [
    {
      "problem": {
        "id": 101,
        "title": "문제A",
        "slug": "problem-a",
        "tier": "GOLD",
        "level": 3,
        "categories": ["DP", "그래프"]
      },
      "lastSubmission": {
        "status": "AC",
        "lang": "JAVA",
        "createdAt": "2025-01-15T10:30:00Z"
      }
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 123,
  "totalPages": 7
}
```

### 2. 복습 추천 (단건)

```bash
GET http://localhost:8080/api/me/review?userId=1&baseProblemId=101&limit=3

# 파라미터:
# - userId (필수): 사용자 ID
# - baseProblemId (필수): 기준 문제 ID
# - limit (기본: 3, 최대: 10): 추천 개수
```

**응답 예시:**
```json
{
  "baseProblem": {
    "id": 101,
    "title": "문제A",
    "slug": "problem-a",
    "tier": "GOLD",
    "level": 3,
    "categories": ["DP"]
  },
  "recommendations": [
    {
      "id": 102,
      "title": "문제B",
      "slug": "problem-b",
      "tier": "GOLD",
      "level": 2,
      "categories": ["DP", "그리디"]
    }
  ]
}
```

### 3. 복습 추천 (일괄)

```bash
GET http://localhost:8080/api/me/review/bulk?userId=1&recent=5&perBaseLimit=2

# 파라미터:
# - userId (필수): 사용자 ID
# - recent (기본: 5, 최대: 10): 최근 AC 문제 수
# - perBaseLimit (기본: 2, 최대: 5): 문제당 추천 개수
```

### 4. 마이 차트 데이터

```bash
GET http://localhost:8080/api/me/charts?userId=1&days=30

# 파라미터:
# - userId (필수): 사용자 ID
# - days (기본: 30, 최대: 365): 최근 일수
```

**응답 예시:**
```json
{
  "activityByDay": [
    { "date": "2025-10-01", "count": 3 },
    { "date": "2025-10-02", "count": 5 }
  ],
  "solvedCountByTier": [
    { "tier": "BRONZE", "count": 12 },
    { "tier": "SILVER", "count": 8 }
  ],
  "solvedCountByLevel": [
    { "level": 1, "count": 10 },
    { "level": 2, "count": 5 }
  ],
  "topCategories": [
    { "category": "DP", "count": 7 },
    { "category": "그리디", "count": 5 }
  ],
  "languageUsage": [
    { "lang": "JAVA", "count": 14 },
    { "lang": "PYTHON", "count": 10 }
  ],
  "overall": {
    "attemptedProblems": 123,
    "solvedProblems": 98,
    "acRate": 0.80
  }
}
```

## 로컬 테스트 방법

### 1. Docker Compose로 백엔드 실행

```bash
cd backend
docker-compose up -d
```

### 2. API 테스트 (curl 또는 Postman)

```bash
# 내가 푼 문제 목록
curl "http://localhost:8080/api/me/problems?userId=1"

# 복습 추천 (단건)
curl "http://localhost:8080/api/me/review?userId=1&baseProblemId=1&limit=3"

# 복습 추천 (일괄)
curl "http://localhost:8080/api/me/review/bulk?userId=1&recent=5&perBaseLimit=2"

# 차트 데이터
curl "http://localhost:8080/api/me/charts?userId=1&days=30"
```

### 3. VS Code REST Client 사용

`.vscode/http.http` 파일 생성:

```http
### 내가 푼 문제 목록
GET http://localhost:8080/api/me/problems?userId=1&page=0&size=20

### 복습 추천 (단건)
GET http://localhost:8080/api/me/review?userId=1&baseProblemId=1&limit=3

### 복습 추천 (일괄)
GET http://localhost:8080/api/me/review/bulk?userId=1&recent=5&perBaseLimit=2

### 차트 데이터
GET http://localhost:8080/api/me/charts?userId=1&days=30
```

## 생성된 파일 목록

### Controller
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/controller/MyPageController.java`

### Service
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/service/MyPageService.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/service/ReviewService.java`

### DTO
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/ProblemBrief.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/MySolvedItem.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/LastSubmission.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/PageResponse.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/ReviewResponse.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/BulkReviewResponse.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/ChartsResponse.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/DailyCount.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/TierCount.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/LevelCount.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/CategoryCount.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/LangCount.java`
- `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/dto/Overall.java`

### Database Migration
- `backend/orchestrator/src/main/resources/db/migration/V7__indexes_for_mypage.sql`

## 데이터베이스 인덱스

다음 인덱스가 자동으로 생성됩니다:

1. `idx_problems_categories_gin` - categories JSONB GIN 인덱스
2. `idx_submissions_user_created` - (user_id, created_at DESC)
3. `idx_submissions_user_status` - (user_id, status)
4. `idx_problems_vis_tier_level` - (visibility, tier, level)

## 구현 특징

1. **효율적인 쿼리**: DISTINCT ON 사용으로 중복 문제 제거
2. **스마트 추천**: 동일 tier 우선, ±1 tier 허용, 카테고리 교집합 고려
3. **유연한 필터링**: status 파라미터로 다양한 제출 상태 필터링
4. **성능 최적화**: 적절한 인덱스와 네이티브 쿼리 사용
5. **페이지네이션**: 대량 데이터 처리 지원

## 주의사항

- 현재 Submission status는 `QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`로 동작 중
- 실제 AC/WA/TLE/RE/CE 상태는 SubmissionResult의 summary_json에 저장됨
- 마이페이지 API는 `status='COMPLETED'`를 AC로 매핑하여 사용

