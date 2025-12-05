package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.dto.AIRecommendationResponse;
import com.codebrainer.orchestrator.dto.ProblemBrief;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * AI 추천 복습 문제 서비스
 */
@Service
public class AIRecommendationService {

    private final EntityManager entityManager;

    public AIRecommendationService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * 간격 반복 학습(Spaced Repetition) 기반 복습 문제 추천
     * 에빙하우스 망각 곡선 이론 적용:
     * - 1회 정답: 1일 후 복습
     * - 2회 정답: 3일 후 복습
     * - 3회 정답: 7일 후 복습
     * - 4회 정답: 14일 후 복습
     * - 5회 이상: 30일 후 복습
     */
    @Transactional(readOnly = true)
    public AIRecommendationResponse getAIRecommendations(String userId, int limit) {
        Query query = entityManager.createNativeQuery("""
                WITH problem_review_history AS (
                    -- 각 문제별 정답 횟수와 마지막 해결 시간
                    SELECT
                        s.problem_id,
                        MAX(s.created_at) AS last_solved_at,
                        COUNT(CASE WHEN s.status IN ('AC', 'COMPLETED') THEN 1 END) AS ac_count,
                        COUNT(*) AS total_attempts
                    FROM submissions s
                    WHERE s.user_id = CAST(:userId AS TEXT)
                      AND s.status IN ('AC', 'COMPLETED')
                    GROUP BY s.problem_id
                ),
                review_schedule AS (
                    -- 복습 주기 계산
                    SELECT
                        prh.*,
                        p.id, p.title, p.slug, p.tier, p.level, p.categories,
                        -- 경과 일수
                        EXTRACT(DAY FROM NOW() - prh.last_solved_at) AS days_since_solved,
                        -- 다음 복습 권장 일수 (간격 반복 학습)
                        CASE
                            WHEN prh.ac_count = 1 THEN 1   -- 첫 복습: 1일
                            WHEN prh.ac_count = 2 THEN 3   -- 두번째: 3일
                            WHEN prh.ac_count = 3 THEN 7   -- 세번째: 7일
                            WHEN prh.ac_count = 4 THEN 14  -- 네번째: 14일
                            ELSE 30                         -- 그 이후: 30일
                        END AS recommended_review_days,
                        -- 난이도 가중치 (어려운 문제일수록 자주 복습)
                        CASE p.tier
                            WHEN 'Bronze' THEN 1.0
                            WHEN 'Silver' THEN 1.5
                            WHEN 'Gold' THEN 2.0
                            WHEN 'Platinum' THEN 2.5
                            WHEN 'Diamond' THEN 3.0
                            ELSE 1.0
                        END AS difficulty_weight
                    FROM problem_review_history prh
                    JOIN problems p ON p.id = prh.problem_id
                    WHERE UPPER(p.visibility) = 'PUBLIC'
                ),
                priority_scores AS (
                    -- 복습 우선순위 점수 계산
                    SELECT
                        id, title, slug, tier, level, categories,
                        days_since_solved,
                        recommended_review_days,
                        ac_count,
                        -- 복습 긴급도 = (경과일수 / 권장일수) × 난이도가중치
                        -- 1.0 이상이면 복습 시기 도래, 높을수록 시급
                        (days_since_solved::FLOAT / NULLIF(recommended_review_days, 0)) * difficulty_weight AS review_urgency
                    FROM review_schedule
                    WHERE days_since_solved >= recommended_review_days * 0.8  -- 권장 시기의 80% 도달
                )
                SELECT
                    id, title, slug, tier, level, categories,
                    review_urgency
                FROM priority_scores
                ORDER BY review_urgency DESC, level DESC
                LIMIT :limit
                """);
        query.setParameter("userId", userId);
        query.setParameter("limit", limit);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<ProblemBrief> recommendations = new ArrayList<>();
        for (Object[] row : results) {
            Long problemId = ((Number) row[0]).longValue();
            String title = (String) row[1];
            String slug = (String) row[2];
            String tier = (String) row[3];
            Integer level = ((Number) row[4]).intValue();
            List<String> categories = parseCategories(row[5]);
            // row[6]은 review_urgency (표시용으로 사용 가능)

            recommendations.add(new ProblemBrief(problemId, title, slug, tier, level, categories));
        }

        String reason = recommendations.isEmpty()
                ? "복습이 필요한 문제가 없습니다. 새로운 문제에 도전해보세요!"
                : "간격 반복 학습 이론에 따라 지금 복습하면 가장 효과적인 문제들입니다. " +
                  "망각 곡선을 고려한 최적의 복습 시기에 도달한 문제들이에요!";

        return new AIRecommendationResponse(recommendations, reason);
    }

    @SuppressWarnings("unchecked")
    private List<String> parseCategories(Object categoriesObj) {
        if (categoriesObj == null) {
            return List.of();
        }
        if (categoriesObj instanceof List) {
            return (List<String>) categoriesObj;
        }
        if (categoriesObj instanceof String) {
            // JSON 문자열인 경우 파싱 필요
            return List.of();
        }
        return List.of();
    }
}

