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
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
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

        List<ProblemTest> tests = problemTestRepository.findAllByProblemOrderByCaseNo(submission.getProblem());

        List<Judge0SubmissionRequest> judgeRequests = new ArrayList<>();
        for (ProblemTest test : tests) {
            judgeRequests.add(new Judge0SubmissionRequest(
                    sourceCode,
                    mapLanguage(submission.getLanguageId()),
                    new String(storageClient.read(test.getInputPath())),
                    new String(storageClient.read(test.getOutputPath())),
                    submission.getProblem().getTimeMs() / 1000.0,
                    submission.getProblem().getMemMb() * 1024
            ));
        }

        List<String> tokens = judge0Client.submitBatch(judgeRequests)
                .submissions()
                .stream()
                .map(Judge0SubmissionResult::token)
                .toList();

        List<Judge0SubmissionResult> results = pollResults(tokens);

        SubmissionSummary summary = summaryAggregator.aggregate(results);

        List<Map<String, Object>> testResults = new ArrayList<>();
        Map<String, Object> firstDiff = null;

        for (int i = 0; i < tests.size(); i++) {
            ProblemTest test = tests.get(i);
            Judge0SubmissionResult result = results.get(i);

            String verdict = mapJudgeStatus(result.status());
            String stdout = result.stdout() != null ? result.stdout() : "";
            String expected = new String(storageClient.read(test.getOutputPath()));

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
        submissionResult.setSummaryJson(summary.toJson());
        submissionResult.setTestsJson(summary.testsToJson(testResults));

        submissionResultRepository.save(submissionResult);

        submission.setStatus(Submission.Status.COMPLETED);
        submission.setUpdatedAt(java.time.OffsetDateTime.now());
        submissionRepository.save(submission);
    }

    private List<Judge0SubmissionResult> pollResults(List<String> tokens) throws InterruptedException {
        List<Judge0SubmissionResult> results = new ArrayList<>();
        int attempts = 0;
        while (attempts < maxPollAttempts) {
            attempts++;
            Judge0SubmissionResponse response = judge0Client.fetchBatchTokens(tokens);
            results = response.submissions();
            boolean allFinished = results.stream().allMatch(this::isTerminalStatus);
            if (allFinished) {
                return results;
            }
            TimeUnit.MILLISECONDS.sleep(pollDelayMs);
        }
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
}

