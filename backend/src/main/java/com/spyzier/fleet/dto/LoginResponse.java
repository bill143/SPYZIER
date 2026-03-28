package com.spyzier.fleet.dto;

import com.spyzier.fleet.model.Role;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
}
