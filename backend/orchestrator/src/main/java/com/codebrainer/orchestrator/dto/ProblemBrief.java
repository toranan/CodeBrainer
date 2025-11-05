package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * 문제 간략 정보 DTO
 */
public record ProblemBrief(
        Long id,
        String title,
        String slug,
        String tier,
        Integer level,
        List<String> categories
) {
}

