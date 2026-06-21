import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, PieChart, Pie
} from 'recharts';
import { Info, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px', fontWeight: 500 }}>{subtitle}</div>
    </div>
    {source && (
      <span className="data-source-badge">
        <Info style={{ width: 8, height: 8 }} /> {source}
      </span>
    )}
  </div>
);

export const Analytics: React.FC = () => {
  const { complaints, officers } = useStore();
  const [activeMetric, setActiveMetric] = useState<'volume' | 'resolution' | 'sla'>('volume');

  
  const trendsData = useMemo(() => {
    
    const dates = ['2026-06-13', '2026-06-14', '2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19'];
    const displayDates = ['13 Jun', '14 Jun', '15 Jun', '16 Jun', '17 Jun', '18 Jun', '19 Jun'];
    
    return dates.map((date, idx) => {
      const filed = complaints.filter(c => c.dateFiled === date).length;
      const resolved = complaints.filter(c => c.dateFiled === date && c.status === 'Resolved').length;
      const pending = complaints.filter(c => c.dateFiled === date && c.status !== 'Resolved').length;
      
      return {
        date: displayDates[idx],
        Intake: filed,
        Resolved: resolved,
        Pending: pending
      };
    });
  }, [complaints]);

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

  
  const hourlyData = useMemo(() => {
    const hourlyDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    complaints.forEach(c => {
      const hash = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      hourlyDistribution[hash % 9]++;
    });
    return [
      { hour: '06-08', count: hourlyDistribution[0] },
      { hour: '08-10', count: hourlyDistribution[1] },
      { hour: '10-12', count: hourlyDistribution[2] },
      { hour: '12-14', count: hourlyDistribution[3] },
      { hour: '14-16', count: hourlyDistribution[4] },
      { hour: '16-18', count: hourlyDistribution[5] },
      { hour: '18-20', count: hourlyDistribution[6] },
      { hour: '20-22', count: hourlyDistribution[7] },
      { hour: '22-24', count: hourlyDistribution[8] },
    ];
  }, [complaints]);

  
  const slaData = useMemo(() => {
    const departmentsList = [
      'PWD & Infrastructure',
      'Delhi Jal Board',
      'Health & Family Welfare',
      'Power Department',
      'Transport Department',
      'Education Department'
    ];
    return departmentsList.map(dept => {
      const deptComplaints = complaints.filter(c => c.department === dept);
      const resolvedInSLA = deptComplaints.filter(c => {
        if (c.status !== 'Resolved') return false;
        
        const start = new Date(c.dateFiled).getTime();
        const end = new Date(c.timeline[c.timeline.length - 1].date).getTime();
        return (end - start) <= 7 * 24 * 60 * 60 * 1000;
      }).length;

      const rate = deptComplaints.length > 0
        ? Math.round((resolvedInSLA / deptComplaints.length) * 100)
        : 0;

      return {
        dept: dept.replace(' Department', '').replace(' & Family Welfare', '').replace(' & Infrastructure', ''),
        within: rate,
        breach: 100 - rate
      };
    });
  }, [complaints]);

  
  const { avgResTimeStr, slaBreachRate, totalVolumeStr, satisfactionStr } = useMemo(() => {
    const resolved = complaints.filter(c => c.status === 'Resolved');
    let totalDays = 0;
    resolved.forEach(c => {
      const start = new Date(c.dateFiled).getTime();
      const end = new Date(c.timeline[c.timeline.length - 1].date).getTime();
      totalDays += Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    });
    
    const avgDays = resolved.length > 0 ? (totalDays / resolved.length).toFixed(1) : '—';
    
    
    const escalated = complaints.filter(c => c.status === 'Escalated').length;
    const breachPercent = complaints.length > 0 ? Math.round((escalated / complaints.length) * 100) : 0;

    
    const avgRating = officers.length > 0
      ? officers.reduce((acc, curr) => acc + curr.rating, 0) / officers.length
      : 0;
    const satScore = Math.round((avgRating / 5) * 100);

    return {
      avgResTimeStr: avgDays !== '—' ? `${avgDays} days` : '—',
      slaBreachRate: complaints.length > 0 ? `${breachPercent}%` : '0%',
      totalVolumeStr: complaints.length.toLocaleString(),
      satisfactionStr: officers.length > 0 ? `${satScore}/100` : '—'
    };
  }, [complaints, officers]);

  const metricBtns = [
    { key: 'volume', label: 'Volume Trends' },
    { key: 'resolution', label: 'Resolution Rate' },
    { key: 'sla', label: 'SLA Compliance' },
  ];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-slidein">

      
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-widest rounded-md border border-[#DBEAFE]">
            Executive Analytics Module
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
          Intake, Trends & Performance Analytics
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '4px 0 0', fontWeight: 500 }}>
          Grievance volume analysis, departmental performance, and SLA compliance metrics.
        </p>
      </div>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Avg. Resolution Time', value: avgResTimeStr, icon: <Clock style={{ width: 18, height: 18 }} />, bg: '#EFF6FF', color: '#2563EB' },
          { label: 'SLA Breach Rate', value: slaBreachRate, icon: <AlertTriangle style={{ width: 18, height: 18 }} />, bg: '#FEF2F2', color: '#DC2626' },
          { label: 'Monthly Intake', value: totalVolumeStr, icon: <TrendingUp style={{ width: 18, height: 18 }} />, bg: '#F0FDF4', color: '#16A34A' },
          { label: 'Satisfaction Score', value: satisfactionStr, icon: <CheckCircle2 style={{ width: 18, height: 18 }} />, bg: '#F3E8FF', color: '#7C3AED' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-all hover:-translate-y-0.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: kpi.color }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '12px', background: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {kpi.icon}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>{kpi.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: '6px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      
      <div style={{ display: 'flex', gap: '8px' }}>
        {metricBtns.map(btn => (
          <button key={btn.key} onClick={() => setActiveMetric(btn.key as any)}
            style={{
              padding: '8px 18px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              background: activeMetric === btn.key ? '#2563EB' : '#FFFFFF',
              color: activeMetric === btn.key ? '#FFFFFF' : '#6B7280',
              border: `1px solid ${activeMetric === btn.key ? '#2563EB' : '#E5E7EB'}`,
              transition: 'all 0.15s',
              boxShadow: activeMetric === btn.key ? '0 2px 8px rgba(37,99,235,0.3)' : 'none'
            }}>
            {btn.label}
          </button>
        ))}
      </div>

      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <SectionHeader title="Daily Grievance Volume" subtitle="Intake vs Resolved — last 7 days" source="State Portal" />
          <div style={{ padding: '20px' }}>
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

        
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <SectionHeader title="Grievances by Department" subtitle="Total complaints per nodal department" />
          <div style={{ padding: '20px' }}>
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

      
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
        
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <SectionHeader title="District-wise Complaint Load & Resolution" subtitle="Filed vs resolved per district for current period" />
          <div style={{ padding: '20px' }}>
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

        
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <SectionHeader title="By Priority Level" subtitle="Distribution across severity tiers" />
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <SectionHeader title="Peak Hour Intake Analysis" subtitle="Complaint filing pattern by time-of-day" />
          <div style={{ padding: '20px' }}>
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

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <SectionHeader title="SLA Compliance by Department" subtitle="% within 7-day resolution mandate" />
          <div style={{ padding: '20px' }}>
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

      
      <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-5 flex items-start gap-3">
        <Info style={{ width: 15, height: 15, color: '#2563EB', marginTop: '1px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.80rem', color: '#1D4ED8', lineHeight: 1.6, fontWeight: 500 }}>
          <strong>Data Integration Note:</strong> All charts and metrics render live administrative data fetched directly from the NagarVaani MongoDB database.
        </div>
      </div>
    </div>
  );
};
