package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.dto.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 마이페이지 서비스
 */
@Service
public class MyPageService {

    private final EntityManager entityManager;
    private static final TypeReference<Map<String, Object>> SUMMARY_TYPE = new TypeReference<>() {};
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MyPageService(
            EntityManager entityManager
    ) {
        this.entityManager = entityManager;
    }

    /**
     * 내가 푼 문제 목록 조회 (페이지네이션)
     */
    @Transactional(readOnly = true)
    public Page<MySolvedItem> getMySolvedProblems(String userId, String status, Pageable pageable) {
        String[] statuses = parseStatuses(status);
        int offset = (int) pageable.getOffset();
        int size = pageable.getPageSize();

        // status가 null이거나 빈 문자열이면 모든 제출을 반환
        boolean filterByStatus = status != null && !status.trim().isEmpty();

        StringBuilder baseWhere = new StringBuilder("""
                FROM submissions s
                JOIN problems p ON p.id = s.problem_id
                LEFT JOIN submission_results sr ON sr.submission_id = s.id
                WHERE s.user_id = CAST(:userId AS TEXT)
                  AND UPPER(p.visibility) = 'PUBLIC'
                """);

        if (filterByStatus) {
            baseWhere.append(" AND s.status = ANY(:statuses)");
        }

        String countSql = "SELECT COUNT(DISTINCT p.id) " + baseWhere;

        String dataSql = """
                WITH ranked_submissions AS (
                    SELECT s.id, p.id AS problem_id, p.title, p.slug, p.tier, p.level, p.categories,
                           s.status, s.lang_id, s.created_at, s.hint_usage_count, sr.summary_json,
                           ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY s.created_at DESC) as rn
                    """ + baseWhere + """
                )
                SELECT id, problem_id, title, slug, tier, level, categories,
                       status, lang_id, created_at, hint_usage_count, summary_json
                FROM ranked_submissions
                WHERE rn = 1
                ORDER BY created_at DESC
                LIMIT :size OFFSET :offset
                """;
        
        Query countQuery = entityManager.createNativeQuery(countSql);
        countQuery.setParameter("userId", userId);
        if (filterByStatus) {
            countQuery.setParameter("statuses", statuses);
        }
        Long totalElements = ((Number) countQuery.getSingleResult()).longValue();

        Query dataQuery = entityManager.createNativeQuery(dataSql);
        dataQuery.setParameter("userId", userId);
        if (filterByStatus) {
            dataQuery.setParameter("statuses", statuses);
        }
        dataQuery.setParameter("offset", offset);
        dataQuery.setParameter("size", size);

        @SuppressWarnings("unchecked")
        List<Object[]> results = dataQuery.getResultList();

        List<MySolvedItem> content = new ArrayList<>();
        for (Object[] row : results) {
            Long submissionId = ((Number) row[0]).longValue();
            Long problemId = ((Number) row[1]).longValue();
            String title = (String) row[2];
            String slug = (String) row[3];
            String tier = (String) row[4];
            Integer level = ((Number) row[5]).intValue();
            List<String> categories = parseCategories(row[6]);
            String submissionStatus = mapStatus((String) row[7]);
            String lang = (String) row[8];
            Object createdValue = row[9];
            OffsetDateTime createdAt;
            if (createdValue instanceof java.sql.Timestamp timestamp) {
                createdAt = timestamp.toInstant().atOffset(java.time.ZoneOffset.UTC);
            } else if (createdValue instanceof java.time.Instant instant) {
                createdAt = instant.atOffset(java.time.ZoneOffset.UTC);
            } else if (createdValue instanceof java.time.OffsetDateTime offsetDateTime) {
                createdAt = offsetDateTime;
            } else if (createdValue instanceof java.time.LocalDateTime localDateTime) {
                createdAt = localDateTime.atOffset(java.time.ZoneOffset.UTC);
            } else {
                throw new IllegalStateException("지원하지 않는 createdAt 타입: " + createdValue);
            }

            int hintUsageCount = 0;
            if (row.length > 10 && row[10] != null) {
                hintUsageCount = ((Number) row[10]).intValue();
            }
            if ((hintUsageCount == 0) && row.length > 11 && row[11] != null) {
                hintUsageCount = extractHintUsageCount(row[11]);
            }

            ProblemBrief problem = new ProblemBrief(problemId, title, slug, tier, level, categories);
            LastSubmission lastSubmission = new LastSubmission(submissionId, submissionStatus, lang, createdAt, hintUsageCount);
            content.add(new MySolvedItem(problem, lastSubmission, hintUsageCount));
        }

        return new PageImpl<>(content, pageable, totalElements);
    }

