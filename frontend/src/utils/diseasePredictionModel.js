const DISEASE_PROFILES = [
  {
    name: 'Upper respiratory infection',
    keywords: ['cough', 'sore throat', 'runny nose', 'congestion', 'sneezing', 'cold'],
    weights: { cough: 2.2, 'sore throat': 1.8, 'runny nose': 1.7, congestion: 1.5, sneezing: 1.2, cold: 1.2 },
  },
  {
    name: 'Influenza-like illness',
    keywords: ['fever', 'chills', 'body ache', 'fatigue', 'headache', 'muscle pain'],
    weights: { fever: 2.1, chills: 1.8, 'body ache': 1.9, fatigue: 1.4, headache: 1.3, 'muscle pain': 1.6 },
  },
  {
    name: 'Asthma exacerbation',
    keywords: ['wheezing', 'shortness of breath', 'breathlessness', 'chest tightness', 'asthma'],
    weights: { wheezing: 2.5, 'shortness of breath': 2.2, breathlessness: 2.2, 'chest tightness': 1.8, asthma: 2.4 },
  },
  {
    name: 'Gastroenteritis',
    keywords: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'stomach pain', 'cramps'],
    weights: { nausea: 1.8, vomiting: 2.2, diarrhea: 2.3, 'abdominal pain': 1.7, 'stomach pain': 1.7, cramps: 1.3 },
  },
  {
    name: 'Hypertension',
    keywords: ['hypertension', 'high blood pressure', 'headache', 'dizziness', 'blurred vision'],
    weights: { hypertension: 2.5, 'high blood pressure': 2.5, headache: 0.8, dizziness: 1.1, 'blurred vision': 1.4 },
  },
];

const normalize = (value) => String(value || '').toLowerCase().trim();

const parseNumber = (value) => {
  const parsed = Number.parseFloat(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const softmax = (scores) => {
  const max = Math.max(...scores);
  const exponents = scores.map(score => Math.exp(score - max));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map(value => value / total);
};

export const predictDiseases = ({ symptoms = '', diagnosis = '', bloodPressure = '', temperature = '', spo2 = '' } = {}) => {
  const text = normalize(`${symptoms} ${diagnosis}`);
  const temperatureValue = parseNumber(temperature);
  const spo2Value = parseNumber(spo2);
  const bloodPressureMatch = normalize(bloodPressure).match(/(\d{2,3})\s*[/\\]\s*(\d{2,3})/);
  const systolic = bloodPressureMatch ? Number(bloodPressureMatch[1]) : null;

  const rawScores = DISEASE_PROFILES.map(profile => {
    const matchedIndicators = profile.keywords.filter(keyword => text.includes(keyword));
    let score = matchedIndicators.reduce((sum, keyword) => sum + profile.weights[keyword], 0);
    if (profile.name === 'Influenza-like illness' && temperatureValue !== null && temperatureValue >= 100.4) score += 1.8;
    if (profile.name === 'Hypertension' && systolic !== null && systolic >= 140) score += 2.4;
    if (profile.name === 'Asthma exacerbation' && spo2Value !== null && spo2Value < 95) score += 1.5;
    return { profile, score, matchedIndicators };
  });

  const hasSignal = rawScores.some(result => result.score > 0);
  if (!hasSignal) return [];

  const probabilities = softmax(rawScores.map(result => result.score));
  return rawScores
    .map((result, index) => ({
      disease: result.profile.name,
      confidence: Math.round(probabilities[index] * 100),
      matchedIndicators: result.matchedIndicators,
    }))
    .filter(result => result.confidence >= 10 && result.matchedIndicators.length > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
};
