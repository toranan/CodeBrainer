package com.codebrainer.orchestrator.judge0;

import com.codebrainer.orchestrator.config.Judge0Properties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class Judge0Client {

    private static final Logger log = LoggerFactory.getLogger(Judge0Client.class);

    private final RestTemplate restTemplate;
    private final Judge0Properties properties;
    private final ObjectMapper objectMapper;

    /**
     * Judge0Client 생성자
     *
     * @param judge0RestTemplate RestClientConfig에서 생성한 설정된 RestTemplate Bean
     * @param properties Judge0 서버 설정
     * @param objectMapper JSON 직렬화용 ObjectMapper
     */
    public Judge0Client(RestTemplate judge0RestTemplate, Judge0Properties properties, ObjectMapper objectMapper) {
        this.restTemplate = judge0RestTemplate;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public Judge0SubmissionResponse submitBatch(List<Judge0SubmissionRequest> submissions) {
        String url = properties.getApiUrl() + "/submissions/batch?base64_encoded=true&wait=false&fields=*";

        log.info("Judge0 배치 제출 요청: {}개의 제출", submissions.size());
        if (submissions.isEmpty()) {
            throw new IllegalArgumentException("제출 목록이 비어있습니다.");
        }

        // 첫 번째 제출의 주요 필드 로깅 (디버깅용)
        Judge0SubmissionRequest first = submissions.get(0);
        log.info("첫 번째 제출 샘플: language_id={}, stdin={}, expected_output={}, cpu_time_limit={}, memory_limit={}",
            first.language_id(),
            first.stdin() != null ? first.stdin().substring(0, Math.min(50, first.stdin().length())) : "null",
            first.expected_output() != null ? first.expected_output().substring(0, Math.min(50, first.expected_output().length())) : "null",
            first.cpu_time_limit(),
            first.memory_limit());

        // Map을 사용하여 JSON 직렬화 문제 방지
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("submissions", submissions);

        try {
            // JSON 문자열로 직접 변환
            String jsonString = objectMapper.writeValueAsString(requestBody);
            log.info("Judge0 요청 JSON 길이: {} bytes", jsonString.length());
            log.info("Judge0 요청 FULL JSON: {}", jsonString);
            log.info("Judge0 API URL: {}", url);

            // HttpURLConnection을 사용한 직접 HTTP 요청
            byte[] input = jsonString.getBytes(StandardCharsets.UTF_8);

            URL urlObj = new URL(url);
            HttpURLConnection conn = (HttpURLConnection) urlObj.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Content-Length", String.valueOf(input.length));
            conn.setDoOutput(true);

            log.info("Judge0 요청 헤더: Content-Type={}, Content-Length={}, Method={}",
                conn.getRequestProperty("Content-Type"),
                conn.getRequestProperty("Content-Length"),
                conn.getRequestMethod());

            // JSON 데이터 전송
            try (OutputStream os = conn.getOutputStream()) {
                os.write(input, 0, input.length);
                os.flush();
            }

            // 응답 읽기
            int responseCode = conn.getResponseCode();
            log.info("Judge0 응답 코드: {}", responseCode);

            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(
                            responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream(),
                            StandardCharsets.UTF_8))) {
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            }

            String responseBody = response.toString();
            log.info("Judge0 응답 원본: {}", responseBody);

            if (responseCode != 200 && responseCode != 201) {
                throw new RuntimeException("Judge0 API 호출 실패: " + responseCode + " - " + responseBody);
            }

            // 응답 문자열을 수동으로 파싱
            List<Judge0SubmissionResult> resultList = objectMapper.readValue(
                    responseBody,
                    new TypeReference<List<Judge0SubmissionResult>>() {}
            );

            if (resultList == null || resultList.isEmpty()) {
                log.error("Judge0 응답이 null이거나 비어있습니다.");
                throw new IllegalStateException("Judge0 API로부터 응답을 받지 못했습니다.");
            }

            log.info("Judge0 배치 제출 성공: {}개의 토큰 받음", resultList.size());

            // Judge0SubmissionResponse로 래핑하여 반환
            return new Judge0SubmissionResponse(resultList);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Judge0 API HTTP 에러: {} - {}", e.getStatusCode(), e.getMessage(), e);
            throw new RuntimeException("Judge0 API 호출 실패: " + e.getMessage(), e);
        } catch (RestClientException e) {
            log.error("Judge0 API 연결 에러: {}", e.getMessage(), e);
            throw new RuntimeException("Judge0 API에 연결할 수 없습니다. URL을 확인하세요: " + properties.getApiUrl(), e);
        } catch (Exception e) {
            log.error("Judge0 배치 제출 중 예상치 못한 에러: {}", e.getMessage(), e);
            throw new RuntimeException("Judge0 배치 제출 실패: " + e.getMessage(), e);
        }
    }

    public Judge0SubmissionResponse fetchBatchTokens(List<String> tokens) {
        if (tokens == null || tokens.isEmpty()) {
            throw new IllegalArgumentException("토큰 목록이 비어있습니다.");
        }

        String tokenQuery = String.join(",", tokens);
        String url = properties.getApiUrl() + "/submissions/batch?tokens=" + tokenQuery + "&base64_encoded=true&fields=*";

        log.debug("Judge0 배치 토큰 조회: {}개의 토큰", tokens.size());

        try {
            // HttpURLConnection을 사용한 직접 HTTP GET 요청
            URL urlObj = new URL(url);
            HttpURLConnection conn = (HttpURLConnection) urlObj.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            // 응답 읽기
            int responseCode = conn.getResponseCode();
            log.debug("Judge0 배치 토큰 조회 응답 코드: {}", responseCode);

            StringBuilder responseBuilder = new StringBuilder();
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(
                            responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream(),
                            StandardCharsets.UTF_8))) {
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    responseBuilder.append(responseLine.trim());
                }
            }

            String responseBody = responseBuilder.toString();
            log.debug("Judge0 배치 토큰 조회 응답: {}", responseBody.length() > 200 ? responseBody.substring(0, 200) + "..." : responseBody);

            if (responseCode != 200) {
                throw new RuntimeException("Judge0 토큰 조회 실패: " + responseCode + " - " + responseBody);
            }

            // Judge0 batch token query는 {"submissions": [...]} 형식으로 반환
            Judge0SubmissionResponse response = objectMapper.readValue(
                    responseBody,
                    Judge0SubmissionResponse.class
            );

            if (response == null || response.submissions() == null) {
                log.error("Judge0 토큰 조회 응답이 null입니다.");
                throw new IllegalStateException("Judge0 API로부터 응답을 받지 못했습니다.");
            }

            return response;
        } catch (Exception e) {
            log.error("Judge0 토큰 조회 중 에러: {}", e.getMessage(), e);
            throw new RuntimeException("Judge0 토큰 조회 실패: " + e.getMessage(), e);
        }
    }

    public Judge0SubmissionResult fetchToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("토큰이 비어있습니다.");
        }

        String url = properties.getApiUrl() + "/submissions/" + token + "?base64_encoded=true&fields=*";

        log.debug("Judge0 단일 토큰 조회: {}", token);

        try {
            // HttpURLConnection을 사용한 직접 HTTP GET 요청
            URL urlObj = new URL(url);
            HttpURLConnection conn = (HttpURLConnection) urlObj.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            // 응답 읽기
            int responseCode = conn.getResponseCode();

            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(
                            responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream(),
                            StandardCharsets.UTF_8))) {
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            }

            String responseBody = response.toString();

            if (responseCode != 200) {
                throw new RuntimeException("Judge0 토큰 조회 실패: " + responseCode + " - " + responseBody);
            }

            // 응답 문자열을 수동으로 파싱
            Judge0SubmissionResult result = objectMapper.readValue(responseBody, Judge0SubmissionResult.class);

            if (result == null) {
                log.error("Judge0 토큰 조회 응답이 null입니다.");
                throw new IllegalStateException("Judge0 API로부터 응답을 받지 못했습니다.");
            }

            return result;
        } catch (Exception e) {
            log.error("Judge0 토큰 조회 중 에러: {}", e.getMessage(), e);
            throw new RuntimeException("Judge0 토큰 조회 실패: " + e.getMessage(), e);
        }
    }
}

