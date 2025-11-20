package com.codebrainer.orchestrator.controller.internal;

import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.dto.ProblemRequest;
import com.codebrainer.orchestrator.repository.ProblemHintRepository;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemTestRepository;
import com.codebrainer.orchestrator.service.ProblemManagementService;
import com.codebrainer.orchestrator.storage.StorageClient;
import com.codebrainer.orchestrator.storage.LocalStorageClient;
import java.util.List;
import com.codebrainer.orchestrator.dto.ProblemTestDto;
import com.codebrainer.orchestrator.dto.ProblemHintDto;

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
    public ResponseEntity<Long> upsertProblem(@RequestBody @Valid ProblemRequest request) throws IOException {
        Problem problem = new Problem();

        problem.setTitle(request.getTitle());
        problem.setSlug(null);
        problem.setTier(request.getTier());
        problem.setLevel(null);
        problem.setTimeMs(request.getTimeMs());
        problem.setMemMb(request.getMemMb());
        problem.setVisibility(true);
        problem.setVersion(null);
        problem.setInputFormat(request.getInputFormat());
        problem.setOutputFormat(request.getOutputFormat());

        Problem saved = problemManagementService.createProblem(
                problem,
                request.getStatementPath(),
                request.getCategories()
        );

        problemManagementService.addTestcases(saved, problemTestRepository.findAllByProblemIdOrderByCaseNo(request.getId()));
        problemManagementService.addHints(saved, problemHintRepository.findAllByProblemIdOrderByStageAsc(request.getId()));

        return ResponseEntity.ok(saved.getId());
    }
}

