package com.codebrainer.orchestrator.controller.hint;

import lombok.*;
import java.util.Map;
import com.codebrainer.orchestrator.dto.HintRequest;
import com.codebrainer.orchestrator.dto.HintResponse;
import com.codebrainer.orchestrator.service.HintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;

@RestController
@RequestMapping("/hint")
@RequiredArgsConstructor
public class HintController {

    private final HintService hintService;

    @PostMapping("/{problemId}")
    public ResponseEntity<?> addHint(
            @PathVariable Long problemId,
            @RequestBody HintRequest req
    ) throws IOException {
        String markdown = req.getContent();

        HintResponse response = hintService.addNextStageHint(problemId, req.getContent());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{problemId}/stage")
    public ResponseEntity<?> getStage(@PathVariable Long problemId) {

        int stage = hintService.getNextStage(problemId);

        return ResponseEntity.ok(Map.of("stage", stage));
    }

}