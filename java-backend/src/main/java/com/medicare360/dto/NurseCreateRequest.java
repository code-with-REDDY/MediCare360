package com.medicare360.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NurseCreateRequest {

    @NotBlank
    private String fullName;

    private Long departmentId;

    private String shift = "Morning";

    @NotBlank
    private String phone;

    @NotBlank
    @Email
    private String email;

    private String status = "Active";

    @NotBlank
    private String licenseNumber;

    private String password;
}

