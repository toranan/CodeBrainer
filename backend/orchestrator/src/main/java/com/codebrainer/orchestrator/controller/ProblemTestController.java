package com.codebrainer.orchestrator.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import java.util.List;

import com.codebrainer.orchestrator.dto.ProblemTestcaseResponse;
import com.codebrainer.orchestrator.service.ProblemTestService;

@RestController
@RequestMapping("/problems/{problemId}/tests")
@RequiredArgsConstructor
public class ProblemTestController {

    private final ProblemTestService problemTestService;

    @PostMapping("/ai")
    public ResponseEntity<List<ProblemTestcaseResponse>> createByAi(
            @PathVariable Long problemId
    ) throws IOException, InterruptedException {

        List<ProblemTestcaseResponse> result = problemTestService.generateAndSaveTests(problemId);

        return ResponseEntity.ok(result);
    }
}
