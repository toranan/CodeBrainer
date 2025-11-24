package com.codebrainer.orchestrator.dto;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * 틀린 문제 항목 DTO
 */
public record WrongProblemItem(
        Long problemId,
        String title,
        String slug,
        String tier,
        Integer level,
        List<String> categories,
        int attemptCount,
        OffsetDateTime lastAttemptAt
) {
}

