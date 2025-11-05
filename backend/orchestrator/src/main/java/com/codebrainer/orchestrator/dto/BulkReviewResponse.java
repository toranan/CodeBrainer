package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * 일괄 복습 추천 응답 DTO
 */
public record BulkReviewResponse(
        List<ReviewResponse> items
) {
}

