package com.codebrainer.orchestrator.repository;

import com.codebrainer.orchestrator.domain.Submission;
import com.codebrainer.orchestrator.domain.SubmissionResult;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionResultRepository extends JpaRepository<SubmissionResult, Long> {

    Optional<SubmissionResult> findBySubmission(Submission submission);
}

