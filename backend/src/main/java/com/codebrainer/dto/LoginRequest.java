package com.codebrainer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    @NotBlank(message = "아이디 또는 이메일은 필수입니다")
    private String emailOrUsername;

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}


