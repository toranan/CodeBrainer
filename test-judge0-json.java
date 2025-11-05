import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

class Judge0SubmissionRequest {
    public String source_code;
    public Integer language_id;
    public String stdin;
    public String expected_output;
    public Double cpu_time_limit;
    public Integer memory_limit;

    public Judge0SubmissionRequest(String source_code, Integer language_id, String stdin,
                                  String expected_output, Double cpu_time_limit, Integer memory_limit) {
        this.source_code = source_code;
        this.language_id = language_id;
        this.stdin = stdin;
        this.expected_output = expected_output;
        this.cpu_time_limit = cpu_time_limit;
        this.memory_limit = memory_limit;
    }
}

public class TestJudge0Json {
    public static void main(String[] args) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();

        List<Judge0SubmissionRequest> submissions = new ArrayList<>();
        submissions.add(new Judge0SubmissionRequest(
            "print(\"hello\")",
            71,
            "",
            "hello",
            2.0,
            128000
        ));

        // 현재 코드처럼 Map으로 감싸기
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("submissions", submissions);

        String jsonString = objectMapper.writeValueAsString(requestBody);
        System.out.println("Generated JSON:");
        System.out.println(jsonString);

        // Pretty print
        System.out.println("\nPretty JSON:");
        System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestBody));
    }
}
