package com.codebrainer.orchestrator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmissionRequest(
        @NotNull(message = "problemId는 필수입니다.") Long problemId,
        @NotBlank(message = "langId는 필수입니다.") String langId,
        @NotBlank(message = "code는 필수입니다.") String code
) {
}

