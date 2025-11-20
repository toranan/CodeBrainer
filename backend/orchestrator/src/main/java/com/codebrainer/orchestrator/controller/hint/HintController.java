package com.codebrainer.orchestrator.controller.hint;

import lombok.*;
import com.codebrainer.orchestrator.dto.HintRequest;
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

        hintService.addNextStageHint(problemId, markdown);

        return ResponseEntity.ok("OK");
    }
}