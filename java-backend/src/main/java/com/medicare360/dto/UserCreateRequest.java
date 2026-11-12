package com.medicare360.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserCreateRequest {

    private String email;

    private String password;

    @JsonAlias({"fullName", "full_name", "name"})
    private String fullName;

    private String role;

    @JsonAlias({"phoneNumber", "phone_number", "phone"})
    private String phoneNumber;

    private String department;
}
