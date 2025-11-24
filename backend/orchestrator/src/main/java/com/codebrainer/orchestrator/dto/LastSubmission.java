package com.codebrainer.orchestrator.dto;

import java.time.OffsetDateTime;

/**
 * 마지막 제출 정보 DTO
 */
public record LastSubmission(
        Long submissionId,
        String status,
        String lang,
        OffsetDateTime createdAt,
        Integer hintUsageCount // 힌트 사용량
) {
}

