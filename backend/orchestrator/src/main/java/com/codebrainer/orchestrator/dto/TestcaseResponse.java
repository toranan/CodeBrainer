package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.Problem;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class TestcaseResponse {
    private Long id;
    private Problem problem;
    private String in;
    private String out;
    private Boolean hidden;
    private String explanation;

    public TestcaseResponse(Problem problem, Long id, String in, String out, String explanation) {
        this.id = id;
        this.problem = problem.getProblem();
        this.in = in;
        this.out = out;
        this.hidden = true;
        this.explanation = explanation;
    }
}

