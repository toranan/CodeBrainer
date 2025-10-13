package com.codebrainer.orchestrator.judge0;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Judge0Status {
    IN_QUEUE(1),
    PROCESSING(2),
    ACCEPTED(3),
    WRONG_ANSWER(4),
    TIME_LIMIT_EXCEEDED(5),
    COMPILATION_ERROR(6),
    RUNTIME_ERROR(7),
    MEMORY_LIMIT_EXCEEDED(8),
    INTERNAL_ERROR(13);

    private final int id;

    Judge0Status(int id) {
        this.id = id;
    }

    @JsonValue
    public int getId() {
        return id;
    }

    @JsonCreator
    public static Judge0Status fromId(int id) {
        for (Judge0Status status : values()) {
            if (status.id == id) {
                return status;
            }
        }
        return INTERNAL_ERROR;
    }
}

