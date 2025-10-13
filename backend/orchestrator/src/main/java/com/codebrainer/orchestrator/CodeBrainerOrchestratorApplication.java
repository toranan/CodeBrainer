package com.codebrainer.orchestrator;

import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableRabbit
public class CodeBrainerOrchestratorApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeBrainerOrchestratorApplication.class, args);
    }
}

