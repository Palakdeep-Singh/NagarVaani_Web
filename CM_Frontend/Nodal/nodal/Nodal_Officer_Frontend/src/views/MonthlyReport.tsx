import React from 'react';
import { MOCK_MONTHLY_REPORTS } from '../data/mockData';
import { FileBarChart, CheckCircle2 } from 'lucide-react';

export const MonthlyReport: React.FC = () => {
  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><FileBarChart size={18} className="text-indigo-600" /> Monthly Data Report</div>
      <p className="text-sm text-slate-500 mb-6">Historical reporting data required for upper-level submission.</p>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Received</th>
                <th>Resolved</th>
                <th>Avg Days</th>
                <th>SLA Breaches</th>
                <th>Satisfaction</th>
                <th>CPGRAMS Sync</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MONTHLY_REPORTS.map(r => (
                <tr key={r.month}>
                  <td className="font-bold">{r.month}</td>
                  <td>{r.totalReceived}</td>
                  <td className="text-emerald-600 font-bold">{r.totalResolved}</td>
                  <td>{r.avgResolutionDays}</td>
                  <td className={r.slaBreachCount > 15 ? 'text-rose-600 font-bold' : ''}>{r.slaBreachCount}</td>
                  <td>{r.citizenSatisfactionScore}/5</td>
                  <td>
                    {r.cpgramsSubmitted ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold"><CheckCircle2 size={14}/> Synced</span>
                    ) : (
                      <button className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] uppercase font-bold hover:bg-indigo-100">Sync Now</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
