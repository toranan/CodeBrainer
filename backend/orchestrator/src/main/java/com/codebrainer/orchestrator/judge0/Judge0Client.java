package com.codebrainer.orchestrator.judge0;

import com.codebrainer.orchestrator.config.Judge0Properties;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class Judge0Client {

    private static final Logger log = LoggerFactory.getLogger(Judge0Client.class);

    private final RestClient restClient;
    private final Judge0Properties properties;

    public Judge0Client(Judge0Properties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getApiUrl())
                .build();
    }

    public Judge0SubmissionResponse submitBatch(List<Judge0SubmissionRequest> submissions) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromPath("/submissions/batch")
                .queryParam("base64_encoded", false)
                .queryParam("wait", false)
                .queryParam("fields", "*");

        return restClient.post()
                .uri(uriBuilder.build().toUri())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("submissions", submissions))
                .retrieve()
                .body(Judge0SubmissionResponse.class);
    }

    public Judge0SubmissionResponse fetchBatchTokens(List<String> tokens) {
        String tokenQuery = String.join(",", tokens);
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/submissions/batch")
                        .queryParam("tokens", tokenQuery)
                        .queryParam("base64_encoded", false)
                        .queryParam("fields", "*")
                        .build())
                .retrieve()
                .body(Judge0SubmissionResponse.class);
    }

    public Judge0SubmissionResult fetchToken(String token) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/submissions/{token}")
                        .queryParam("base64_encoded", false)
                        .queryParam("fields", "*")
                        .build(token))
                .retrieve()
                .body(Judge0SubmissionResult.class);
    }
}

