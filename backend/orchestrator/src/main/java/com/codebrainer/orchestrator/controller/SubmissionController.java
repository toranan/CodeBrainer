package com.codebrainer.orchestrator.controller;

import com.codebrainer.orchestrator.domain.Submission;
import com.codebrainer.orchestrator.domain.SubmissionResult;
import com.codebrainer.orchestrator.dto.SubmissionRequest;
import com.codebrainer.orchestrator.dto.SubmissionResponse;
import com.codebrainer.orchestrator.service.SubmissionService;
import com.codebrainer.orchestrator.repository.SubmissionResultRepository;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionResultRepository submissionResultRepository;

    public SubmissionController(
            SubmissionService submissionService,
            SubmissionResultRepository submissionResultRepository
    ) {
        this.submissionService = submissionService;
        this.submissionResultRepository = submissionResultRepository;
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> create(
            @RequestBody @Valid SubmissionRequest request
    ) throws IOException {
        // TODO: 실제 사용자 인증 연동 후 userId 결정
        Long mockUserId = 1L;
        SubmissionResponse response = submissionService.createSubmission(mockUserId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{submissionId}")
        public ResponseEntity<Map<String, Object>> getSubmission(@PathVariable("submissionId") Long submissionId) {
        Submission submission = submissionService.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("제출을 찾을 수 없습니다."));

        SubmissionResult result = submissionResultRepository.findBySubmission(submission)
                .orElse(null);

        return ResponseEntity.ok(Map.of(
                "submissionId", submission.getId(),
                "status", submission.getStatus().name(),
                "result", result != null ? Map.of(
                        "compile", Map.of(
                                "ok", result.getCompileOk(),
                                "message", result.getCompileMessage()
                        ),
                        "summary", result.getSummaryJson(),
                        "tests", result.getTestsJson()
                ) : null
        ));
    }
}

