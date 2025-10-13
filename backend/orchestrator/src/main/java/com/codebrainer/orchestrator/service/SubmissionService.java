package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.Submission;
import com.codebrainer.orchestrator.dto.SubmissionRequest;
import com.codebrainer.orchestrator.dto.SubmissionResponse;
import com.codebrainer.orchestrator.queue.SubmissionPublisher;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.SubmissionRepository;
import com.codebrainer.orchestrator.storage.StorageClient;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class SubmissionService {

    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final StorageClient storageClient;
    private final SubmissionPublisher submissionPublisher;

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
    public SubmissionResponse createSubmission(Long userId, SubmissionRequest request) throws IOException {
        Problem problem = problemRepository.findById(request.problemId())
                .orElseThrow(() -> new IllegalArgumentException("문제를 찾을 수 없습니다."));

        Submission submission = new Submission();
        submission.setUserId(userId);
        submission.setProblem(problem);
        submission.setLanguageId(request.langId());
        submission.setStatus(Submission.Status.QUEUED);
        submission.setCreatedAt(OffsetDateTime.now());
        submission.setUpdatedAt(OffsetDateTime.now());

        Submission saved = submissionRepository.save(submission);

        String codePath = buildCodePath(saved.getId());
        storageClient.saveString(codePath, request.code());

        saved.setCodePath(codePath);
        submissionRepository.save(saved);

        submissionPublisher.publishSubmission(saved.getId());

        return new SubmissionResponse(saved.getId(), saved.getStatus().name());
    }

    public Optional<Submission> findById(Long submissionId) {
        return submissionRepository.findById(submissionId);
    }

    private String buildCodePath(Long submissionId) {
        return "submissions/" + submissionId + "/Main.txt";
    }
}

