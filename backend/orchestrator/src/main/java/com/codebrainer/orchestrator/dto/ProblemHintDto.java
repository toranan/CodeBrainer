package com.codebrainer.orchestrator.dto;

public record ProblemHintDto(
        Short stage,
        String title,
        String contentMd,
        Integer waitSeconds
) {
}

