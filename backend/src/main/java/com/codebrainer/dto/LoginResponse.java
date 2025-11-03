package com.codebrainer.dto;

import com.codebrainer.entity.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String name;
    private String role;

    public static LoginResponse of(User user, String token) {
        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }
}


