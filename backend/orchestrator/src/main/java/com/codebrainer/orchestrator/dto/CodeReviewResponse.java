package com.codebrainer.orchestrator.dto;

import java.time.Instant;

/**
 * AI 코드 리뷰 응답 DTO
 */
public record CodeReviewResponse(
        Long reviewId,
        Long submissionId,
        String reviewContent,
        Integer rating,
        String suggestions,
        Instant createdAt
) {
}
