package com.codebrainer.orchestrator.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "judge0")
public class Judge0Properties {

    /** Base URL of Judge0 API */
    private String apiUrl = "http://localhost:2358";

    /** Whether callback mode is enabled */
    private boolean callbackEnabled = false;

    /** Callback URL for Judge0 (used only when callback-enabled) */
    private String callbackUrl;

    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    public boolean isCallbackEnabled() {
        return callbackEnabled;
    }

    public void setCallbackEnabled(boolean callbackEnabled) {
        this.callbackEnabled = callbackEnabled;
    }

    public String getCallbackUrl() {
        return callbackUrl;
    }

    public void setCallbackUrl(String callbackUrl) {
        this.callbackUrl = callbackUrl;
    }
}

