package com.codebrainer.orchestrator.controller.hint;

import lombok.*;

@RestController
@RequestMapping("/hint")
@RequiredArgsConstructor
public class HintController {

    private final HintService hintService;

    @PostMapping("/{problemId}")
    public ResponseEntity<?> addHint(
            @PathVariable Long problemId,
            @RequestBody HintCreateRequest req
    ) throws IOException {
        String markdown = req.getHint();

        hintService.addNextStageHint(problemId, markdown);

        return ResponseEntity.ok("OK");
    }
}
