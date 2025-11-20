package com.codebrainer.orchestrator.repository;

import com.codebrainer.orchestrator.domain.Problem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    Optional<Problem> findById(Long id);

    List<Problem> findAllByOrderByCreatedAtDesc();
}