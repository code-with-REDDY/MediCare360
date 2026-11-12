package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DoctorCreateRequest {

    private String fullName;

    private String specialization;

    private String qualification;

    private String phone;

    private String email;

    private Long departmentId;

    private Integer experienceYears;

    private Double consultationFee;

    private String availableDays;

    private String status;

    private String password;
}
