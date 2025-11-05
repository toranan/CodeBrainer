package com.codebrainer.orchestrator.dto;

import java.time.OffsetDateTime;

/**
 * 마지막 제출 정보 DTO
 */
public record LastSubmission(
        String status,
        String lang,
        OffsetDateTime createdAt
) {
}

