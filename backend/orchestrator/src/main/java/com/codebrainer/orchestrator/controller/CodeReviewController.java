package com.codebrainer.orchestrator.controller;

import com.codebrainer.orchestrator.dto.CodeReviewResponse;
import com.codebrainer.orchestrator.service.CodeReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * 코드 리뷰 API 컨트롤러
 */
@RestController
@RequestMapping("/api/code-reviews")
public class CodeReviewController {

    private static final Logger log = LoggerFactory.getLogger(CodeReviewController.class);

    private final CodeReviewService codeReviewService;

    public CodeReviewController(CodeReviewService codeReviewService) {
        this.codeReviewService = codeReviewService;
    }

    /**
     * 제출에 대한 AI 코드 리뷰를 생성합니다.
     *
     * POST /api/code-reviews/submissions/{submissionId}
     *
     * @param submissionId 제출 ID
     * @param request 리뷰 요청 데이터
     * @return 생성된 코드 리뷰
     */
    @PostMapping("/submissions/{submissionId}")
    public ResponseEntity<?> createReview(
            @PathVariable("submissionId") Long submissionId,
            @RequestBody(required = false) CreateReviewRequest request) {
        try {
            String mode = (request != null && request.mode() != null) ? request.mode() : "review";
            String problemTitle = (request != null) ? request.problemTitle() : null;
            String problemStatement = (request != null) ? request.problemStatement() : null;
            
            log.info("Generating {} for submission: {}", mode, submissionId);
            CodeReviewResponse review = codeReviewService.generateReview(
                submissionId, mode, problemTitle, problemStatement
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Failed to generate code review: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(e.getMessage())
            );
        } catch (Exception e) {
            log.error("Unexpected error generating code review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("코드 리뷰 생성 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 리뷰 생성 요청 DTO
     */
    private record CreateReviewRequest(
        String mode,
        String verdict,
        String problemTitle,
        String problemStatement
    ) {}


    /**
     * 제출에 대한 기존 코드 리뷰를 조회합니다.
     *
     * GET /api/code-reviews/submissions/{submissionId}
     *
     * @param submissionId 제출 ID
     * @return 코드 리뷰 (없으면 404)
     */
    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<?> getReview(@PathVariable("submissionId") Long submissionId) {
        try {
            log.debug("Fetching code review for submission: {}", submissionId);
            Optional<CodeReviewResponse> review = codeReviewService.getReview(submissionId);

            if (review.isPresent()) {
                return ResponseEntity.ok(review.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ErrorResponse("해당 제출에 대한 코드 리뷰가 없습니다.")
                );
            }
        } catch (Exception e) {
            log.error("Error fetching code review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("코드 리뷰 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 에러 응답 DTO
     */
    private record ErrorResponse(String message) {
    }
}
