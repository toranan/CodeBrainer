package com.codebrainer.orchestrator.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.io.IOException;
import java.util.List;
import java.nio.file.Path;
import java.nio.file.Files;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.*;
import com.codebrainer.orchestrator.domain.Problem;
import com.codebrainer.orchestrator.dto.ProblemTestcaseResponse;
import com.codebrainer.orchestrator.repository.ProblemRepository;
import com.codebrainer.orchestrator.repository.ProblemTestRepository;
import com.codebrainer.orchestrator.domain.ProblemTest;

@Service
@RequiredArgsConstructor
public class ProblemTestService {

    private final ProblemRepository problemRepository;
    private final ProblemTestRepository problemTestRepository;

    @Transactional
    public List<ProblemTestcaseResponse> generateAndSaveTests(Long problemId)
            throws IOException, InterruptedException {

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("문제가 존재하지 않습니다."));

        ProcessBuilder pb = new ProcessBuilder(
                "python",
                "data/make_testcases.py",
                problemId.toString()
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();

        String result = new String(process.getInputStream().readAllBytes());
        int code = process.waitFor();

        if (code != 0) {
            throw new IllegalStateException("make_testcases.py 실행 실패");
        }

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> cases =
                mapper.readValue(result, new TypeReference<>(){});

        int currentCount = problemTestRepository
                .findAllByProblemIdOrderByCaseNo(problem.getId())
                .size();

        List<ProblemTestcaseResponse> savedList = new ArrayList<>();

        String basePath = System.getenv("STORAGE_BASE_PATH");

        for (int i = 0; i < 50; i++) {
                Map<String, Object> c = cases.get(i);

                int caseNo = currentCount + i + 1;

                String inContent = (String) c.get("in");
                String outContent = (String) c.get("out");

                Path inFile = Path.of(
                        basePath,
                        "problems",
                        problemId.toString(),
                        "cases",
                        String.valueOf(caseNo) + ".in"
                );
                Path outFile = Path.of(
                        basePath,
                        "problems",
                        problemId.toString(),
                        "cases",
                        String.valueOf(caseNo) + ".out"
                );

                Files.createDirectories(inFile.getParent());
                Files.writeString(inFile, inContent != null ? inContent : "");
                Files.writeString(outFile, outContent != null ? outContent : "");

                ProblemTest test = new ProblemTest();
                test.setProblemId(problem.getId());
                test.setCaseNo(caseNo);

                test.setInputPath(inFile.toString());
                test.setOutputPath(outFile.toString());

                Boolean hidden = (Boolean) c.get("hidden");
                test.setIsHidden(hidden != null ? hidden : false);

                String explanation = (String) c.get("explanation");
                test.setExplanation(explanation != null ? explanation : "");

                problemTestRepository.save(test);

                savedList.add(new ProblemTestcaseResponse(
                        test.getProblemId(),
                        test.getCaseNo(),
                        test.getInputPath(),
                        test.getOutputPath(),
                        test.getExplanation()
                ));
        }
        return savedList;
    }
}
