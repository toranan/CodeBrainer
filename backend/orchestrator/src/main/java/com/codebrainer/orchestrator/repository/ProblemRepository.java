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

    // is_visible = true인 문제만 조회
    List<Problem> findAllByIsVisibleTrueOrderByCreatedAtDesc();

    // slug로 조회하되 is_visible = true인 것만
    Optional<Problem> findBySlugAndIsVisibleTrue(String slug);
}

