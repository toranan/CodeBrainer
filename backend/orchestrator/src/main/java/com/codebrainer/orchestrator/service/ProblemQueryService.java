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

    public List<ProblemSummaryResponse> fetchSummaries() {
        // is_visible = true인 문제만 반환
        return problemRepository.findAllByIsVisibleTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public Optional<ProblemDetailResponse> fetchDetailBySlug(String slug) {
        // is_visible = true인 문제만 반환
        return problemRepository.findBySlugAndIsVisibleTrue(slug)
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
                        t.getProblemId(),
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

