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
    private String tier;
    private List<String> categories;
    private String statementPath;
}
