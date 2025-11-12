package com.codebrainer.orchestrator.repository;

import com.codebrainer.orchestrator.domain.CodeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodeReviewRepository extends JpaRepository<CodeReview, Long> {

    Optional<CodeReview> findBySubmissionId(Long submissionId);

    boolean existsBySubmissionId(Long submissionId);
}
