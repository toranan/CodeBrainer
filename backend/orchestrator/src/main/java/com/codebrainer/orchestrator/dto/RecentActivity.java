package com.codebrainer.orchestrator.dto;

import java.time.OffsetDateTime;

/**
 * 최근 활동 DTO
 */
public record RecentActivity(
    String userId,
    String userName,
    String action,
    String detail,
    OffsetDateTime createdAt
) {
}

