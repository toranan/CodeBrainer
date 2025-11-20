package com.codebrainer.orchestrator.service;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.List;

import lombok.RequiredArgsConstructor;

import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemHintRepository;
import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.ProblemHint;

@Service
@RequiredArgsConstructor
public class HintService {

    private final ProblemRepository problemRepository;
    private final ProblemHintRepository problemHintRepository;

    @Transactional
    public ProblemHint addNextStageHint(Long problemId, String markdown) throws IOException {

        List<ProblemHint> existing =
                problemHintRepository.findAllByProblemIdOrderByStageAsc(problemId);

        int nextStage = existing.size() + 1;

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("문제 없음 id=" + problemId));

        int maxStage = Integer.parseInt(problem.getTier());

        if (nextStage > maxStage) {
            throw new IllegalStateException(
                    "힌트는 최대 " + maxStage + "개(tier)만 저장할 수 있습니다."
            );
        }

        ProblemHint hint = ProblemHint.builder()
                .problemId(problemId)
                .stage((short) nextStage)
                .title(null)
                .lang(null)
                .version(null)
                .source(null)
                .reviewerId(null)
                .waitSeconds(5)
                .isActive(true)
                .createdAt(null)
                .updatedAt(null)
                .build();

        problemHintRepository.save(hint);

        String basePath = System.getenv("STORAGE_BASE_PATH");
        Path file = Path.of(
                basePath, "problems",
                problemId.toString(),
                "hints",
                hint.getId() + ".md"
        );

        Files.createDirectories(file.getParent());
        Files.writeString(file, markdown);

        hint.setContentPath(file.toString());

        return problemHintRepository.save(hint);
    }
}
