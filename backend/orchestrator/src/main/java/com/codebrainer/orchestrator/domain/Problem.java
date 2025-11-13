package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.fasterxml.jackson.databind.JsonNode;

@Entity
@Table(name = "problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String slug;

    private String tier;

    private Integer level;

    @Column(name = "time_ms")
    private Integer timeMs;

    @Column(name = "mem_mb")
    private Integer memMb;

    @Column(name = "statement_path")
    private String statementPath;

    @Column(columnDefinition = "jsonb")
    private JsonNode categories;

    @Column(columnDefinition = "jsonb")
    private JsonNode languages;

    @Column(columnDefinition = "text")
    private String constraints;

    @Column(name = "input_format", columnDefinition = "text")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "text")
    private String outputFormat;

    private String visibility;

    private Integer version;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;
}
