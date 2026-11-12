package com.medicare360.repository;

import com.medicare360.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    Page<MedicalRecord> findByPatient_IdOrderByCreatedAtDesc(Long patientId, Pageable pageable);

    Optional<MedicalRecord> findByRecordNumber(String recordNumber);
}
