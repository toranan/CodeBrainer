package com.codebrainer.orchestrator.judge0;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Judge0 API의 status 필드를 역직렬화하는 커스텀 deserializer.
 * Judge0는 status를 다음 두 가지 형식으로 반환할 수 있음:
 * 1. 숫자: 3
 * 2. 객체: {"id": 3, "description": "Accepted"}
 */
public class Judge0StatusDeserializer extends JsonDeserializer<Judge0Status> {

    private static final Logger log = LoggerFactory.getLogger(Judge0StatusDeserializer.class);

    @Override
    public Judge0Status deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        JsonNode node = parser.getCodec().readTree(parser);

        int statusId;

        if (node.isInt()) {
            // Case 1: status가 숫자로 오는 경우 (예: 3)
            statusId = node.asInt();
            log.debug("Judge0 status를 숫자로 파싱: {}", statusId);
        } else if (node.isObject() && node.has("id")) {
            // Case 2: status가 객체로 오는 경우 (예: {"id": 3, "description": "Accepted"})
            statusId = node.get("id").asInt();
            String description = node.has("description") ? node.get("description").asText() : "N/A";
            log.debug("Judge0 status를 객체로 파싱: id={}, description={}", statusId, description);
        } else {
            // 예상하지 못한 형식
            log.error("Judge0 status 형식을 인식할 수 없음: {}", node.toString());
            return Judge0Status.INTERNAL_ERROR;
        }

        return Judge0Status.fromId(statusId);
    }
}
