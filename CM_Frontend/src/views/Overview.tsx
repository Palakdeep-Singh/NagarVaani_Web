import React from 'react';
import { useStore } from '../context/Store';
import { Heatmap } from '../components/Heatmap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import {
  ShieldAlert, CheckCircle2, Clock, FileText,
  AlertTriangle, BrainCircuit, ArrowUpRight, TrendingUp, Sparkles
} from 'lucide-react';
import { formatINR } from '../utils/helper';

export const Overview: React.FC = () => {
  const { complaints, files, projects, officers } = useStore();

  // 1. Calculations for top KPI cards
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionPercentage = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  
  const emergencyCount = complaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;
  const pendingFilesCount = files.filter(f => f.status === 'Pending Approval').length;

  // 2. Generate Chart Data: Grievance Trends (last 7 days in June)
  const trendsData = [
    { date: '12 Jun', Intake: 8, Resolved: 6 },
    { date: '13 Jun', Intake: 12, Resolved: 9 },
    { date: '14 Jun', Intake: 15, Resolved: 10 },
    { date: '15 Jun', Intake: 18, Resolved: 12 },
    { date: '16 Jun', Intake: 14, Resolved: 15 },
    { date: '17 Jun', Intake: 21, Resolved: 13 },
    { date: '18 Jun', Intake: complaints.filter(c => c.dateFiled === '2026-06-18').length + 12, Resolved: 14 }
  ];

  // 3. Generate Department Data
  const deptCounts = complaints.reduce((acc: Record<string, number>, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.keys(deptCounts).map(dept => ({
    name: dept.replace(' & Family Welfare', '').replace(' Department', ''),
    Grievances: deptCounts[dept]
  }));

  const COLORS = ['#6366f1', '#0d9488', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  // 4. District Ranking Calculation
  const districtRankings = officers
    .filter(o => o.district) // Filter to DMs
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
    .sort((a, b) => b.score - a.score); // Highest score first

  // 5. AI Suggestion Insights
  const aiInsights = [
    {
      topic: 'Monsoon Waterlogging Hotspots Identified',
      source: 'Auto-grouped from 12 PWD infrastructure complaints',
      summary: 'Recurring drainage choking detected at Ring Road (Lajpat Nagar) & Outer Ring Road (IIT Flyover). Machine models estimate a 92% flood risk probability for the next heavy rain cycle.',
      action: 'Direct PWD to initiate desilting verification and execute emergency pump deployment plans.',
      severity: 'High'
    },
    {
      topic: 'Contaminated Water Supplies Seepage Risk',
      source: 'Auto-grouped from 8 Delhi Jal Board complaints',
      summary: 'Multiple complaints in West Delhi (Vikas Puri) report blackish water supply. Sewage pipe line crossings are adjacent to drinking mains. Health risk index elevated in Block C/D.',
      action: 'Direct West Delhi DM to inspect site and schedule water quality testing within 12 hours.',
      severity: 'Emergency'
    },
    {
      topic: 'Health Center Pharmacy Shortages',
      source: 'Auto-grouped from 6 Mohalla Clinic reports',
      summary: 'Medicine stockout audits report high shortage rates of pediatric antibiotics and basic antipyretics in North East Delhi clinics. Citizen dissatisfaction increased by 30%.',
      action: 'Initiate digital file DF-2026-512 to authorize fast-track platelet and stock purchases.',
      severity: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            CM Executive Grievance Dashboard
            <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/25">
              Live Feed
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time insights, district accountability reports, and civic service delivery monitoring.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Active Portfolio Budget</span>
            <div className="text-sm font-extrabold text-teal-400 font-mono">
              {formatINR(projects.reduce((acc, p) => acc + p.budgetAllocated, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Case Intake */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-indigo-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Intake Cases</span>
            <h3 className="text-2xl font-extrabold text-white font-mono">{totalCount}</h3>
            <span className="text-[10px] text-indigo-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +15% from last week
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <ShieldAlert className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-emerald-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resolution SLA</span>
            <h3 className="text-2xl font-extrabold text-white font-mono">{resolutionPercentage}%</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {resolvedCount} cases closed
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        {/* Emergency Escalls */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-rose-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Cases</span>
            <h3 className="text-2xl font-extrabold text-white font-mono">{emergencyCount}</h3>
            <span className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
              <AlertTriangle className="h-3 w-3 text-rose-400 animate-pulse" /> Immediate Field Action
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="h-6 w-6 text-rose-400 animate-bounce" />
          </div>
        </div>

        {/* E-File Approvals */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-amber-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-File Approvals</span>
            <h3 className="text-2xl font-extrabold text-white font-mono">{pendingFilesCount}</h3>
            <span className="text-[10px] text-amber-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Signatures pending
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <FileText className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Grid: Heatmap + Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap (2 cols) */}
        <div className="lg:col-span-2">
          <Heatmap />
        </div>

        {/* Leaderboard District Rankings (1 col) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                District Leaderboard
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">Performance SLA</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Ranking of Delhi's 11 administrative zones by grievance resolution rate.
            </p>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {districtRankings.map((rank, idx) => (
                <div key={rank.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5 truncate">
                      <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] ${
                        idx < 3 ? 'bg-indigo-600/30 text-indigo-400 font-extrabold border border-indigo-500/35' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      {rank.name}
                    </span>
                    <span className="font-mono text-white font-bold">{rank.score}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rank.score >= 85 ? 'bg-emerald-500' : rank.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${rank.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 px-0.5">
                    <span>Active: {rank.active} of {rank.total}</span>
                    <span>DM: {rank.officer.split(' ')[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Grievance Trends */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="mb-4">
            <h3 className="text-md font-bold text-white">Daily Grievance Trends</h3>
            <p className="text-xs text-slate-400 mt-1">Comparison of daily registered complaints vs resolved cases.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Intake" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIntake)" />
                <Area type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Distribution */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="mb-4">
            <h3 className="text-md font-bold text-white">Grievances by Nodal Department</h3>
            <p className="text-xs text-slate-400 mt-1">Total volume distribution across administrative heads.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="Grievances" radius={[8, 8, 0, 0]} maxBarSize={45}>
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Suggestion Dashboard (AI Overview) */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/10">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-400 animate-pulse" />
              Suggestion Dashboard & Policy Recommendation (AI-Overview)
            </h3>
            <p className="text-xs text-slate-400">
              Natural Language Processing models grouping individual citizen complaints into system-wide actionable items.
            </p>
          </div>
          <span className="text-[10px] font-bold text-teal-400 bg-teal-950/40 border border-teal-500/20 px-2 py-1 rounded-md flex items-center gap-1 select-none">
            <Sparkles className="h-3 w-3 fill-teal-400" /> NLP Models Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    insight.severity === 'Emergency' ? 'bg-rose-950/60 text-rose-400 border-rose-500/30' :
                    insight.severity === 'High' ? 'bg-amber-950/40 text-amber-400 border-amber-500/20' :
                    'bg-indigo-950/40 text-indigo-300 border-indigo-500/20'
                  }`}>
                    {insight.severity} Priority
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium truncate max-w-[150px]">{insight.source}</span>
                </div>
                <h4 className="text-sm font-extrabold text-white mb-2 leading-snug">
                  {insight.topic}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {insight.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-900 space-y-2.5">
                <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" /> AI Recommended Action:
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-300 italic bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/10">
                  "{insight.action}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
