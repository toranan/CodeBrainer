package com.codebrainer.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 에러 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

    private int status;
    private String message;
    private LocalDateTime timestamp;

    public static ErrorResponse of(int status, String message) {
        return ErrorResponse.builder()
                .status(status)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}

