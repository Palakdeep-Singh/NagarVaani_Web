import React from 'react';
import { useStore } from '../context/Store';
import { Award, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Rankings: React.FC = () => {
  const { complaints, officers } = useStore();

  
  const districtRankings = officers
    .filter(o => o.district) 
    .map(dm => {
      const distComplaints = complaints.filter(c => c.district === dm.district);
      const total = distComplaints.length;
      const active = distComplaints.filter(c => c.status !== 'Resolved').length;
      const score = total > 0 ? Math.round(((total - active) / total) * 100) : 100;
      return {
        name: dm.district!,
        score,
        active,
        total,
        officer: dm.name
      };
    })
    .sort((a, b) => b.score - a.score); 

  return (
    <div className="space-y-6">
            <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-600" />
          District Performance Leaderboard
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Grievance resolution SLA leaderboard ranking Delhi's 11 administrative zones.
        </p>
      </div>

      {/* Roster Layout */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in duration-200">
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider pb-3 border-b border-slate-100">
          <span>Rank & District Zone</span>
          <span>SLA Performance Score</span>
        </div>

        <div className="space-y-5">
          {districtRankings.map((rank, idx) => {
            const hasGoodScore = rank.score >= 80;
            return (
              <div key={rank.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/60 hover:bg-slate-50 transition-colors">
                
                {/* Left side info */}
                <div className="flex items-center gap-3 min-w-[250px]">
                  <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-350' :
                    idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      {rank.name}
                      {hasGoodScore ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      )}
                    </h4>
                    <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                      DM: {rank.officer} • Active Complaints: {rank.active} of {rank.total}
                    </span>
                  </div>
                </div>

                {/* Progress bar + percentage */}
                <div className="flex-1 flex items-center gap-4 max-w-md">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rank.score >= 85 ? 'bg-emerald-500' : rank.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${rank.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 shrink-0">
                    {rank.score}%
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Advisory Info */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-800">
        <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Accountability Policy:</span> Districts falling below a **70% SLA threshold** are automatically flagged by the CM Secretariat for immediate inspection reports. Top 3 districts receive digital merit citations.
        </div>
      </div>
    </div>
  );
};
