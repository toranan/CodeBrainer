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

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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
        Problem problem = new Problem();

        problem.setTitle(request.title());
        problem.setSlug(null);
        problem.setTier(request.tier());
        problem.setLevel(null);
        problem.setTimeMs(request.timeMs());
        problem.setMemMb(request.memMb());
        problem.setVisibility(true);
        problem.setVersion(null);
        problem.setInputFormat(request.inputFormat());
        problem.setOutputFormat(request.outputFormat());

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
}

