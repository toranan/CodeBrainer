package com.codebrainer.orchestrator.dto;

/**
 * 취약 알고리즘 카테고리별 통계 DTO
 */
public record WeakCategoryStats(
        String category,
        int totalProblems,
        int correctProblems,
        double accuracy // 0.0 ~ 1.0
) {
}

