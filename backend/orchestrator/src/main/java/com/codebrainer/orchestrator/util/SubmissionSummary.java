package com.codebrainer.orchestrator.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

public record SubmissionSummary(
        boolean compileOk,
        String compileMessage,
        Map<String, Integer> summary,
        int totalTimeMs,
        int peakMemoryKb
) {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public String toJson() {
        try {
            // Determine overall verdict
            String verdict = determineVerdict();

            return MAPPER.writeValueAsString(Map.of(
                    "verdict", verdict,
                    "compile", Map.of(
                            "ok", compileOk,
                            "message", compileMessage != null ? compileMessage : ""
                    ),
                    "summary", Map.of(
                            "AC", summary.getOrDefault("AC", 0),
                            "WA", summary.getOrDefault("WA", 0),
                            "TLE", summary.getOrDefault("TLE", 0),
                            "MLE", summary.getOrDefault("MLE", 0),
                            "RE", summary.getOrDefault("RE", 0),
                            "CE", summary.getOrDefault("CE", 0),
                            "timeMs", totalTimeMs,
                            "memoryKb", peakMemoryKb
                    )
            ));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("요약 정보를 직렬화할 수 없습니다.", e);
        }
    }

    private String determineVerdict() {
        // If compilation failed, verdict is CE
        if (!compileOk) {
            return "CE";
        }

        // Check for errors in priority order
        if (summary.getOrDefault("CE", 0) > 0) return "CE";
        if (summary.getOrDefault("RE", 0) > 0) return "RE";
        if (summary.getOrDefault("TLE", 0) > 0) return "TLE";
        if (summary.getOrDefault("MLE", 0) > 0) return "MLE";
        if (summary.getOrDefault("WA", 0) > 0) return "WA";

        // If all tests passed, verdict is AC
        int acCount = summary.getOrDefault("AC", 0);
        int totalTests = summary.values().stream().mapToInt(Integer::intValue).sum();

        if (acCount > 0 && acCount == totalTests) {
            return "AC";
        }

        return "PENDING";
    }

    public String testsToJson(List<Map<String, Object>> tests) {
        try {
            return MAPPER.writeValueAsString(tests);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("테스트 결과를 직렬화할 수 없습니다.", e);
        }
    }
}

