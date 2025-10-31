package com.codebrainer.orchestrator.queue;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SubmissionPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final String exchange;
    private final String routingKey;

    public SubmissionPublisher(
            RabbitTemplate rabbitTemplate,
            @Value("${queue.submission.exchange}") String exchange,
            @Value("${queue.submission.routing-key}") String routingKey
    ) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchange = exchange;
        this.routingKey = routingKey;
    }

    public void publishSubmission(Long submissionId) {
        rabbitTemplate.convertAndSend(exchange, routingKey, submissionId);
    }
}

