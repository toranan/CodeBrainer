package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.Hint;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class HintResponse {
    private Long id;
    private Long problemId;
    private Short stage;
    private String contents;
}