    /**
     * 차트 데이터 조회
     */
    @Transactional(readOnly = true)
    public ChartsResponse getChartsData(String userId, int days) {
        List<DailyCount> activityByDay = getActivityByDay(userId, days);
        List<TierCount> solvedCountByTier = getSolvedCountByTier(userId);
        List<LevelCount> solvedCountByLevel = getSolvedCountByLevel(userId);
        List<CategoryCount> topCategories = getTopCategories(userId);
        List<LangCount> languageUsage = getLanguageUsage(userId, days);
        Overall overall = getOverall(userId);

        return new ChartsResponse(
                activityByDay,
                solvedCountByTier,
                solvedCountByLevel,
                topCategories,
                languageUsage,
                overall
        );
    }

    /**
     * 취약 알고리즘 분석 (카테고리별 정답률)
     */
    @Transactional(readOnly = true)
    public List<WeakCategoryStats> getWeakCategories(String userId) {
        // 각 카테고리별로 전체 시도 수와 정답 수를 계산
        Query query = entityManager.createNativeQuery("""
                WITH category_submissions AS (
                    SELECT 
                        cat.category,
                        s.problem_id,
                        sr.summary_json,
                        ROW_NUMBER() OVER (PARTITION BY s.problem_id ORDER BY s.created_at DESC) AS rn
                    FROM submissions s
                    JOIN problems p ON p.id = s.problem_id
                    CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS_TEXT(p.categories) AS cat(category)
                    LEFT JOIN submission_results sr ON sr.submission_id = s.id
                    WHERE s.user_id = CAST(:userId AS TEXT)
                      AND UPPER(p.visibility) = 'PUBLIC'
                      AND sr.summary_json IS NOT NULL
                ),
                category_stats AS (
                    SELECT 
                        category,
                        COUNT(DISTINCT problem_id) AS total_problems,
                        COUNT(DISTINCT CASE 
                            WHEN (summary_json->>'verdict') = 'AC' THEN problem_id 
                        END) AS correct_problems
                    FROM category_submissions
                    WHERE rn = 1
                    GROUP BY category
                )
                SELECT 
                    category,
                    total_problems,
                    correct_problems,
                    CASE 
                        WHEN total_problems > 0 
                        THEN CAST(correct_problems AS DOUBLE PRECISION) / total_problems 
                        ELSE 0.0 
                    END AS accuracy
                FROM category_stats
                WHERE total_problems > 0
                ORDER BY accuracy ASC, total_problems DESC
                """);
        query.setParameter("userId", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> {
                    String category = (String) row[0];
                    Integer totalProblems = ((Number) row[1]).intValue();
                    Integer correctProblems = ((Number) row[2]).intValue();
                    Double accuracy = ((Number) row[3]).doubleValue();
                    return new WeakCategoryStats(category, totalProblems, correctProblems, accuracy);
                })
                .toList();
    }

