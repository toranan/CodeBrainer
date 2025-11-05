package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.Problem;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ProblemListResponse {
    private Long id;
    private String title;
    private Integer level;
    private List<String> algorithm = new ArrayList<>();

    public ProblemListResponse(Problem problem) {
        this.id = problem.getId();
        this.title = problem.getTitle();
        this.level = problem.getLevel();
        this.algorithm = problem.getAlgorithm() != null ? problem.getAlgorithm() : new ArrayList<>();
    }
}

