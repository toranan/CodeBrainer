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
        public List<ProblemTestcaseResponse> saveTestsFromJson(Long problemId, String jsonArr)
                throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> cases;

        // JSON 문자열일 때
        if (jsonArr.trim().startsWith("[")) {
                cases = mapper.readValue(jsonArr, new TypeReference<>() {});
        }
        // JSON 객체(Map/List)일 때 → 문자열로 직렬화 후 다시 파싱
        else {
                Object parsed = mapper.readValue(jsonArr, Object.class);
                String normalized = mapper.writeValueAsString(parsed);
                cases = mapper.readValue(normalized, new TypeReference<>() {});
        }

        // 문제 존재 여부 체크
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("문제가 존재하지 않습니다."));

        // 기존 테스트 개수
        int currentCount = problemTestRepository
                .findAllByProblemIdOrderByCaseNo(problemId)
                .size();

        List<ProblemTestcaseResponse> savedList = new ArrayList<>();

        String basePath = System.getenv("STORAGE_BASE_PATH");

        int idx = 0;
        for (Map<String, Object> c : cases) {

                int caseNo = currentCount + (++idx);

                String inContent = null;
                Object rawIn = c.get("in");
                if (rawIn instanceof String s)
                        inContent = s;
                else if (rawIn != null)
                        inContent = rawIn.toString();
                else 
                        inContent = ""; 
                
                String outContent = (String) c.get("out");
                String explanation = (String) c.get("explanation");
                Boolean hidden = (Boolean) c.getOrDefault("hidden", false);

                Path inFile = Path.of(basePath, "problems", "problem-" + problemId, "tests", caseNo + ".in");
                Path outFile = Path.of(basePath, "problems", "problem-" + problemId, "tests", caseNo + ".out");

                Files.createDirectories(inFile.getParent());// 입력 파일이 없을 때만 생성
                if (!Files.exists(inFile)) {
                Files.writeString(inFile, inContent != null ? inContent : "");
                }

                // 출력 파일이 없을 때만 생성
                if (!Files.exists(outFile)) {
                Files.writeString(outFile, outContent != null ? outContent : "");
                }

                ProblemTest test = new ProblemTest();
                test.setProblemId(problemId);
                test.setCaseNo(caseNo);
                test.setInputPath(inFile.toString());
                test.setOutputPath(outFile.toString());
                test.setExplanation(explanation != null ? explanation : "");
                test.setIsHidden(hidden);

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


        // @Transactional
        // public List<ProblemTestcaseResponse> generateAndSaveTests(Long problemId)
        //         throws IOException, InterruptedException {

        // Problem problem = problemRepository.findById(problemId)
        //         .orElseThrow(() -> new IllegalArgumentException("문제가 존재하지 않습니다."));

        // ProcessBuilder pb = new ProcessBuilder(
        //         "python",
        //         "data/make_testcases.py",
        //         problemId.toString()
        // );
        // pb.redirectErrorStream(true);
        // Process process = pb.start();

        // String result = new String(process.getInputStream().readAllBytes());
        // int code = process.waitFor();

        // if (code != 0) {
        //         throw new IllegalStateException("make_testcases.py 실행 실패");
        // }

        // ObjectMapper mapper = new ObjectMapper();
        // List<Map<String, Object>> cases =
        //         mapper.readValue(result, new TypeReference<>(){});

        // int currentCount = problemTestRepository
        //         .findAllByProblemIdOrderByCaseNo(problem.getId())
        //         .size();

        // List<ProblemTestcaseResponse> savedList = new ArrayList<>();

        // String basePath = System.getenv("STORAGE_BASE_PATH");

        // for (int i = 0; i < 50; i++) {
        //         Map<String, Object> c = cases.get(i);

        //         int caseNo = currentCount + i + 1;

        //         String inContent = (String) c.get("in");
        //         String outContent = (String) c.get("out");

        //         Path inFile = Path.of(
        //                 basePath,
        //                 "problems",
        //                 "problem-" + problemId,
        //                 "tests",
        //                 caseNo + ".in"
        //         );

        //         Path outFile = Path.of(
        //                 basePath,
        //                 "problems",
        //                 "problem-" + problemId,
        //                 "tests",
        //                 caseNo + ".out"
        //         );

        //         Files.createDirectories(inFile.getParent());
        //         Files.writeString(inFile, inContent != null ? inContent : "");
        //         Files.writeString(outFile, outContent != null ? outContent : "");

        //         ProblemTest test = new ProblemTest();
        //         test.setProblemId(problem.getId());
        //         test.setCaseNo(caseNo);

        //         test.setInputPath(inFile.toString());
        //         test.setOutputPath(outFile.toString());

        //         Boolean hidden = (Boolean) c.get("hidden");
        //         test.setIsHidden(hidden != null ? hidden : false);

        //         String explanation = (String) c.get("explanation");
        //         test.setExplanation(explanation != null ? explanation : "");

        //         problemTestRepository.save(test);

        //         savedList.add(new ProblemTestcaseResponse(
        //                 test.getProblemId(),
        //                 test.getCaseNo(),
        //                 test.getInputPath(),
        //                 test.getOutputPath(),
        //                 test.getExplanation()
        //         ));
        // }
        // return savedList;
        // }
}
