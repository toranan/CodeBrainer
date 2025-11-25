package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.domain.ProblemHint;
import com.codebrainer.orchestrator.domain.ProblemTest;
import com.codebrainer.orchestrator.dto.ProblemHintDto;
import com.codebrainer.orchestrator.repository.ProblemHintRepository;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemTestRepository;
import com.codebrainer.orchestrator.storage.StorageClient;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.io.IOException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;


@Service
public class ProblemManagementService {

    private final ProblemRepository problemRepository;
    private final ProblemTestRepository problemTestRepository;
    private final ProblemHintRepository problemHintRepository;
    private final StorageClient storageClient;
    private final ObjectMapper mapper; 

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
        this.mapper = new ObjectMapper();
    }

    private List<String> fixedLanguages() {
        return List.of(
                "C++17", "Python3", "PyPy3", "C99", "Java11",
                "Ruby", "Kotlin(JVM)", "Swift", "Text", "C#",
                "node.js", "GO", "D", "Rust2018", "C++17(Clang)"
        );
    }

    private String buildStatementPath(Long problemId) {
        return "problems/problem-" + problemId + "/statement.md";
    }

    private String buildTestcaseInputPath(Long problemId, Integer caseNo) {
        return "problems/problem-" + problemId + "/tests/" + caseNo + ".in";
    }

    private String buildTestcaseOutputPath(Long problemId, Integer caseNo) {
        return "problems/problem-" + problemId + "/tests/" + caseNo + ".out";
    }

    private String buildHintContentPath(Long problemId, int stage) {
        return "problems/problem-" + problemId + "/hints/" + stage + ".md";
    }

    @Transactional
    public Problem createProblem(Problem problem, String statement, List<String> categories) throws IOException {
        if (problemRepository.existsById(problem.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Problem already exists");
        }
        if (problem.getCreatedAt() == null) {
            problem.setCreatedAt(OffsetDateTime.now());
        }
        
        problem.setUpdatedAt(null);
        problem.setCategories(categories == null ? List.of() : categories);
        problem.setLanguages(fixedLanguages());
        problem.setInputFormat(problem.getInputFormat());
        problem.setOutputFormat(problem.getOutputFormat());


        Problem saved = problemRepository.save(problem);

        String statementPath = buildStatementPath(problem.getId());
        storageClient.saveString(statementPath, statement);
        saved.setStatementPath(statementPath);

        if (saved.getSlug() == null || saved.getSlug().isBlank()) {
            saved.setSlug("problem-" + saved.getId());
        }

        return problemRepository.save(saved);
    }

    @Transactional
    public void addTestcases(Problem problem, List<ProblemTest> testcases) throws IOException {
        if (testcases == null) return;
        Long problemId = problem.getId();
        for (ProblemTest oldTest : testcases) {
            ProblemTest test = new ProblemTest();
            test.setProblemId(problem.getId());
            test.setCaseNo(oldTest.getCaseNo());
            String inContent = storageClient.readString(oldTest.getInputPath());
            String outContent = storageClient.readString(oldTest.getOutputPath());
            String inputPath = buildTestcaseInputPath(problemId, oldTest.getCaseNo());
            String outputPath = buildTestcaseOutputPath(problemId, oldTest.getCaseNo());
            storageClient.saveString(inputPath, inContent);
            storageClient.saveString(outputPath, outContent);
            test.setInputPath(inputPath);
            test.setOutputPath(outputPath);
            test.setIsHidden(Boolean.TRUE.equals(oldTest.getIsHidden()));
            test.setExplanation(oldTest.getExplanation());
            problemTestRepository.save(test);
        }
    }

    @Transactional
    public void addHints(Problem problem, List<ProblemHint> hints) throws IOException {
        if (hints == null) return;
        for (ProblemHint oldHint : hints) {

            String content = storageClient.readString(oldHint.getContentPath());
            String hintPath = buildHintContentPath(problem.getId(), oldHint.getStage());
            storageClient.saveString(hintPath, content);

            ProblemHint hint = new ProblemHint();
            hint.setProblemId(problem.getId());
            hint.setTier(null);
            hint.setStage(oldHint.getStage());
            hint.setTitle(null);
            hint.setContentPath(hintPath);
            hint.setWaitSeconds(oldHint.getWaitSeconds());
            hint.setIsActive(true);
            hint.setCreatedAt(OffsetDateTime.now());
            hint.setUpdatedAt(null);

            problemHintRepository.save(hint);
        }
    }
}

