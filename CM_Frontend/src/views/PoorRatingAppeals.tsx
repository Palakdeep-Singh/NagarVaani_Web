import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { ThumbsDown, RotateCcw } from 'lucide-react';

export const PoorRatingAppeals: React.FC = () => {
  const { complaints, reopenComplaint } = useStore();
  const [reason, setReason] = useState('');
  
  const appeals = complaints.filter(c => c.status === 'Resolved' && c.citizenRating && c.citizenRating <= 2 && !c.isReopen);

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><ThumbsDown size={18} className="text-rose-600" /> Poor-Rating Appeals</div>
      <p className="text-sm text-slate-500 mb-6">Review grievances marked "Resolved" but rated poorly by citizens. Reopen if resolution was inadequate per CPGRAMS rules.</p>

      {appeals.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">No new poor-rating appeals.</div>
      ) : (
        <div className="space-y-4">
          {appeals.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-mono text-slate-400">{c.id}</div>
                <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">Rating: {c.citizenRating}/5</div>
              </div>
              <div className="font-bold text-sm mb-1">{c.title}</div>
              <div className="text-xs text-slate-500 mb-4">Resolved by: {c.assignedOfficer}</div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-600 mb-2">Reopen Grievance</div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Reason for reopening..." 
                    className="flex-1 text-sm p-2 border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                    onChange={e => setReason(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (!reason) return alert('Provide a reason');
                      reopenComplaint(c.id, reason);
                      setReason('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 transition-colors"
                  >
                    <RotateCcw size={14} /> Reopen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
