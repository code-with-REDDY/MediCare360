package com.medicare360.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PharmacistCreateRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    private String licenseNumber;

    @NotBlank
    private String phone;

    @NotBlank
    @Email
    private String email;

    private String status = "Active";

    private String password;
}

