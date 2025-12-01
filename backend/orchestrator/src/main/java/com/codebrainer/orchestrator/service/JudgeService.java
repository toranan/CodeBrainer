package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.config.Judge0Properties;
import com.codebrainer.orchestrator.domain.ProblemTest;
import com.codebrainer.orchestrator.domain.Submission;
import com.codebrainer.orchestrator.domain.SubmissionResult;
import com.codebrainer.orchestrator.judge0.Judge0Client;
import com.codebrainer.orchestrator.judge0.Judge0SubmissionResponse;
import com.codebrainer.orchestrator.judge0.Judge0Status;
import com.codebrainer.orchestrator.judge0.Judge0SubmissionRequest;
import com.codebrainer.orchestrator.judge0.Judge0SubmissionResult;
import com.codebrainer.orchestrator.repository.ProblemTestRepository;
import com.codebrainer.orchestrator.repository.SubmissionRepository;
import com.codebrainer.orchestrator.repository.SubmissionResultRepository;
import com.codebrainer.orchestrator.storage.StorageClient;
import com.codebrainer.orchestrator.util.DiffResult;
import com.codebrainer.orchestrator.util.DiffUtil;
import com.codebrainer.orchestrator.util.SubmissionSummary;
import com.codebrainer.orchestrator.util.SummaryAggregator;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JudgeService {

    private static final Logger log = LoggerFactory.getLogger(JudgeService.class);

    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;
    private final ProblemTestRepository problemTestRepository;
    private final StorageClient storageClient;
    private final Judge0Client judge0Client;
    private final SummaryAggregator summaryAggregator;
    private final DiffUtil diffUtil;
    private final Judge0Properties judge0Properties;
    private final int pollDelayMs;
    private final int maxPollAttempts;

    public JudgeService(
            SubmissionRepository submissionRepository,
            SubmissionResultRepository submissionResultRepository,
            ProblemTestRepository problemTestRepository,
            StorageClient storageClient,
            Judge0Client judge0Client,
            SummaryAggregator summaryAggregator,
            DiffUtil diffUtil,
            Judge0Properties judge0Properties,
            @Value("${codebrainer.submission.poll-delay-ms}") int pollDelayMs,
            @Value("${codebrainer.submission.max-poll-attempts}") int maxPollAttempts
    ) {
        this.submissionRepository = submissionRepository;
        this.submissionResultRepository = submissionResultRepository;
        this.problemTestRepository = problemTestRepository;
        this.storageClient = storageClient;
        this.judge0Client = judge0Client;
        this.summaryAggregator = summaryAggregator;
        this.diffUtil = diffUtil;
        this.judge0Properties = judge0Properties;
        this.pollDelayMs = pollDelayMs;
        this.maxPollAttempts = maxPollAttempts;
    }

    @Transactional
    public void executeSubmission(Long submissionId) throws IOException, InterruptedException {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("제출을 찾을 수 없습니다."));

        submission.setStatus(Submission.Status.RUNNING);
        submission.setUpdatedAt(java.time.OffsetDateTime.now());
        submissionRepository.save(submission);

        String sourceCode = storageClient.readString(submission.getCodePath());

        Long problemId = submission.getProblem().getId();
        List<ProblemTest> tests = problemTestRepository.findAllByProblemIdOrderByCaseNo(problemId);

        log.info("제출 {}: 문제 ID {}, 테스트케이스 개수: {}", submissionId, problemId, tests.size());

        if (tests.isEmpty()) {
            log.error("제출 {}에 대한 테스트케이스가 없습니다. 문제 ID: {}", submissionId, problemId);
            throw new IllegalStateException("테스트케이스가 없습니다. 문제를 먼저 설정해야 합니다.");
        }

        List<Judge0SubmissionRequest> judgeRequests = new ArrayList<>();
        for (ProblemTest test : tests) {
            try {
                String input = new String(storageClient.read(normalizePath(test.getInputPath(), submission.getProblem())));
                String output = new String(storageClient.read(normalizePath(test.getOutputPath(), submission.getProblem())));
                log.debug("테스트케이스 {}: inputPath={}, outputPath={}", 
                    test.getId(), test.getInputPath(), test.getOutputPath());
                
                // 출력 정규화 (끝 공백/줄바꿈 제거)
                output = output.trim();
                
                // Base64 인코딩
                String encodedSourceCode = Base64.getEncoder().encodeToString(sourceCode.getBytes());
                String encodedInput = Base64.getEncoder().encodeToString(input.getBytes());
                String encodedOutput = Base64.getEncoder().encodeToString(output.getBytes());

                judgeRequests.add(new Judge0SubmissionRequest(
                        encodedSourceCode,
                        mapLanguage(submission.getLanguageId()),
                        encodedInput,
                        encodedOutput,
                        submission.getProblem().getTimeMs() / 1000.0,
                        submission.getProblem().getMemMb() * 1024
                ));
            } catch (Exception e) {
                log.error("테스트케이스 {} 파일 읽기 실패: {}", test.getId(), e.getMessage(), e);
                throw new IOException("테스트케이스 파일을 읽을 수 없습니다: " + test.getInputPath(), e);
            }
        }

        log.info("제출 {}: Judge0 요청 개수: {}", submissionId, judgeRequests.size());

        if (judgeRequests.isEmpty()) {
            log.error("제출 {}에 대한 Judge0 요청이 생성되지 않았습니다.", submissionId);
            throw new IllegalStateException("채점 요청을 생성할 수 없습니다.");
        }

        List<String> tokens;
        try {
            Judge0SubmissionResponse batchResponse = judge0Client.submitBatch(judgeRequests);
            if (batchResponse == null || batchResponse.submissions() == null || batchResponse.submissions().isEmpty()) {
                log.error("제출 {}: Judge0 배치 응답이 비어있습니다.", submissionId);
                throw new IllegalStateException("Judge0 API로부터 토큰을 받지 못했습니다.");
            }
            
            tokens = batchResponse.submissions()
                    .stream()
                    .map(Judge0SubmissionResult::token)
                    .filter(token -> token != null && !token.isEmpty())
                    .toList();
            
            if (tokens.size() != judgeRequests.size()) {
                log.warn("제출 {}: 요청한 개수({})와 받은 토큰 개수({})가 다릅니다.", 
                    submissionId, judgeRequests.size(), tokens.size());
            }
            
            log.info("제출 {}: {}개의 토큰을 받았습니다.", submissionId, tokens.size());
        } catch (RuntimeException e) {
            log.error("제출 {}: Judge0 배치 제출 실패: {}", submissionId, e.getMessage(), e);
            submission.setStatus(Submission.Status.FAILED);
            submission.setUpdatedAt(java.time.OffsetDateTime.now());
            submissionRepository.save(submission);
            throw new IOException("Judge0 API 호출 실패: " + e.getMessage(), e);
        }

        List<Judge0SubmissionResult> results;
        try {
            results = pollResults(tokens);
            if (results == null || results.isEmpty()) {
                log.error("제출 {}: Judge0 결과를 받지 못했습니다.", submissionId);
                throw new IllegalStateException("Judge0 결과를 받지 못했습니다.");
            }
            if (results.size() != tests.size()) {
                log.warn("제출 {}: 테스트케이스 개수({})와 결과 개수({})가 다릅니다.", 
                    submissionId, tests.size(), results.size());
            }
        } catch (InterruptedException e) {
            log.error("제출 {}: 결과 폴링 중 인터럽트 발생", submissionId, e);
            Thread.currentThread().interrupt();
            submission.setStatus(Submission.Status.FAILED);
            submission.setUpdatedAt(java.time.OffsetDateTime.now());
            submissionRepository.save(submission);
            throw e;
        } catch (RuntimeException e) {
            log.error("제출 {}: 결과 폴링 실패: {}", submissionId, e.getMessage(), e);
            submission.setStatus(Submission.Status.FAILED);
            submission.setUpdatedAt(java.time.OffsetDateTime.now());
            submissionRepository.save(submission);
            throw new IOException("Judge0 결과 조회 실패: " + e.getMessage(), e);
        }

        SubmissionSummary summary = summaryAggregator.aggregate(results);

        List<Map<String, Object>> testResults = new ArrayList<>();
        Map<String, Object> firstDiff = null;

        for (int i = 0; i < tests.size(); i++) {
            ProblemTest test = tests.get(i);
            Judge0SubmissionResult result = results.get(i);

            String verdict = mapJudgeStatus(result.status());
            
            // Base64 디코딩 및 정규화
            String stdout = "";
            if (result.stdout() != null && !result.stdout().isEmpty()) {
                try {
                    stdout = new String(Base64.getDecoder().decode(result.stdout()), StandardCharsets.UTF_8);
                } catch (IllegalArgumentException e) {
                    // Base64 디코딩 실패 시 원본 문자열 사용 (이미 디코딩된 경우)
                    stdout = result.stdout();
                }
            }
            
            // 출력 끝의 공백/줄바꿈 제거
            stdout = stdout.trim();
            
            String expected = new String(storageClient.read(normalizePath(test.getOutputPath(), submission.getProblem())));
            // 예상 출력도 정규화
            expected = expected.trim();

            Map<String, Object> resultItem = new HashMap<>();
            resultItem.put("testcaseId", test.getId());
            resultItem.put("verdict", verdict);
            resultItem.put("timeMs", (int) Math.round(Optional.ofNullable(result.time()).orElse(0.0) * 1000));
            resultItem.put("memoryKb", Optional.ofNullable(result.memory()).orElse(0));

            if (!"AC".equals(verdict) && firstDiff == null) {
                DiffResult diff = diffUtil.diff(expected, stdout);
                firstDiff = Map.of(
                        "expected", diff.expected(),
                        "actual", diff.actual(),
                        "message", diff.message()
                );
                resultItem.put("stderr", diff.message());
            }

            testResults.add(resultItem);
        }

        SubmissionResult submissionResult = submissionResultRepository.findBySubmission(submission)
                .orElseGet(SubmissionResult::new);

        submissionResult.setSubmission(submission);
        submissionResult.setCompileOk(summary.compileOk());
        submissionResult.setCompileMessage(summary.compileMessage());
        
        // 힌트 사용량을 summary_json에 추가
        String summaryJson = summary.toJson();
        Integer hintUsageCount = resolveHintUsageCount(submission);
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> summaryMap = mapper.readValue(summaryJson, new TypeReference<Map<String, Object>>() {});
            summaryMap.put("hintUsageCount", hintUsageCount);
            summaryJson = mapper.writeValueAsString(summaryMap);
        } catch (Exception e) {
            log.warn("힌트 사용량을 summary_json에 추가하는 중 오류 발생: {}", e.getMessage());
        }
        
        submissionResult.setSummaryJson(summaryJson);
        submissionResult.setTestsJson(summary.testsToJson(testResults));

        submissionResultRepository.save(submissionResult);

        Submission.Status finalStatus = determineFinalStatus(summary);
        submission.setStatus(finalStatus);
        submission.setUpdatedAt(java.time.OffsetDateTime.now());
        submissionRepository.save(submission);
    }

    private Integer resolveHintUsageCount(Submission submission) {
        if (submission.getHintUsageCount() != null) {
            return submission.getHintUsageCount();
        }
        String metaPath = buildMetaPath(submission.getId());
        try {
            String metaJson = storageClient.readString(metaPath);
            if (metaJson == null || metaJson.isBlank()) {
                return 0;
            }
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> metadata = mapper.readValue(metaJson, new TypeReference<Map<String, Object>>() {});
            Object value = metadata.get("hintUsageCount");
            if (value instanceof Number number) {
                return number.intValue();
            }
            if (value instanceof String stringValue) {
                return Integer.parseInt(stringValue);
            }
        } catch (Exception e) {
            log.debug("제출 {} 메타데이터에서 힌트 사용량을 읽을 수 없습니다: {}", submission.getId(), e.getMessage());
        }
        return 0;
    }

    private String buildMetaPath(Long submissionId) {
        return "submissions/" + submissionId + "/meta.json";
    }

    private List<Judge0SubmissionResult> pollResults(List<String> tokens) throws InterruptedException {
        List<Judge0SubmissionResult> results = new ArrayList<>();
        int attempts = 0;
        
        while (attempts < maxPollAttempts) {
            attempts++;
            try {
                Judge0SubmissionResponse response = judge0Client.fetchBatchTokens(tokens);
                if (response == null || response.submissions() == null) {
                    log.warn("Judge0 응답이 null이거나 submissions가 null입니다. 재시도 중... (시도 {}/{})", 
                        attempts, maxPollAttempts);
                    if (attempts < maxPollAttempts) {
                        TimeUnit.MILLISECONDS.sleep(pollDelayMs);
                        continue;
                    } else {
                        throw new IllegalStateException("Judge0 응답을 받지 못했습니다.");
                    }
                }
                
                results = response.submissions();
                if (results.isEmpty()) {
                    log.warn("Judge0 응답이 비어있습니다. 재시도 중... (시도 {}/{})", 
                        attempts, maxPollAttempts);
                    if (attempts < maxPollAttempts) {
                        TimeUnit.MILLISECONDS.sleep(pollDelayMs);
                        continue;
                    } else {
                        throw new IllegalStateException("Judge0 결과가 비어있습니다.");
                    }
                }
                
                boolean allFinished = results.stream().allMatch(this::isTerminalStatus);
                if (allFinished) {
                    log.info("모든 Judge0 결과가 완료되었습니다. (시도 {}/{})", attempts, maxPollAttempts);
                    return results;
                }
                
                log.debug("Judge0 결과 대기 중... 완료된 개수: {}/{}, 시도 {}/{}", 
                    results.stream().filter(this::isTerminalStatus).count(),
                    results.size(),
                    attempts,
                    maxPollAttempts);
                
                TimeUnit.MILLISECONDS.sleep(pollDelayMs);
            } catch (InterruptedException e) {
                log.error("Judge0 결과 폴링 중 인터럽트 발생");
                Thread.currentThread().interrupt();
                throw e;
            } catch (RuntimeException e) {
                log.error("Judge0 결과 폴링 중 에러 발생 (시도 {}/{}): {}", 
                    attempts, maxPollAttempts, e.getMessage(), e);
                if (attempts >= maxPollAttempts) {
                    throw e;
                }
                TimeUnit.MILLISECONDS.sleep(pollDelayMs);
            }
        }
        
        log.warn("Judge0 결과 폴링 타임아웃. 최대 시도 횟수({})에 도달했습니다.", maxPollAttempts);
        return results;
    }

    private boolean isTerminalStatus(Judge0SubmissionResult result) {
        Judge0Status status = result.status();
        return switch (status) {
            case ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, COMPILATION_ERROR,
                    RUNTIME_ERROR, MEMORY_LIMIT_EXCEEDED, INTERNAL_ERROR -> true;
            default -> false;
        };
    }

    private int mapLanguage(String langId) {
        return switch (langId.toUpperCase()) {
            case "C" -> 50;
            case "CPP" -> 54;
            case "JAVA" -> 62;
            case "PYTHON" -> 71;
            case "JAVASCRIPT" -> 63;
            case "GO" -> 60;
            default -> throw new IllegalArgumentException("지원하지 않는 언어입니다: " + langId);
        };
    }

    private String mapJudgeStatus(Judge0Status status) {
        return switch (status) {
            case ACCEPTED -> "AC";
            case WRONG_ANSWER -> "WA";
            case TIME_LIMIT_EXCEEDED -> "TLE";
            case MEMORY_LIMIT_EXCEEDED -> "MLE";
            case COMPILATION_ERROR -> "CE";
            case RUNTIME_ERROR -> "RE";
            case INTERNAL_ERROR -> "ERR";
            default -> "PENDING";
        };
    }

    /**
     * Normalize storage path by removing /data/storage/ prefix.
     * The path should already contain the correct slug-based folder name (e.g., problem-2864).
     * This ensures compatibility with Supabase storage.
     */
    private String normalizePath(String path, com.codebrainer.orchestrator.domain.Problem problem) {
        if (path == null) {
            return null;
        }

        // Remove /data/storage/ prefix if present
        if (path.startsWith("/data/storage/")) {
            path = path.substring("/data/storage/".length());
        }

        // Path should already be in the format: problems/problem-{slug}/tests/1.in
        // No conversion needed - the database stores paths with slug, not ID
        return path;
    }

    private Submission.Status determineFinalStatus(SubmissionSummary summary) {
        if (!summary.compileOk()) {
            return Submission.Status.CE;
        }

        Map<String, Integer> counts = summary.summary();
        int total = counts.values().stream().mapToInt(Integer::intValue).sum();
        if (total == 0) {
            return Submission.Status.FAILED;
        }

        int acCount = counts.getOrDefault("AC", 0);
        int waCount = counts.getOrDefault("WA", 0);
        int tleCount = counts.getOrDefault("TLE", 0);
        int mleCount = counts.getOrDefault("MLE", 0);
        int reCount = counts.getOrDefault("RE", 0);
        int errCount = counts.getOrDefault("ERR", 0);

        if (acCount == total) {
            return Submission.Status.AC;
        }
        if (reCount > 0) {
            return Submission.Status.RE;
        }
        if (tleCount > 0) {
            return Submission.Status.TLE;
        }
        if (mleCount > 0) {
            return Submission.Status.MLE;
        }
        if (waCount > 0) {
            return Submission.Status.WA;
        }
        if (errCount > 0) {
            return Submission.Status.FAILED;
        }

        return Submission.Status.FAILED;
    }
}

