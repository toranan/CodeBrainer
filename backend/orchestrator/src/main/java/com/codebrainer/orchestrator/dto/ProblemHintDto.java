package com.codebrainer.orchestrator.dto;

import com.codebrainer.orchestrator.domain.ProblemHint;
import com.codebrainer.orchestrator.domain.ProblemTest;

public record ProblemHintDto(
        Short stage,
        String title,
        String contentMd,
        Integer waitSeconds
)  {
    public static ProblemHintDto fromEntity(ProblemHint hint) {
        return new ProblemHintDto(
                hint.getStage(),
                hint.getTitle(),
                hint.getContentPath(),
                hint.getWaitSeconds()
        );
    }
}