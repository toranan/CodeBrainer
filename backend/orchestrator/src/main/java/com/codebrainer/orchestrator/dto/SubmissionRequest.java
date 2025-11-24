package com.codebrainer.orchestrator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmissionRequest(
        @NotBlank(message = "userId는 필수입니다.") String userId,
        @NotNull(message = "problemId는 필수입니다.") Long problemId,
        @NotBlank(message = "langId는 필수입니다.") String langId,
        @NotBlank(message = "code는 필수입니다.") String code,
        Integer hintUsageCount // 힌트 사용량 (선택적)
) {
    public SubmissionRequest {
        // hintUsageCount가 null이면 0으로 설정
        if (hintUsageCount == null) {
            hintUsageCount = 0;
        }
    }
}

