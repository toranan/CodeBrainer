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
        // Prisma User 테이블의 UUID (String) 형식으로 변경됨
        String mockUserId = "mock-user-id-temp"; // 임시 값, 실제 인증 연동 시 세션에서 가져와야 함
        SubmissionResponse response = submissionService.createSubmission(mockUserId, request);
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

