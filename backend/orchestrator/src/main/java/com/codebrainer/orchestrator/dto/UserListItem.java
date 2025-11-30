package com.codebrainer.orchestrator.dto;

import java.time.OffsetDateTime;

/**
 * 사용자 목록 아이템 DTO
 */
public record UserListItem(
    String id,
    String email,
    String name,
    String role,
    Long solvedCount,
    Long submissionCount,
    OffsetDateTime createdAt
) {
}

