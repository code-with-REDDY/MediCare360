package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NurseUpdateRequest {

    private String shift;

    private String status;

    private Long departmentId;

    private String phone;
}

