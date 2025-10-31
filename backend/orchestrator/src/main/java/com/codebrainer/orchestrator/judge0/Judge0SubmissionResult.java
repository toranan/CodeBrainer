package com.codebrainer.orchestrator.judge0;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Judge0SubmissionResult(
        String token,
        Judge0Status status,
        Double time,
        Integer memory,
        String stdout,
        String stderr,
        String compile_output,
        String message
) {
}

