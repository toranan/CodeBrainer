package com.codebrainer.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * application.yml의 admins 설정을 읽어오는 Properties 클래스
 */
@Component
@ConfigurationProperties(prefix = "")
@Getter
@Setter
public class AdminProperties {

    private List<AdminAccount> admins = new ArrayList<>();

    @Getter
    @Setter
    public static class AdminAccount {
        private String email;
        private String username;
        private String password;
        private String name;
    }
}

