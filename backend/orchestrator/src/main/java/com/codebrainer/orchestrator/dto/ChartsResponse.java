package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * 차트 데이터 응답 DTO
 */
public record ChartsResponse(
        List<DailyCount> activityByDay,
        List<TierCount> solvedCountByTier,
        List<LevelCount> solvedCountByLevel,
        List<CategoryCount> topCategories,
        List<LangCount> languageUsage,
        Overall overall
) {
}

