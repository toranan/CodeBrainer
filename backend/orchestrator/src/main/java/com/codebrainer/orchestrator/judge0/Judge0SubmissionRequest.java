package com.codebrainer.orchestrator.judge0;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record Judge0SubmissionRequest(
        String source_code,
        Integer language_id,
        String stdin,
        String expected_output,
        Double cpu_time_limit,
        Integer memory_limit
) {
}

