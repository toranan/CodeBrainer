package com.codebrainer.orchestrator.repository;

import com.codebrainer.orchestrator.domain.Problem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    Optional<Problem> findBySlug(String slug);

    List<Problem> findAllByOrderByCreatedAtDesc();
}

