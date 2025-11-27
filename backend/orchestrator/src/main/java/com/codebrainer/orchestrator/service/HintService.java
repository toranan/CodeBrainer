package com.codebrainer.orchestrator.service;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.List;

import lombok.RequiredArgsConstructor;

import com.codebrainer.orchestrator.dto.HintResponse;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemHintRepository;
import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.ProblemHint;

@Service
@RequiredArgsConstructor
public class HintService {

    private final ProblemRepository problemRepository;
    private final ProblemHintRepository problemHintRepository;

    private int tierToMaxStage(String tier) {
        return switch (tier) {
            case "BRONZE" -> 1;
            case "SILVER" -> 2;
            case "GOLD" -> 3;
            default -> 4; // PLATINUM
        };
    }

    public int getNextStage(Long problemId) {
        int count = (int)problemHintRepository.countByProblemId(problemId);
        return count + 1;
        }

    @Transactional
    public HintResponse addNextStageHint(Long problemId, String markdown) throws IOException {

        List<ProblemHint> existing =
                problemHintRepository.findAllByProblemIdOrderByStageAsc(problemId);

        int nextStage = existing.size() + 1;

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("문제 없음 id=" + problemId));

        int maxStage = tierToMaxStage(problem.getTier());

        if (nextStage > maxStage) {
            throw new IllegalStateException(
                    "힌트는 최대 " + maxStage + "개(tier)만 저장할 수 있습니다."
            );
        }

        String basePath = System.getenv("STORAGE_BASE_PATH");
        if (basePath == null || basePath.isBlank()) {
            throw new IllegalStateException("STORAGE_BASE_PATH 환경변수가 설정되어 있지 않습니다.");
        }
        
        String relativePath = "problems/problem-" + problemId + "/hints/" + nextStage + ".md";

        Path file = Path.of(basePath, relativePath);
        Files.createDirectories(file.getParent());
        Files.writeString(file, markdown);

        ProblemHint hint = ProblemHint.builder()
                .problemId(problemId)
                .tier(problem.getTier())
                .stage((short) nextStage)
                .title(null)
                .lang("ko")
                .version(1)
                .source(null)
                .reviewerId(null)
                .waitSeconds(1)
                .isActive(true)
                .contentPath(relativePath)
                .createdAt(null)
                .updatedAt(null)
                .build();


        problemHintRepository.save(hint);

        return new HintResponse(
                hint.getId(),
                problem.getTier(),
                nextStage,
                problem.getTimeMs(),
                problem.getMemMb(),
                problem.getCategories(),
                relativePath,
                problem.getConstraints(),
                problem.getInputFormat(),
                problem.getOutputFormat()
        );
    }
}
