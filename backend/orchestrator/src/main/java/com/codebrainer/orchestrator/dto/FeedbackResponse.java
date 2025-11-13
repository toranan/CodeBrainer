package com.codebrainer.orchestrator.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.*;
import com.codebrainer.orchestrator.domain.Problem;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class FeedbackResponse {
    private Long submissionId;
    private String advice;

    public FeedbackResponse(Feedback feedback) {
        this.submissionId = feedback.getSubmissionId();
        this.advice = feedback.getAdvice();
    }
}