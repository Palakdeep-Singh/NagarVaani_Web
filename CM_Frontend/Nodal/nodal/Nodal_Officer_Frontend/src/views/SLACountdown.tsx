import React from 'react';
import { useStore } from '../context/Store';
import { Clock, AlertTriangle } from 'lucide-react';

export const SLACountdown: React.FC = () => {
  const { complaints } = useStore();
  
  const active = complaints
    .filter(c => c.status !== 'Resolved' && c.status !== 'Escalated')
    .sort((a, b) => b.slaDay - a.slaDay);

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><Clock size={18} className="text-amber-600" /> SLA Countdown</div>
      <p className="text-sm text-slate-500 mb-6">Monitor grievances nearing the 21-day DARPG limit.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {active.map(c => {
          const slaPct  = Math.min(100, Math.round((c.slaDay / 21) * 100));
          const isCritical = c.slaDay >= 18;
          const isWarning = c.slaDay >= 14 && !isCritical;
          
          return (
            <div key={c.id} className={`bg-white border rounded-xl p-5 shadow-sm ${isCritical ? 'border-rose-300 bg-rose-50' : isWarning ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-mono text-slate-500">{c.id}</div>
                <div className={`text-xs font-bold px-2 py-1 rounded ${isCritical ? 'bg-rose-100 text-rose-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  Day {c.slaDay} of 21
                </div>
              </div>
              <div className="font-bold text-sm mb-1">{c.title}</div>
              <div className="text-xs text-slate-500 mb-4">{c.assignedOfficer ? `Assigned to: ${c.assignedOfficer}` : 'Unassigned'}</div>
              
              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200">
                <div className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${slaPct}%` }} />
              </div>
              
              {isCritical && (
                <div className="mt-3 flex items-start gap-1.5 text-xs text-rose-700">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>Immediate follow-up required. Nearing automatic escalation to DM/Secretary.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
