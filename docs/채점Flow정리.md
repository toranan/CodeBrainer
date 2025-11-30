# 현재 채점 시스템 Flow 및 사용 파일 정리

## 📋 전체 Flow

```
1. 웹 브라우저 (사용자 코드 제출)
   ↓
2. Next.js Frontend (problem-workspace.tsx)
   ↓
3. Next.js API Route (/api/judge/run/route.ts)
   ↓
4. Spring Boot Orchestrator (SubmissionController.java)
   ↓
5. RabbitMQ (메시지 큐)
   ↓
6. Submission Listener (SubmissionListener.java)
   ↓
7. Judge Service (JudgeService.java)
   ↓
8. Judge0 Client (Judge0Client.java)
   ↓
9. Judge0 on EC2 (http://3.27.95.194:2358)
   ↓
10. 결과 폴링 및 DB 저장 (SubmissionResult)
   ↓
11. Frontend로 결과 반환
```

---

## 📁 사용 파일 상세 (순서대로)

### **1단계: Frontend - 코드 제출**
📄 `src/components/problem/problem-workspace.tsx:207`
```typescript
// 사용자가 "제출" 버튼 클릭 시
body: JSON.stringify({
  problemId: problem.slug,  // slug 사용 (중요!)
  language,
  code: currentCode,
  mode: "submit",
})
```

### **2단계: Next.js API Route - 제출 처리**
📄 `src/app/api/judge/run/route.ts`

**핵심 역할:**
- `mode: "submit"` → Orchestrator API 호출
- `mode: "run"` → Judge0 직접 호출 (테스트 실행용)

**Submit 모드 흐름 (118-146줄):**
1. `problem.slug`를 숫자 ID로 변환
2. `submitToOrchestrator()` 함수 호출 (39-90줄)
   - POST `/api/submissions` → 제출 생성
   - 폴링 루프 (최대 60초, 1초 간격)
   - GET `/api/submissions/{submissionId}` → 상태 확인
   - `status === "COMPLETED"` 될 때까지 대기

### **3단계: Orchestrator - 제출 접수**
📄 `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/controller/SubmissionController.java:35-44`

```java
@PostMapping
public ResponseEntity<SubmissionResponse> create(@RequestBody @Valid SubmissionRequest request)
```
→ `SubmissionService.createSubmission()` 호출

### **4단계: 제출 생성 및 큐 발행**
📄 `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/service/SubmissionService.java:38-68`

**핵심 로직:**
1. DB에 Submission 생성 (`status: QUEUED`)
2. 코드를 스토리지에 저장 (`submissions/{id}/Main.txt`)
3. **RabbitMQ에 submissionId 발행** (65줄)
   ```java
   submissionPublisher.publishSubmission(saved.getId());
   ```

### **5단계: RabbitMQ Listener - 채점 요청 수신**
📄 `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/queue/SubmissionListener.java:20-32`

```java
@RabbitListener(queues = "${queue.submission.name}")
public void handleSubmission(Long submissionId) {
    judgeService.executeSubmission(submissionId);
}
```

### **6단계: 채점 실행 - Judge0 호출**
📄 `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/service/JudgeService.java`

**핵심 로직 (76-230줄):**

1. **Submission 상태 변경** → `RUNNING` (80줄)

2. **테스트케이스 로드** (87줄)
   ```java
   List<ProblemTest> tests = problemTestRepository.findAllByProblemIdOrderByCaseNo(problemId);
   ```

3. **Base64 인코딩** (104-107줄) ⭐ **UTF-8 처리 핵심!**
   ```java
   String encodedSourceCode = Base64.getEncoder().encodeToString(sourceCode.getBytes());
   String encodedInput = Base64.getEncoder().encodeToString(input.getBytes());
   String encodedOutput = Base64.getEncoder().encodeToString(output.getBytes());
   ```

4. **Judge0 배치 제출** (132줄)
   ```java
   Judge0SubmissionResponse batchResponse = judge0Client.submitBatch(judgeRequests);
   ```

5. **결과 폴링** (160줄)
   ```java
   results = pollResults(tokens);  // 최대 60초 대기
   ```

