package com.codebrainer.orchestrator.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.Problem;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ProblemResponse {
    private Long id;
    private String title;
    private Integer level;
    private Integer timeMs;
    private Integer memMb;
    private List<String> algorithm = new ArrayList<>();
    private List<String> languages = new ArrayList<>();
    private String textPath;
    private String inputFormat;
    private String outputFormat;

    public ProblemResponse(Problem problem) {
        this.id = problem.getId();
        this.title = problem.getTitle();
        this.level = problem.getLevel();
        this.timeMs = problem.getTimeMs();
        this.memMb = problem.getMemMb();
        this.algorithm = problem.getAlgorithm() != null ? problem.getAlgorithm() : new ArrayList<>();
        this.languages = problem.getLanguages() != null ? problem.getLanguages() : new ArrayList<>();
        this.textPath = problem.getTextPath();
        this.inputFormat = problem.getInputFormat();
        this.outputFormat = problem.getOutputFormat();
    }
}

