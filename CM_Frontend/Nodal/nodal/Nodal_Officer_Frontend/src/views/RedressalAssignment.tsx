import React from 'react';
import { useStore } from '../context/Store';
import { Users2, ArrowRight } from 'lucide-react';
import { MOCK_OFFICERS } from '../data/mockData';

export const RedressalAssignment: React.FC = () => {
  const { complaints, assignOfficer } = useStore();
  const unassigned = complaints.filter(c => !c.assignedOfficer && c.status === 'Pending' && c.subCategory);

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><Users2 size={18} className="text-indigo-600" /> Redressal Officer Assignment</div>
      <p className="text-sm text-slate-500 mb-6">Assign verified complaints to field officers. Only categorised grievances appear here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold mb-4 text-slate-800 border-b pb-2">Verified & Unassigned ({unassigned.length})</h3>
          {unassigned.length === 0 ? (
            <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-sm">No verified complaints awaiting assignment.</div>
          ) : (
            unassigned.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm flex flex-col gap-3">
                <div>
                  <div className="text-xs font-mono text-slate-400">{c.id}</div>
                  <div className="font-bold text-sm text-slate-800">{c.title}</div>
                  <div className="text-xs text-indigo-600 font-medium mt-1">{c.category} &gt; {c.subCategory}</div>
                </div>
                <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="text-xs font-semibold text-slate-600 mb-1 uppercase">Assign to:</div>
                  <div className="flex gap-2 flex-wrap">
                    {MOCK_OFFICERS.filter(o => o.department === c.department).map(officer => (
                      <button 
                        key={officer.id}
                        onClick={() => assignOfficer(c.id, officer.id, officer.name)}
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:border-indigo-400 hover:text-indigo-600 transition-colors text-left"
                      >
                        {officer.name} <span className="text-[10px] text-slate-400">({officer.pendingCount} pending)</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div>
          <h3 className="font-bold mb-4 text-slate-800 border-b pb-2">Field Officer Roster</h3>
          {MOCK_OFFICERS.map(officer => (
            <div key={officer.id} className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-slate-800">{officer.name}</div>
                <div className="text-xs text-slate-500">{officer.designation} · {officer.department}</div>
                <div className="text-xs font-medium mt-1 text-amber-600">{officer.pendingCount} active cases</div>
              </div>
              <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${officer.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {officer.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
