package com.codebrainer.orchestrator.config;

import com.codebrainer.orchestrator.storage.LocalStorageClient;
import com.codebrainer.orchestrator.storage.StorageClient;
import com.codebrainer.orchestrator.storage.SupabaseStorageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    @Value("${storage.type:local}")
    private String storageType;

    @Value("${storage.base-path}")
    private String basePath;

    @Value("${storage.supabase.url:}")
    private String supabaseUrl;

    @Value("${storage.supabase.key:}")
    private String supabaseKey;

    @Value("${storage.supabase.bucket:codebrainer-problems}")
    private String supabaseBucket;

    @Bean
    public StorageClient storageClient() {
        if ("supabase".equalsIgnoreCase(storageType)) {
            if (supabaseUrl.isEmpty() || supabaseKey.isEmpty()) {
                throw new IllegalStateException(
                    "Supabase storage is enabled but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set"
                );
            }
            return new SupabaseStorageClient(supabaseUrl, supabaseKey, supabaseBucket);
        }

        // Default to local storage
        return new LocalStorageClient(basePath);
    }
}