6. **결과 저장** (216-229줄)
   - `SubmissionResult` DB에 저장
   - `status → COMPLETED`

### **7단계: Judge0 API 클라이언트**
📄 `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/judge0/Judge0Client.java`

**3개 메서드:**

1. **`submitBatch()`** (53줄) ⭐
   ```java
   String url = properties.getApiUrl() + "/submissions/batch?base64_encoded=true&wait=false&fields=*";
   ```
   - EC2 Judge0에 배치 제출
   - Base64 인코딩 사용 (`base64_encoded=true`)
   - 토큰 리스트 반환

2. **`fetchBatchTokens()`** (152줄)
   ```java
   String url = properties.getApiUrl() + "/submissions/batch?tokens=" + tokenQuery + "&base64_encoded=true&fields=*";
   ```
   - 토큰으로 결과 조회
   - 폴링에 사용

3. **`fetchToken()`** (209줄)
   - 단일 토큰 조회

### **8단계: 결과 조회 API**
📄 `backend/orchestrator/src/main/java/com/codebrainer/orchestrator/controller/SubmissionController.java:46-74`

```java
@GetMapping("/{submissionId}")
public ResponseEntity<Map<String, Object>> getSubmission(@PathVariable("submissionId") Long submissionId)
```

**반환 형식:**
```json
{
  "submissionId": 34,
  "status": "COMPLETED",
  "result": {
    "compile": {
      "ok": true,
      "message": ""
    },
    "summary": "{...}",
    "tests": "[...]"
  }
}
```

---

## 🔑 핵심 기술 요소

### **1. Base64 인코딩 (UTF-8 처리)**
- **위치**: `JudgeService.java:104-107`
- **이유**: Judge0가 한글 등 non-ASCII 문자 처리를 위해 필수
- **적용**: 소스코드, 입력, 출력 모두 Base64 인코딩

### **2. Slug 기반 라우팅**
- **Frontend**: `problem.slug` 전송
- **Backend**: `/api/problems/{slug}` 엔드포인트
- **변환**: route.ts에서 slug → 숫자 ID 변환

### **3. 비동기 큐 처리**
- **RabbitMQ**: 제출 요청을 큐에 저장
- **Listener**: 백그라운드에서 채점 처리
- **폴링**: Frontend가 1초 간격으로 결과 확인

### **4. 상태 관리**
```
QUEUED → RUNNING → COMPLETED
         ↓
       FAILED (에러 발생 시)
```

---

## 🗄️ 데이터베이스 스키마

### **Orchestrator Schema (PostgreSQL)**
```sql
-- 제출 정보
submissions (
  id, user_id, problem_id, language_id,
  code_path, status, created_at, updated_at
)

-- 제출 결과
submission_results (
  id, submission_id, compile_ok, compile_message,
  summary_json, tests_json
)

-- 문제 테스트케이스
problem_tests (
  id, problem_id, case_no,
  input_path, output_path
)
```

---

## ⚙️ 환경 설정

### **Docker Compose**
📄 `backend/docker-compose.yml`

**실행 중인 서비스:**
- PostgreSQL (5432)
- RabbitMQ (5672, 15672)
- Orchestrator (8080)

### **Judge0 설정**
📄 `backend/orchestrator/src/main/resources/application.yml`

```yaml
judge0:
  api-url: http://3.27.95.194:2358  # EC2에서 실행 중
```

---

## 🎯 요약

**데이터 흐름:**
1. 사용자 → Frontend (slug 전송)
2. Frontend → Next.js API (slug → ID 변환)
3. Next.js → Orchestrator (제출 생성)
4. Orchestrator → RabbitMQ (큐 발행)
5. Listener → JudgeService (채점 실행)
6. JudgeService → Judge0Client (Base64 인코딩 + 배치 제출)
7. Judge0Client → EC2 Judge0 (코드 실행)
8. Polling → 결과 조회 및 DB 저장
9. Frontend → 폴링 → 결과 표시

**핵심 파일 3개:**
1. `route.ts` - API 라우팅 및 폴링
2. `JudgeService.java` - 채점 로직 + Base64 인코딩
3. `Judge0Client.java` - Judge0 API 호출
