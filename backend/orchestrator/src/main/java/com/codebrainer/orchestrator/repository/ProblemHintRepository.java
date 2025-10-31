package com.codebrainer.orchestrator.repository;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.ProblemHint;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemHintRepository extends JpaRepository<ProblemHint, Long> {

    List<ProblemHint> findAllByProblemOrderByStageAsc(Problem problem);

    void deleteByProblem(Problem problem);
}

