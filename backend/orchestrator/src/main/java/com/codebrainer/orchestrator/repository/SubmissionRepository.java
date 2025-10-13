package com.codebrainer.orchestrator.repository;

import com.codebrainer.orchestrator.domain.Submission;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Optional<Submission> findByIdAndUserId(Long id, Long userId);
}

