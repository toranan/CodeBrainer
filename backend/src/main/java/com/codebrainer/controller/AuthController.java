package com.codebrainer.controller;

import com.codebrainer.config.JwtUtil;
import com.codebrainer.dto.ErrorResponse;
import com.codebrainer.dto.LoginRequest;
import com.codebrainer.dto.LoginResponse;
import com.codebrainer.dto.SignUpRequest;
import com.codebrainer.dto.SignUpResponse;
import com.codebrainer.entity.User;
import com.codebrainer.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 관련 API 컨트롤러
 * 회원가입, 로그인 등의 엔드포인트 제공
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    /**
     * 회원가입 API
     * POST /api/auth/signup
     * 
     * @param request 회원가입 요청 데이터 (email, password, name)
     * @param bindingResult 유효성 검증 결과
     * @return SignUpResponse 또는 ErrorResponse
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(
            @Valid @RequestBody SignUpRequest request,
            BindingResult bindingResult
    ) {
        log.info("회원가입 요청: email={}", request.getEmail());

        // 유효성 검증 실패
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getAllErrors().get(0).getDefaultMessage();
            log.warn("회원가입 유효성 검증 실패: {}", errorMessage);
            return ResponseEntity
                    .badRequest()
                    .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), errorMessage));
        }

        try {
            // UserService의 create 메서드 호출 (비밀번호 암호화 포함)
            User user = userService.create(
                    request.getEmail(),
                    request.getUsername(),
                    request.getPassword(),
                    request.getName()
            );

            // 응답 생성
            SignUpResponse response = SignUpResponse.from(user);
            log.info("회원가입 성공: userId={}", user.getId());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException e) {
            // 이메일 중복 등의 비즈니스 로직 예외
            log.error("회원가입 실패: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ErrorResponse.of(HttpStatus.CONFLICT.value(), e.getMessage()));

        } catch (Exception e) {
            // 그 외 예상치 못한 예외
            log.error("회원가입 중 예외 발생", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "회원가입 처리 중 오류가 발생했습니다"
                    ));
        }
    }

    /**
     * 로그인 API
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            BindingResult bindingResult
    ) {
        log.info("로그인 요청: emailOrUsername={}", request.getEmailOrUsername());

        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), errorMessage));
        }

        try {
            User user = userService.login(request.getEmailOrUsername(), request.getPassword());
            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getName());
            LoginResponse response = LoginResponse.of(user, token);
            log.info("로그인 성공: userId={}, email={}, username={}", user.getId(), user.getEmail(), user.getUsername());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("로그인 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), e.getMessage()));
        } catch (Exception e) {
            log.error("로그인 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "로그인 처리 중 오류가 발생했습니다"));
        }
    }

    /**
     * 이메일 중복 체크 API
     * GET /api/auth/check-email?email=test@example.com
     * 
     * @param email 체크할 이메일
     * @return 중복 여부 (true: 사용 가능, false: 중복)
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        log.info("이메일 중복 체크: email={}", email);

        boolean exists = userService.existsByEmail(email);
        
        return ResponseEntity.ok()
                .body(new EmailCheckResponse(!exists, exists ? "이미 사용 중인 이메일입니다" : "사용 가능한 이메일입니다"));
    }

    /**
     * 아이디 중복 체크 API
     * GET /api/auth/check-username?username=testuser
     * 
     * @param username 체크할 아이디
     * @return 중복 여부 (true: 사용 가능, false: 중복)
     */
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        log.info("아이디 중복 체크: username={}", username);

        boolean exists = userService.existsByUsername(username);
        
        return ResponseEntity.ok()
                .body(new EmailCheckResponse(!exists, exists ? "이미 사용 중인 아이디입니다" : "사용 가능한 아이디입니다"));
    }

    /**
     * 이메일 중복 체크 응답 DTO
     */
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class EmailCheckResponse {
        private boolean available;
        private String message;
    }
}

