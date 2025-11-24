package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * AI 추천 복습 문제 응답 DTO
 */
public record AIRecommendationResponse(
        List<ProblemBrief> recommendations,
        String reason
) {
}

