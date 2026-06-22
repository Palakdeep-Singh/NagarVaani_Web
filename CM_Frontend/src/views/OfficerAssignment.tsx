import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Users2, ArrowRight } from 'lucide-react';
import { MOCK_SDM_OFFICERS } from '../data/mockData';

export const OfficerAssignment: React.FC = () => {
  const { complaints, updateAssignedSDM } = useStore();
  const unassigned = complaints.filter(c => !c.assignedSDM && c.status === 'Pending');

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><Users2 size={18} /> Officer Assignment</div>
      <p className="text-sm text-slate-500 mb-6">Assign pending complaints to Sub-Divisional Magistrates based on load and zone.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold mb-4">Pending Assignment ({unassigned.length})</h3>
          {unassigned.length === 0 ? (
            <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-sm">No complaints pending assignment.</div>
          ) : (
            unassigned.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm">
                <div className="text-xs font-mono text-slate-400">{c.id}</div>
                <div className="font-bold text-sm">{c.title}</div>
                <div className="text-xs text-slate-500 mt-1">{c.category} · {c.ward}</div>
              </div>
            ))
          )}
        </div>
        <div>
          <h3 className="font-bold mb-4">SDM Availability</h3>
          {MOCK_SDM_OFFICERS.map(sdm => (
            <div key={sdm.id} className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm flex justify-between items-center">
              <div>
                <div className="font-bold text-sm">{sdm.name}</div>
                <div className="text-xs text-slate-500">{sdm.designation} · {sdm.zone}</div>
                <div className="text-xs text-indigo-600 font-medium mt-1">{sdm.pendingCount} pending</div>
              </div>
              <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${sdm.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {sdm.available ? 'Available' : 'On Leave'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
