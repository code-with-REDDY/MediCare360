import React, { useMemo, useState } from 'react';
import { AlertTriangle, BrainCircuit, ChevronDown, ShieldCheck } from 'lucide-react';
import { rankPatientsByRisk } from '../../utils/patientRiskModel';

const levelStyles = {
  High: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  Moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const PredictiveRiskPanel = ({ patients, medicalRecords, appointments }) => {
  const [expandedPatient, setExpandedPatient] = useState(null);
  const rankedPatients = useMemo(
    () => rankPatientsByRisk(patients, medicalRecords, appointments),
    [patients, medicalRecords, appointments]
  );
  const highRisk = rankedPatients.filter(item => item.level === 'High').length;
  const moderateRisk = rankedPatients.filter(item => item.level === 'Moderate').length;

  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Predictive Patient Risk Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explainable model using available demographics, clinical records, vitals, and attendance.
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{highRisk} high</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">{moderateRisk} moderate</span>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
        <span>Decision support only. This score is not a diagnosis and should be reviewed with current clinical findings.</span>
      </div>

      {rankedPatients.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">Patient data is not available for analysis.</div>
      ) : (
        <div className="space-y-2">
          {rankedPatients.slice(0, 6).map(item => {
            const isExpanded = expandedPatient === item.patient.id;
            return (
              <div key={item.patient.id} className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedPatient(isExpanded ? null : item.patient.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.patient.name || item.patient.fullName}</p>
                    <p className="text-[11px] text-slate-400">{item.recordCount} clinical record{item.recordCount === 1 ? '' : 's'}</p>
                  </div>
                  <div className="w-20">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>{item.score}/100</span>
                      <span>{item.level}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${item.level === 'High' ? 'bg-rose-500' : item.level === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.max(item.score, 4)}%` }} />
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${levelStyles[item.level]}`}>{item.level}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">Contributing indicators</p>
                    <div className="flex flex-wrap gap-2">
                      {item.factors.map(factor => (
                        <span key={factor} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[11px] text-slate-600 dark:text-slate-300">{factor}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5" /> Scores are calculated in the browser from the data currently available to this doctor.
      </div>
    </section>
  );
};

export default PredictiveRiskPanel;
