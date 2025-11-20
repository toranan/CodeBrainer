package com.codebrainer.orchestrator.dto;

import lombok.*;
import java.util.List;
import java.util.ArrayList;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemResponse {
    private Long id;
    private String title;
    private String tier;
    private Integer timeMs;
    private Integer memMb;
    private List<String> languages;
    private List<String> categories;
    private String constraints;
    private String inputFormat;
    private String outputFormat;
    private String statementPath;
    private Boolean visibility;
    private Integer version;
    private List<ProblemHintDto> hints;
    private List<ProblemTestcaseResponse> testcases;
    private List<ProblemTestcaseResponse> samples;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
