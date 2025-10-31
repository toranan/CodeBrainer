package com.codebrainer.orchestrator.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ProblemSummaryResponse(
        Long id,
        String slug,
        String title,
        String tier,
        Integer level,
        List<String> categories,
        List<String> languages,
        String statement,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}

