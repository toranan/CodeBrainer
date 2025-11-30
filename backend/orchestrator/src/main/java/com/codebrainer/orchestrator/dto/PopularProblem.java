package com.codebrainer.orchestrator.dto;

/**
 * 인기 문제 DTO
 */
public record PopularProblem(
    Long problemId,
    String title,
    String slug,
    String tier,
    Integer level,
    Long submissionCount
) {
}

