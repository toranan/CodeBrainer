package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * 힌트 사용량 성장 추세 응답 DTO
 */
public record GrowthTrendResponse(
        List<DailyCount> points,
        int totalHints
) {
}

