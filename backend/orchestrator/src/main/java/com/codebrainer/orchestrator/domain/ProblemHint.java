package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;
import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.dto.HintRequest;
import com.codebrainer.orchestrator.service.HintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import com.codebrainer.orchestrator.domain.Problem;
import java.time.OffsetDateTime;

@Entity
@Table(name = "problem_hints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemHint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "problem_id", nullable = false)
    private Long problemId;

    private String tier;
    private Short stage;
    private String title;

    @Column(name = "content_md", columnDefinition = "text")
    private String contentPath;

    private String lang;

    @Column(name = "is_active")
    private Boolean isActive;

    private Integer version;
    private String source;

    @Column(name = "reviewer_id")
    private Long reviewerId;

    @Column(name = "wait_seconds")
    private Integer waitSeconds;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
