package com.codebrainer.orchestrator.config;

import com.codebrainer.orchestrator.storage.LocalStorageClient;
import com.codebrainer.orchestrator.storage.StorageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    @Value("${storage.base-path}")
    private String basePath;

    @Bean
    public StorageClient storageClient() {
        return new LocalStorageClient(basePath);
    }
}

