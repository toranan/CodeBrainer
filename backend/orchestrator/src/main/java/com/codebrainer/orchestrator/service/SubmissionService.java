package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.Submission;
import com.codebrainer.orchestrator.dto.SubmissionRequest;
import com.codebrainer.orchestrator.dto.SubmissionResponse;
import com.codebrainer.orchestrator.queue.SubmissionPublisher;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.SubmissionRepository;
import com.codebrainer.orchestrator.storage.StorageClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class SubmissionService {

    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final StorageClient storageClient;
    private final SubmissionPublisher submissionPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SubmissionService(
            ProblemRepository problemRepository,
            SubmissionRepository submissionRepository,
            StorageClient storageClient,
            SubmissionPublisher submissionPublisher
    ) {
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
        this.storageClient = storageClient;
        this.submissionPublisher = submissionPublisher;
    }

    @Transactional
    public SubmissionResponse createSubmission(SubmissionRequest request) throws IOException {
        Problem problem = problemRepository.findById(request.problemId())
                .orElseThrow(() -> new IllegalArgumentException("문제를 찾을 수 없습니다."));

        Submission submission = new Submission();
        submission.setUserId(request.userId());
        submission.setProblem(problem);
        submission.setLanguageId(request.langId());
        submission.setStatus(Submission.Status.QUEUED);
        submission.setCreatedAt(OffsetDateTime.now());
        submission.setUpdatedAt(OffsetDateTime.now());
        submission.setHintUsageCount(request.hintUsageCount() != null ? request.hintUsageCount() : 0);
        // 임시 code_path 설정 (NOT NULL 제약조건을 만족하기 위해)
        submission.setCodePath("temp/path");

        // 먼저 저장하여 ID 생성
        Submission saved = submissionRepository.save(submission);

        // ID를 얻은 후 실제 code_path 생성 및 설정
        String codePath = buildCodePath(saved.getId());
        saved.setCodePath(codePath);
        
        // 코드를 스토리지에 저장
        storageClient.saveString(codePath, request.code());

        // 제출 메타데이터 저장 (예: 힌트 사용량)
        saveSubmissionMetadata(saved.getId(), Map.of(
                "hintUsageCount", submission.getHintUsageCount() != null ? submission.getHintUsageCount() : 0
        ));

        // code_path를 포함하여 다시 저장
        saved = submissionRepository.save(saved);

        submissionPublisher.publishSubmission(saved.getId());

        return new SubmissionResponse(saved.getId(), saved.getStatus().name());
    }

    public Optional<Submission> findById(Long submissionId) {
        return submissionRepository.findById(submissionId);
    }

    private String buildCodePath(Long submissionId) {
        return "submissions/" + submissionId + "/Main.txt";
    }

    private String buildMetaPath(Long submissionId) {
        return "submissions/" + submissionId + "/meta.json";
    }

    private void saveSubmissionMetadata(Long submissionId, Map<String, Object> metadata) throws IOException {
        String metaPath = buildMetaPath(submissionId);
        String json = objectMapper.writeValueAsString(metadata);
        storageClient.saveString(metaPath, json);
    }
}

