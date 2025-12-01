package com.codebrainer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${allowed.origins:http://localhost:3000,http://localhost:3001}")
    private String allowedOrigins;

    /**
     * BCryptPasswordEncoder 빈 설정
     * Spring Security의 BCryptPasswordEncoder를 사용하여 비밀번호 암호화
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Spring Security 필터 체인 설정
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (REST API에서는 일반적으로 비활성화)
            .csrf(AbstractHttpConfigurer::disable)
            
            // CORS 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 세션 관리 - Stateless (JWT 등 사용 시)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 요청 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 회원가입, 로그인, 에러 페이지는 인증 없이 접근 가능
                .requestMatchers("/auth/**", "/public/**", "/error").permitAll()
                // 나머지는 인증 필요
                .anyRequest().authenticated()
            );

        return http.build();
    }

    /**
     * CORS 설정 (Next.js 프론트엔드와 통신)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 Origin (프론트엔드 주소) - 환경변수에서 읽어오기
        String[] origins = allowedOrigins.split(",");
        configuration.setAllowedOrigins(Arrays.asList(origins));

        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(
            Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        );

        // 허용할 헤더
        configuration.setAllowedHeaders(List.of("*"));

        // 자격증명 허용 (쿠키 등)
        configuration.setAllowCredentials(true);

        // 노출할 헤더
        configuration.setExposedHeaders(
            Arrays.asList("Authorization", "Content-Type")
        );

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

