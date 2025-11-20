package com.codebrainer.orchestrator.dto;

import com.codebrainer.orchestrator.domain.ProblemHint;
import com.codebrainer.orchestrator.domain.ProblemTest;

public record ProblemTestDto(
        Integer caseNo,
        String input,
        String output,
        Boolean isHidden,
        String explanation
) {
    public static ProblemTestDto fromEntity(ProblemTest test) {
        return new ProblemTestDto(
                test.getCaseNo(),
                test.getInputPath(),
                test.getOutputPath(),
                test.getIsHidden(),
                test.getExplanation()
        );
    }
}