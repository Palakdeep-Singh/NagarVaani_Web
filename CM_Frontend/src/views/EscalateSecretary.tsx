import React from 'react';
import { useStore } from '../context/Store';
import { AlertTriangle, Send } from 'lucide-react';

export const EscalateSecretary: React.FC = () => {
  const { complaints } = useStore();
  const escalated = complaints.filter(c => c.status === 'Escalated');

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><AlertTriangle size={18} className="text-rose-600" /> Escalate to Secretary</div>
      <p className="text-sm text-slate-500 mb-6">Review and escalate critical breaches to the Secretary (DARPG Guidelines).</p>

      {escalated.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">No complaints currently require escalation.</div>
      ) : (
        <div className="space-y-4">
          {escalated.map(c => (
            <div key={c.id} className="bg-rose-50 border border-rose-200 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs font-mono text-rose-500">{c.id}</div>
                  <div className="font-bold text-rose-900">{c.title}</div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700">
                  <Send size={14} /> Send Note
                </button>
              </div>
              <p className="text-sm text-rose-700 mb-2">{c.description}</p>
              <div className="text-xs text-rose-600 font-mono">Breached SLA Day: {c.slaDay}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
