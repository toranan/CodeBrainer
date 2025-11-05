package com.codebrainer.orchestrator.judge0;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record Judge0BatchRequest(
        @JsonProperty("submissions") List<Judge0SubmissionRequest> submissions
) {
}

