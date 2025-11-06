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

    // id랑 동일 역할
    // @Column(name = "case_no", nullable = false)
    // private Integer caseNo;

    @Column(name = "in", nullable = false)
    private String in;

    @Column(name = "out", nullable = false)
    private String out;

    @Column(name = "is_hidden", nullable = false)
    private Boolean hidden;

    @Column(name = "explanation", columnDefinition = "text")
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