    /**
     * 틀린 문제 목록 (정답이 아닌 제출이 있는 문제들, 중복 제외)
     */
    @Transactional(readOnly = true)
    public List<WrongProblemItem> getWrongProblems(String userId) {
        Query query = entityManager.createNativeQuery("""
                WITH problem_last_submission AS (
                    SELECT 
                        s.problem_id,
                        MAX(s.created_at) AS last_attempt_at,
                        COUNT(*) AS attempt_count
                    FROM submissions s
                    JOIN problems p ON p.id = s.problem_id
                    LEFT JOIN submission_results sr ON sr.submission_id = s.id
                    WHERE s.user_id = CAST(:userId AS TEXT)
                      AND UPPER(p.visibility) = 'PUBLIC'
                      AND sr.summary_json IS NOT NULL
                      AND (sr.summary_json->>'verdict') != 'AC'
                    GROUP BY s.problem_id
                ),
                problem_has_ac AS (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    JOIN problems p ON p.id = s.problem_id
                    LEFT JOIN submission_results sr ON sr.submission_id = s.id
                    WHERE s.user_id = CAST(:userId AS TEXT)
                      AND UPPER(p.visibility) = 'PUBLIC'
                      AND sr.summary_json IS NOT NULL
                      AND (sr.summary_json->>'verdict') = 'AC'
                )
                SELECT 
                    p.id,
                    p.title,
                    p.slug,
                    p.tier,
                    p.level,
                    p.categories,
                    pls.attempt_count,
                    pls.last_attempt_at
                FROM problem_last_submission pls
                JOIN problems p ON p.id = pls.problem_id
                LEFT JOIN problem_has_ac pac ON pac.problem_id = p.id
                WHERE pac.problem_id IS NULL
                ORDER BY pls.last_attempt_at DESC
                """);
        query.setParameter("userId", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        List<WrongProblemItem> items = new ArrayList<>();
        for (Object[] row : results) {
            Long problemId = ((Number) row[0]).longValue();
            String title = (String) row[1];
            String slug = (String) row[2];
            String tier = (String) row[3];
            Integer level = ((Number) row[4]).intValue();
            List<String> categories = parseCategories(row[5]);
            Integer attemptCount = ((Number) row[6]).intValue();
            Object lastAttemptValue = row[7];
            OffsetDateTime lastAttemptAt;
            if (lastAttemptValue instanceof java.sql.Timestamp timestamp) {
                lastAttemptAt = timestamp.toInstant().atOffset(java.time.ZoneOffset.UTC);
            } else if (lastAttemptValue instanceof java.time.OffsetDateTime offsetDateTime) {
                lastAttemptAt = offsetDateTime;
            } else if (lastAttemptValue instanceof java.time.LocalDateTime localDateTime) {
                lastAttemptAt = localDateTime.atOffset(java.time.ZoneOffset.UTC);
            } else {
                lastAttemptAt = OffsetDateTime.now();
            }
            items.add(new WrongProblemItem(
                    problemId,
                    title,
                    slug,
                    tier,
                    level,
                    categories,
                    attemptCount,
                    lastAttemptAt
            ));
        }
        return items;
    }

    @Transactional(readOnly = true)
    public GrowthTrendResponse getHintUsageGrowth(String userId, String category, String tier, Integer level, int days) {
        Query query = entityManager.createNativeQuery("""
                SELECT TO_CHAR(s.created_at::date, 'YYYY-MM-DD') AS date, COALESCE(SUM(s.hint_usage_count), 0) AS total
                FROM submissions s
                JOIN problems p ON p.id = s.problem_id
                LEFT JOIN LATERAL JSONB_ARRAY_ELEMENTS_TEXT(p.categories) AS cat(category) ON TRUE
                WHERE s.user_id = CAST(:userId AS TEXT)
                  AND s.status IN ('AC', 'COMPLETED')
                  AND s.created_at >= NOW() - (:days || ' days')::interval
                  AND (:tier IS NULL OR UPPER(p.tier) = UPPER(:tier))
                  AND (:level IS NULL OR p.level = :level)
                  AND (:category IS NULL OR cat.category = :category)
                GROUP BY date
                ORDER BY date
                """);
        query.setParameter("userId", userId);
        query.setParameter("days", days);
        query.setParameter("tier", tier != null && !tier.isBlank() ? tier : null);
        query.setParameter("level", level);
        query.setParameter("category", category != null && !category.isBlank() ? category : null);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        List<DailyCount> points = results.stream()
                .map(row -> new DailyCount((String) row[0], ((Number) row[1]).intValue()))
                .toList();
        int totalHints = (int) points.stream().mapToLong(DailyCount::count).sum();
        return new GrowthTrendResponse(points, totalHints);
    }

    /**
     * 카테고리 / 티어 / 난이도별 힌트 사용량 트렌드
     * - 최근 days일 vs 그 이전 days일을 비교
     */
    @Transactional(readOnly = true)
    public HintUsageTrendsResponse getHintUsageTrends(String userId, int days) {
        // 실제 힌트 사용량이 있는 항목들(기존 로직)
        List<HintUsageTrendsResponse.CategoryHintUsageTrend> categoryTrends =
                new ArrayList<>(getCategoryHintUsageTrends(userId, days));
        List<HintUsageTrendsResponse.TierHintUsageTrend> tierTrends =
                new ArrayList<>(getTierHintUsageTrends(userId, days));
        List<HintUsageTrendsResponse.LevelHintUsageTrend> levelTrends =
                new ArrayList<>(getLevelHintUsageTrends(userId, days));

        // --- 카테고리: 문제 메타데이터 기준 전체 카테고리를 0값이라도 포함 ---
        List<String> allCategories = getAllCategoriesForUser(userId);
        if (!allCategories.isEmpty()) {
            Set<String> existingCategories = categoryTrends.stream()
                    .map(HintUsageTrendsResponse.CategoryHintUsageTrend::category)
                    .collect(Collectors.toSet());

            for (String category : allCategories) {
                if (!existingCategories.contains(category)) {
                    categoryTrends.add(new HintUsageTrendsResponse.CategoryHintUsageTrend(
                            category,
                            0,
                            0
                    ));
                }
            }
        }

        // --- 티어: 사용자가 시도한 모든 티어를 0값이라도 포함 ---
        List<String> allTiers = getAllTiersForUser(userId);
        if (!allTiers.isEmpty()) {
            Set<String> existingTiers = tierTrends.stream()
                    .map(HintUsageTrendsResponse.TierHintUsageTrend::tier)
                    .collect(Collectors.toSet());

            for (String tier : allTiers) {
                if (!existingTiers.contains(tier)) {
                    tierTrends.add(new HintUsageTrendsResponse.TierHintUsageTrend(
                            tier,
                            0,
                            0
                    ));
                }
            }
        }

        // --- 난이도(Level): 사용자가 시도한 모든 레벨을 0값이라도 포함 ---
        List<Integer> allLevels = getAllLevelsForUser(userId);
        if (!allLevels.isEmpty()) {
            Set<Integer> existingLevels = levelTrends.stream()
                    .map(HintUsageTrendsResponse.LevelHintUsageTrend::level)
                    .collect(Collectors.toSet());

            for (Integer level : allLevels) {
                if (!existingLevels.contains(level)) {
                    levelTrends.add(new HintUsageTrendsResponse.LevelHintUsageTrend(
                            level,
                            0,
                            0
                    ));
                }
            }
        }

        return new HintUsageTrendsResponse(categoryTrends, tierTrends, levelTrends);
    }

    @SuppressWarnings("unchecked")
    private List<HintUsageTrendsResponse.CategoryHintUsageTrend> getCategoryHintUsageTrends(String userId, int days) {
        Query query = entityManager.createNativeQuery("""
                SELECT 
                    cat.category,
                    COALESCE(SUM(CASE WHEN s.created_at >= NOW() - (:days || ' days')::interval THEN s.hint_usage_count END), 0) AS recent_hints,
                    COALESCE(SUM(CASE WHEN s.created_at <  NOW() - (:days || ' days')::interval THEN s.hint_usage_count END), 0) AS previous_hints
                FROM submissions s
                JOIN problems p ON p.id = s.problem_id
                CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS_TEXT(p.categories) AS cat(category)
                WHERE s.user_id = CAST(:userId AS TEXT)
                  AND s.status IN ('AC', 'COMPLETED')
                  AND s.hint_usage_count IS NOT NULL
                  AND UPPER(p.visibility) = 'PUBLIC'
                GROUP BY cat.category
                HAVING COALESCE(SUM(s.hint_usage_count), 0) > 0
                ORDER BY recent_hints DESC
                """);
        query.setParameter("userId", userId);
        query.setParameter("days", days);

        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new HintUsageTrendsResponse.CategoryHintUsageTrend(
                        (String) row[0],
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).intValue()
                ))
                .toList();
    }

    @SuppressWarnings("unchecked")
    private List<HintUsageTrendsResponse.TierHintUsageTrend> getTierHintUsageTrends(String userId, int days) {
        Query query = entityManager.createNativeQuery("""
                SELECT 
                    p.tier,
                    COALESCE(SUM(CASE WHEN s.created_at >= NOW() - (:days || ' days')::interval THEN s.hint_usage_count END), 0) AS recent_hints,
                    COALESCE(SUM(CASE WHEN s.created_at <  NOW() - (:days || ' days')::interval THEN s.hint_usage_count END), 0) AS previous_hints
                FROM submissions s
                JOIN problems p ON p.id = s.problem_id
                WHERE s.user_id = CAST(:userId AS TEXT)
                  AND s.status IN ('AC', 'COMPLETED')
                  AND s.hint_usage_count IS NOT NULL
                  AND UPPER(p.visibility) = 'PUBLIC'
                GROUP BY p.tier
                HAVING COALESCE(SUM(s.hint_usage_count), 0) > 0
                ORDER BY recent_hints DESC
                """);
        query.setParameter("userId", userId);
        query.setParameter("days", days);

        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new HintUsageTrendsResponse.TierHintUsageTrend(
                        (String) row[0],
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).intValue()
                ))
                .toList();
    }

    @SuppressWarnings("unchecked")
    private List<HintUsageTrendsResponse.LevelHintUsageTrend> getLevelHintUsageTrends(String userId, int days) {
        Query query = entityManager.createNativeQuery("""
                SELECT 
                    p.level,
                    COALESCE(SUM(CASE WHEN s.created_at >= NOW() - (:days || ' days')::interval THEN s.hint_usage_count END), 0) AS recent_hints,
                    COALESCE(SUM(CASE WHEN s.created_at <  NOW() - (:days || ' days')::interval THEN s.hint_usage_count END), 0) AS previous_hints
                FROM submissions s
                JOIN problems p ON p.id = s.problem_id
                WHERE s.user_id = CAST(:userId AS TEXT)
                  AND s.status IN ('AC', 'COMPLETED')
                  AND s.hint_usage_count IS NOT NULL
                  AND UPPER(p.visibility) = 'PUBLIC'
                GROUP BY p.level
                HAVING COALESCE(SUM(s.hint_usage_count), 0) > 0
                ORDER BY p.level
                """);
        query.setParameter("userId", userId);
        query.setParameter("days", days);

        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new HintUsageTrendsResponse.LevelHintUsageTrend(
                        ((Number) row[0]).intValue(),
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).intValue()
                ))
                .toList();
    }

    /**
     * 사용자가 시도한 모든 문제에서 등장하는 카테고리 전체 목록
     * - 힌트 사용 여부와 상관없이, 문제 메타데이터 기준으로만 수집
     */
    @SuppressWarnings("unchecked")
    private List<String> getAllCategoriesForUser(String userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT DISTINCT cat.category
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = CAST(:userId AS TEXT)
                      AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS_TEXT(p.categories) AS cat(category)
                WHERE UPPER(p.visibility) = 'PUBLIC'
                ORDER BY cat.category
                """);
        query.setParameter("userId", userId);

        List<String> results = query.getResultList();
        return results == null ? List.of() : results;
    }

    /**
     * 사용자가 시도한 모든 문제의 티어 전체 목록
     */
    @SuppressWarnings("unchecked")
    private List<String> getAllTiersForUser(String userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT DISTINCT p.tier
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = CAST(:userId AS TEXT)
                      AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                WHERE UPPER(p.visibility) = 'PUBLIC'
                ORDER BY p.tier
                """);
        query.setParameter("userId", userId);

        List<String> results = query.getResultList();
        return results == null ? List.of() : results;
    }

    /**
     * 사용자가 시도한 모든 문제의 난이도(level) 전체 목록
     */
    @SuppressWarnings("unchecked")
    private List<Integer> getAllLevelsForUser(String userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT DISTINCT p.level
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = CAST(:userId AS TEXT)
                      AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                WHERE UPPER(p.visibility) = 'PUBLIC'
                ORDER BY p.level
                """);
        query.setParameter("userId", userId);

        List<Number> results = query.getResultList();
        if (results == null) {
            return List.of();
        }
        return results.stream()
                .map(Number::intValue)
                .toList();
    }

    // === Helper Methods ===

    private List<DailyCount> getActivityByDay(String userId, int days) {
        Query query = entityManager.createNativeQuery("""
                SELECT TO_CHAR(d::date, 'YYYY-MM-DD') AS date, COALESCE(cnt, 0) AS count
                FROM GENERATE_SERIES(
                    (NOW()::date - (:days || ' days')::interval),
                    NOW()::date,
                    '1 day'
                ) AS d
                LEFT JOIN (
                    SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*) AS cnt
                    FROM submissions
                    WHERE user_id = CAST(:userId AS TEXT)
                      AND created_at >= NOW() - (:days || ' days')::interval
                    GROUP BY 1
                ) s ON s.day = d::date
                ORDER BY date
                """);
        query.setParameter("userId", userId);
        query.setParameter("days", days);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new DailyCount((String) row[0], ((Number) row[1]).intValue()))
                .toList();
    }

    private List<TierCount> getSolvedCountByTier(String userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT p.tier, COUNT(*) AS count
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = CAST(:userId AS TEXT) AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                WHERE UPPER(p.visibility) = 'PUBLIC'
                GROUP BY p.tier
                """);
        query.setParameter("userId", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new TierCount((String) row[0], ((Number) row[1]).intValue()))
                .toList();
    }

    private List<LevelCount> getSolvedCountByLevel(String userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT p.level, COUNT(*) AS count
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = CAST(:userId AS TEXT) AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                WHERE UPPER(p.visibility) = 'PUBLIC'
                GROUP BY p.level
                ORDER BY p.level
                """);
        query.setParameter("userId", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new LevelCount(((Number) row[0]).intValue(), ((Number) row[1]).intValue()))
                .toList();
    }

    private List<CategoryCount> getTopCategories(String userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT cat AS category, COUNT(*) AS count
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = CAST(:userId AS TEXT) AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS_TEXT(p.categories) AS c(cat)
                WHERE UPPER(p.visibility) = 'PUBLIC'
                GROUP BY cat
                ORDER BY count DESC
                LIMIT 10
                """);
        query.setParameter("userId", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new CategoryCount((String) row[0], ((Number) row[1]).intValue()))
                .toList();
    }

    private List<LangCount> getLanguageUsage(String userId, int days) {
        Query query = entityManager.createNativeQuery("""
                SELECT lang_id AS lang, COUNT(*) AS count
                FROM (
                    SELECT DISTINCT problem_id, lang_id
                    FROM submissions
                    WHERE user_id = CAST(:userId AS TEXT)
                      AND status IN ('AC', 'COMPLETED')
                      AND created_at >= NOW() - (:days || ' days')::interval
                ) distinct_langs
                GROUP BY lang_id
                ORDER BY count DESC
                """);
        query.setParameter("userId", userId);
        query.setParameter("days", days);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new LangCount((String) row[0], ((Number) row[1]).intValue()))
                .toList();
    }

    private Overall getOverall(String userId) {
        Query attemptedQuery = entityManager.createNativeQuery("""
                SELECT COUNT(*) FROM (
                    SELECT DISTINCT problem_id
                    FROM submissions
                    WHERE user_id = CAST(:userId AS TEXT)
                ) t
                """);
        attemptedQuery.setParameter("userId", userId);
        Long attemptedProblems = ((Number) attemptedQuery.getSingleResult()).longValue();

        Query solvedQuery = entityManager.createNativeQuery("""
                SELECT
                    COUNT(DISTINCT CASE WHEN status IN ('AC', 'COMPLETED') THEN problem_id END) AS solved_total,
                    COUNT(CASE WHEN status IN ('AC', 'COMPLETED') AND created_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS solved_week,
                    COUNT(CASE WHEN status IN ('AC', 'COMPLETED') AND created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS solved_month
                FROM submissions
                WHERE user_id = CAST(:userId AS TEXT)
                """);
        solvedQuery.setParameter("userId", userId);
        Object[] solvedResult = (Object[]) solvedQuery.getSingleResult();
        Long solvedProblems = solvedResult[0] != null ? ((Number) solvedResult[0]).longValue() : 0L;
        Long solvedWeek = solvedResult[1] != null ? ((Number) solvedResult[1]).longValue() : 0L;
        Long solvedMonth = solvedResult[2] != null ? ((Number) solvedResult[2]).longValue() : 0L;

        double acRate = attemptedProblems > 0 ? (double) solvedProblems / attemptedProblems : 0.0;

        return new Overall(attemptedProblems, solvedProblems, acRate, solvedWeek, solvedMonth);
    }

    private String[] parseStatuses(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new String[]{"AC", "COMPLETED"};
        }
        List<String> parsed = Arrays.stream(status.split(","))
                .map(String::trim)
                .map(this::mapStatusFromInput)
                .collect(Collectors.toCollection(ArrayList::new));

        Set<String> normalized = new LinkedHashSet<>(parsed);
        if (normalized.contains("AC")) {
            normalized.add("COMPLETED");
        }
        return normalized.toArray(new String[0]);
    }

    private String mapStatusFromInput(String input) {
        return switch (input.toUpperCase()) {
            case "AC" -> "AC";
            case "COMPLETED" -> "COMPLETED";
            case "WA" -> "WA";
            case "TLE" -> "TLE";
            case "RE" -> "RE";
            case "CE" -> "CE";
            case "MLE" -> "MLE";
            case "FAILED" -> "FAILED";
            case "QUEUED" -> "QUEUED";
            case "RUNNING" -> "RUNNING";
            default -> input.toUpperCase();
        };
    }

    private String mapStatus(String dbStatus) {
        return switch (dbStatus) {
            case "AC" -> "AC";
            case "WA" -> "WA";
            case "TLE" -> "TLE";
            case "RE" -> "RE";
            case "CE" -> "CE";
            case "MLE" -> "MLE";
            case "COMPLETED" -> "AC";
            case "QUEUED", "RUNNING" -> "PENDING";
            case "FAILED", "ERR" -> "FAILED";
            default -> dbStatus;
        };
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

    private int extractHintUsageCount(Object summaryJsonObject) {
        if (summaryJsonObject == null) {
            return 0;
        }
        try {
            String summaryJson = summaryJsonObject instanceof String
                    ? (String) summaryJsonObject
                    : summaryJsonObject.toString();
            Map<String, Object> summaryMap = objectMapper.readValue(summaryJson, SUMMARY_TYPE);
            Object hintCount = summaryMap.get("hintUsageCount");
            if (hintCount instanceof Number number) {
                return number.intValue();
            }
            if (hintCount instanceof String stringValue && !stringValue.isBlank()) {
                return Integer.parseInt(stringValue);
            }
        } catch (Exception ignored) {
            // summary_json에 힌트 정보가 없거나 파싱 실패 시 0으로 처리
        }
        return 0;
    }
}

