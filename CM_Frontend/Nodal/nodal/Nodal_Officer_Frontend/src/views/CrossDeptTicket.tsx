import React from 'react';
import { MOCK_CROSS_DEPT_TICKETS } from '../data/mockData';
import { Share2 } from 'lucide-react';

export const CrossDeptTicket: React.FC = () => {
  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><Share2 size={18} className="text-indigo-600" /> Cross-Dept Shared Tickets</div>
      <p className="text-sm text-slate-500 mb-6">Manage grievances requiring joint action from multiple departments.</p>

      <div className="space-y-4">
        {MOCK_CROSS_DEPT_TICKETS.map(t => (
          <div key={t.ticketId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-mono font-bold text-indigo-600">{t.ticketId}</div>
                <div className="text-xs text-slate-500 mt-1">Linked Complaint: {t.complaintId}</div>
              </div>
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] uppercase font-bold rounded border border-indigo-200">{t.status}</span>
            </div>
            
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-600 uppercase mb-2">Involved Departments</div>
              <div className="flex gap-2 flex-wrap">
                {t.departments.map(d => <span key={d} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">{d}</span>)}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-600 uppercase mb-2">Action Log</div>
              <div className="space-y-2">
                {t.actions.map((act, i) => (
                  <div key={i} className="text-sm bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-semibold text-slate-800">{act.dept}:</span> {act.action}
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{act.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
