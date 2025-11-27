package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.ProblemHint;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class HintResponse {
    private Long id;
    private String tier;
    private int stage;
    private int timeMs;
    private int memMb;
    private List<String> categories;
    private String statementPath;
    private String constraints;
    private String inputFormat;
    private String outputFormat;
}

