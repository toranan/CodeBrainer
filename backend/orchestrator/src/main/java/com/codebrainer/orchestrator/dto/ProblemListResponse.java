package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.codebrainer.orchestrator.domain.Problem;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ProblemListResponse {
    private Long id;
    private String title;
    private String tier;
    private JsonNode categories;
    private String statementPath;
}
