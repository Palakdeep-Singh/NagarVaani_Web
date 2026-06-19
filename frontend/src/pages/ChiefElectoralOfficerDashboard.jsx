import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, FileText, Users, Award, ShieldAlert, Cpu,
  Settings, PhoneCall, Send, AlertTriangle,
  Building, CheckCircle, Percent, RefreshCw, BarChart2,
  Clock, Volume2, UserCheck, LogOut, ArrowRight,
  Truck, AlertCircle, BookOpen, TrendingUp, Database,
  MessageSquare, Bell, Globe
} from 'lucide-react';

import { emApi, fmt, fmtMoney } from '../api/emApi.js';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const CEO_STATE = 'Uttar Pradesh';

const statusBadge = (s) => {
  const map = {
    open: { bg: '#fee2e2', color: '#dc2626', label: 'Open' },
    pending: { bg: '#fef9c3', color: '#ca8a04', label: 'Pending' },
    resolved: { bg: '#dcfce7', color: '#16a34a', label: 'Resolved' },
    closed: { bg: '#f1f5f9', color: '#64748b', label: 'Closed' },
    in_progress: { bg: '#dbeafe', color: '#2563eb', label: 'In Progress' },
  };
  const cfg = map[s?.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', label: s || '—' };
  return (
    <span style={{ backgroundColor: cfg.bg, color: cfg.color, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
      {cfg.label}
    </span>
  );
};

const priorityBadge = (p) => {
  const map = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', critical: '#7c3aed' };
  const c = map[p?.toLowerCase()] || '#64748b';
  return p ? <span style={{ color: c, fontWeight: 700, fontSize: 10 }}>{p?.toUpperCase()}</span> : null;
};

const Skeleton = ({ w = '100%', h = 20, r = 6 }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
);

const KpiCard = ({ label, value, sub, color, icon, loading }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ background: color + '18', padding: 6, borderRadius: 8, color }}>{icon}</span>
    </div>
    {loading ? <Skeleton h={28} w="70%" /> : (
      <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
    )}
    {sub && <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{sub}</div>}
  </div>
);

/* ── SVG Donut ───────────────────────────────────────────────────────────── */
const Donut = ({ data, size = 100, stroke = 12 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {total > 0 && data.map((d, i) => {
        const pct = d.value / total;
        const dash = pct * circ;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

/* ── SVG Bar Chart ───────────────────────────────────────────────────────── */
const BarChart = ({ data, color = '#2563eb', height = 100 }) => {
  if (!data || data.length === 0) return <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', paddingTop: 40 }}>No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.floor(100 / data.length);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${data.length * 30} ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const bh = Math.max(2, (d.value / max) * (height - 20));
        return (
          <g key={i}>
            <rect x={i * 30 + 4} y={height - 20 - bh} width={22} height={bh} rx={3} fill={color} opacity={0.85} />
            <text x={i * 30 + 15} y={height - 4} textAnchor="middle" fontSize={7} fill="#94a3b8">{d.label?.slice(-5)}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export default function ChiefElectoralOfficerDashboard({ user, onLogout }) {
  const userName = user?.name || 'CEO Admin';

  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Real data state
  const [stats, setStats] = useState(null);
  const [complaintsData, setComplaintsData] = useState(null);
  const [schemesData, setSchemesData] = useState(null);
  const [distData, setDistData] = useState(null);
  const [benefitTrend, setBenefitTrend] = useState(null);
  const [dataError, setDataError] = useState(null);

  // UI state
  const [broadcastText, setBroadcastText] = useState('');
  const [callModal, setCallModal] = useState({ open: false, recipient: '', number: '', isVideo: false });
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your NagarVaani CEO State Command Assistant. I monitor state-wide citizen data, complaint trends, scheme enrollment, and fund disbursement.' },
  ]);
  const [compFilter, setCompFilter] = useState('all');

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateString(now.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setDataError(null);
    try {
      const params = { state: CEO_STATE };
      const [s, c, sc, d, bt] = await Promise.all([
        emApi.getStats(params),
        emApi.getComplaints({ ...params, limit: 100 }),
        emApi.getSchemes(params),
        emApi.getUsersDist(params),
        emApi.getBenefitTrend(params),
      ]);
      setStats(s);
      setComplaintsData(c);
      setSchemesData(sc);
      setDistData(d);
      setBenefitTrend(bt);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('[CEO Dashboard] fetch error:', err);
      setDataError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(fetchAll, 60000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      let reply = `Regarding "${chatInput}": Check the CEO State Command guidelines for current operational protocols.`;
      if (q.includes('complaint')) reply = `Total complaints: ${stats?.totalComplaints || '—'} | Open: ${stats?.openComplaints || '—'} | Resolved: ${stats?.resolvedComplaints || '—'} | Resolution rate: ${stats?.resolutionRate || '—'}%`;
      else if (q.includes('scheme') || q.includes('enroll')) reply = `Active schemes: ${stats?.activeSchemes || '—'} | Total enrolled citizens: ${fmt(stats?.totalEnrolled)} | Total disbursed: ${fmtMoney(stats?.totalDisbursed)}`;
      else if (q.includes('user') || q.includes('citizen')) reply = `Total registered citizens: ${fmt(stats?.totalUsers)} | Male: ${stats?.genderBreakdown?.Male || 0} | Female: ${stats?.genderBreakdown?.Female || 0}`;
      else if (q.includes('district')) reply = `Top district: ${distData?.districts?.[0]?.district || '—'} with ${distData?.districts?.[0]?.count || 0} citizens. Total districts active: ${distData?.districts?.length || 0}`;
      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 500);
  };

  // Filtered complaints
  const filteredComplaints = (complaintsData?.complaints || []).filter(c =>
    compFilter === 'all' || c.status === compFilter
  );

  /* ── SIDEBAR ─────────────────────────────────────────────────────────── */
  const menuItems = [
    { id: 'Dashboard', name: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { id: 'State Overview', name: 'State Overview', icon: <Globe size={15} /> },
    { id: 'District Performance', name: 'District Performance', icon: <BarChart2 size={15} /> },
    { id: 'MCC & Complaint Monitor', name: 'MCC & Complaints', icon: <AlertTriangle size={15} />, badge: stats?.openComplaints > 0 ? stats.openComplaints : null },
    { id: 'Scheme Analytics', name: 'Scheme Analytics', icon: <Award size={15} /> },
    { id: 'Citizen Data', name: 'Citizen Data', icon: <Users size={15} /> },
    { id: 'Reports & Analytics', name: 'Reports & Analytics', icon: <TrendingUp size={15} /> },
    { id: 'Communication Hub', name: 'Communication Hub', icon: <Volume2 size={15} /> },
    { id: 'System Settings', name: 'System Settings', icon: <Settings size={15} /> },
  ];

  /* ── RENDER ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 260, background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>NV</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>NagarVaani</div>
              <div style={{ color: '#38bdf8', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>CEO State Command</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {menuItems.map(item => (
            <div key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                background: activeMenu === item.id ? 'linear-gradient(90deg,#2563eb,#3b82f6)' : 'transparent',
                color: activeMenu === item.id ? '#fff' : '#94a3b8',
                fontWeight: activeMenu === item.id ? 700 : 500, fontSize: 12,
                transition: 'all 0.15s ease',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{item.icon}<span>{item.name}</span></div>
              {item.badge && <span style={{ background: '#dc2626', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>{item.badge}</span>}
            </div>
          ))}
        </nav>

        {/* Bottom state summary */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>State: {CEO_STATE}</div>
            <div>Registered Citizens: <strong style={{ color: '#fff' }}>{loading ? '...' : fmt(stats?.totalUsers)}</strong></div>
            <div>Active Schemes: <strong style={{ color: '#fff' }}>{loading ? '...' : stats?.activeSchemes}</strong></div>
            <div>Open Complaints: <strong style={{ color: stats?.openComplaints > 0 ? '#fbbf24' : '#fff' }}>{loading ? '...' : stats?.openComplaints}</strong></div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5', borderRadius: 8, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>CEO Command Center</h1>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: '#dcfce7', color: '#15803d' }}>● LIVE</span>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', margin: '3px 0 0', fontWeight: 500 }}>
              State: {CEO_STATE} · {fmt(stats?.totalUsers)} Citizens · {stats?.activeSchemes} Active Schemes
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={fetchAll} disabled={loading} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 700, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <div style={{ fontSize: 11, color: '#64748b', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{timeString}</div>
              <div>{dateString}</div>
            </div>
            {stats?.openComplaints > 0 && (
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveMenu('MCC & Complaint Monitor')}>
                <Bell size={18} color="#dc2626" />
                <span style={{ position: 'absolute', top: -5, right: -5, background: '#dc2626', color: '#fff', fontSize: 8, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Math.min(stats.openComplaints, 99)}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>CEO</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{userName}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Chief Electoral Officer</div>
              </div>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {dataError && (
          <div style={{ background: '#fee2e2', borderBottom: '1px solid #fca5a5', padding: '10px 24px', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
            ⚠ Failed to load live data: {dataError}. Showing last cached data.
          </div>
        )}

        <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ════ DASHBOARD VIEW ════ */}
          {activeMenu === 'Dashboard' && (
            <>
              {/* KPI Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <KpiCard label="Registered Citizens" value={fmt(stats?.totalUsers)} sub={`State: ${CEO_STATE}`} color="#2563eb" icon={<Users size={16} />} loading={loading} />
                <KpiCard label="Total Complaints" value={fmt(stats?.totalComplaints)} sub={`${stats?.openComplaints || 0} open`} color="#dc2626" icon={<AlertTriangle size={16} />} loading={loading} />
                <KpiCard label="Resolved Complaints" value={fmt(stats?.resolvedComplaints)} sub={`${stats?.resolutionRate || 0}% resolution rate`} color="#16a34a" icon={<CheckCircle size={16} />} loading={loading} />
                <KpiCard label="Active Schemes" value={stats?.activeSchemes || '—'} sub="Central + State schemes" color="#7c3aed" icon={<Award size={16} />} loading={loading} />
                <KpiCard label="Scheme Enrollments" value={fmt(stats?.totalEnrolled)} sub="Applied + Active + Completed" color="#ea580c" icon={<UserCheck size={16} />} loading={loading} />
                <KpiCard label="Total Disbursed" value={fmtMoney(stats?.totalDisbursed)} sub="All benefit transactions" color="#059669" icon={<TrendingUp size={16} />} loading={loading} />
                <KpiCard label="Open Complaints" value={stats?.openComplaints || 0} sub="Pending resolution" color={stats?.openComplaints > 0 ? '#dc2626' : '#16a34a'} icon={<AlertCircle size={16} />} loading={loading} />
                <KpiCard label="Resolution Rate" value={`${stats?.resolutionRate || 0}%`} sub="Complaints resolved" color="#2563eb" icon={<Percent size={16} />} loading={loading} />
              </div>

              {/* Row 2: Complaint categories + Gender breakdown + Benefit trend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.6fr', gap: 20 }}>
                {/* Complaint Categories */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Complaint Categories</h3>
                  {loading ? (<><Skeleton h={14} /><br /><Skeleton h={14} /><br /><Skeleton h={14} /></>) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(complaintsData?.categoryBreakdown || []).slice(0, 8).map((c, i) => {
                        const total = complaintsData.complaints.length || 1;
                        const pct = Math.round((c.count / total) * 100);
                        const colors = ['#2563eb','#dc2626','#16a34a','#ea580c','#7c3aed','#059669','#0891b2','#d97706'];
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>
                              <span style={{ color: '#475569' }}>{c.category}</span>
                              <span style={{ color: '#0f172a' }}>{c.count}</span>
                            </div>
                            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 999 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: 999, transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Gender Breakdown */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, alignSelf: 'flex-start' }}>Gender Breakdown</h3>
                  {loading ? <Skeleton h={80} w={80} r={999} /> : (() => {
                    const g = stats?.genderBreakdown || {};
                    const total = (g.Male || 0) + (g.Female || 0) + (g.Other || 0);
                    const donutData = [
                      { value: g.Male || 0, color: '#2563eb' },
                      { value: g.Female || 0, color: '#ec4899' },
                      { value: g.Other || 0, color: '#94a3b8' },
                    ];
                    return (
                      <>
                        <div style={{ position: 'relative' }}>
                          <Donut data={donutData} size={90} stroke={14} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>Total</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{fmt(total)}</span>
                          </div>
                        </div>
                        <div style={{ width: '100%', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {[['Male', g.Male || 0, '#2563eb'], ['Female', g.Female || 0, '#ec4899'], ['Other', g.Other || 0, '#94a3b8']].map(([label, val, col]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />{label}
                              </span>
                              <strong style={{ color: '#0f172a' }}>{fmt(val)} ({total > 0 ? Math.round(val/total*100) : 0}%)</strong>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Benefit Trend */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Monthly Benefit Disbursement</h3>
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>{fmtMoney(benefitTrend?.total)} total</span>
                  </div>
                  {loading ? <Skeleton h={100} /> : (
                    <BarChart
                      data={(benefitTrend?.monthly || []).map(m => ({ label: m.month, value: m.amount }))}
                      color="#2563eb" height={110}
                    />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                    <span>Last 12 months</span>
                    <span>{benefitTrend?.count || 0} transactions</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Top Schemes + Category Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20 }}>
                {/* Top Schemes */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Top Schemes by Enrollment</h3>
                  {loading ? <Skeleton h={120} /> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ color: '#64748b', fontWeight: 700, fontSize: 10, borderBottom: '2px solid #f1f5f9' }}>
                          <th style={{ padding: '4px 8px', textAlign: 'left' }}>Scheme</th>
                          <th style={{ padding: '4px 8px', textAlign: 'center' }}>Category</th>
                          <th style={{ padding: '4px 8px', textAlign: 'right' }}>Enrolled</th>
                          <th style={{ padding: '4px 8px', textAlign: 'right' }}>Benefit</th>
                          <th style={{ padding: '4px 8px', textAlign: 'right' }}>Disbursed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(schemesData?.schemes || []).slice(0, 8).map((s, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 600, color: '#1e293b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{s.category}</span>
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{fmt(s.enrollment?.total)}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{fmtMoney(s.benefit_amount)}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#7c3aed', fontWeight: 700 }}>{fmtMoney(s.totalDisbursed)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Scheme Category Summary */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Scheme Categories</h3>
                  {loading ? <Skeleton h={120} /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(schemesData?.categoryBreakdown || []).map((cat, i) => {
                        const colors = ['#2563eb','#16a34a','#ea580c','#7c3aed','#059669','#dc2626','#0891b2'];
                        return (
                          <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', borderLeft: `3px solid ${colors[i % colors.length]}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 11 }}>
                              <span style={{ color: '#1e293b' }}>{cat.category}</span>
                              <span style={{ color: colors[i % colors.length] }}>{cat.count} schemes</span>
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                              {fmt(cat.enrolled)} enrolled · {fmtMoney(cat.disbursed)} disbursed
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Chat */}
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Cpu size={16} color="#2563eb" />
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>CEO AI Command Assistant</h3>
                </div>
                <div style={{ height: 130, overflowY: 'auto', background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', background: m.sender === 'user' ? '#2563eb' : '#fff', color: m.sender === 'user' ? '#fff' : '#334155', padding: '7px 12px', borderRadius: 10, fontSize: 11, maxWidth: '80%', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleChatSend} style={{ display: 'flex', gap: 8 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about complaints, schemes, citizens, districts..." style={{ flex: 1, padding: '8px 12px', fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none' }} />
                  <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ════ STATE OVERVIEW ════ */}
          {activeMenu === 'State Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <KpiCard label="Total Citizens" value={fmt(stats?.totalUsers)} color="#2563eb" icon={<Users size={16} />} loading={loading} sub="Registered in DB" />
                <KpiCard label="Avg Civic Score" value={`${distData?.districts?.[0]?.avgCivicScore || '—'}`} color="#16a34a" icon={<Award size={16} />} loading={loading} sub="State average" />
                <KpiCard label="Active Districts" value={distData?.districts?.length || 0} color="#7c3aed" icon={<Building size={16} />} loading={loading} sub="With registered users" />
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>District-wise Citizen Distribution</h3>
                {loading ? <Skeleton h={200} /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 11 }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>#</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>District</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Citizens</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Male</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Female</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>Avg Civic Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(distData?.districts || []).slice(0, 20).map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{d.district}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{fmt(d.count)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#2563eb' }}>{fmt(d.male)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#ec4899' }}>{fmt(d.female)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <span style={{ background: d.avgCivicScore >= 70 ? '#dcfce7' : d.avgCivicScore >= 40 ? '#fef9c3' : '#fee2e2', color: d.avgCivicScore >= 70 ? '#16a34a' : d.avgCivicScore >= 40 ? '#ca8a04' : '#dc2626', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 999 }}>
                              {d.avgCivicScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ════ DISTRICT PERFORMANCE ════ */}
          {activeMenu === 'District Performance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>District Performance Rankings</h3>
                {loading ? <Skeleton h={300} /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 11 }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Rank</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>District</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Citizens</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Civic Score</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(distData?.districts || []).map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', color: i < 3 ? '#f59e0b' : '#94a3b8', fontWeight: 800, fontSize: 13 }}>
                            {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{d.district}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(d.count)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 999 }}>
                                <div style={{ height: '100%', width: `${d.avgCivicScore}%`, background: d.avgCivicScore >= 70 ? '#16a34a' : d.avgCivicScore >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 999 }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: 11 }}>{d.avgCivicScore}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <span style={{ background: d.avgCivicScore >= 70 ? '#dcfce7' : d.avgCivicScore >= 40 ? '#fef9c3' : '#fee2e2', color: d.avgCivicScore >= 70 ? '#16a34a' : d.avgCivicScore >= 40 ? '#ca8a04' : '#dc2626', fontWeight: 700, fontSize: 10, padding: '2px 8px', borderRadius: 999 }}>
                              {d.avgCivicScore >= 70 ? 'Good' : d.avgCivicScore >= 40 ? 'Average' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ════ MCC & COMPLAINT MONITOR ════ */}
          {activeMenu === 'MCC & Complaint Monitor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Status summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                  { label: 'Total', val: stats?.totalComplaints, color: '#64748b' },
                  { label: 'Open', val: stats?.openComplaints, color: '#dc2626' },
                  { label: 'Resolved', val: stats?.resolvedComplaints, color: '#16a34a' },
                  { label: 'Resolution Rate', val: `${stats?.resolutionRate || 0}%`, color: '#2563eb' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{loading ? '…' : s.val}</div>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              <div style={{ background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>Category Breakdown</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(complaintsData?.categoryBreakdown || []).map((c, i) => {
                    const colors = ['#2563eb','#dc2626','#16a34a','#ea580c','#7c3aed','#059669','#0891b2','#d97706'];
                    return (
                      <div key={i} style={{ background: colors[i % colors.length] + '15', border: `1px solid ${colors[i % colors.length]}30`, borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: colors[i % colors.length] }}>{c.count}</div>
                        <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>{c.category}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filter + Table */}
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Live Complaints ({filteredComplaints.length})</h3>
                  <select value={compFilter} onChange={e => setCompFilter(e.target.value)} style={{ fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 10px', color: '#475569', fontWeight: 600 }}>
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                {loading ? <Skeleton h={200} /> : (
                  <div style={{ overflowY: 'auto', maxHeight: 400 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead style={{ position: 'sticky', top: 0 }}>
                        <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 10 }}>
                          <th style={{ padding: '8px 10px', textAlign: 'left' }}>Ticket No</th>
                          <th style={{ padding: '8px 10px', textAlign: 'left' }}>Title</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Category</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Priority</th>
                          <th style={{ padding: '8px 10px', textAlign: 'left' }}>District</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>Filed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.slice(0, 50).map((c, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '7px 10px', color: '#2563eb', fontWeight: 700, fontFamily: 'monospace', fontSize: 10 }}>{c.ticket_no}</td>
                            <td style={{ padding: '7px 10px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b', fontWeight: 600 }}>{c.title}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                              <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{c.category}</span>
                            </td>
                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>{statusBadge(c.status)}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>{priorityBadge(c.priority)}</td>
                            <td style={{ padding: '7px 10px', color: '#64748b', fontWeight: 600, fontSize: 10 }}>{c.district || '—'}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'right', color: '#94a3b8', fontSize: 10 }}>{c.filed_at ? new Date(c.filed_at).toLocaleDateString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ SCHEME ANALYTICS ════ */}
          {activeMenu === 'Scheme Analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <KpiCard label="Active Schemes" value={schemesData?.totalSchemes || 0} color="#7c3aed" icon={<Award size={16} />} loading={loading} sub="All active govt schemes" />
                <KpiCard label="Total Enrolled" value={fmt(schemesData?.totalEnrolled)} color="#16a34a" icon={<UserCheck size={16} />} loading={loading} sub="Across all schemes" />
                <KpiCard label="Total Disbursed" value={fmtMoney(schemesData?.totalDisbursed)} color="#059669" icon={<TrendingUp size={16} />} loading={loading} sub="Benefit transactions" />
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>All Schemes – Enrollment & Disbursement</h3>
                {loading ? <Skeleton h={300} /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 10 }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Scheme Name</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Category</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Level</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Applied</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Active</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Completed</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Benefit</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Disbursed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(schemesData?.schemes || []).map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '7px 10px', fontWeight: 700, color: '#1e293b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                            <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{s.category}</span>
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                            <span style={{ background: s.level === 'central' ? '#f5f3ff' : '#f0fdf4', color: s.level === 'central' ? '#7c3aed' : '#16a34a', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{s.level}</span>
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', color: '#f59e0b', fontWeight: 700 }}>{s.enrollment?.applied || 0}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 700 }}>{s.enrollment?.active || 0}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{s.enrollment?.completed || 0}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600 }}>{fmtMoney(s.benefit_amount)}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', color: '#7c3aed', fontWeight: 700 }}>{fmtMoney(s.totalDisbursed)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ════ CITIZEN DATA ════ */}
          {activeMenu === 'Citizen Data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <KpiCard label="Total Citizens" value={fmt(stats?.totalUsers)} color="#2563eb" icon={<Users size={16} />} loading={loading} />
                <KpiCard label="Male" value={fmt(stats?.genderBreakdown?.Male)} color="#2563eb" icon={<Users size={16} />} loading={loading} />
                <KpiCard label="Female" value={fmt(stats?.genderBreakdown?.Female)} color="#ec4899" icon={<Users size={16} />} loading={loading} />
                <KpiCard label="Other" value={fmt(stats?.genderBreakdown?.Other)} color="#94a3b8" icon={<Users size={16} />} loading={loading} />
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Citizen Category Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {Object.entries(stats?.categoryBreakdown || {}).map(([cat, cnt], i) => {
                    const colors = ['#2563eb','#16a34a','#ea580c','#7c3aed','#059669','#dc2626'];
                    return (
                      <div key={cat} style={{ background: colors[i%colors.length] + '10', border: `1px solid ${colors[i%colors.length]}30`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: colors[i%colors.length] }}>{fmt(cnt)}</div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginTop: 4 }}>{cat}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ REPORTS & ANALYTICS ════ */}
          {activeMenu === 'Reports & Analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Monthly Benefit Disbursement Trend</h3>
                  {loading ? <Skeleton h={180} /> : (
                    <BarChart data={(benefitTrend?.monthly || []).map(m => ({ label: m.month, value: m.amount }))} color="#2563eb" height={180} />
                  )}
                </div>
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Type Breakdown</h3>
                  {loading ? <Skeleton h={150} /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(benefitTrend?.typeBreakdown || []).map((t, i) => {
                        const colors = ['#2563eb','#16a34a','#ea580c'];
                        return (
                          <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{t.type?.replace(/_/g, ' ')}</span>
                            <strong style={{ fontSize: 13, color: colors[i % colors.length] }}>{fmtMoney(t.amount)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                <KpiCard label="Total Transactions" value={fmt(benefitTrend?.count)} color="#2563eb" icon={<Database size={16} />} loading={loading} />
                <KpiCard label="Total Disbursed" value={fmtMoney(benefitTrend?.total)} color="#16a34a" icon={<TrendingUp size={16} />} loading={loading} />
                <KpiCard label="Enrolled Citizens" value={fmt(stats?.totalEnrolled)} color="#7c3aed" icon={<UserCheck size={16} />} loading={loading} />
                <KpiCard label="Resolution Rate" value={`${stats?.resolutionRate || 0}%`} color="#059669" icon={<CheckCircle size={16} />} loading={loading} />
              </div>
            </div>
          )}

          {/* ════ COMMUNICATION HUB ════ */}
          {activeMenu === 'Communication Hub' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>State-wide Broadcast</h3>
                <form onSubmit={e => { e.preventDefault(); if (broadcastText.trim()) { alert(`Broadcast sent: "${broadcastText}"`); setBroadcastText(''); } }}>
                  <textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)} placeholder="Enter broadcast message to all districts..." style={{ width: '100%', minHeight: 120, padding: 14, fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 10, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ marginTop: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    📡 Send State Broadcast
                  </button>
                </form>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Quick Contacts — District Officers</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {['North DEO', 'South DEO', 'East DEO', 'West DEO', 'Central DEO', 'Rural DEO'].map((name, i) => (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>DEO</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{name}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>District Officer</div>
                      </div>
                      <button onClick={() => setCallModal({ open: true, recipient: name, number: '+91 98765 XXXXX', isVideo: false })} style={{ marginLeft: 'auto', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 10 }}>
                        <PhoneCall size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ SYSTEM SETTINGS ════ */}
          {activeMenu === 'System Settings' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>System Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}><span>Dashboard Version</span><strong style={{ color: '#0f172a' }}>v2.1.0 Live</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}><span>Database</span><strong style={{ color: '#16a34a' }}>Supabase ● Connected</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}><span>Auto-Refresh Interval</span><strong style={{ color: '#0f172a' }}>60 seconds</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}><span>Last Updated</span><strong style={{ color: '#0f172a' }}>{lastUpdated}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}><span>State Scope</span><strong style={{ color: '#0f172a' }}>{CEO_STATE}</strong></div>
              </div>
              <button onClick={fetchAll} style={{ marginTop: 16, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Force Refresh All Data
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '14px 0', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #e2e8f0', background: '#fff', fontWeight: 500 }}>
          © 2026 NagarVaani · CEO State Command Dashboard · Last updated: {lastUpdated}
        </footer>
      </main>

      {/* Call Modal */}
      {callModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', color: '#fff', borderRadius: 24, padding: 40, width: 300, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <PhoneCall size={26} color="#10b981" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 900 }}>{callModal.recipient}</h3>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 24px' }}>{callModal.number}</p>
            <button onClick={() => setCallModal({ open: false, recipient: '', number: '', isVideo: false })} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', width: '100%', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              End Call
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
      `}</style>
    </div>
  );
}
