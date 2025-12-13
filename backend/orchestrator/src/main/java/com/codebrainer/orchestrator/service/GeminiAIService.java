package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.config.GeminiProperties;
import com.codebrainer.orchestrator.domain.ProblemSolution;
import com.codebrainer.orchestrator.repository.ProblemSolutionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Gemini AI API 서비스
 * Google Gemini API를 사용하여 코드 리뷰를 생성합니다.
 */
@Service
public class GeminiAIService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAIService.class);
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

    private final GeminiProperties geminiProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ProblemSolutionRepository problemSolutionRepository;

    public GeminiAIService(
            GeminiProperties geminiProperties, 
            RestTemplate restTemplate, 
            ObjectMapper objectMapper,
            ProblemSolutionRepository problemSolutionRepository) {
        this.geminiProperties = geminiProperties;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.problemSolutionRepository = problemSolutionRepository;
    }

    /**
     * 제출된 코드에 대한 AI 리뷰를 생성합니다.
     *
     * @param code 제출된 코드
     * @param problemTitle 문제 제목
     * @param problemStatement 문제 설명 (optional)
     * @param languageId 프로그래밍 언어
     * @param problemId 문제 ID
     * @return AI 생성 코드 리뷰 텍스트
     */
    public String generateCodeReview(String code, String problemTitle, String problemStatement, String languageId, Long problemId, List<String> categories) {
        if (!geminiProperties.isEnabled()) {
            log.warn("Gemini AI is disabled. Skipping code review generation.");
            return "AI 코드 리뷰 기능이 비활성화되어 있습니다.";
        }

        if (geminiProperties.getApiKey() == null || geminiProperties.getApiKey().isEmpty()) {
            log.error("Gemini API key is not configured.");
            throw new IllegalStateException("Gemini API key가 설정되지 않았습니다.");
        }

        try {
            String prompt = buildReviewPrompt(code, problemTitle, problemStatement, languageId, problemId, categories);
            String apiUrl = String.format(GEMINI_API_URL, geminiProperties.getModel()) + "?key=" + geminiProperties.getApiKey();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
            ));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.debug("Sending request to Gemini API: {}", apiUrl);
            
            // HttpURLConnection으로 직접 호출 (RestTemplate 문제 우회)
            java.net.URL url = new java.net.URL(apiUrl);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(30000);
            conn.setReadTimeout(60000);
            
            // Request body 작성
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonBody.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            log.info("Gemini API response code: {}", responseCode);
            
            if (responseCode >= 200 && responseCode < 300) {
                // 응답 읽기
                try (java.io.BufferedReader br = new java.io.BufferedReader(
                        new java.io.InputStreamReader(conn.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    StringBuilder responseBuilder = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        responseBuilder.append(line);
                    }
                    String responseBody = responseBuilder.toString();
                    log.info("=== Gemini API Response ===");
                    log.info("Response length: {} characters", responseBody.length());
                    log.info("Response body (first 500 chars): {}", responseBody.substring(0, Math.min(500, responseBody.length())));
                    
                    return extractReviewFromResponse(responseBody);
                }
            } else {
                // 에러 응답 읽기
                try (java.io.BufferedReader br = new java.io.BufferedReader(
                        new java.io.InputStreamReader(conn.getErrorStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    StringBuilder errorBuilder = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        errorBuilder.append(line);
                    }
                    log.error("Gemini API error response: {}", errorBuilder.toString());
                }
                return "AI 코드 리뷰 생성에 실패했습니다.";
            }

        } catch (Exception e) {
            log.error("Error generating code review with Gemini AI", e);
            return "AI 코드 리뷰 생성 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    /**
     * 제출된 코드에 대한 AI 힌트를 생성합니다. (정답 미포함)
     *
     * @param code 제출된 코드
     * @param problemTitle 문제 제목
     * @param problemStatement 문제 설명 (optional)
     * @param languageId 프로그래밍 언어
     * @param problemId 문제 ID
     * @param verdict 제출 결과 (WA, TLE, RE 등)
     * @return AI 생성 힌트 텍스트
     */
    public String generateHint(String code, String problemTitle, String problemStatement, String languageId, Long problemId, String verdict, List<String> categories) {
        if (!geminiProperties.isEnabled()) {
            log.warn("Gemini AI is disabled. Skipping hint generation.");
            return "AI 힌트 기능이 비활성화되어 있습니다.";
        }

        if (geminiProperties.getApiKey() == null || geminiProperties.getApiKey().isEmpty()) {
            log.error("Gemini API key is not configured.");
            throw new IllegalStateException("Gemini API key가 설정되지 않았습니다.");
        }

        try {
            String prompt = buildHintPrompt(code, problemTitle, problemStatement, languageId, problemId, verdict, categories);
            String apiUrl = String.format(GEMINI_API_URL, geminiProperties.getModel()) + "?key=" + geminiProperties.getApiKey();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
            ));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.debug("Sending hint request to Gemini API: {}", apiUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractReviewFromResponse(response.getBody());
            } else {
                log.error("Gemini API returned non-success status: {}", response.getStatusCode());
                return "AI 힌트 생성에 실패했습니다.";
            }

        } catch (Exception e) {
            log.error("Error generating hint with Gemini AI", e);
            return "AI 힌트 생성 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    /**
     * 코드 리뷰를 위한 프롬프트를 생성합니다.
     * DB에 저장된 정답 코드를 사용자 언어로 변환합니다.
     */
    private String buildReviewPrompt(String code, String problemTitle, String problemStatement, String languageId, Long problemId, List<String> categories) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("당신은 알고리즘 전문 코드 리뷰어입니다. 다음 문제에 대한 제출 코드를 평가해주세요.\n\n");
        prompt.append("# 문제: ").append(problemTitle).append("\n\n");

        if (problemStatement != null && !problemStatement.isEmpty()) {
            prompt.append("# 문제 설명 및 출제 의도:\n").append(problemStatement).append("\n\n");
        }

        prompt.append("# 프로그래밍 언어: ").append(languageId).append("\n\n");
        
        // 알고리즘 카테고리 추가
        if (categories != null && !categories.isEmpty()) {
            prompt.append("# 🎯 요구 알고리즘 (출제의도): ").append(String.join(", ", categories)).append("\n");
            prompt.append("⚠️ 이 문제는 위 알고리즘을 사용해야 하는 문제입니다!\n\n");
        }
        
        prompt.append("# 제출된 코드:\n```").append(languageId).append("\n");
        prompt.append(code).append("\n```\n\n");

        // DB에서 정답 코드 불러오기
        Optional<ProblemSolution> solutionOpt = problemSolutionRepository.findFirstByProblemId(problemId);
        
        if (solutionOpt.isPresent()) {
            ProblemSolution solution = solutionOpt.get();
            
            prompt.append("# ⚠️ 중요: 모범답안 코드는 이미 제공됩니다!\n\n");
            prompt.append("## 저장된 정답 코드 (").append(solution.getLanguage()).append("):\n");
            prompt.append("```").append(solution.getLanguage().toLowerCase()).append("\n");
            prompt.append(solution.getCode()).append("\n```\n\n");
            
            if (solution.getExplanation() != null) {
                prompt.append("## 정답 코드 설명:\n").append(solution.getExplanation()).append("\n\n");
            }
            
            if (solution.getTimeComplexity() != null) {
                prompt.append("**시간 복잡도**: ").append(solution.getTimeComplexity()).append("\n");
            }
            if (solution.getSpaceComplexity() != null) {
                prompt.append("**공간 복잡도**: ").append(solution.getSpaceComplexity()).append("\n\n");
            }

            prompt.append("# 리뷰 작성 규칙:\n\n");

            prompt.append("## 1. 출제의도 부합 여부 (필수)\n");
            prompt.append("제출 코드가 **출제의도에 부합**하는지 먼저 평가하세요:\n");
            
            // 카테고리가 있을 때 더 엄격한 체크
            if (categories != null && !categories.isEmpty()) {
                prompt.append("- ⚠️ **중요**: 위에 명시된 \"요구 알고리즘\"을 **실제로 코드에서 사용했는지** 확인하세요\n");
                prompt.append("- 예시: \"힙\" 카테고리면 → heapq, PriorityQueue, heap 등의 자료구조를 **반드시** 사용해야 함\n");
                prompt.append("- 예시: \"스택\" 카테고리면 → stack, 배열+pop/push 패턴을 **반드시** 사용해야 함\n");
                prompt.append("- 정답이더라도 요구 알고리즘을 사용하지 않았으면 \"⚠️ 출제의도와 다른 접근\"으로 평가\n");
            } else {
                prompt.append("- 문제 설명에 명시된 알고리즘 카테고리(예: 완전탐색, DP, 그리디 등)에 맞는 접근 방식을 사용했는지 확인\n");
            }
            
            prompt.append("- 출제의도에 부합하면: \"✅ 출제의도에 부합합니다.\" 라고 명시\n");
            prompt.append("- 부합하지 않으면: \"⚠️ 출제의도와 다른 접근을 사용했습니다.\" 라고 명시하고 이유 설명\n\n");

            prompt.append("## 2. 개선 포인트\n");
            prompt.append("코드에서 개선할 수 있는 부분을 구체적으로 나열하세요. 각 항목은 한 문장으로 작성하세요.\n");
            prompt.append("- 출제의도에 부합하는 경우: 코드 품질, 가독성, 효율성 측면의 개선점 제시\n");
            prompt.append("- 출제의도와 다른 경우: 올바른 접근 방법과 현재 코드의 차이점 설명\n\n");

            prompt.append("## 3. 다른 접근법\n");
            prompt.append("문제를 해결할 수 있는 대안적인 접근 방법을 제시하세요. 각 항목은 한 문장으로 작성하세요.\n\n");

            prompt.append("## 4. 모범답안 코드 **언어 변환만 수행**\n");
            prompt.append("⚠️ **중요**: 위에 제공된 정답 코드를 **").append(languageId).append("** 언어로 **정확히 변환만** 하세요:\n");
            prompt.append("- 알고리즘 로직은 절대 변경하지 마세요\n");
            prompt.append("- 단순히 문법만 ").append(languageId).append("로 변환하세요\n");
            prompt.append("- 변수명, 함수명도 최대한 유지하세요\n");
            prompt.append("- 핵심 로직을 설명하는 주석을 ").append(languageId).append(" 스타일로 포함하세요\n\n");

            prompt.append("## 5. 코드 품질 점수\n");
            prompt.append("1-5점 사이의 점수를 \"점수: X/5\" 형식으로 명시하세요.\n\n");

        } else {
            // 정답 코드가 없으면 기존 방식대로
            log.warn("No solution found for problem ID: {}. Using fallback prompt.", problemId);
            
            prompt.append("# 리뷰 작성 규칙:\n\n");

            prompt.append("## 1. 출제의도 부합 여부 (필수)\n");
            prompt.append("제출 코드가 **출제의도에 부합**하는지 먼저 평가하세요:\n");
            prompt.append("- 문제 설명에 명시된 알고리즘 카테고리(예: 완전탐색, DP, 그리디 등)에 맞는 접근 방식을 사용했는지 확인\n");
            prompt.append("- 출제의도에 부합하면: \"✅ 출제의도에 부합합니다.\" 라고 명시\n");
            prompt.append("- 부합하지 않으면: \"⚠️ 출제의도와 다른 접근을 사용했습니다.\" 라고 명시하고 이유 설명\n\n");

            prompt.append("## 2. 개선 포인트\n");
            prompt.append("코드에서 개선할 수 있는 부분을 구체적으로 나열하세요. 각 항목은 한 문장으로 작성하세요.\n");
            prompt.append("- 출제의도에 부합하는 경우: 코드 품질, 가독성, 효율성 측면의 개선점 제시\n");
            prompt.append("- 출제의도와 다른 경우: 올바른 접근 방법과 현재 코드의 차이점 설명\n\n");

            prompt.append("## 3. 다른 접근법\n");
            prompt.append("문제를 해결할 수 있는 대안적인 접근 방법을 제시하세요. 각 항목은 한 문장으로 작성하세요.\n\n");

            prompt.append("## 4. 모범답안 코드\n");
            prompt.append("출제의도에 맞는 완전한 코드를 작성하세요:\n");
            prompt.append("- 출제의도에 부합하는 경우: 제출 코드를 약간 개선한 버전\n");
            prompt.append("- 출제의도와 다른 경우: 출제의도에 맞는 올바른 접근의 완전한 코드\n");
            prompt.append("- 코드에는 핵심 로직을 설명하는 주석 포함\n\n");

            prompt.append("## 5. 코드 품질 점수\n");
            prompt.append("1-5점 사이의 점수를 \"점수: X/5\" 형식으로 명시하세요.\n\n");
        }

        prompt.append("---\n\n");
        prompt.append("응답 형식: 반드시 아래 형식을 정확히 따라 작성하세요.\n\n");
        prompt.append("### 출제의도 부합 여부\n");
        prompt.append("(✅ 또는 ⚠️ 로 시작하는 평가)\n\n");
        prompt.append("### 개선 포인트:\n");
        prompt.append("- 개선점 1\n");
        prompt.append("- 개선점 2\n");
        prompt.append("- 개선점 3\n\n");
        prompt.append("### 다른 접근법:\n");
        prompt.append("- 접근법 1\n");
        prompt.append("- 접근법 2\n\n");
        prompt.append("### 모범답안 코드:\n");
        prompt.append("```").append(languageId).append("\n");
        prompt.append("// 모범답안 코드\n");
        prompt.append("```\n\n");
        prompt.append("### 점수: X/5\n\n");
        prompt.append("### 상세 설명:\n");
        prompt.append("(시간/공간 복잡도, 에지 케이스 처리 등 추가 분석)\n");

        return prompt.toString();
    }

    /**
     * 힌트를 위한 프롬프트를 생성합니다.
     * 정답 코드를 포함하지 않고, 방향성만 제시합니다.
     */
    private String buildHintPrompt(String code, String problemTitle, String problemStatement, String languageId, Long problemId, String verdict, List<String> categories) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("당신은 알고리즘 전문 코딩 튜터입니다. 학생의 코드가 틀렸습니다.\n");
        prompt.append("**중요**: 정답 코드나 수정된 코드는 절대 제공하지 마세요. 학생이 스스로 깨달을 수 있도록 힌트만 제공하세요.\n\n");
        
        prompt.append("# 문제: ").append(problemTitle).append("\n\n");

        if (problemStatement != null && !problemStatement.isEmpty()) {
            prompt.append("# 문제 설명:\n").append(problemStatement).append("\n\n");
        }

        prompt.append("# 프로그래밍 언어: ").append(languageId).append("\n");
        
        // 알고리즘 카테고리 추가
        if (categories != null && !categories.isEmpty()) {
            prompt.append("# 🎯 요구 알고리즘 (출제의도): ").append(String.join(", ", categories)).append("\n\n");
        }
        
        prompt.append("# 제출 결과: ").append(verdict).append("\n");
        
        // 제출 결과별 추가 컨텍스트
        if ("WA".equals(verdict)) {
            prompt.append("→ 코드는 실행되지만 출력 결과가 예상과 다릅니다.\n\n");
        } else if ("TLE".equals(verdict)) {
            prompt.append("→ 코드가 시간 초과되었습니다. 알고리즘 효율성을 개선해야 합니다.\n\n");
        } else if ("RE".equals(verdict)) {
            prompt.append("→ 런타임 에러가 발생했습니다. 예외 처리나 배열 범위 등을 확인하세요.\n\n");
        } else if ("CE".equals(verdict)) {
            prompt.append("→ 컴파일 에러가 발생했습니다. 문법 오류를 확인하세요.\n\n");
        } else {
            prompt.append("\n");
        }
        
        prompt.append("# 학생의 제출 코드:\n```").append(languageId).append("\n");
        prompt.append(code).append("\n```\n\n");

        // DB에서 정답 코드 불러오기 (참고용으로만 사용하고 유출 금지)
        Optional<ProblemSolution> solutionOpt = problemSolutionRepository.findFirstByProblemId(problemId);
        
        if (solutionOpt.isPresent()) {
            ProblemSolution solution = solutionOpt.get();
            prompt.append("# [내부 참고용 - 절대 노출 금지] 정답 코드:\n");
            prompt.append("```").append(solution.getLanguage().toLowerCase()).append("\n");
            prompt.append(solution.getCode()).append("\n```\n\n");
            prompt.append("⚠️ 위 정답 코드는 학생 코드와 비교 분석용입니다. 정답 코드의 내용을 직접적으로 언급하거나 힌트로 제공하지 마세요.\n\n");
        }

        prompt.append("# 📝 힌트 작성 규칙:\n\n");
        
        prompt.append("## 1. 코드 분석 (필수)\n");
        prompt.append("학생의 코드를 **한 줄씩 분석**하여 다음을 찾으세요:\n");
        prompt.append("- 변수명, 자료구조 선택이 적절한가?\n");
        prompt.append("- 반복문/조건문의 조건이 올바른가?\n");
        prompt.append("- 정렬 기준, 우선순위 등이 문제 요구사항과 일치하는가?\n");
        prompt.append("- 엣지 케이스(빈 입력, 0, 음수, 최대값 등)를 처리했는가?\n\n");

        prompt.append("## 2. 구체적 힌트 제공\n");
        prompt.append("- **코드의 특정 부분**을 언급하며 왜 그 부분이 문제인지 설명\n");
        prompt.append("- 예: \"heapq.heappush의 튜플 순서를 다시 확인해보세요\"\n");
        prompt.append("- 예: \"abs() 함수가 어느 위치에서 호출되나요?\"\n");
        prompt.append("- 예: \"정렬 기준을 문제에서 요구하는 순서와 비교해보세요\"\n\n");

        prompt.append("## 3. 질문 형태로 유도\n");
        prompt.append("- 정답을 직접 알려주지 말고, 학생이 스스로 깨달을 수 있는 질문을 던지세요\n");
        prompt.append("- 예: \"절댓값이 같을 때 어떤 값을 먼저 출력해야 하나요?\"\n");
        prompt.append("- 예: \"현재 비교 기준은 무엇인가요? 문제에서 요구하는 비교 기준은요?\"\n\n");

        prompt.append("## 4. 테스트 케이스 제안\n");
        prompt.append("- 학생이 직접 테스트해볼 수 있는 간단한 입력 예시를 제공하세요\n");
        prompt.append("- 예: \"입력이 [-1, 1, 0]일 때 어떻게 출력되어야 할까요?\"\n\n");

        prompt.append("---\n\n");
        prompt.append("# 응답 형식 (반드시 엄격히 준수):\n\n");
        
        prompt.append("## 문제점 분석\n");
        prompt.append("- (학생 코드의 **구체적인 라인이나 로직**을 언급하며 무엇이 잘못되었는지 설명)\n");
        prompt.append("- (최소 2-3개의 구체적인 문제점 나열)\n\n");
        
        prompt.append("## 다시 생각해볼 점\n");
        prompt.append("- (학생이 스스로 깨달을 수 있는 **구체적인 질문**)\n");
        prompt.append("- (테스트해볼 만한 입력값과 예상 결과 비교 질문)\n");
        prompt.append("- (최소 2-3개의 질문 형태 힌트)\n");

        return prompt.toString();
    }

    /**
     * Gemini API 응답에서 리뷰 텍스트를 추출합니다.
     */
    private String extractReviewFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");

                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }

            log.warn("Could not extract review text from Gemini response");
            return "AI 응답을 파싱할 수 없습니다.";

        } catch (Exception e) {
            log.error("Error parsing Gemini API response", e);
            return "AI 응답 처리 중 오류가 발생했습니다.";
        }
    }
}
