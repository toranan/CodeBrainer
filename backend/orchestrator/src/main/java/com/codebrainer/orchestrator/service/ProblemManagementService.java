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
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    private JsonNode toJsonNode(List<String> list) {
        return mapper.valueToTree(list == null ? List.of() : list);
    }

    private JsonNode fixedLanguages() {
        List<String> langs = List.of(
                "C++17", "Python3", "PyPy3", "C99", "Java11",
                "Ruby", "Kotlin(JVM)", "Swift", "Text", "C#",
                "node.js", "GO", "D", "Rust2018", "C++17(Clang)"
        );
        return mapper.valueToTree(langs);
    }


    @Transactional
    public Problem createProblem(Problem problem, String statementContent, List<String> categories, List<String> languages, String constraints) throws IOException {
        if (problem.getCreatedAt() == null) {
            problem.setCreatedAt(OffsetDateTime.now());
        }
        problem.setUpdatedAt(null);
        problem.setCategories(categories == null ? List.of() : categories);
        problem.setLanguages(fixedLanguages());
        problem.setConstraints(null);

        Problem saved = problemRepository.save(problem);

        String statementPath = buildStatementPathById(saved.getId());
        storageClient.saveString(statementPath, statementContent);
        saved.setStatementPath(statementPath);

        return problemRepository.save(saved);
    }

    @Transactional
    public void addTestcases(Problem problem, List<ProblemTestDto> tests) throws IOException {
        if (tests == null) return;
        Long problemId = problem.getId();
        for (ProblemTestDto dto : tests) {
            ProblemTest test = new ProblemTest();
            test.setProblem(problem);
            test.setCaseNo(dto.caseNo());
            String inputPath = buildTestcaseInputPathById(problemId, dto.caseNo());
            String outputPath = buildTestcaseOutputPathById(problemId, dto.caseNo());
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
            hint.setTier(null);
            hint.setStage(dto.stage());
            hint.setTitle(null);
            hint.setContentMarkdown(hintDto.contentMd());
            hint.setWaitSeconds(hintDto.waitSeconds());
            hint.setCreatedAt(OffsetDateTime.now());
            hint.setUpdatedAt(null);
            problemHintRepository.save(hint);
        }
    }

    private String buildStatementPath(Long problemId) {
        return "problems/" + problemId + "/statement.md";
    }

    private String buildTestcaseInputPath(Long problemId, Integer caseNo) {
        return "problems/" + problemId + "/tests/" + caseNo + ".in";
    }
    private String buildTestcaseOutputPath(Long problemId, Integer caseNo) {
        return "problems/" + problemId + "/tests/" + caseNo + ".out";
    }
}

