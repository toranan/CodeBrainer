package com.codebrainer.orchestrator.judge0;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Judge0SubmissionResult(
        String token,
        @JsonProperty("status") Judge0Status status,
        Double time,
        Integer memory,
        String stdout,
        String stderr,
        @JsonProperty("compile_output") String compile_output,
        String message
) {
    // Judge0 API는 status를 객체 { "id": 3, "description": "..." } 또는 숫자로 반환할 수 있음
    // Judge0StatusDeserializer가 두 형식을 모두 처리함
}

