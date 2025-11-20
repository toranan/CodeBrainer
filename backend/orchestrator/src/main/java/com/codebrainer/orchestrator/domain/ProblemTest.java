package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "problem_tests")
public class ProblemTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "problem_id", nullable = false)
    private Long problemId;

    // id랑 동일 역할
    @Column(name = "case_no", nullable = false)
    private Integer caseNo;

    @Column(name = "in_path", nullable = false)
    private String inputPath;

    @Column(name = "out_path", nullable = false)
    private String outputPath;

    @Column(name = "is_hidden", nullable = false)
    private Boolean isHidden;

    @Column(name = "explanation", columnDefinition = "text")
    private String explanation;

    @Builder
    public ProblemTest(Long problemId, Integer caseNo, String inputPath, String outputPath) {
        this.problemId = problemId;
        this.caseNo = caseNo;
        this.inputPath = inputPath;
        this.outputPath = outputPath;
        this.isHidden = false;
        this.explanation = "";
    }
}

