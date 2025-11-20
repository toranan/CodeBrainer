package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.dto.ProblemRequest;
import com.codebrainer.orchestrator.dto.ProblemResponse;
import com.codebrainer.orchestrator.dto.ProblemHintDto;
import com.codebrainer.orchestrator.dto.ProblemListResponse;
import com.codebrainer.orchestrator.dto.ProblemTestcaseResponse;
import com.codebrainer.orchestrator.repository.ProblemHintRepository;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemTestRepository;
import com.codebrainer.orchestrator.storage.StorageClient;
import com.codebrainer.orchestrator.domain.ProblemTest;
import com.codebrainer.orchestrator.domain.ProblemHint;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import java.nio.file.Path;
import java.nio.file.Files;

@Service
public class ProblemQueryService {

    private final ProblemRepository problemRepository;
    private final ProblemTestRepository problemTestRepository;
    private final ProblemHintRepository problemHintRepository;
    private final StorageClient storageClient;

    public ProblemQueryService(
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

    public List<ProblemListResponse> fetchSummaries() {
        return problemRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toSummary)
                .toList();
    }
        private List<String> fixedLanguages() {
        return List.of(
                "C++17", "Python3", "PyPy3", "C99", "Java11",
                "Ruby", "Kotlin(JVM)", "Swift", "Text", "C#",
                "node.js", "GO", "D", "Rust2018", "C++17(Clang)"
        );
    }

    // public Optional<ProblemResponse> fetchDetailBySlug(String slug) {
    //     return problemRepository.findBySlug(slug)
    //             .map(this::buildDetailResponse);
    // }

    public Optional<ProblemResponse> fetchDetailById(Long id) {
        return problemRepository.findById(id)
                .map(this::buildDetailResponse);
    }

    private ProblemResponse buildDetailResponse(Problem problem) {

        List<ProblemHint> hintEntities = problemHintRepository.findAllByProblemIdOrderByStageAsc(problem.getId());
        List<ProblemTest> testcaseEntities = problemTestRepository.findAllByProblemIdOrderByCaseNo(problem.getId());

        List<ProblemHintDto> hintDtos = hintEntities.stream()
                .map(h -> new ProblemHintDto(
                        h.getStage(),
                        h.getTitle(),
                        readFileSafely(h.getContentPath()),
                        h.getWaitSeconds()
                ))
                .toList();
        List<ProblemTestcaseResponse> testcaseDtos = testcaseEntities.stream()
                .map(t -> new ProblemTestcaseResponse(
                        t.getId(),
                        t.getCaseNo(),
                        readFileSafely(t.getInputPath()),
                        readFileSafely(t.getOutputPath()),
                        t.getExplanation()
                ))
                .toList();

        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .tier(problem.getTier())
                .timeMs(problem.getTimeMs())
                .memMb(problem.getMemMb())
                .languages(problem.getLanguages())
                .categories(problem.getCategories())
                .constraints(problem.getConstraints())
                .inputFormat(problem.getInputFormat())
                .outputFormat(problem.getOutputFormat())
                .statementPath(readFileSafely(problem.getStatementPath()))
                .visibility(problem.getVisibility())
                .version(problem.getVersion())
                .hints(hintDtos)
                .testcases(testcaseDtos)
                .samples(null)
                // .samples(problem.getSamples())
                .createdAt(null)
                .updatedAt(null)
                .build();
        }

    private ProblemListResponse toSummary(Problem problem) {
        return new ProblemListResponse(
                problem.getId(),
                problem.getTitle(),
                problem.getTier(),
                problem.getCategories(),
                readFileSafely(problem.getStatementPath())
        );
    }

    private ProblemTestcaseResponse toTestcase(ProblemTest test, boolean includeContent) {
        return new ProblemTestcaseResponse(
                test.getProblemId(),
                test.getCaseNo(),
                includeContent ? readFileSafely(test.getInputPath()) : null,
                includeContent ? readFileSafely(test.getOutputPath()) : null,
                test.getExplanation()
        );
    }

    private String readFileSafely(String path) {
        if (path == null || path.isBlank()) {
            return "";
        }
        try {
            return storageClient.readString(path);
        } catch (Exception e) {
            return "";
        }
    }
}

