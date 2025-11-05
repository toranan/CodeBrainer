package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.ArrayList;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // @Column(nullable = false, unique = true, length = 128)
    // private String slug;

    // @Column(nullable = false)
    // private String tier;

    @Column(nullable = false)
    private Integer level;

    @Column(name = "time_ms", nullable = false)
    private Integer timeMs;

    @Column(name = "mem_mb", nullable = false)
    private Integer memMb;

    @Column(name = "algorithm", columnDefinition = "jsonb")
    private List<String> algorithm = new ArrayList<>();

    @Column(name = "languages", columnDefinition = "jsonb")
    private List<String> languages = new ArrayList<>();

    @Column(name = "text_path")
    private String textPath;

    @Column(name = "input_format", columnDefinition = "text")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "text")
    private String outputFormat;

    @Builder
    public Problem(Long id, String title, Integer level, Integer timeMs, Integer memMb, List<String> algorithm, List<String> languages, String textPath) {
        this.id = id;
        this.title = title;
        this.level = level;
        this.timeMs = timeMs;
        this.memMb = memMb;
        this.algorithm = algorithm;
        this.languages = languages;
        this.textPath = textPath;
        this.inputFormat = "";
        this.outputFormat = "";
    }
}

