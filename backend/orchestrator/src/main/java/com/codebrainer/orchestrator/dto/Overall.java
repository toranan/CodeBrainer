package com.codebrainer.orchestrator.dto;

/**
 * 전체 통계 DTO
 */
public record Overall(
        Long attemptedProblems,
        Long solvedProblems,
        Double acRate,
        Long solvedLast7Days,
        Long solvedLast30Days
) {
}

