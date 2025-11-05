package com.codebrainer.orchestrator.dto;

/**
 * 내가 푼 문제 항목 DTO
 */
public record MySolvedItem(
        ProblemBrief problem,
        LastSubmission lastSubmission
) {
}

