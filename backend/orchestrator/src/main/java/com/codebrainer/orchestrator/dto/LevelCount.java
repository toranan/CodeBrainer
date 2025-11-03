package com.codebrainer.orchestrator.dto;

/**
 * 레벨별 집계 DTO
 */
public record LevelCount(
        Integer level,
        Integer count
) {
}

