const HIGH_RISK_TERMS = ['cardiac', 'heart', 'stroke', 'diabetes', 'sepsis', 'cancer', 'copd', 'asthma'];

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const getAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const normalizeText = (value) => String(value || '').toLowerCase();

export const calculatePatientRisk = (patient, records = [], appointments = []) => {
  const patientRecords = records.filter(record =>
    String(record.patientId) === String(patient.id) ||
    String(record.patientUserId) === String(patient.userId)
  );
  const patientAppointments = appointments.filter(appointment =>
    String(appointment.patientId) === String(patient.id) ||
    String(appointment.patientUserId) === String(patient.userId)
  );

  const factors = [];
  let score = 0;
  const age = getAge(patient.dateOfBirth);
  if (age !== null && age >= 65) {
    score += 20;
    factors.push('Age 65+');
  }

  const chronicConditions = Array.isArray(patient.chronicConditions)
    ? patient.chronicConditions
    : String(patient.chronicConditions || '').split(',').map(value => value.trim()).filter(Boolean);
  if (chronicConditions.length > 0) {
    score += Math.min(30, chronicConditions.length * 15);
    factors.push(`${chronicConditions.length} chronic condition${chronicConditions.length > 1 ? 's' : ''}`);
  }

  const clinicalText = patientRecords
    .map(record => `${record.diagnosis} ${record.symptoms}`)
    .join(' ')
    .toLowerCase();
  if (HIGH_RISK_TERMS.some(term => clinicalText.includes(term))) {
    score += 25;
    factors.push('High-risk clinical history');
  }

  const latestRecord = [...patientRecords].sort((a, b) =>
    new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
  )[0];
  const spo2 = toNumber(latestRecord?.vitals?.spo2 || latestRecord?.vitalSigns);
  if (spo2 !== null && spo2 < 94) {
    score += 20;
    factors.push('Low oxygen saturation');
  }

  const heartRate = toNumber(latestRecord?.vitals?.heartRate);
  if (heartRate !== null && (heartRate < 50 || heartRate > 110)) {
    score += 15;
    factors.push('Abnormal heart rate');
  }

  const missedAppointments = patientAppointments.filter(appointment =>
    ['missed', 'no-show', 'cancelled'].includes(normalizeText(appointment.status))
  ).length;
  if (missedAppointments > 0) {
    score += 10;
    factors.push('Missed appointment history');
  }

  const boundedScore = Math.min(100, score);
  const level = boundedScore >= 60 ? 'High' : boundedScore >= 30 ? 'Moderate' : 'Low';
  return {
    patient,
    score: boundedScore,
    level,
    factors: factors.length ? factors : ['No elevated indicators in available data'],
    recordCount: patientRecords.length,
  };
};

export const rankPatientsByRisk = (patients = [], records = [], appointments = []) =>
  patients
    .map(patient => calculatePatientRisk(patient, records, appointments))
    .sort((a, b) => b.score - a.score);
