package com.codebrainer.orchestrator.dto;

/**
 * 카테고리별 집계 DTO
 */
public record CategoryCount(
        String category,
        Integer count
) {
}

