package com.codebrainer.orchestrator.util;

import com.codebrainer.orchestrator.judge0.Judge0Status;
import com.codebrainer.orchestrator.judge0.Judge0SubmissionResult;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class SummaryAggregator {

    public SubmissionSummary aggregate(List<Judge0SubmissionResult> results) {
        Map<String, Integer> summary = new HashMap<>();
        boolean compileOk = true;
        String compileMessage = null;
        int totalTimeMs = 0;
        int peakMemoryKb = 0;

        for (Judge0SubmissionResult result : results) {
            String verdict = mapStatus(result.status());
            summary.merge(verdict, 1, Integer::sum);

            totalTimeMs += (int) Math.round(result.time() != null ? result.time() * 1000 : 0);
            peakMemoryKb = Math.max(peakMemoryKb, result.memory() != null ? result.memory() : 0);

            if (result.status() == Judge0Status.COMPILATION_ERROR) {
                compileOk = false;
                compileMessage = result.compile_output();
            }
        }

        return new SubmissionSummary(compileOk, compileMessage, summary, totalTimeMs, peakMemoryKb);
    }

    private String mapStatus(Judge0Status status) {
        return switch (status) {
            case ACCEPTED -> "AC";
            case WRONG_ANSWER -> "WA";
            case TIME_LIMIT_EXCEEDED -> "TLE";
            case MEMORY_LIMIT_EXCEEDED -> "MLE";
            case COMPILATION_ERROR -> "CE";
            case RUNTIME_ERROR -> "RE";
            case INTERNAL_ERROR -> "ERR";
            default -> "PENDING";
        };
    }
}

