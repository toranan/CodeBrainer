package com.codebrainer.service;

import com.codebrainer.entity.User;
import com.codebrainer.entity.UserRole;
import com.codebrainer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // SecurityConfig에서 빈으로 등록한 BCryptPasswordEncoder

    /**
     * 회원 데이터 생성 (회원가입)
     * 
     * @param email 이메일
     * @param password 평문 비밀번호
     * @param name 이름
     * @return 생성된 User 엔티티
     * @throws IllegalArgumentException 이메일이 이미 존재하는 경우
     */
    @Transactional
    public User create(String email, String password, String name) {
        log.info("회원가입 시도: email={}, name={}", email, name);

        // 이메일 중복 체크
        if (userRepository.existsByEmail(email)) {
            log.warn("이메일 중복: {}", email);
            throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + email);
        }

        // 비밀번호 암호화 (BCryptPasswordEncoder 사용)
        String encodedPassword = passwordEncoder.encode(password);
        log.debug("비밀번호 암호화 완료");

        // User 엔티티 생성
        User user = User.builder()
                .email(email)
                .password(encodedPassword)
                .name(name)
                .provider("local") // 일반 회원가입
                .role(UserRole.USER)
                .build();

        // 저장
        User savedUser = userRepository.save(user);
        log.info("회원가입 완료: userId={}, email={}", savedUser.getId(), savedUser.getEmail());

        return savedUser;
    }

    /**
     * 이메일로 사용자 조회
     * 
     * @param email 이메일
     * @return User 엔티티 (Optional)
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));
    }

    /**
     * 비밀번호 검증
     * 
     * @param rawPassword 평문 비밀번호
     * @param encodedPassword 암호화된 비밀번호
     * @return 일치 여부
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * 이메일 존재 여부 확인
     * 
     * @param email 이메일
     * @return 존재 여부
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * 로그인 (이메일/비밀번호 검증)
     *
     * @param email 이메일
     * @param password 평문 비밀번호
     * @return User 엔티티
     * @throws IllegalArgumentException 사용자를 찾을 수 없거나 비밀번호가 틀린 경우
     */
    @Transactional(readOnly = true)
    public User login(String email, String password) {
        log.info("로그인 시도: email={}", email);

        // 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("로그인 실패 - 사용자 없음: {}", email);
                    return new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다");
                });

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("로그인 실패 - 비밀번호 불일치: {}", email);
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        log.info("로그인 성공: userId={}, email={}", user.getId(), user.getEmail());
        return user;
    }
}

