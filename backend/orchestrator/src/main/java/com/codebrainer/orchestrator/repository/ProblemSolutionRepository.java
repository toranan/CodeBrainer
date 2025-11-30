package com.codebrainer.orchestrator.repository;

import com.codebrainer.orchestrator.domain.ProblemSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemSolutionRepository extends JpaRepository<ProblemSolution, Long> {
    
    /**
     * 문제 ID와 언어로 정답 코드를 조회합니다.
     */
    Optional<ProblemSolution> findByProblemIdAndLanguage(Long problemId, String language);
    
    /**
     * 문제 ID로 첫 번째 정답 코드를 조회합니다 (언어 무관).
     */
    Optional<ProblemSolution> findFirstByProblemId(Long problemId);
}

