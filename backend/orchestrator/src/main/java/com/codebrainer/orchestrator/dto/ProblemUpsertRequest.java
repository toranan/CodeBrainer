package com.codebrainer.orchestrator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ProblemUpsertRequest(
        @NotBlank String title,
        @NotBlank String slug,
        @NotBlank String tier,
        @NotNull Integer level,
        @NotNull Integer timeMs,
        @NotNull Integer memMb,
        @NotBlank String visibility,
        @NotNull Integer version,
        @NotEmpty List<String> categories,
        @NotEmpty List<String> languages,
        String constraints,
        String inputFormat,
        String outputFormat,
        @NotBlank String statement,
        List<ProblemTestDto> tests,
        List<ProblemHintDto> hints
) {
}

