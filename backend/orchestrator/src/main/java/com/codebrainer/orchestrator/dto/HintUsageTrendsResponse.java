package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * 힌트 사용량 트렌드 응답 DTO
 * - 카테고리 / 티어 / 난이도별로 최근 기간 대비 이전 기간 힌트 사용량 변화를 표현
 */
public record HintUsageTrendsResponse(
        List<CategoryHintUsageTrend> categoryTrends,
        List<TierHintUsageTrend> tierTrends,
        List<LevelHintUsageTrend> levelTrends
) {

    public record CategoryHintUsageTrend(
            String category,
            int recentHints,
            int previousHints
    ) {
    }

    public record TierHintUsageTrend(
            String tier,
            int recentHints,
            int previousHints
    ) {
    }

    public record LevelHintUsageTrend(
            int level,
            int recentHints,
            int previousHints
    ) {
    }
}


