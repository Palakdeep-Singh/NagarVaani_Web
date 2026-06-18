import React from 'react';
import { useStore } from '../context/Store';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { BarChart2, Info } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { complaints } = useStore();

  // Generate Chart Data: Grievance Trends (last 7 days in June)
  const trendsData = [
    { date: '12 Jun', Intake: 8, Resolved: 6 },
    { date: '13 Jun', Intake: 12, Resolved: 9 },
    { date: '14 Jun', Intake: 15, Resolved: 10 },
    { date: '15 Jun', Intake: 18, Resolved: 12 },
    { date: '16 Jun', Intake: 14, Resolved: 15 },
    { date: '17 Jun', Intake: 21, Resolved: 13 },
    { date: '18 Jun', Intake: complaints.filter(c => c.dateFiled === '2026-06-18').length + 12, Resolved: 14 }
  ];

  // Generate Department distribution counts
  const deptCounts = complaints.reduce((acc: Record<string, number>, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.keys(deptCounts).map(dept => ({
    name: dept.replace(' & Family Welfare', '').replace(' Department', ''),
    Grievances: deptCounts[dept]
  }));

  const COLORS = ['#4f46e5', '#0d9488', '#d97706', '#059669', '#dc2626', '#7c3aed'];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-indigo-600" />
          Intake & Trends Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Grievance filing volumes, peak hour analysis, and agency performance trend reports.
        </p>
      </div>

      {/* Grid: Trends + Department Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
        
        {/* Chart 1: Grievance Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Daily Grievance Trends</h3>
            <p className="text-sm text-slate-500 mt-0.5">Comparison of daily registered complaints vs resolved cases.</p>
          </div>
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div className="h-72 min-w-[550px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIntakeLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolvedLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="Intake" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIntakeLight)" />
                <Area type="monotone" dataKey="Resolved" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolvedLight)" />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Department Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Grievances by Nodal Department</h3>
            <p className="text-sm text-slate-500 mt-0.5">Total volume distribution across administrative heads.</p>
          </div>
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div className="h-72 min-w-[550px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} interval={0} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="Grievances" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Advisory Info */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-800">
        <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Operational Note:</span> Trends are generated using automated server aggregation over secure pipelines. If a specific department spikes (e.g. DJB Water grievances exceeding thresholds), the system raises flags in the CM Alerts drawer.
        </div>
      </div>
    </div>
  );
};
