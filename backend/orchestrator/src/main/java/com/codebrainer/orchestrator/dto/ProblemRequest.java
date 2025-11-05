package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.Problem;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ProblemRequest {
    @NotBlank(message = "문제는 ID가 필수입니다")
    private Long id;

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @NotBlank(message = "level은 필수입니다")
    private Integer level;

    @NotBlank(message = "time_ms는 필수입니다")
    private Integer timeMs;

    @NotBlank(message = "mem_mb는 필수입니다")
    private Integer memMb;

    @NotBlank(message = "algorithm은  필수입니다")
    private List<String> algorithm = new ArrayList<>();

    private List<String> languages = new ArrayList<>();

    private String textPath;

    private String inputFormat;

    private String outputFormat;
}