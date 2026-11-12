import React, { useState } from 'react';
import { FlaskConical, Search, FileText, Eye } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

const TestRecords = () => {
  const { medicalRecords, patients } = useData();
  const [search, setSearch] = useState('');

  const getPatientName = (patientId) => {
    const p = patients.find(pt => pt.id === patientId || String(pt.id) === String(patientId));
    return p?.name || p?.full_name || `Patient #${patientId}`;
  };

  const filtered = medicalRecords.filter(rec => {
    const q = search.toLowerCase();
    if (!q) return true;
    const num = (rec.recordNumber || rec.record_number || '').toLowerCase();
    const diag = (rec.diagnosis || '').toLowerCase();
    return num.includes(q) || diag.includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FlaskConical className="w-7 h-7 text-cyan-600" />
          Clinical Test Records
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Browse doctor-issued clinical records for laboratory reference
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by record number or diagnosis..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-800 dark:text-white"
        />
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No test records found.</p>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Clinical records created by doctors will appear here for lab technician reference.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Record #</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Diagnosis</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Visit Date</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-cyan-600">
                        {rec.recordNumber || rec.record_number || `REC-${rec.id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {getPatientName(rec.patientId || rec.patient_id)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {rec.diagnosis || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {rec.visitDate || rec.visit_date || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(rec.createdAt || rec.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRecords;
