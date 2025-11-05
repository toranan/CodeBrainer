package com.codebrainer.orchestrator.dto;

/**
 * 티어별 집계 DTO
 */
public record TierCount(
        String tier,
        Integer count
) {
}

