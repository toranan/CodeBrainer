package com.codebrainer.orchestrator.dto;

/**
 * 언어별 집계 DTO
 */
public record LangCount(
        String lang,
        Integer count
) {
}

