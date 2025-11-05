package com.codebrainer.orchestrator.dto;

public record ProblemTestcaseResponse(
        Long id,
        Integer caseNo,
        String input,
        String output,
        Boolean hidden,
        String explanation
) {
}

