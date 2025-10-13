package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.ProblemHint;
import com.codebrainer.orchestrator.domain.ProblemTest;
import com.codebrainer.orchestrator.dto.ProblemHintDto;
import com.codebrainer.orchestrator.dto.ProblemTestDto;
import com.codebrainer.orchestrator.repository.ProblemHintRepository;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemTestRepository;
import com.codebrainer.orchestrator.storage.StorageClient;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProblemManagementService {

    private final ProblemRepository problemRepository;
    private final ProblemTestRepository problemTestRepository;
    private final ProblemHintRepository problemHintRepository;
    private final StorageClient storageClient;

    public ProblemManagementService(
            ProblemRepository problemRepository,
            ProblemTestRepository problemTestRepository,
            ProblemHintRepository problemHintRepository,
            StorageClient storageClient
    ) {
        this.problemRepository = problemRepository;
        this.problemTestRepository = problemTestRepository;
        this.problemHintRepository = problemHintRepository;
        this.storageClient = storageClient;
    }

    @Transactional
    public Problem createProblem(Problem problem, String statementContent, List<String> categories, List<String> languages, String constraints) throws IOException {
        if (problem.getCreatedAt() == null) {
            problem.setCreatedAt(OffsetDateTime.now());
        }
        problem.setUpdatedAt(OffsetDateTime.now());
        problem.setCategories(categories == null ? List.of() : categories);
        problem.setLanguages(languages == null ? List.of() : languages);
        problem.setConstraints(constraints);

        // slug를 사용하여 경로를 미리 생성
        String statementPath = buildStatementPathBySlug(problem.getSlug());
        storageClient.saveString(statementPath, statementContent);
        problem.setStatementPath(statementPath);

        return problemRepository.save(problem);
    }

    @Transactional
    public void addTestcases(Problem problem, List<ProblemTestDto> tests) throws IOException {
        if (tests == null) return;
        for (ProblemTestDto dto : tests) {
            ProblemTest test = new ProblemTest();
            test.setProblem(problem);
            test.setCaseNo(dto.caseNo());
            String inputPath = buildTestcaseInputPathBySlug(problem.getSlug(), dto.caseNo());
            String outputPath = buildTestcaseOutputPathBySlug(problem.getSlug(), dto.caseNo());
            storageClient.saveString(inputPath, dto.input());
            storageClient.saveString(outputPath, dto.output());
            test.setInputPath(inputPath);
            test.setOutputPath(outputPath);
            test.setHidden(Boolean.TRUE.equals(dto.hidden()));
            test.setExplanation(dto.explanation());
            problemTestRepository.save(test);
        }
    }

    @Transactional
    public void addHints(Problem problem, List<ProblemHintDto> hints) {
        if (hints == null) return;
        for (ProblemHintDto hintDto : hints) {
            ProblemHint hint = new ProblemHint();
            hint.setProblem(problem);
            hint.setTier(problem.getTier());
            hint.setStage(hintDto.stage());
            hint.setTitle(hintDto.title());
            hint.setContentMarkdown(hintDto.contentMd());
            hint.setWaitSeconds(hintDto.waitSeconds());
            hint.setCreatedAt(OffsetDateTime.now());
            hint.setUpdatedAt(OffsetDateTime.now());
            problemHintRepository.save(hint);
        }
    }

    private String buildStatementPath(Long problemId) {
        return "problems/" + problemId + "/statement.md";
    }

    private String buildStatementPathBySlug(String slug) {
        return "problems/" + slug + "/statement.md";
    }

    private String buildTestcaseInputPath(Long problemId, Integer caseNo) {
        return "problems/" + problemId + "/tests/" + caseNo + ".in";
    }

    private String buildTestcaseInputPathBySlug(String slug, Integer caseNo) {
        return "problems/" + slug + "/tests/" + caseNo + ".in";
    }

    private String buildTestcaseOutputPath(Long problemId, Integer caseNo) {
        return "problems/" + problemId + "/tests/" + caseNo + ".out";
    }

    private String buildTestcaseOutputPathBySlug(String slug, Integer caseNo) {
        return "problems/" + slug + "/tests/" + caseNo + ".out";
    }
}

