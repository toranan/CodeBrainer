package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "testcases")
public class Testcase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "case_no", nullable = false)
    private Integer caseNo;

    @Column(name = "in_path", nullable = false)
    private String inputPath;

    @Column(name = "out_path", nullable = false)
    private String outputPath;

    @Column(name = "is_hidden", nullable = false)
    private Boolean hidden;

    @Column(columnDefinition = "text")
    private String explanation;

    @Builder
    public Testcase(Problem problem, Integer caseNo, String inputPath, String outputPath) {
        this.problem = problem;
        this.caseNo = caseNo;
        this.inputPath = inputPath;
        this.outputPath = outputPath;
        this.is_hidden = false;
        this.explanation = "";
    }
}

