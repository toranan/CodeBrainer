package com.codebrainer.orchestrator.controller.problem;

import com.codebrainer.orchestrator.dto.ProblemRequest;
import com.codebrainer.orchestrator.dto.ProblemListResponse;
import com.codebrainer.orchestrator.dto.ProblemResponse;
import com.codebrainer.orchestrator.service.ProblemQueryService;
import com.codebrainer.orchestrator.storage.LocalStorageClient;
import com.codebrainer.orchestrator.storage.StorageClient;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
public class ProblemPublicController {

    private final ProblemQueryService problemQueryService;

    public ProblemPublicController(ProblemQueryService problemQueryService) {
        this.problemQueryService = problemQueryService;
    }

    @GetMapping
    public ResponseEntity<List<ProblemListResponse>> list() {
        return ResponseEntity.ok(problemQueryService.fetchSummaries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> detail(@PathVariable("id") Long id) {
        return problemQueryService.fetchDetailById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ProblemResponse> detailById(@PathVariable("id") Long id) {
        return problemQueryService.fetchDetailById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
