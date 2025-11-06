package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "feedbacks")
public class Feedback {
    @Id
    @Column(name = "submission_id")
    private Long submissionId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId   // PK를 FK로 사용한다는 의미
    @JoinColumn(name = "submission_id")
    private Submission submission;

    @Column(name = "advice", nullable = false, columnDefinition = "TEXT")
    private String advice;
}
