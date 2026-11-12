package com.medicare360.service;

import com.medicare360.dto.MedicalRecordCreateRequest;
import com.medicare360.dto.MedicalRecordResponse;
import com.medicare360.dto.MedicalRecordUpdateRequest;
import com.medicare360.entity.Doctor;
import com.medicare360.entity.MedicalRecord;
import com.medicare360.entity.Patient;
import com.medicare360.entity.User;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.DoctorRepository;
import com.medicare360.repository.MedicalRecordRepository;
import com.medicare360.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AuditService auditService;

    public MedicalRecordService(
            MedicalRecordRepository medicalRecordRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AuditService auditService
    ) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getMulti(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<MedicalRecord> records = medicalRecordRepository.findAll(pageable);
        return records.getContent().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getPatientHistory(Long patientId, int skip, int limit) {
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size);

        Page<MedicalRecord> records = medicalRecordRepository.findByPatient_IdOrderByCreatedAtDesc(patientId, pageable);
        return records.getContent().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));
        return toResponse(record);
    }

    @Transactional
    public MedicalRecordResponse create(MedicalRecordCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = null;
        if (req.getDoctorId() != null) {
            doctor = doctorRepository.findById(req.getDoctorId()).orElse(null);
        }

        MedicalRecord record = new MedicalRecord();
        record.setRecordNumber("REC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        record.setPatient(patient);
        record.setDoctor(doctor);
        record.setDiagnosis(req.getDiagnosis());
        record.setSymptoms(req.getSymptoms());
        record.setExaminationNotes(req.getExaminationNotes());
        record.setVitalSigns(req.getVitalSigns());
        record.setAttachments(req.getAttachments());
        record.setVisitDate(req.getVisitDate());

        record = medicalRecordRepository.save(record);

        auditService.logAction(
                "MEDICAL_RECORD_CREATED",
                "MedicalRecord",
                currentUser,
                record.getId().toString(),
                Map.of("patient_id", patient.getId(), "diagnosis", record.getDiagnosis()),
                ipAddress,
                userAgent
        );

        return toResponse(record);
    }

    @Transactional
    public MedicalRecordResponse update(Long id, MedicalRecordUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (req.getDiagnosis() != null) record.setDiagnosis(req.getDiagnosis());
        if (req.getSymptoms() != null) record.setSymptoms(req.getSymptoms());
        if (req.getExaminationNotes() != null) record.setExaminationNotes(req.getExaminationNotes());
        if (req.getVitalSigns() != null) record.setVitalSigns(req.getVitalSigns());
        if (req.getAttachments() != null) record.setAttachments(req.getAttachments());
        if (req.getVisitDate() != null) record.setVisitDate(req.getVisitDate());

        record = medicalRecordRepository.save(record);

        auditService.logAction(
                "MEDICAL_RECORD_UPDATED",
                "MedicalRecord",
                currentUser,
                record.getId().toString(),
                Map.of("id", record.getId()),
                ipAddress,
                userAgent
        );

        return toResponse(record);
    }

    public MedicalRecordResponse toResponse(MedicalRecord r) {
        MedicalRecordResponse res = new MedicalRecordResponse();
        res.setId(r.getId());
        res.setRecordNumber(r.getRecordNumber());
        if (r.getPatient() != null) {
            res.setPatientId(r.getPatient().getId());
            res.setPatientName(r.getPatient().getFullName());
        }
        if (r.getDoctor() != null) {
            res.setDoctorId(r.getDoctor().getId());
            res.setDoctorName(r.getDoctor().getFullName());
        }
        res.setDiagnosis(r.getDiagnosis());
        res.setSymptoms(r.getSymptoms());
        res.setExaminationNotes(r.getExaminationNotes());
        res.setVitalSigns(r.getVitalSigns());
        res.setAttachments(r.getAttachments());
        res.setVisitDate(r.getVisitDate());
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());
        return res;
    }
}

