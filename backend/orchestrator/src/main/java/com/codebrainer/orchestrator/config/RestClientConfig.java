package com.codebrainer.orchestrator.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

/**
 * HTTP Client 설정 클래스
 * Judge0 API 호출을 위한 RestTemplate을 구성합니다.
 */
@Configuration
public class RestClientConfig {

    /**
     * Judge0 API 호출을 위한 RestTemplate Bean 생성
     *
     * @param objectMapper Spring Boot가 자동으로 생성한 ObjectMapper
     * @return 설정된 RestTemplate 인스턴스
     */
    @Bean
    public RestTemplate judge0RestTemplate(ObjectMapper objectMapper) {
        RestTemplate restTemplate = new RestTemplate();

        // ObjectMapper를 사용하는 Jackson HTTP 메시지 컨버터 생성
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter(objectMapper);

        // 기존 컨버터 목록의 첫 번째에 우리 컨버터를 추가
        restTemplate.getMessageConverters().add(0, converter);

        return restTemplate;
    }
}
