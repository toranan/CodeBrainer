package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * 복습 추천 응답 DTO (단건)
 */
public record ReviewResponse(
        ProblemBrief baseProblem,
        List<ProblemBrief> recommendations
) {
}

