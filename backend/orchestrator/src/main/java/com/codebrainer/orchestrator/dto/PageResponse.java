package com.codebrainer.orchestrator.dto;

import java.util.List;

/**
 * 페이지네이션 응답 DTO
 */
public record PageResponse<T>(
        List<T> content,
        Integer page,
        Integer size,
        Long totalElements,
        Integer totalPages
) {
}

