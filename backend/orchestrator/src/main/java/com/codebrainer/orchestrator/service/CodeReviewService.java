package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.CodeReview;
import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.Submission;
import com.codebrainer.orchestrator.domain.SubmissionResult;
import com.codebrainer.orchestrator.dto.CodeReviewResponse;
import com.codebrainer.orchestrator.repository.CodeReviewRepository;
import com.codebrainer.orchestrator.repository.SubmissionRepository;
import com.codebrainer.orchestrator.repository.SubmissionResultRepository;
import com.codebrainer.orchestrator.storage.StorageClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 코드 리뷰 서비스
 * AI를 활용한 코드 리뷰 생성 및 관리
 */
@Service
public class CodeReviewService {

    private static final Logger log = LoggerFactory.getLogger(CodeReviewService.class);
    private static final Pattern RATING_PATTERN = Pattern.compile("(점수|평점|rating)\\s*[:：]?\\s*(\\d)[/／]?5", Pattern.CASE_INSENSITIVE);

    private final CodeReviewRepository codeReviewRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;
    private final GeminiAIService geminiAIService;
    private final StorageClient storageClient;
    private final ObjectMapper objectMapper;

    public CodeReviewService(
            CodeReviewRepository codeReviewRepository,
            SubmissionRepository submissionRepository,
            SubmissionResultRepository submissionResultRepository,
            GeminiAIService geminiAIService,
            StorageClient storageClient,
            ObjectMapper objectMapper) {
        this.codeReviewRepository = codeReviewRepository;
        this.submissionRepository = submissionRepository;
        this.submissionResultRepository = submissionResultRepository;
        this.geminiAIService = geminiAIService;
        this.storageClient = storageClient;
        this.objectMapper = objectMapper;
    }

    /**
     * 제출에 대한 코드 리뷰를 생성합니다.
     * 이미 리뷰가 존재하면 기존 리뷰를 반환합니다.
     *
     * @param submissionId 제출 ID
     * @return 코드 리뷰 응답
     */
    @Transactional
    public CodeReviewResponse generateReview(Long submissionId) {
        // 이미 리뷰가 존재하는지 확인
        Optional<CodeReview> existingReview = codeReviewRepository.findBySubmissionId(submissionId);
        if (existingReview.isPresent()) {
            log.info("Code review already exists for submission {}", submissionId);
            return toResponse(existingReview.get());
        }

        // 제출 정보 조회
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("제출을 찾을 수 없습니다: " + submissionId));

        // 제출이 완료되었는지 확인
        if (submission.getStatus() != Submission.Status.COMPLETED) {
            throw new IllegalStateException("완료된 제출만 리뷰할 수 있습니다.");
        }

        // 제출 결과 조회 (모든 테스트를 통과했는지 확인)
        SubmissionResult result = submissionResultRepository.findBySubmission(submission)
                .orElseThrow(() -> new IllegalStateException("제출 결과를 찾을 수 없습니다."));

        if (!isAllTestsPassed(result)) {
            throw new IllegalStateException("모든 테스트를 통과한 제출만 리뷰할 수 있습니다.");
        }

        // 코드 읽기
        String code = readCodeFromStorage(submission.getCodePath());
        Problem problem = submission.getProblem();

        // 문제 설명 읽기 (optional)
        String problemStatement = null;
        if (problem.getStatementPath() != null) {
            try {
                problemStatement = storageClient.readString(problem.getStatementPath());
            } catch (Exception e) {
                log.warn("Could not read problem statement: {}", e.getMessage());
            }
        }

        // AI 리뷰 생성
        String reviewContent = geminiAIService.generateCodeReview(
                code,
                problem.getTitle(),
                problemStatement,
                submission.getLanguageId()
        );

        // 리뷰에서 평점 추출 (optional)
        Integer rating = extractRating(reviewContent);

        // 리뷰 저장
        CodeReview codeReview = new CodeReview(submission, reviewContent, rating, null);
        codeReview = codeReviewRepository.save(codeReview);

        log.info("Code review generated for submission {}", submissionId);
        return toResponse(codeReview);
    }

    /**
     * 기존 코드 리뷰를 조회합니다.
     *
     * @param submissionId 제출 ID
     * @return 코드 리뷰 응답 (없으면 Optional.empty())
     */
    @Transactional(readOnly = true)
    public Optional<CodeReviewResponse> getReview(Long submissionId) {
        return codeReviewRepository.findBySubmissionId(submissionId)
                .map(this::toResponse);
    }

    /**
     * 스토리지에서 코드를 읽어옵니다.
     */
    private String readCodeFromStorage(String codePath) {
        try {
            return storageClient.readString(codePath);
        } catch (Exception e) {
            log.error("Failed to read code from storage: {}", codePath, e);
            throw new IllegalStateException("코드를 읽을 수 없습니다: " + e.getMessage());
        }
    }

    /**
     * 모든 테스트가 통과했는지 확인합니다.
     */
    private boolean isAllTestsPassed(SubmissionResult result) {
        try {
            JsonNode summaryNode = objectMapper.readTree(result.getSummaryJson());
            String verdict = summaryNode.path("verdict").asText();
            return "AC".equalsIgnoreCase(verdict);
        } catch (Exception e) {
            log.error("Failed to parse submission result summary", e);
            return false;
        }
    }

    /**
     * 리뷰 텍스트에서 평점을 추출합니다.
     */
    private Integer extractRating(String reviewContent) {
        Matcher matcher = RATING_PATTERN.matcher(reviewContent);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(2));
            } catch (NumberFormatException e) {
                log.warn("Failed to parse rating from review", e);
            }
        }
        return null;
    }

    /**
     * CodeReview 엔티티를 응답 DTO로 변환합니다.
     */
    private CodeReviewResponse toResponse(CodeReview codeReview) {
        return new CodeReviewResponse(
                codeReview.getId(),
                codeReview.getSubmission().getId(),
                codeReview.getReviewContent(),
                codeReview.getRating(),
                codeReview.getSuggestions(),
                codeReview.getCreatedAt()
        );
    }
}
