package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.dto.*;
import com.codebrainer.orchestrator.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 관리자 서비스
 */
@Service
public class AdminService {

    private final EntityManager entityManager;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final RestTemplate restTemplate;
    private static final String USER_API_BASE_URL = "http://localhost:8081";

    public AdminService(
            EntityManager entityManager,
            ProblemRepository problemRepository,
            SubmissionRepository submissionRepository
    ) {
        this.entityManager = entityManager;
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
        this.restTemplate = new RestTemplate();
    }

    /**
     * 관리자 대시보드 통계 조회
     */
    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        long totalUsers = getTotalUsers();
        long totalProblems = problemRepository.count();
        long todaySubmissions = getTodaySubmissions();
        long activeUsers24h = getActiveUsers24h();
        List<PopularProblem> topProblems = getTopProblems(5);
        List<RecentActivity> recentActivities = getRecentActivities(5);

        return new AdminDashboardStats(
                totalUsers,
                totalProblems,
                todaySubmissions,
                activeUsers24h,
                topProblems,
                recentActivities
        );
    }

    /**
     * 사용자 목록 조회 (페이지네이션)
     */
    @Transactional(readOnly = true)
    public Page<UserListItem> getUserList(Pageable pageable) {
        // 8081 서버에서 사용자 목록 조회
        try {
            String url = String.format("%s/api/users?page=%d&size=%d",
                    USER_API_BASE_URL,
                    pageable.getPageNumber(),
                    pageable.getPageSize());

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                System.err.println("User API 응답이 null입니다.");
                return new PageImpl<>(List.of(), pageable, 0);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> users = (List<Map<String, Object>>) response.get("content");
            long total = ((Number) response.get("totalElements")).longValue();

            List<UserListItem> content = new ArrayList<>();
            for (Map<String, Object> user : users) {
                String userId = (String) user.get("id");
                
                // 각 사용자의 풀이 통계 조회
                Long solvedCount = getSolvedCount(userId);
                Long submissionCount = getSubmissionCount(userId);

                content.add(new UserListItem(
                        userId,
                        (String) user.get("email"),
                        (String) user.get("name"),
                        (String) user.get("role"),
                        solvedCount,
                        submissionCount,
                        OffsetDateTime.parse((String) user.get("createdAt"))
                ));
            }

            return new PageImpl<>(content, pageable, total);
        } catch (Exception e) {
            System.err.println("User API 호출 실패 (getUserList): " + e.getMessage());
            e.printStackTrace();
            // 에러 시 빈 목록 반환
            return new PageImpl<>(List.of(), pageable, 0);
        }
    }

    // === Helper Methods ===

    private long getTotalUsers() {
        try {
            String url = USER_API_BASE_URL + "/api/users/count";
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response != null ? ((Number) response.get("count")).longValue() : 0;
        } catch (Exception e) {
            System.err.println("User API 호출 실패 (getTotalUsers): " + e.getMessage());
            return 0;
        }
    }

    private long getTodaySubmissions() {
        Query query = entityManager.createNativeQuery("""
                SELECT COUNT(*)
                FROM submissions
                WHERE created_at >= CURRENT_DATE
                """);
        return ((Number) query.getSingleResult()).longValue();
    }

    private long getActiveUsers24h() {
        Query query = entityManager.createNativeQuery("""
                SELECT COUNT(DISTINCT user_id)
                FROM submissions
                WHERE created_at >= NOW() - INTERVAL '24 hours'
                """);
        return ((Number) query.getSingleResult()).longValue();
    }

    private List<PopularProblem> getTopProblems(int limit) {
        Query query = entityManager.createNativeQuery("""
                SELECT p.id, p.title, p.slug, p.tier, p.level, COUNT(s.id) AS cnt
                FROM problems p
                LEFT JOIN submissions s ON s.problem_id = p.id
                WHERE p.visibility = 'PUBLIC'
                GROUP BY p.id, p.title, p.slug, p.tier, p.level
                ORDER BY cnt DESC
                LIMIT :limit
                """);
        query.setParameter("limit", limit);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> new PopularProblem(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).intValue(),
                        ((Number) row[5]).longValue()
                ))
                .toList();
    }

    private List<RecentActivity> getRecentActivities(int limit) {
        Query query = entityManager.createNativeQuery("""
                SELECT s.user_id, s.problem_id, p.title, s.status, s.created_at
                FROM submissions s
                JOIN problems p ON p.id = s.problem_id
                ORDER BY s.created_at DESC
                LIMIT :limit
                """);
        query.setParameter("limit", limit);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> {
                    String action = "문제를 풀었습니다";
                    String detail = (String) row[2] + " (" + mapStatus((String) row[3]) + ")";
                    return new RecentActivity(
                            (String) row[0],
                            (String) row[0], // userName은 userId로 대체 (실제로는 User 서버에서 조회 필요)
                            action,
                            detail,
                            toOffsetDateTime(row[4])
                    );
                })
                .toList();
    }

    private Long getSolvedCount(String userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT COUNT(DISTINCT problem_id)
                FROM submissions
                WHERE user_id = :userId AND status IN ('AC', 'COMPLETED')
                """);
        query.setParameter("userId", userId);
        return ((Number) query.getSingleResult()).longValue();
    }

    private Long getSubmissionCount(String userId) {
        Query query = entityManager.createNativeQuery("""
                SELECT COUNT(*)
                FROM submissions
                WHERE user_id = :userId
                """);
        query.setParameter("userId", userId);
        return ((Number) query.getSingleResult()).longValue();
    }

    private String mapStatus(String dbStatus) {
        return switch (dbStatus) {
            case "COMPLETED" -> "정답";
            case "AC" -> "정답";
            case "WA" -> "오답";
            case "TLE" -> "시간초과";
            case "RE" -> "런타임 에러";
            case "CE" -> "컴파일 에러";
            case "QUEUED" -> "대기중";
            case "RUNNING" -> "실행중";
            case "FAILED" -> "실패";
            default -> dbStatus;
        };
    }

    private OffsetDateTime toOffsetDateTime(Object value) {
        if (value == null) {
            return OffsetDateTime.now(ZoneOffset.UTC);
        }
        if (value instanceof OffsetDateTime odt) {
            return odt;
        }
        if (value instanceof Timestamp ts) {
            return ts.toInstant().atOffset(ZoneOffset.UTC);
        }
        if (value instanceof Instant instant) {
            return instant.atOffset(ZoneOffset.UTC);
        }
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}

