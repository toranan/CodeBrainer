package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * 관리자 대시보드 통계 응답 DTO
 */
public record AdminDashboardStats(
    long totalUsers,
    long totalProblems,
    long todaySubmissions,
    long activeUsers24h,
    List<PopularProblem> topProblems,
    List<RecentActivity> recentActivities
) {
}

