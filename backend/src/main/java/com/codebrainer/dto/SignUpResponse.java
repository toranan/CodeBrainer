package com.codebrainer.dto;

import com.codebrainer.entity.User;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 회원가입 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpResponse {

    private Long id;
    private String email;
    private String name;
    private String role;
    private LocalDateTime createdAt;

    /**
     * User 엔티티로부터 DTO 생성
     */
    public static SignUpResponse from(User user) {
        return SignUpResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

