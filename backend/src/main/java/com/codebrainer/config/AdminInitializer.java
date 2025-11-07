package com.codebrainer.config;

import com.codebrainer.entity.User;
import com.codebrainer.entity.UserRole;
import com.codebrainer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 애플리케이션 시작 시 초기 관리자 계정을 자동으로 생성하는 클래스
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements ApplicationRunner {

    private final AdminProperties adminProperties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("=== 초기 관리자 계정 자동 생성 시작 ===");

        if (adminProperties.getAdmins() == null || adminProperties.getAdmins().isEmpty()) {
            log.warn("설정된 관리자 계정이 없습니다. application.yml의 admins 설정을 확인하세요.");
            return;
        }

        int createdCount = 0;
        int skippedCount = 0;

        for (AdminProperties.AdminAccount adminAccount : adminProperties.getAdmins()) {
            try {
                // 이메일 중복 체크
                if (userRepository.existsByEmail(adminAccount.getEmail())) {
                    log.info("관리자 계정 건너뜀 (이메일 중복): {}", adminAccount.getEmail());
                    skippedCount++;
                    continue;
                }

                // 아이디 중복 체크
                if (userRepository.existsByUsername(adminAccount.getUsername())) {
                    log.info("관리자 계정 건너뜀 (아이디 중복): {}", adminAccount.getUsername());
                    skippedCount++;
                    continue;
                }

                // 관리자 계정 생성
                User admin = User.builder()
                        .email(adminAccount.getEmail())
                        .username(adminAccount.getUsername())
                        .password(passwordEncoder.encode(adminAccount.getPassword()))
                        .name(adminAccount.getName())
                        .provider("local")
                        .role(UserRole.ADMIN)
                        .build();

                userRepository.save(admin);
                log.info("✅ 관리자 계정 생성 완료: {} ({})", adminAccount.getUsername(), adminAccount.getEmail());
                createdCount++;

            } catch (Exception e) {
                log.error("❌ 관리자 계정 생성 실패: {}", adminAccount.getEmail(), e);
            }
        }

        log.info("=== 초기 관리자 계정 자동 생성 완료 (생성: {}, 건너뜀: {}) ===", createdCount, skippedCount);
    }
}

