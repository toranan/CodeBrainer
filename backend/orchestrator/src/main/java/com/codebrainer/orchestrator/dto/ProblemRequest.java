package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.Problem;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemRequest {
    private Long id;
    private String title;
    private String tier;
    private Integer timeMs;
    private Integer memMb;
    private List<String> categories;
    private String inputFormat;
    private String outputFormat;
    private String statement;
    private String constraints;
    private List<String> languages;
}
