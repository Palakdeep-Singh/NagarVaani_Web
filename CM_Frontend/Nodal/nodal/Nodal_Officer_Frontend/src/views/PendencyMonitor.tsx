import React from 'react';
import { useStore } from '../context/Store';
import { Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_OFFICERS } from '../data/mockData';

export const PendencyMonitor: React.FC = () => {
  const { complaints } = useStore();
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const active = complaints.filter(c => c.status === 'Active').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const chartData = [
    { day: 'Mon', backlog: 120, inflow: 45 },
    { day: 'Tue', backlog: 110, inflow: 50 },
    { day: 'Wed', backlog: 125, inflow: 60 },
    { day: 'Thu', backlog: 105, inflow: 30 },
    { day: 'Fri', backlog: 95,  inflow: 25 },
    { day: 'Sat', backlog: 80,  inflow: 20 },
    { day: 'Sun', backlog: 85,  inflow: 15 },
  ];

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><Clock size={18} className="text-teal-600" /> Pendency & Ageing Monitor</div>
      <p className="text-sm text-slate-500 mb-6">Track unresolved tickets and identify bottlenecks based on ticket age.</p>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 h-64">
        <h3 className="font-bold text-slate-800 mb-4">Backlog vs Inflow (7 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBacklog" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Area type="monotone" dataKey="backlog" stroke="#0F766E" fillOpacity={1} fill="url(#colorBacklog)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
          <div className="text-3xl font-extrabold text-slate-800">{total}</div>
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Total Grievances</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center shadow-sm">
          <div className="text-3xl font-extrabold text-amber-700">{pending}</div>
          <div className="text-xs uppercase tracking-wider font-bold text-amber-600 mt-1">Pending Assignment</div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center shadow-sm">
          <div className="text-3xl font-extrabold text-indigo-700">{active}</div>
          <div className="text-xs uppercase tracking-wider font-bold text-indigo-600 mt-1">Active / In-Progress</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center shadow-sm">
          <div className="text-3xl font-extrabold text-emerald-700">{resolved}</div>
          <div className="text-xs uppercase tracking-wider font-bold text-emerald-600 mt-1">Resolved</div>
        </div>
      </div>

      <h3 className="font-bold text-slate-800 mb-4">Officer Load</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_OFFICERS.map(o => (
          <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="font-bold text-slate-800">{o.name}</div>
            <div className="text-xs text-slate-500 mb-3">{o.department}</div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-extrabold text-amber-600 leading-none">{o.pendingCount}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Active Cases</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-600">{o.resolvedThisMonth} resolved</div>
                <div className="text-xs text-slate-500">{o.avgResolutionDays} avg days</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
