package com.medicare360.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    private String fullName;

    private String phoneNumber;

    private String role;
}
