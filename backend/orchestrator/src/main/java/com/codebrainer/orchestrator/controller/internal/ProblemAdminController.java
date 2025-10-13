package com.codebrainer.orchestrator.controller.internal;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.dto.ProblemUpsertRequest;
import com.codebrainer.orchestrator.repository.ProblemHintRepository;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemTestRepository;
import com.codebrainer.orchestrator.service.ProblemManagementService;
import com.codebrainer.orchestrator.storage.StorageClient;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/problems")
public class ProblemAdminController {

    private final ProblemRepository problemRepository;
    private final ProblemTestRepository problemTestRepository;
    private final ProblemHintRepository problemHintRepository;
    private final StorageClient storageClient;
    private final ProblemManagementService problemManagementService;

    public ProblemAdminController(
            ProblemRepository problemRepository,
            ProblemTestRepository problemTestRepository,
            ProblemHintRepository problemHintRepository,
            StorageClient storageClient,
            ProblemManagementService problemManagementService
    ) {
        this.problemRepository = problemRepository;
        this.problemTestRepository = problemTestRepository;
        this.problemHintRepository = problemHintRepository;
        this.storageClient = storageClient;
        this.problemManagementService = problemManagementService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Long> upsertProblem(@RequestBody @Valid ProblemUpsertRequest request) throws IOException {
        Optional<Problem> existing = problemRepository.findBySlug(request.slug());
        Problem problem = existing.orElseGet(Problem::new);

        problem.setTitle(request.title());
        problem.setSlug(request.slug());
        problem.setTier(request.tier());
        problem.setLevel(request.level());
        problem.setTimeMs(request.timeMs());
        problem.setMemMb(request.memMb());
        problem.setVisibility(request.visibility());
        problem.setVersion(Optional.ofNullable(request.version()).orElse(problem.getVersion() != null ? problem.getVersion() : 1));
        problem.setInputFormat(request.inputFormat());
        problem.setOutputFormat(request.outputFormat());

        if (problem.getId() != null) {
            problemTestRepository.deleteByProblem(problem);
            problemHintRepository.deleteByProblem(problem);
            deleteProblemFiles(problem.getSlug());
        }

        Problem saved = problemManagementService.createProblem(
                problem,
                request.statement(),
                request.categories(),
                request.languages(),
                request.constraints()
        );

        problemManagementService.addTestcases(saved, request.tests());
        problemManagementService.addHints(saved, request.hints());

        return ResponseEntity.ok(saved.getId());
    }

    private void deleteProblemFiles(String slug) throws IOException {
        String basePath = "problems/" + slug;
        storageClient.deleteDirectory(basePath);
    }
}

