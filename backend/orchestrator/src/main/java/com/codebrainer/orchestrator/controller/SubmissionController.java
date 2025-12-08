package com.codebrainer.orchestrator.controller;

import com.codebrainer.orchestrator.domain.Submission;
import com.codebrainer.orchestrator.domain.SubmissionResult;
import com.codebrainer.orchestrator.storage.StorageClient;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private static final Logger logger = LoggerFactory.getLogger(SubmissionController.class);

    private final SubmissionService submissionService;
    private final SubmissionResultRepository submissionResultRepository;
    private final StorageClient storageClient;

    public SubmissionController(
            SubmissionService submissionService,
            SubmissionResultRepository submissionResultRepository,
            StorageClient storageClient
    ) {
        this.submissionService = submissionService;
        this.submissionResultRepository = submissionResultRepository;
        this.storageClient = storageClient;
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> create(
            @RequestBody @Valid SubmissionRequest request
    ) throws IOException {
        SubmissionResponse response = submissionService.createSubmission(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<Map<String, Object>> getSubmission(@PathVariable("submissionId") Long submissionId) {
        Submission submission = submissionService.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("제출을 찾을 수 없습니다."));

        SubmissionResult result = submissionResultRepository.findBySubmission(submission)
                .orElse(null);

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("submissionId", submission.getId());
        response.put("status", submission.getStatus().name());
        response.put("userId", submission.getUserId());
        response.put("language", submission.getLanguageId());

        // 코드 내용을 스토리지에서 읽어와서 포함
        try {
            String code = storageClient.readString(submission.getCodePath());
            response.put("code", code);
        } catch (Exception e) {
            logger.error("Failed to read code from storage for submission {}: {}", submissionId, e.getMessage());
            response.put("code", null);
        }

        if (result != null) {
            Map<String, Object> compile = new java.util.HashMap<>();
            compile.put("ok", result.getCompileOk());
            compile.put("message", result.getCompileMessage() != null ? result.getCompileMessage() : "");

            Map<String, Object> resultData = new java.util.HashMap<>();
            resultData.put("compile", compile);
            resultData.put("summary", result.getSummaryJson());
            resultData.put("tests", result.getTestsJson());

            response.put("result", resultData);
        } else {
            response.put("result", null);
        }

        return ResponseEntity.ok(response);
    }
}

