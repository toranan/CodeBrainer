package com.codebrainer.orchestrator.repository;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.ProblemTest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemTestRepository extends JpaRepository<ProblemTest, Long> {

    List<ProblemTest> findAllByProblemOrderByCaseNo(Problem problem);

    void deleteByProblem(Problem problem);
}

