package com.codebrainer.orchestrator.controller.problem;

import com.codebrainer.orchestrator.dto.ProblemDetailResponse;
import com.codebrainer.orchestrator.dto.ProblemSummaryResponse;
import com.codebrainer.orchestrator.service.ProblemQueryService;
import java.io.IOException;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/problems")
public class ProblemPublicController {

    private final ProblemQueryService problemQueryService;

    public ProblemPublicController(ProblemQueryService problemQueryService) {
        this.problemQueryService = problemQueryService;
    }

    @GetMapping
    public ResponseEntity<List<ProblemSummaryResponse>> list() {
        return ResponseEntity.ok(problemQueryService.fetchSummaries());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProblemDetailResponse> detail(@PathVariable("slug") String slug) {
        return problemQueryService.fetchDetailBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ProblemDetailResponse> detailById(@PathVariable("id") Long id) {
        return problemQueryService.fetchDetailById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
