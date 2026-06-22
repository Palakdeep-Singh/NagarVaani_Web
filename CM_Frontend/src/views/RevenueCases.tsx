import React from 'react';
import { MOCK_REVENUE_CASES } from '../data/mockData';
import { FileText, Clock } from 'lucide-react';

export const RevenueCases: React.FC = () => {
  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><FileText size={18} className="text-indigo-600" /> Revenue Case Tracker</div>
      <p className="text-sm text-slate-500 mb-6">Track land disputes, property mutations, and statutory deadlines for revenue cases.</p>

      <div className="gov-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Type & Parties</th>
                <th>Ward</th>
                <th>Assigned Patwari</th>
                <th>Filed Date</th>
                <th>Status</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REVENUE_CASES.map(rc => (
                <tr key={rc.id}>
                  <td><span className="font-mono text-xs text-slate-500">{rc.id}</span></td>
                  <td>
                    <div className="font-bold text-sm text-slate-800">{rc.caseType}</div>
                    <div className="text-xs text-slate-500">{rc.parties}</div>
                  </td>
                  <td className="text-sm">{rc.ward}</td>
                  <td className="text-sm">{rc.assignedPatwari}</td>
                  <td className="text-sm">{rc.filedDate}</td>
                  <td>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                      rc.status === 'Disposed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {rc.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock size={14} className={rc.daysToDeadline < 0 ? 'text-rose-500' : 'text-amber-500'} />
                      <span className={rc.daysToDeadline < 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {rc.daysToDeadline < 0 ? `Breached by ${Math.abs(rc.daysToDeadline)} days` : `${rc.daysToDeadline} days left`}
                      </span>
                    </div>
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
