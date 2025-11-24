package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.dto.ProblemBrief;
import com.codebrainer.orchestrator.dto.ReviewResponse;
import com.codebrainer.orchestrator.dto.BulkReviewResponse;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 복습 추천 서비스
 */
@Service
public class ReviewService {

    private final EntityManager entityManager;
    private final ProblemRepository problemRepository;

    public ReviewService(EntityManager entityManager, ProblemRepository problemRepository) {
        this.entityManager = entityManager;
        this.problemRepository = problemRepository;
    }

    /**
     * 단건 복습 추천
     */
    @Transactional(readOnly = true)
    public ReviewResponse getReviewRecommendations(String userId, Long baseProblemId, int limit) {
        Problem baseProblem = problemRepository.findById(baseProblemId)
                .orElseThrow(() -> new IllegalArgumentException("기준 문제를 찾을 수 없습니다."));

        String tier = baseProblem.getTier();
        Integer level = baseProblem.getLevel();
        List<String> categories = baseProblem.getCategories();
        String[] catsArray = categories.isEmpty() ? new String[0] : categories.toArray(String[]::new);

        Query query = entityManager.createNativeQuery("""
                WITH base AS (
                    SELECT :baseTier::text AS tier,
                           :baseLevel::int AS level,
                           :baseCats::text[] AS cats
                )
                SELECT p.id, p.title, p.slug, p.tier, p.level, p.categories
                FROM problems p
                WHERE UPPER(p.visibility) = 'PUBLIC'
                  AND p.id <> :baseProblemId
                  AND NOT EXISTS (
                      SELECT 1 FROM submissions s
                      WHERE s.user_id = :userId
                        AND s.problem_id = p.id
                        AND s.status IN ('AC', 'COMPLETED')
                  )
                  AND ABS(p.level - (SELECT level FROM base)) <= 1
                  AND ABS(
                      ARRAY_POSITION(ARRAY['BRONZE','SILVER','GOLD','PLATINUM','DIAMOND'], p.tier)
                      - ARRAY_POSITION(ARRAY['BRONZE','SILVER','GOLD','PLATINUM','DIAMOND'], (SELECT tier FROM base))
                  ) <= 1
                ORDER BY (
                    SELECT COUNT(*)
                    FROM JSONB_ARRAY_ELEMENTS_TEXT(p.categories) c(val)
                    WHERE c.val = ANY((SELECT cats FROM base))
                ) DESC,
                ABS(
                    ARRAY_POSITION(ARRAY['BRONZE','SILVER','GOLD','PLATINUM','DIAMOND'], p.tier)
                    - ARRAY_POSITION(ARRAY['BRONZE','SILVER','GOLD','PLATINUM','DIAMOND'], (SELECT tier FROM base))
                ) ASC,
                ABS(p.level - (SELECT level FROM base)) ASC,
                p.created_at DESC
                LIMIT :limit
                """);
        query.setParameter("userId", userId);
        query.setParameter("baseProblemId", baseProblemId);
        query.setParameter("baseTier", tier);
        query.setParameter("baseLevel", level);
        query.setParameter("baseCats", catsArray);
        query.setParameter("limit", limit);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<ProblemBrief> recommendations = new ArrayList<>();
        for (Object[] row : results) {
            Long problemId = ((Number) row[0]).longValue();
            String title = (String) row[1];
            String slug = (String) row[2];
            String problemTier = (String) row[3];
            Integer problemLevel = ((Number) row[4]).intValue();
            List<String> problemCategories = parseCategories(row[5]);

            recommendations.add(new ProblemBrief(problemId, title, slug, problemTier, problemLevel, problemCategories));
        }

        ProblemBrief baseProblemBrief = new ProblemBrief(
                baseProblem.getId(),
                baseProblem.getTitle(),
                baseProblem.getSlug(),
                baseProblem.getTier(),
                baseProblem.getLevel(),
                baseProblem.getCategories()
        );

        return new ReviewResponse(baseProblemBrief, recommendations);
    }

    /**
     * 일괄 복습 추천
     */
    @Transactional(readOnly = true)
    public BulkReviewResponse getBulkReviewRecommendations(String userId, int recent, int perBaseLimit) {
        List<Long> recentProblemIds = getRecentSolvedProblemIds(userId, recent);
        
        List<ReviewResponse> items = new ArrayList<>();
        for (Long problemId : recentProblemIds) {
            ReviewResponse response = getReviewRecommendations(userId, problemId, perBaseLimit);
            items.add(response);
        }

        return new BulkReviewResponse(items);
    }

    private List<Long> getRecentSolvedProblemIds(String userId, int limit) {
        Query query = entityManager.createNativeQuery("""
                SELECT DISTINCT s.problem_id
                FROM submissions s
                WHERE s.user_id = :userId
                  AND s.status IN ('AC', 'COMPLETED')
                ORDER BY s.created_at DESC
                LIMIT :limit
                """);
        query.setParameter("userId", userId);
        query.setParameter("limit", limit);

        @SuppressWarnings("unchecked")
        List<Long> results = query.getResultList();
        return results;
    }

    @SuppressWarnings("unchecked")
    private List<String> parseCategories(Object categories) {
        if (categories == null) {
            return new ArrayList<>();
        }
        try {
            return (List<String>) categories;
        } catch (ClassCastException e) {
            return new ArrayList<>();
        }
    }
}

