package com.codebrainer.orchestrator.util;

import org.springframework.stereotype.Component;

@Component
public class DiffUtil {

    public DiffResult diff(String expected, String actual) {
        if (expected.equals(actual)) {
            return new DiffResult(expected, actual, "정답과 출력이 일치합니다.");
        }

        String message = "expected: " + expected + "\nactual: " + actual;
        return new DiffResult(expected, actual, message);
    }
}

