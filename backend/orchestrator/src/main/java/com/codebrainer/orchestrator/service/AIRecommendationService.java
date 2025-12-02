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
     * AI 추천 복습 문제 조회
     * TODO: 실제 AI API 연동 필요
     */
    @Transactional(readOnly = true)
    public AIRecommendationResponse getAIRecommendations(String userId, int limit) {
        // 임시 구현: 최근 해결한 문제들을 기반으로 추천
        // 실제로는 AI API를 호출하여 추천받아야 함
        
        Query query = entityManager.createNativeQuery("""
                SELECT DISTINCT ON (p.id)
                       p.id, p.title, p.slug, p.tier, p.level, p.categories
                FROM submissions s
                JOIN problems p ON p.id = s.problem_id
                WHERE s.user_id = CAST(:userId AS TEXT)
                  AND s.status = 'AC'
                  AND UPPER(p.visibility) = 'PUBLIC'
                ORDER BY p.id, s.created_at DESC
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

            recommendations.add(new ProblemBrief(problemId, title, slug, tier, level, categories));
        }

        String reason = recommendations.isEmpty() 
                ? "아직 해결한 문제가 없어 추천할 문제가 없습니다."
                : "최근 해결한 문제들을 기반으로 추천합니다.";

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

