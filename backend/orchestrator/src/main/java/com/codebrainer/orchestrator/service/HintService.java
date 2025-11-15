package com.codebrainer.orchestrator.service;

import lombok.*;

@Service
@RequiredArgsConstructor
public class HintService {

    private final ProblemHintRepository problemHintRepository;

    /**
     * stage를 자동 증가(1~4)
     */
    @Transactional
    public ProblemHint addNextStageHint(Long problemId, String markdown) throws IOException {

        // 현재 저장된 힌트 불러오기
        List<ProblemHint> existing = problemHintRepository
                .findAllByProblemIdOrderByStageAsc(problemId);

        int nextStage = existing.size() + 1;
        if (nextStage > 4) {
            throw new IllegalStateException("힌트는 최대 4개만 저장할 수 있습니다.");
        }

        // 엔티티 생성
        ProblemHint hint = ProblemHint.builder()
                .problemId(problemId)
                .stage((short) nextStage)
                .title(null)              // 의도대로 null 처리
                .waitSeconds(0)
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .build();

        // 1차 저장 → id 생성
        problemHintRepository.save(hint);

        // 파일 저장
        String basePath = System.getenv("STORAGE_BASE_PATH");
        Path file = Path.of(basePath,
                "problems",
                problemId.toString(),
                "hints",
                hint.getId() + ".md");

        Files.createDirectories(file.getParent());
        Files.writeString(file, markdown);

        // 파일 경로 DB 저장
        hint.setContentPath(file.toString());
        hint.setUpdatedAt(OffsetDateTime.now());

        return problemHintRepository.save(hint);
    }

    /**
     * 파이썬 스크립트 실행
     */
    public void runHintScript(Long problemId) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                "python", "data/make_hints.py", problemId.toString()
        );
        pb.redirectErrorStream(true);
        pb.directory(new File("."));

        Process process = pb.start();
        int exit = process.waitFor();

        if (exit != 0) {
            throw new IllegalStateException("make_hints.py 실행 실패: exit=" + exit);
        }
    }
}

@Transactional
public Problem toEntity(ProblemRequest req) {
    return Problem.builder()
            .id(req.getId())
            .title(null)   // 의도대로 null 처리
            .tier(req.getTier())
            .build();
}
