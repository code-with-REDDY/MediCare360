# MediCare360 Database Entity-Relationship Diagram

This diagram reflects the SQLite database at `data/medicare360.db` and the
Spring JPA entity mappings. It excludes the technical `alembic_version` table.

```mermaid
erDiagram
    USERS {
        INTEGER id PK
        VARCHAR email UK
        VARCHAR hashed_password
        VARCHAR full_name
        VARCHAR role
        VARCHAR phone
        BOOLEAN is_active
        BOOLEAN is_verified
        DATETIME last_login
        VARCHAR department
    }

    DEPARTMENTS {
        INTEGER id PK
        VARCHAR code UK
        VARCHAR name
        TEXT description
        VARCHAR head_of_department
        VARCHAR status
        BOOLEAN is_active
    }

    PATIENTS {
        INTEGER id PK
        VARCHAR patient_id UK
        INTEGER user_id FK
        VARCHAR full_name
        VARCHAR gender
        VARCHAR date_of_birth
        VARCHAR blood_group
        VARCHAR phone
        VARCHAR email
        TEXT allergies
        TEXT chronic_conditions
        VARCHAR status
    }

    DOCTORS {
        INTEGER id PK
        VARCHAR doctor_id UK
        INTEGER user_id FK
        INTEGER department_id FK
        VARCHAR full_name
        VARCHAR specialization
        VARCHAR qualification
        INTEGER experience_years
        FLOAT consultation_fee
        VARCHAR available_days
        VARCHAR status
    }

    NURSES {
        INTEGER id PK
        VARCHAR nurse_id UK
        INTEGER user_id FK
        INTEGER department_id FK
        VARCHAR full_name
        VARCHAR shift
        VARCHAR license_number
        VARCHAR status
    }

    RECEPTIONISTS {
        INTEGER id PK
        VARCHAR receptionist_id UK
        INTEGER user_id FK
        VARCHAR full_name
        VARCHAR shift
        VARCHAR status
    }

    PHARMACISTS {
        INTEGER id PK
        VARCHAR pharmacist_id UK
        INTEGER user_id FK
        VARCHAR full_name
        VARCHAR license_number
        VARCHAR status
    }

    APPOINTMENTS {
        INTEGER id PK
        VARCHAR appointment_number UK
        INTEGER patient_id FK
        INTEGER doctor_id FK
        INTEGER department_id FK
        VARCHAR appointment_date
        VARCHAR appointment_time
        VARCHAR type
        VARCHAR reason
        VARCHAR status
    }

    MEDICAL_RECORDS {
        INTEGER id PK
        VARCHAR record_number UK
        INTEGER patient_id FK
        INTEGER doctor_id FK
        VARCHAR diagnosis
        TEXT symptoms
        TEXT examination_notes
        TEXT vital_signs
        TEXT attachments
        VARCHAR visit_date
    }

    PRESCRIPTIONS {
        INTEGER id PK
        VARCHAR prescription_number UK
        INTEGER patient_id FK
        INTEGER doctor_id FK
        INTEGER appointment_id FK
        VARCHAR diagnosis
        TEXT instructions
        VARCHAR status
    }

    PRESCRIPTION_ITEMS {
        INTEGER id PK
        INTEGER prescription_id FK
        VARCHAR medicine_name
        VARCHAR dosage
        VARCHAR frequency
        VARCHAR duration
        VARCHAR instructions
    }

    MEDICINES {
        INTEGER id PK
        VARCHAR code UK
        VARCHAR name
        VARCHAR generic_name
        VARCHAR category
        VARCHAR manufacturer
        FLOAT unit_price
        INTEGER stock_quantity
        INTEGER min_stock_threshold
        VARCHAR expiry_date
        VARCHAR status
    }

    MEDICINE_ISSUE_RECORDS {
        INTEGER id PK
        INTEGER prescription_id FK
        INTEGER medicine_id FK
        INTEGER patient_id FK
        INTEGER quantity
        VARCHAR dispensed_by
        DATETIME dispensed_at
        TEXT notes
    }

    INVOICES {
        INTEGER id PK
        VARCHAR invoice_number UK
        INTEGER patient_id FK
        INTEGER appointment_id FK
        TEXT description
        TEXT items_json
        FLOAT subtotal
        FLOAT tax
        FLOAT discount
        FLOAT total_amount
        VARCHAR payment_status
        VARCHAR payment_method
        DATETIME paid_at
    }

    NOTIFICATIONS {
        INTEGER id PK
        INTEGER user_id FK
        VARCHAR title
        TEXT message
        VARCHAR type
        BOOLEAN is_read
        VARCHAR link
        DATETIME read_at
    }

    AUDIT_LOGS {
        INTEGER id PK
        INTEGER user_id FK
        VARCHAR user_name
        VARCHAR user_email
        VARCHAR action
        TEXT details
        VARCHAR resource
        VARCHAR resource_id
        VARCHAR ip_address
        VARCHAR user_agent
    }

    STAFF_SCHEDULES {
        INTEGER id PK
        VARCHAR staff_type
        INTEGER staff_id
        VARCHAR staff_name
        VARCHAR day_of_week
        VARCHAR shift_start
        VARCHAR shift_end
        VARCHAR duty_location
    }

    USERS ||--o| PATIENTS : "has profile"
    USERS ||--o| DOCTORS : "has profile"
    USERS ||--o| NURSES : "has profile"
    USERS ||--o| RECEPTIONISTS : "has profile"
    USERS ||--o| PHARMACISTS : "has profile"
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : creates

    DEPARTMENTS ||--o{ DOCTORS : contains
    DEPARTMENTS ||--o{ NURSES : contains
    DEPARTMENTS ||--o{ APPOINTMENTS : categorizes

    PATIENTS ||--o{ APPOINTMENTS : books
    DOCTORS ||--o{ APPOINTMENTS : attends
    PATIENTS ||--o{ MEDICAL_RECORDS : owns
    DOCTORS ||--o{ MEDICAL_RECORDS : writes
    PATIENTS ||--o{ PRESCRIPTIONS : receives
    DOCTORS ||--o{ PRESCRIPTIONS : issues
    APPOINTMENTS ||--o{ PRESCRIPTIONS : produces
    PRESCRIPTIONS ||--o{ PRESCRIPTION_ITEMS : contains
    PRESCRIPTIONS ||--o{ MEDICINE_ISSUE_RECORDS : fulfills
    MEDICINES ||--o{ MEDICINE_ISSUE_RECORDS : dispensed
    PATIENTS ||--o{ MEDICINE_ISSUE_RECORDS : receives
    PATIENTS ||--o{ INVOICES : billed
    APPOINTMENTS ||--o{ INVOICES : generates
```

## Relationship caveats

- `staff_schedules.staff_id` and `staff_type` form a polymorphic reference and
  have no database foreign-key constraint.
- `prescription_items.medicine_name` is stored as text; it does not reference
  `medicines.id`. The inventory link is represented by
  `medicine_issue_records.medicine_id`.
- `audit_logs.resource_id` is a generic text identifier rather than a foreign
  key to one specific resource table.
- The role-profile links (`users` to patients, doctors, nurses, receptionists,
  and pharmacists) are modeled as optional one-to-zero-or-one relationships in
  the JPA entities, although the SQLite schema does not enforce uniqueness on
  every `user_id` column.
