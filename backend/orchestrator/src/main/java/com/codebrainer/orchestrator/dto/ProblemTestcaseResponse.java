package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.Problem;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ProblemTestcaseResponse {
    private Long problemId;
    private String inputPath;
    private String outputPath;
    private Boolean isHidden;
    private String explanation;
    private Integer caseNo;

    public ProblemTestcaseResponse(Long problemId, Integer caseNo, String inputPath, String outputPath, String explanation) {
        this.problemId = problemId;
        this.caseNo = caseNo;
        this.inputPath = inputPath;
        this.outputPath = outputPath;
        this.isHidden = false;
        this.explanation = explanation;
    }
}

