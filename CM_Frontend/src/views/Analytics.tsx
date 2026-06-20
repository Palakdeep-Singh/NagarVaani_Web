import React, { useState } from 'react';
import { useStore } from '../context/Store';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, Line, Legend, PieChart, Pie
} from 'recharts';
import { BarChart2, Info, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const GOV_COLORS = ['#2563EB', '#16A34A', '#DC2626', '#D97706', '#7C3AED', '#0891B2', '#DB2777', '#65A30D'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #d4dae3', borderRadius: '3px', padding: '10px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '0.84rem', color: '#1e2a38' }}>
      <div style={{ fontWeight: 700, marginBottom: '6px', fontFamily: 'var(--font-heading)', color: '#0d1e30' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '2px', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#6b7a8a' }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; subtitle: string; source?: string }> = ({ title, subtitle, source }) => (
  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8edf3', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 600, color: '#0d1e30' }}>{title}</div>
      <div style={{ fontSize: '0.78rem', color: '#6b7a8a', marginTop: '2px' }}>{subtitle}</div>
    </div>
    {source && (
      <span className="data-source-badge">
        <Info style={{ width: 8, height: 8 }} /> {source}
      </span>
    )}
  </div>
);

export const Analytics: React.FC = () => {
  const { complaints } = useStore();
  const [activeMetric, setActiveMetric] = useState<'volume' | 'resolution' | 'sla'>('volume');

  const trendsData = [
    { date: '13 Jun', Intake: 12, Resolved: 9, Pending: 3 },
    { date: '14 Jun', Intake: 15, Resolved: 10, Pending: 5 },
    { date: '15 Jun', Intake: 18, Resolved: 12, Pending: 6 },
    { date: '16 Jun', Intake: 14, Resolved: 15, Pending: 5 },
    { date: '17 Jun', Intake: 21, Resolved: 13, Pending: 8 },
    { date: '18 Jun', Intake: 19, Resolved: 16, Pending: 7 },
    { date: '19 Jun', Intake: complaints.filter(c => c.dateFiled === '2026-06-19').length + 14, Resolved: 12, Pending: 9 },
  ];

  const deptCounts = complaints.reduce((acc: Record<string, number>, curr) => {
    const key = curr.department?.replace(' & Family Welfare', '').replace(' Department', '') || 'Other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const departmentData = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, Grievances]) => ({ name, Grievances }));

  const districtCounts = complaints.reduce((acc: Record<string, { total: number; resolved: number }>, curr) => {
    if (!acc[curr.district]) acc[curr.district] = { total: 0, resolved: 0 };
    acc[curr.district].total++;
    if (curr.status === 'Resolved') acc[curr.district].resolved++;
    return acc;
  }, {});
  const districtData = Object.entries(districtCounts)
    .map(([district, d]) => ({
      district: district.length > 10 ? district.slice(0, 9) + '…' : district,
      Total: d.total,
      Resolved: d.resolved,
      ResRate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0
    }))
    .sort((a, b) => b.Total - a.Total);

  const priorityCounts = complaints.reduce((acc: Record<string, number>, curr) => {
    acc[curr.priority] = (acc[curr.priority] || 0) + 1;
    return acc;
  }, {});
  const priorityData = ['Emergency', 'High', 'Medium', 'Low']
    .filter(p => priorityCounts[p])
    .map((p, i) => ({ name: p, value: priorityCounts[p], fill: GOV_COLORS[i] }));

  const hourlyData = [
    { hour: '06-08', count: 4 }, { hour: '08-10', count: 18 }, { hour: '10-12', count: 34 },
    { hour: '12-14', count: 22 }, { hour: '14-16', count: 28 }, { hour: '16-18', count: 19 },
    { hour: '18-20', count: 12 }, { hour: '20-22', count: 7 }, { hour: '22-24', count: 3 },
  ];

  const slaData = [
    { dept: 'PWD', within: 78, breach: 22 }, { dept: 'DJB', within: 62, breach: 38 },
    { dept: 'Health', within: 85, breach: 15 }, { dept: 'Revenue', within: 71, breach: 29 },
    { dept: 'Transport', within: 90, breach: 10 }, { dept: 'Education', within: 88, breach: 12 },
  ];

  const metricBtns = [
    { key: 'volume', label: 'Volume Trends' },
    { key: 'resolution', label: 'Resolution Rate' },
    { key: 'sla', label: 'SLA Compliance' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-slidein">

      {/* Header */}
      <div>
        <div style={{ fontSize: '0.6rem', color: '#6b7a8a', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          Executive Analytics Module
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 600, color: '#0d1e30', margin: 0 }}>
          Intake, Trends & Performance Analytics
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#6b7a8a', margin: '3px 0 0' }}>
          Grievance volume analysis, departmental performance, and SLA compliance metrics.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Avg. Resolution Time', value: '4.2 days', icon: <Clock style={{ width: 14, height: 14, color: '#1a3a5c' }} />, accent: '#1a3a5c' },
          { label: 'SLA Breach Rate', value: '23%', icon: <AlertTriangle style={{ width: 14, height: 14, color: '#e8600d' }} />, accent: '#e8600d' },
          { label: 'Monthly Intake', value: '1,284', icon: <TrendingUp style={{ width: 14, height: 14, color: '#138808' }} />, accent: '#138808' },
          { label: 'Satisfaction Score', value: '68/100', icon: <CheckCircle2 style={{ width: 14, height: 14, color: '#1a6b8a' }} />, accent: '#1a6b8a' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #d4dae3', borderLeft: `3px solid ${kpi.accent}`, borderRadius: '3px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              {kpi.icon}
              <span style={{ fontSize: '0.74rem', color: '#6b7a8a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{kpi.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, color: '#0d1e30' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {metricBtns.map(btn => (
          <button key={btn.key} onClick={() => setActiveMetric(btn.key as any)}
            style={{
              padding: '6px 14px', borderRadius: '3px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer',
              background: activeMetric === btn.key ? '#1a3a5c' : '#ffffff',
              color: activeMetric === btn.key ? '#ffffff' : '#4a5568',
              border: `1px solid ${activeMetric === btn.key ? '#1a3a5c' : '#d4dae3'}`
            }}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Daily trends */}
        <div style={{ background: '#fff', border: '1px solid #d4dae3', borderRadius: '4px', overflow: 'hidden' }}>
          <SectionHeader title="Daily Grievance Volume" subtitle="Intake vs Resolved — last 7 days" source="State Portal" />
          <div style={{ padding: '16px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendsData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIntake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#1a3a5c" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#138808" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#138808" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
                <XAxis dataKey="date" stroke="#aab4c0" fontSize={10} tickLine={false} />
                <YAxis stroke="#aab4c0" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.80rem' }} />
                <Area type="monotone" dataKey="Intake" stroke="#1a3a5c" strokeWidth={2} fillOpacity={1} fill="url(#gIntake)" />
                <Area type="monotone" dataKey="Resolved" stroke="#138808" strokeWidth={2} fillOpacity={1} fill="url(#gResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept bar chart */}
        <div style={{ background: '#fff', border: '1px solid #d4dae3', borderRadius: '4px', overflow: 'hidden' }}>
          <SectionHeader title="Grievances by Department" subtitle="Total complaints per nodal department" />
          <div style={{ padding: '16px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={departmentData.slice(0, 7)} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" vertical={false} />
                <XAxis dataKey="name" stroke="#aab4c0" fontSize={9} tickLine={false} interval={0} />
                <YAxis stroke="#aab4c0" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Grievances" radius={[2, 2, 0, 0]} maxBarSize={36}>
                  {departmentData.map((_, index) => (
                    <Cell key={index} fill={GOV_COLORS[index % GOV_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* District comparison */}
        <div style={{ background: '#fff', border: '1px solid #d4dae3', borderRadius: '4px', overflow: 'hidden' }}>
          <SectionHeader title="District-wise Complaint Load & Resolution" subtitle="Filed vs resolved per district for current period" />
          <div style={{ padding: '16px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={districtData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" vertical={false} />
                <XAxis dataKey="district" stroke="#aab4c0" fontSize={9} tickLine={false} />
                <YAxis stroke="#aab4c0" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.80rem' }} />
                <Bar dataKey="Total" fill="#1a3a5c" radius={[2, 2, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Resolved" fill="#138808" radius={[2, 2, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority pie */}
        <div style={{ background: '#fff', border: '1px solid #d4dae3', borderRadius: '4px', overflow: 'hidden' }}>
          <SectionHeader title="By Priority Level" subtitle="Distribution across severity tiers" />
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
              {priorityData.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.80rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: 9, height: 9, background: p.fill, borderRadius: '2px', display: 'inline-block' }} />
                    <span style={{ color: '#4a5568' }}>{p.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#0d1e30' }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly intake + SLA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#fff', border: '1px solid #d4dae3', borderRadius: '4px', overflow: 'hidden' }}>
          <SectionHeader title="Peak Hour Intake Analysis" subtitle="Complaint filing pattern by time-of-day" />
          <div style={{ padding: '16px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" vertical={false} />
                <XAxis dataKey="hour" stroke="#aab4c0" fontSize={9} tickLine={false} />
                <YAxis stroke="#aab4c0" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Filings" fill="#1a6b8a" radius={[2, 2, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #d4dae3', borderRadius: '4px', overflow: 'hidden' }}>
          <SectionHeader title="SLA Compliance by Department" subtitle="% within 7-day resolution mandate" />
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {slaData.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.80rem', marginBottom: '4px' }}>
                    <span style={{ color: '#4a5568', fontWeight: 600 }}>{d.dept}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: d.within >= 80 ? '#138808' : d.within >= 65 ? '#c8941c' : '#e8600d', fontWeight: 600 }}>
                      {d.within}% in-SLA
                    </span>
                  </div>
                  <div style={{ height: '7px', background: '#e8edf3', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${d.within}%`, height: '100%', background: d.within >= 80 ? '#138808' : d.within >= 65 ? '#c8941c' : '#e8600d', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e8edf3', display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#138808' }}>
                <span style={{ width: 8, height: 8, background: '#138808', borderRadius: '2px', display: 'inline-block' }} /> ≥80% On track
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#c8941c' }}>
                <span style={{ width: 8, height: 8, background: '#c8941c', borderRadius: '2px', display: 'inline-block' }} /> 65–79% Moderate risk
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#e8600d' }}>
                <span style={{ width: 8, height: 8, background: '#e8600d', borderRadius: '2px', display: 'inline-block' }} /> &lt;65% Breach risk
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data footnote */}
      <div style={{ background: '#eff5fb', border: '1px solid #9ab8d8', borderRadius: '3px', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Info style={{ width: 13, height: 13, color: '#1a3a5c', marginTop: '1px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.80rem', color: '#1a3a5c', lineHeight: 1.5 }}>
          <strong>Data Integration Note:</strong> All charts currently render synthetic data generated for demonstration purposes. Production integration is planned with CPGRAMS (Central Public Grievance Redress and Monitoring System), State Treasury IFMS, and NIC e-Office for live feeds. Source labels will update on integration.
        </div>
      </div>
    </div>
  );
};
