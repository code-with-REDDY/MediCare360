# MediCare360

MediCare360 is a full-stack hospital management platform with role-based clinical,
administrative, pharmacy, laboratory, billing, and patient workflows. It combines
a React/Vite frontend with a Java 21/Spring Boot backend and a SQLite persistence
layer suitable for local development.

## Features

- Role-based portals for administrators, doctors, nurses, receptionists,
  pharmacists, laboratory technicians, and patients.
- Patient registration, appointments, doctor schedules, medical records,
  vitals, prescriptions, pharmacy inventory, medicine issue records, billing,
  notifications, audit logs, and department management.
- JWT authentication with Spring Security, role enforcement, validation, and
  centralized API error handling.
- Responsive React UI with Tailwind CSS, protected routes, theme support, and
  service modules for backend API integration.
- Clinical decision-support models in the browser:
  - `diseasePredictionModel.js` uses weighted symptom, diagnosis, temperature,
    blood-pressure, and oxygen-saturation indicators to rank likely conditions.
  - `patientRiskModel.js` calculates an explainable 0–100 patient risk score from
    demographics, chronic conditions, clinical history, vitals, and attendance.
  - These are decision-support heuristics, not diagnostic replacements or
    externally trained medical models; clinicians must review the results.

## Architecture

- **Frontend:** React 19, Vite 6, React Router, Tailwind CSS, Recharts,
  Axios, and Lucide icons.
- **Backend:** Java 21, Spring Boot 3.2.5, Spring MVC, Spring Data JPA,
  Spring Security, JWT, Bean Validation, MapStruct, and Lombok.
- **Database:** SQLite through Hibernate Community Dialects, with migration
  documentation under `database/`.
- **Deployment:** Netlify-compatible frontend configuration and Railway/
  Procfile deployment configuration for the backend.

## Project layout

```text
frontend/       React/Vite application
java-backend/   Spring Boot API and tests
database/       Database migration and ERD documentation
data/           Local runtime database files (ignored by Git)
```

## Getting started

### Requirements

- Node.js 18+
- Java 21 JDK
- Maven 3.9+ (optional when using the existing backend JAR)

### Run the backend

```powershell
.\run-backend.ps1
```

The backend runs at `http://localhost:8080`; health check:
`http://localhost:8080/health`.

### Run the frontend

```powershell
.\run-frontend.ps1
```

The frontend runs at `http://localhost:3000`.

Alternatively:

```powershell
cd java-backend
mvn spring-boot:run

cd ..\frontend
npm install
npm run dev
```

## Testing

```powershell
cd java-backend
mvn test

cd ..
powershell -ExecutionPolicy Bypass -File .\test-api-suite.ps1
```

The API suite expects the backend to be running. Do not commit local databases,
JWT secrets, `.env` files, generated build output, or patient data.

## License

This project is licensed under the MIT License.
