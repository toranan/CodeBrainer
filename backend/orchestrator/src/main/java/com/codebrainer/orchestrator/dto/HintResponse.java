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
    private Long problemId;
    private List<String> hints = new ArrayList<>();

    public HintResponse(Hint hint) {
        this.problemId = hint.getId();
        this.hints = hint.getHints() != null ? hint.getHints() : new ArrayList<>();
    }
}

