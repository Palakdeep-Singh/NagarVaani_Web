import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { MessageSquare, Send } from 'lucide-react';

export const InterimReply: React.FC = () => {
  const { complaints, sendInterimReply } = useStore();
  
  // Find active/pending complaints > 15 days old that haven't had an interim reply sent yet
  const eligible = complaints.filter(c => 
    (c.status === 'Pending' || c.status === 'Active') && 
    !c.interimSent && 
    c.slaDay >= 15
  );

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><MessageSquare size={18} className="text-amber-600" /> Interim Reply Tool</div>
      <p className="text-sm text-slate-500 mb-6">DARPG guidelines mandate an interim reply for grievances pending beyond 15 days.</p>

      {eligible.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">
          All complaints older than 15 days have received an interim reply.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eligible.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-mono text-slate-400">{c.id}</div>
                <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{c.slaDay} Days Old</div>
              </div>
              <div className="font-bold text-sm mb-1">{c.title}</div>
              <div className="text-xs text-slate-500 mb-4">Citizen: {c.citizenName} ({c.citizenPhone})</div>
              
              <button 
                onClick={() => {
                  sendInterimReply(c.id);
                  alert(`Interim reply sent via SMS/Email to ${c.citizenName}`);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <Send size={14} /> Send Auto-Reply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
