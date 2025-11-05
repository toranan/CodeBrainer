package com.codebrainer.orchestrator.dto;

/**
 * 일일 집계 DTO
 */
public record DailyCount(
        String date,
        Integer count
) {
}

