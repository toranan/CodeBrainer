package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.dto.*;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.SubmissionRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 마이페이지 서비스
 */
@Service
public class MyPageService {

    private final EntityManager entityManager;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;

    public MyPageService(
            EntityManager entityManager,
            ProblemRepository problemRepository,
            SubmissionRepository submissionRepository
    ) {
        this.entityManager = entityManager;
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
    }

    /**
     * 내가 푼 문제 목록 조회 (페이지네이션)
     */
    @Transactional(readOnly = true)
    public Page<MySolvedItem> getMySolvedProblems(Long userId, String status, Pageable pageable) {
        String[] statuses = parseStatuses(status);
        int offset = (int) pageable.getOffset();
        int size = pageable.getPageSize();

        Query countQuery = entityManager.createNativeQuery("""
                WITH latest AS (
                    SELECT DISTINCT ON (s.problem_id)
                           s.problem_id
                    FROM submissions s
                    WHERE s.user_id = :userId
                      AND (:statuses IS NULL OR s.status = ANY(:statuses))
                    ORDER BY s.problem_id, s.created_at DESC
                )
                SELECT COUNT(*)
                FROM latest l
                JOIN problems p ON p.id = l.problem_id
                WHERE p.visibility = 'PUBLIC'
                """);
        countQuery.setParameter("userId", userId);
        countQuery.setParameter("statuses", statuses);
        Long totalElements = ((Number) countQuery.getSingleResult()).longValue();

        Query dataQuery = entityManager.createNativeQuery("""
                WITH latest AS (
                    SELECT DISTINCT ON (s.problem_id)
                           s.problem_id,
                           s.status,
                           s.lang_id,
                           s.created_at
                    FROM submissions s
                    WHERE s.user_id = :userId
                      AND (:statuses IS NULL OR s.status = ANY(:statuses))
                    ORDER BY s.problem_id, s.created_at DESC
                )
                SELECT p.id, p.title, p.slug, p.tier, p.level, p.categories,
                       l.status, l.lang_id, l.created_at
                FROM latest l
                JOIN problems p ON p.id = l.problem_id
                WHERE p.visibility = 'PUBLIC'
                ORDER BY l.created_at DESC
                LIMIT :size OFFSET :offset
                """);
        dataQuery.setParameter("userId", userId);
        dataQuery.setParameter("statuses", statuses);
        dataQuery.setParameter("offset", offset);
        dataQuery.setParameter("size", size);

        @SuppressWarnings("unchecked")
        List<Object[]> results = dataQuery.getResultList();

        List<MySolvedItem> content = new ArrayList<>();
        for (Object[] row : results) {
            Long problemId = ((Number) row[0]).longValue();
            String title = (String) row[1];
            String slug = (String) row[2];
            String tier = (String) row[3];
            Integer level = ((Number) row[4]).intValue();
            List<String> categories = parseCategories(row[5]);
            String submissionStatus = mapStatus((String) row[6]);
            String lang = (String) row[7];
            OffsetDateTime createdAt = ((java.sql.Timestamp) row[8]).toInstant().atOffset(java.time.ZoneOffset.UTC);

            ProblemBrief problem = new ProblemBrief(problemId, title, slug, tier, level, categories);
            LastSubmission lastSubmission = new LastSubmission(submissionStatus, lang, createdAt);
            content.add(new MySolvedItem(problem, lastSubmission));
        }

        return new PageImpl<>(content, pageable, totalElements);
    }

    /**
     * 차트 데이터 조회
     */
    @Transactional(readOnly = true)
    public ChartsResponse getChartsData(Long userId, int days) {
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

    // === Helper Methods ===

    private List<DailyCount> getActivityByDay(Long userId, int days) {
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
                    WHERE user_id = :userId
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

    private List<TierCount> getSolvedCountByTier(Long userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT p.tier, COUNT(*) AS count
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = :userId AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                WHERE p.visibility = 'PUBLIC'
                GROUP BY p.tier
                """);
        query.setParameter("userId", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new TierCount((String) row[0], ((Number) row[1]).intValue()))
                .toList();
    }

    private List<LevelCount> getSolvedCountByLevel(Long userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT p.level, COUNT(*) AS count
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = :userId AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                WHERE p.visibility = 'PUBLIC'
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

    private List<CategoryCount> getTopCategories(Long userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT cat AS category, COUNT(*) AS count
                FROM (
                    SELECT DISTINCT s.problem_id
                    FROM submissions s
                    WHERE s.user_id = :userId AND s.status IN ('AC', 'COMPLETED')
                ) sp
                JOIN problems p ON p.id = sp.problem_id
                CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS_TEXT(p.categories) AS c(cat)
                WHERE p.visibility = 'PUBLIC'
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

    private List<LangCount> getLanguageUsage(Long userId, int days) {
        Query query = entityManager.createNativeQuery("""
                SELECT lang_id AS lang, COUNT(*) AS count
                FROM submissions
                WHERE user_id = :userId
                  AND created_at >= NOW() - (:days || ' days')::interval
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

    private Overall getOverall(Long userId) {
        Query attemptedQuery = entityManager.createNativeQuery("""
                SELECT COUNT(*) FROM (
                    SELECT DISTINCT problem_id
                    FROM submissions
                    WHERE user_id = :userId
                ) t
                """);
        attemptedQuery.setParameter("userId", userId);
        Long attemptedProblems = ((Number) attemptedQuery.getSingleResult()).longValue();

        Query solvedQuery = entityManager.createNativeQuery("""
                SELECT COUNT(*) FROM (
                    SELECT DISTINCT problem_id
                    FROM submissions
                    WHERE user_id = :userId AND status IN ('AC', 'COMPLETED')
                ) t
                """);
        solvedQuery.setParameter("userId", userId);
        Long solvedProblems = ((Number) solvedQuery.getSingleResult()).longValue();

        double acRate = attemptedProblems > 0 ? (double) solvedProblems / attemptedProblems : 0.0;

        return new Overall(attemptedProblems, solvedProblems, acRate);
    }

    private String[] parseStatuses(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new String[]{"AC", "COMPLETED"};
        }
        return Arrays.stream(status.split(","))
                .map(String::trim)
                .map(this::mapStatusFromInput)
                .toArray(String[]::new);
    }

    private String mapStatusFromInput(String input) {
        return switch (input.toUpperCase()) {
            case "AC" -> "AC";
            case "COMPLETED" -> "COMPLETED";
            case "WA" -> "WA";
            case "TLE" -> "TLE";
            case "RE" -> "RE";
            case "CE" -> "CE";
            default -> input.toUpperCase();
        };
    }

    private String mapStatus(String dbStatus) {
        return switch (dbStatus) {
            case "COMPLETED" -> "AC";
            case "QUEUED" -> "PENDING";
            case "RUNNING" -> "PENDING";
            case "FAILED" -> "WA";
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
}

