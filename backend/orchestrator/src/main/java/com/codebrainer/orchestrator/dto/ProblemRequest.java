package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.fasterxml.jackson.databind.JsonNode;
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
    private JsonNode categories;
    private String inputFormat;
    private String outputFormat;
    private String statementPath;
}