package com.codebrainer.orchestrator.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.codebrainer.orchestrator.dto.ProblemTestcaseResponse;
import com.codebrainer.orchestrator.service.ProblemTestService;

@RestController
@RequestMapping("/problems/{problemId}/tests")
@RequiredArgsConstructor
public class ProblemTestController {

    private final ProblemTestService problemTestService;

    @PostMapping("/ai")
    public ResponseEntity<List<ProblemTestcaseResponse>> createByAi(
        @PathVariable Long problemId,
        @RequestBody Map<String, Object> body
    ) throws IOException {

    Object raw = body.get("content");
    if (raw == null) {
        return ResponseEntity.badRequest().body(List.of());
    }

    String jsonArr;

    if (raw instanceof String s) {
        jsonArr = s;
    } else {
        // JSON 객체가 오면 바로 변환
        jsonArr = new ObjectMapper().writeValueAsString(raw);
    }

    List<ProblemTestcaseResponse> result = problemTestService.saveTestsFromJson(problemId, jsonArr);
    return ResponseEntity.ok(result);
    }

}
