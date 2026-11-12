package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PatientUpdateRequest {

    private String fullName;

    private String gender;

    private String dateOfBirth;

    private String phone;

    private String email;

    private String bloodGroup;

    private String address;

    private String emergencyContact;

    private String allergies;

    private String chronicConditions;

    private String status;

    private String password;

    private String medicalRecordNumber;
}
