package com.codebrainer.orchestrator.service;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.dto.ProblemDetailResponse;
import com.codebrainer.orchestrator.dto.ProblemHintDto;
import com.codebrainer.orchestrator.dto.ProblemSummaryResponse;
import com.codebrainer.orchestrator.dto.ProblemTestcaseResponse;
import com.codebrainer.orchestrator.repository.ProblemHintRepository;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemTestRepository;
import com.codebrainer.orchestrator.storage.StorageClient;
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

    public List<ProblemSummaryResponse> fetchSummaries() {
        return problemRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public Optional<ProblemDetailResponse> fetchDetailBySlug(String slug) {
        return problemRepository.findBySlug(slug)
                .map(this::buildDetailResponse);
    }

    public Optional<ProblemDetailResponse> fetchDetailById(Long id) {
        return problemRepository.findById(id)
                .map(this::buildDetailResponse);
    }

    private ProblemDetailResponse buildDetailResponse(Problem problem) {
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

        return new ProblemDetailResponse(
                problem.getId(),
                problem.getSlug(),
                problem.getTitle(),
                problem.getTier(),
                problem.getLevel(),
                readFileSafely(problem.getStatementPath()),
                problem.getConstraints(),
                problem.getInputFormat(),
                problem.getOutputFormat(),
                problem.getCategories(),
                problem.getLanguages(),
                hints,
                allTestcases,
                samples,
                problem.getCreatedAt(),
                problem.getUpdatedAt()
        );
    }

    private ProblemSummaryResponse toSummary(Problem problem) {
        return new ProblemSummaryResponse(
                problem.getId(),
                problem.getSlug(),
                problem.getTitle(),
                problem.getTier(),
                problem.getLevel(),
                problem.getCategories(),
                problem.getLanguages(),
                "", // Don't load statement for summary - it's too slow
                problem.getCreatedAt(),
                problem.getUpdatedAt()
        );
    }

    private ProblemTestcaseResponse toTestcase(com.codebrainer.orchestrator.domain.ProblemTest test, boolean includeContent) {
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

