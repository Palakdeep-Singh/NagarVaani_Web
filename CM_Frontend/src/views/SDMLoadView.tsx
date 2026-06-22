import React from 'react';
import { MOCK_SDM_OFFICERS } from '../data/mockData';
import { BarChart3, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const SDMLoadView: React.FC = () => {
  const chartData = MOCK_SDM_OFFICERS.map(sdm => ({
    name: sdm.name,
    Pending: sdm.pendingCount,
    Resolved: sdm.resolvedThisMonth
  }));

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><BarChart3 size={18} className="text-indigo-600" /> SDM Load View</div>
      <p className="text-sm text-slate-500 mb-6">Monitor grievance load and performance metrics across all Sub-Divisional Magistrates.</p>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 h-72">
        <h3 className="font-bold text-slate-800 mb-4">Workload Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend iconType="circle" />
            <Bar dataKey="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
            <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MOCK_SDM_OFFICERS.map(sdm => {
          const totalLoad = sdm.pendingCount + sdm.resolvedThisMonth;
          const resolvePct = Math.round((sdm.resolvedThisMonth / totalLoad) * 100);
          
          return (
            <div key={sdm.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{sdm.name}</div>
                    <div className="text-xs text-slate-500">{sdm.designation} · {sdm.zone}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                  sdm.available ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {sdm.available ? 'Available' : 'On Leave'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Pending</div>
                  <div className="text-xl font-bold text-amber-600">{sdm.pendingCount}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Resolved</div>
                  <div className="text-xl font-bold text-emerald-600">{sdm.resolvedThisMonth}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Avg Days</div>
                  <div className="text-xl font-bold text-indigo-600">{sdm.avgResolutionDays}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                  <span>Resolution Rate</span>
                  <span>{resolvePct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${resolvePct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
