package com.codebrainer.orchestrator.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ProblemDetailResponse(
        Long id,
        String slug,
        String title,
        String tier,
        Integer level,
        String statement,
        String constraints,
        String inputFormat,
        String outputFormat,
        List<String> categories,
        List<String> languages,
        List<ProblemHintDto> hints,
        List<ProblemTestcaseResponse> testcases,
        List<ProblemTestcaseResponse> samples,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}

