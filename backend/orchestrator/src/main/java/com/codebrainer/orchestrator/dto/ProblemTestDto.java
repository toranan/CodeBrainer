package com.codebrainer.orchestrator.dto;

public record ProblemTestDto(
        Integer caseNo,
        String input,
        String output,
        Boolean hidden,
        String explanation
) {
}

