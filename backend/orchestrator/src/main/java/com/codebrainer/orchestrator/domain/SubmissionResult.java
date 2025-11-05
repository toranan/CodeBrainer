package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "submission_results")
public class SubmissionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Column(name = "compile_ok", nullable = false)
    private Boolean compileOk;

    @Column(name = "compile_msg")
    private String compileMessage;

    @Column(name = "summary_json", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private String summaryJson;

    @Column(name = "tests_json", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private String testsJson;

    // public Long getId() {
    //     return id;
    // }

    // public Submission getSubmission() {
    //     return submission;
    // }

    // public void setSubmission(Submission submission) {
    //     this.submission = submission;
    // }

    // public Boolean getCompileOk() {
    //     return compileOk;
    // }

    // public void setCompileOk(Boolean compileOk) {
    //     this.compileOk = compileOk;
    // }

    // public String getCompileMessage() {
    //     return compileMessage;
    // }

    // public void setCompileMessage(String compileMessage) {
    //     this.compileMessage = compileMessage;
    // }

    // public String getSummaryJson() {
    //     return summaryJson;
    // }

    // public void setSummaryJson(String summaryJson) {
    //     this.summaryJson = summaryJson;
    // }

    // public String getTestsJson() {
    //     return testsJson;
    // }

    // public void setTestsJson(String testsJson) {
    //     this.testsJson = testsJson;
    // }
}

