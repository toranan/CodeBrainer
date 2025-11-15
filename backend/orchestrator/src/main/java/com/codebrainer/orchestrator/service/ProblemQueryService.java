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
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

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

    public Optional<ProblemRequest> fetchDetailById(Long id) {
        return problemRepository.findById(id)
                .map(problem -> {
                    List<ProblemTestcaseResponse> allTestcases = problemTestRepository.findAllByProblemOrderByCaseNo(problem)
                            .stream()
                            .map(test -> toTestcase(test, true))
                            .toList();

                    List<ProblemTestcaseResponse> samples = allTestcases.stream()
                            .filter(tc -> Boolean.FALSE.equals(tc.hidden()))
                            .toList();

                    List<ProblemHintDto> hints = problemHintRepository.findAllByProblemOrderByStageAsc(problem)
                            .stream()
                            .map(hint -> new ProblemHintDto(
                                    hint.getStage(),
                                    hint.getTitle(),
                                    hint.getContentMarkdown(),
                                    hint.getWaitSeconds()
                            ))
                            .toList();

                    ProblemRequest dto = ProblemRequest.builder()
                            .id(problem.getId())
                            .title(problem.getTitle())
                            .tier(problem.getTier())
                            .timeMs(problem.getTimeMs())
                            .memMb(problem.getMemMb())
                            .categories(problem.getCategories())
                            .inputFormat(problem.getInputFormat())
                            .outputFormat(problem.getOutputFormat())
                            .statementPath(problem.getStatementPath())
                            .build();

                    return dto;
                });
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
                test.getId(),
                test.getCaseNo(),
                includeContent ? readFileSafely(test.getInputPath()) : null,
                includeContent ? readFileSafely(test.getOutputPath()) : null,
                test.getHidden(),
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

