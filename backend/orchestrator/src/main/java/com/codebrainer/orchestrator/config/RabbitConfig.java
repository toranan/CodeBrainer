package com.codebrainer.orchestrator.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Value("${queue.submission.name}")
    private String submissionQueueName;

    @Value("${queue.submission.exchange}")
    private String submissionExchange;

    @Value("${queue.submission.routing-key}")
    private String submissionRoutingKey;

    @Bean
    public Queue submissionQueue() {
        return new Queue(submissionQueueName, true);
    }

    @Bean
    public DirectExchange submissionExchange() {
        return new DirectExchange(submissionExchange, true, false);
    }

    @Bean
    public Binding submissionBinding(Queue submissionQueue, DirectExchange submissionExchange) {
        return BindingBuilder.bind(submissionQueue).to(submissionExchange).with(submissionRoutingKey);
    }
}

