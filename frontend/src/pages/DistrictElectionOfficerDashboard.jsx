import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, FileText, Users, Award, ShieldAlert, Cpu,
  Settings, PhoneCall, Send, AlertTriangle,
  Building, CheckCircle, Percent, RefreshCw, BarChart2,
  Volume2, UserCheck, LogOut, AlertCircle,
  Truck, TrendingUp, Database, Lock, Camera, Zap, Bell
} from 'lucide-react';

import { emApi, fmt, fmtMoney } from '../api/emApi.js';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const statusBadge = (s) => {
  const map = {
    open: { bg: '#fee2e2', color: '#dc2626', label: 'Open' },
    pending: { bg: '#fef9c3', color: '#ca8a04', label: 'Pending' },
    resolved: { bg: '#dcfce7', color: '#16a34a', label: 'Resolved' },
    closed: { bg: '#f1f5f9', color: '#64748b', label: 'Closed' },
    in_progress: { bg: '#dbeafe', color: '#2563eb', label: 'In Progress' },
  };
  const cfg = map[s?.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', label: s || '—' };
  return <span style={{ backgroundColor: cfg.bg, color: cfg.color, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>{cfg.label}</span>;
};

const priorityBadge = (p) => {
  const map = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', critical: '#7c3aed' };
  const c = map[p?.toLowerCase()] || '#64748b';
  return p ? <span style={{ color: c, fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>{p}</span> : null;
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
    {loading ? <Skeleton h={26} w="70%" /> : <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{value ?? '—'}</div>}
    {sub && <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{sub}</div>}
  </div>
);

const StatusChip = ({ label, status }) => {
  const isOk = ['online', 'active', 'intact', 'operational', 'present'].includes(status?.toLowerCase());
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{label}</span>
      <span style={{ background: isOk ? '#dcfce7' : '#fee2e2', color: isOk ? '#16a34a' : '#dc2626', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
        {isOk ? '✓ ' : '✗ '}{status}
      </span>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export default function DistrictElectionOfficerDashboard({ user, onLogout }) {
  const userName = user?.name || 'DEO Admin';
  const userDistrict = user?.district || 'AHMEDABAD';

  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Real data state
  const [stats, setStats] = useState(null);
  const [complaintsData, setComplaintsData] = useState(null);
  const [schemesData, setSchemesData] = useState(null);
  const [dataError, setDataError] = useState(null);

  // UI state
  const [broadcastText, setBroadcastText] = useState('');
  const [callModal, setCallModal] = useState({ open: false, recipient: '', number: '' });
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: `Hello! I am your NagarVaani DEO Command Assistant for ${userDistrict} district. I monitor citizen data, complaints, and scheme enrollment in your district.` },
  ]);
  const [compFilter, setCompFilter] = useState('all');
  const [compCatFilter, setCompCatFilter] = useState('all');

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
      const params = { district: userDistrict };
      const [s, c, sc] = await Promise.all([
        emApi.getStats(params),
        emApi.getComplaints({ ...params, limit: 100 }),
        emApi.getSchemes(params),
      ]);
      setStats(s);
      setComplaintsData(c);
      setSchemesData(sc);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setDataError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userDistrict]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const id = setInterval(fetchAll, 60000); return () => clearInterval(id); }, [fetchAll]);

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      let reply = `Regarding "${chatInput}": Check the DEO Command Handbook for protocols.`;
      if (q.includes('complaint')) reply = `District ${userDistrict}: ${stats?.totalComplaints} total complaints, ${stats?.openComplaints} open, ${stats?.resolvedComplaints} resolved. Resolution rate: ${stats?.resolutionRate}%`;
      else if (q.includes('scheme') || q.includes('enroll')) reply = `Active schemes: ${stats?.activeSchemes} | Enrolled: ${fmt(stats?.totalEnrolled)} | Disbursed: ${fmtMoney(stats?.totalDisbursed)}`;
      else if (q.includes('citizen') || q.includes('user')) reply = `Total citizens in ${userDistrict}: ${fmt(stats?.totalUsers)}`;
      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 500);
  };

  // Filtered complaints
  const filteredComplaints = (complaintsData?.complaints || []).filter(c =>
    (compFilter === 'all' || c.status === compFilter) &&
    (compCatFilter === 'all' || c.category === compCatFilter)
  );

  const categories = [...new Set((complaintsData?.complaints || []).map(c => c.category).filter(Boolean))];

  /* ── Sidebar ─────────────────────────────────────────────────────────── */
  const menuItems = [
    { id: 'Dashboard', name: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { id: 'District Overview', name: 'District Overview', icon: <Building size={15} /> },
    { id: 'Complaint Monitor', name: 'Complaint Monitor', icon: <AlertTriangle size={15} />, badge: stats?.openComplaints > 0 ? stats.openComplaints : null },
    { id: 'Scheme Management', name: 'Scheme Management', icon: <Award size={15} /> },
    { id: 'Citizen Data', name: 'Citizen Data', icon: <Users size={15} /> },
    { id: 'Strong Room Status', name: 'Strong Room Status', icon: <Lock size={15} /> },
    { id: 'Vehicle Tracking', name: 'Vehicle Tracking', icon: <Truck size={15} /> },
    { id: 'Staff Report', name: 'Staff Report', icon: <UserCheck size={15} /> },
    { id: 'Communication Hub', name: 'Communication Hub', icon: <Volume2 size={15} /> },
    { id: 'System Settings', name: 'System Settings', icon: <Settings size={15} /> },
  ];

  /* ── RENDER ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 260, background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#0891b2,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 12 }}>DEO</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>NagarVaani</div>
              <div style={{ color: '#38bdf8', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>DEO District Command</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {menuItems.map(item => (
            <div key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                background: activeMenu === item.id ? 'linear-gradient(90deg,#0891b2,#2563eb)' : 'transparent',
                color: activeMenu === item.id ? '#fff' : '#94a3b8',
                fontWeight: activeMenu === item.id ? 700 : 500, fontSize: 12,
                transition: 'all 0.15s ease',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{item.icon}<span>{item.name}</span></div>
              {item.badge && <span style={{ background: '#dc2626', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>District: {userDistrict}</div>
            <div>Citizens: <strong style={{ color: '#fff' }}>{loading ? '…' : fmt(stats?.totalUsers)}</strong></div>
            <div>Open Complaints: <strong style={{ color: stats?.openComplaints > 0 ? '#fbbf24' : '#fff' }}>{loading ? '…' : stats?.openComplaints}</strong></div>
            <div>Resolution Rate: <strong style={{ color: '#fff' }}>{loading ? '…' : `${stats?.resolutionRate || 0}%`}</strong></div>
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
              <h1 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>DEO Command Centre</h1>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: '#dcfce7', color: '#15803d' }}>● LIVE</span>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', margin: '3px 0 0', fontWeight: 500 }}>
              District: {userDistrict} · {fmt(stats?.totalUsers)} Citizens · {stats?.openComplaints || 0} Open Complaints
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
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveMenu('Complaint Monitor')}>
                <Bell size={18} color="#dc2626" />
                <span style={{ position: 'absolute', top: -5, right: -5, background: '#dc2626', color: '#fff', fontSize: 8, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Math.min(stats.openComplaints, 99)}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0891b2,#2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>DEO</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{userName}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>District Election Officer</div>
              </div>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {dataError && (
          <div style={{ background: '#fee2e2', borderBottom: '1px solid #fca5a5', padding: '10px 24px', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
            ⚠ Failed to load data: {dataError}
          </div>
        )}

        <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ════ DASHBOARD ════ */}
          {activeMenu === 'Dashboard' && (
            <>
              {/* KPI Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <KpiCard label="Total Citizens" value={fmt(stats?.totalUsers)} color="#2563eb" icon={<Users size={16} />} loading={loading} sub={`District: ${userDistrict}`} />
                <KpiCard label="Open Complaints" value={stats?.openComplaints || 0} color={stats?.openComplaints > 0 ? '#dc2626' : '#16a34a'} icon={<AlertTriangle size={16} />} loading={loading} sub="Awaiting resolution" />
                <KpiCard label="Resolved Complaints" value={fmt(stats?.resolvedComplaints)} color="#16a34a" icon={<CheckCircle size={16} />} loading={loading} sub={`${stats?.resolutionRate || 0}% rate`} />
                <KpiCard label="Active Schemes" value={stats?.activeSchemes || 0} color="#7c3aed" icon={<Award size={16} />} loading={loading} sub="Govt. schemes" />
                <KpiCard label="Scheme Enrollments" value={fmt(stats?.totalEnrolled)} color="#ea580c" icon={<UserCheck size={16} />} loading={loading} sub="All statuses" />
                <KpiCard label="Total Disbursed" value={fmtMoney(stats?.totalDisbursed)} color="#059669" icon={<TrendingUp size={16} />} loading={loading} sub="Benefit transfers" />
              </div>

              {/* Row 2: Gender + Category + Complaint Categories */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 18 }}>
                {/* Gender */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Gender Breakdown</h3>
                  {loading ? <Skeleton h={80} /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[['Male', stats?.genderBreakdown?.Male, '#2563eb'], ['Female', stats?.genderBreakdown?.Female, '#ec4899'], ['Other', stats?.genderBreakdown?.Other, '#94a3b8']].map(([label, val, color]) => {
                        const total = (stats?.genderBreakdown?.Male || 0) + (stats?.genderBreakdown?.Female || 0) + (stats?.genderBreakdown?.Other || 0);
                        const pct = total > 0 ? Math.round((val || 0) / total * 100) : 0;
                        return (
                          <div key={label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                              <span style={{ color: '#475569' }}>{label}</span>
                              <span style={{ color: '#0f172a' }}>{fmt(val)} ({pct}%)</span>
                            </div>
                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Category breakdown */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Citizen Categories</h3>
                  {loading ? <Skeleton h={80} /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {Object.entries(stats?.categoryBreakdown || {}).slice(0, 6).map(([cat, cnt], i) => {
                        const colors = ['#2563eb','#16a34a','#ea580c','#7c3aed','#059669','#dc2626'];
                        return (
                          <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f8fafc' }}>
                            <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors[i % colors.length] }} />{cat}
                            </span>
                            <strong style={{ fontSize: 11, color: '#0f172a' }}>{fmt(cnt)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top complaint categories */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Top Complaint Categories</h3>
                  {loading ? <Skeleton h={80} /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(complaintsData?.categoryBreakdown || []).slice(0, 7).map((c, i) => {
                        const total = complaintsData.complaints.length || 1;
                        const pct = Math.round((c.count / total) * 100);
                        const colors = ['#dc2626','#ea580c','#f59e0b','#16a34a','#2563eb','#7c3aed','#0891b2'];
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>
                              <span style={{ color: '#475569' }}>{c.category}</span>
                              <span style={{ color: '#0f172a' }}>{c.count} ({pct}%)</span>
                            </div>
                            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 999 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: 999 }} />
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
                  <Cpu size={16} color="#0891b2" />
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>DEO AI Command Assistant</h3>
                </div>
                <div style={{ height: 120, overflowY: 'auto', background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', background: m.sender === 'user' ? '#0891b2' : '#fff', color: m.sender === 'user' ? '#fff' : '#334155', padding: '7px 12px', borderRadius: 10, fontSize: 11, maxWidth: '80%', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleChatSend} style={{ display: 'flex', gap: 8 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about citizens, complaints, schemes..." style={{ flex: 1, padding: '8px 12px', fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none' }} />
                  <button type="submit" style={{ background: '#0891b2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 700 }}>
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ════ DISTRICT OVERVIEW ════ */}
          {activeMenu === 'District Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <KpiCard label="Total Citizens" value={fmt(stats?.totalUsers)} color="#2563eb" icon={<Users size={16} />} loading={loading} />
                <KpiCard label="Total Complaints" value={fmt(stats?.totalComplaints)} color="#dc2626" icon={<AlertTriangle size={16} />} loading={loading} />
                <KpiCard label="Resolution Rate" value={`${stats?.resolutionRate || 0}%`} color="#16a34a" icon={<CheckCircle size={16} />} loading={loading} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Citizen Category Distribution</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(stats?.categoryBreakdown || {}).map(([cat, cnt], i) => {
                      const total = stats?.totalUsers || 1;
                      const pct = Math.round(cnt / total * 100);
                      const colors = ['#2563eb','#16a34a','#ea580c','#7c3aed','#059669','#dc2626'];
                      return (
                        <div key={cat} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${colors[i%colors.length]}` }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{cat}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: colors[i%colors.length] }}>{fmt(cnt)}</div>
                            <div style={{ fontSize: 10, color: '#64748b' }}>{pct}% of total</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Complaint Status Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(complaintsData?.statusBreakdown || {}).map(([status, count], i) => {
                      const statusColors = { open: '#dc2626', pending: '#f59e0b', resolved: '#16a34a', closed: '#64748b', in_progress: '#2563eb' };
                      const c = statusColors[status] || '#64748b';
                      return (
                        <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: c + '10', borderRadius: 8, border: `1px solid ${c}25` }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
                          <span style={{ fontSize: 18, fontWeight: 800, color: c }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ COMPLAINT MONITOR ════ */}
          {activeMenu === 'Complaint Monitor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                  { label: 'Total', val: stats?.totalComplaints, color: '#64748b' },
                  { label: 'Open', val: stats?.openComplaints, color: '#dc2626' },
                  { label: 'Resolved', val: stats?.resolvedComplaints, color: '#16a34a' },
                  { label: 'Rate', val: `${stats?.resolutionRate || 0}%`, color: '#2563eb' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{loading ? '…' : s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Complaints ({filteredComplaints.length})</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={compCatFilter} onChange={e => setCompCatFilter(e.target.value)} style={{ fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 10px', color: '#475569', fontWeight: 600 }}>
                      <option value="all">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={compFilter} onChange={e => setCompFilter(e.target.value)} style={{ fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 10px', color: '#475569', fontWeight: 600 }}>
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                {loading ? <Skeleton h={200} /> : (
                  <div style={{ overflowY: 'auto', maxHeight: 450 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead style={{ position: 'sticky', top: 0 }}>
                        <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 10 }}>
                          <th style={{ padding: '8px 10px', textAlign: 'left' }}>Ticket</th>
                          <th style={{ padding: '8px 10px', textAlign: 'left' }}>Title</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Category</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Priority</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>Filed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.slice(0, 50).map((c, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}>
                            <td style={{ padding: '7px 10px', color: '#0891b2', fontWeight: 700, fontFamily: 'monospace', fontSize: 10 }}>{c.ticket_no}</td>
                            <td style={{ padding: '7px 10px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b', fontWeight: 600 }}>{c.title}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                              <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{c.category}</span>
                            </td>
                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>{statusBadge(c.status)}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>{priorityBadge(c.priority)}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'right', color: '#94a3b8', fontSize: 10 }}>{c.filed_at ? new Date(c.filed_at).toLocaleDateString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredComplaints.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>No complaints found for selected filters.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ SCHEME MANAGEMENT ════ */}
          {activeMenu === 'Scheme Management' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <KpiCard label="Active Schemes" value={schemesData?.totalSchemes || 0} color="#7c3aed" icon={<Award size={16} />} loading={loading} />
                <KpiCard label="Total Enrolled" value={fmt(schemesData?.totalEnrolled)} color="#16a34a" icon={<UserCheck size={16} />} loading={loading} />
                <KpiCard label="Total Disbursed" value={fmtMoney(schemesData?.totalDisbursed)} color="#059669" icon={<TrendingUp size={16} />} loading={loading} />
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Active Schemes</h3>
                {loading ? <Skeleton h={250} /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 10 }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Scheme Name</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Category</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Level</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Enrolled</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Benefit</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Disbursed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(schemesData?.schemes || []).map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1e293b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{s.category}</span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <span style={{ background: s.level === 'central' ? '#f5f3ff' : '#f0fdf4', color: s.level === 'central' ? '#7c3aed' : '#16a34a', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{s.level}</span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{fmt(s.enrollment?.total)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{fmtMoney(s.benefit_amount)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#7c3aed', fontWeight: 700 }}>{fmtMoney(s.totalDisbursed)}</td>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <KpiCard label="Total Citizens" value={fmt(stats?.totalUsers)} color="#2563eb" icon={<Users size={16} />} loading={loading} sub={userDistrict} />
                <KpiCard label="Male" value={fmt(stats?.genderBreakdown?.Male)} color="#2563eb" icon={<Users size={16} />} loading={loading} />
                <KpiCard label="Female" value={fmt(stats?.genderBreakdown?.Female)} color="#ec4899" icon={<Users size={16} />} loading={loading} />
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Citizen Categories in {userDistrict}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {Object.entries(stats?.categoryBreakdown || {}).map(([cat, cnt], i) => {
                    const colors = ['#2563eb','#16a34a','#ea580c','#7c3aed','#059669','#dc2626'];
                    return (
                      <div key={cat} style={{ background: colors[i%colors.length] + '0d', border: `1px solid ${colors[i%colors.length]}25`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 26, fontWeight: 800, color: colors[i%colors.length] }}>{fmt(cnt)}</div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginTop: 4 }}>{cat}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ STRONG ROOM STATUS ════ */}
          {activeMenu === 'Strong Room Status' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Strong Room Operational Status — {userDistrict}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <StatusChip label="CCTV Surveillance" status="Online" />
                  <StatusChip label="Guard Deployment (12/12)" status="Active" />
                  <StatusChip label="Physical Seal Verification" status="Intact" />
                  <StatusChip label="Power Backup (UPS)" status="Active" />
                  <StatusChip label="Internet Connectivity" status="Online" />
                  <StatusChip label="Biometric Door Lock" status="Operational" />
                  <StatusChip label="Fire Suppression System" status="Active" />
                  <StatusChip label="Last Inspection" status="Present" />
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Activity Log</h3>
                {[
                  { time: '10:45 AM', event: 'Guard rotation completed — 6 new guards on duty', color: '#16a34a' },
                  { time: '09:30 AM', event: 'CCTV live feed verified by DEO', color: '#2563eb' },
                  { time: '08:00 AM', event: 'Morning physical inspection completed — seals intact', color: '#16a34a' },
                  { time: 'Yesterday', event: 'Strong room sealed at 11:30 PM', color: '#64748b' },
                ].map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap', marginTop: 1 }}>{log.time}</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: log.color, marginTop: 5, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#1e293b', fontWeight: 600 }}>{log.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ VEHICLE TRACKING ════ */}
          {activeMenu === 'Vehicle Tracking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                  { label: 'Total Vehicles', val: 412, color: '#2563eb', icon: <Truck size={16} /> },
                  { label: 'Deployed', val: 366, color: '#16a34a', icon: <CheckCircle size={16} /> },
                  { label: 'In Transit', val: 38, color: '#f59e0b', icon: <Truck size={16} /> },
                  { label: 'At Base', val: 8, color: '#64748b', icon: <Building size={16} /> },
                ].map((v, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: `3px solid ${v.color}` }}>
                    <div style={{ color: v.color, marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{v.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: v.color }}>{v.val}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{v.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Vehicle Allocation by Route</h3>
                {['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'].map((zone, i) => {
                  const allocated = [80, 72, 88, 66, 106][i];
                  const onRoute = [71, 65, 80, 58, 92][i];
                  const pct = Math.round(onRoute / allocated * 100);
                  return (
                    <div key={zone} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                        <span style={{ color: '#1e293b' }}>{zone}</span>
                        <span style={{ color: '#64748b' }}>{onRoute}/{allocated} vehicles ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#16a34a' : pct >= 70 ? '#f59e0b' : '#ef4444', borderRadius: 999, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ STAFF REPORT ════ */}
          {activeMenu === 'Staff Report' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                  { label: 'Total Staff', val: '2,347', color: '#2563eb' },
                  { label: 'Present Today', val: '2,241', color: '#16a34a' },
                  { label: 'Absent', val: '86', color: '#dc2626' },
                  { label: 'Attendance Rate', val: '95.4%', color: '#7c3aed' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Staff by Role</h3>
                {[
                  { role: 'Returning Officers', count: 10, present: 10 },
                  { role: 'Sector Officers', count: 42, present: 41 },
                  { role: 'Presiding Officers', count: 350, present: 336 },
                  { role: 'Polling Officers', count: 1200, present: 1148 },
                  { role: 'Security Personnel', count: 745, present: 706 },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{s.role}</span>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ {s.present}</span>
                      <span style={{ color: '#dc2626', fontWeight: 700 }}>✗ {s.count - s.present}</span>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: '#64748b' }}>{Math.round(s.present/s.count*100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ COMMUNICATION HUB ════ */}
          {activeMenu === 'Communication Hub' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>District Broadcast</h3>
                <form onSubmit={e => { e.preventDefault(); if (broadcastText.trim()) { alert(`Broadcast sent to ${userDistrict}: "${broadcastText}"`); setBroadcastText(''); } }}>
                  <textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)} placeholder="Enter broadcast message for district officers..." style={{ width: '100%', minHeight: 100, padding: 14, fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 10, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ marginTop: 10, background: '#0891b2', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    📡 Send Broadcast
                  </button>
                </form>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Quick Contacts</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {['Returning Officer 1', 'Returning Officer 2', 'Sector Officer 1', 'CEO Office', 'Police Control', 'Emergency'].map((name, i) => (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e0f2fe', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>RO</div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{userDistrict}</div>
                      </div>
                      <button onClick={() => setCallModal({ open: true, recipient: name, number: '+91 98765 XXXXX' })} style={{ background: '#0891b2', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}><span>District Scope</span><strong style={{ color: '#0f172a' }}>{userDistrict}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}><span>Auto-Refresh</span><strong style={{ color: '#0f172a' }}>60 seconds</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}><span>Last Updated</span><strong style={{ color: '#0f172a' }}>{lastUpdated}</strong></div>
              </div>
              <button onClick={fetchAll} style={{ marginTop: 16, background: '#0891b2', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Force Refresh All Data</button>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '12px 0', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #e2e8f0', background: '#fff', fontWeight: 500 }}>
          © 2026 NagarVaani · DEO District Command — {userDistrict} · Last updated: {lastUpdated}
        </footer>
      </main>

      {/* Call Modal */}
      {callModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', color: '#fff', borderRadius: 24, padding: 40, width: 300, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(8,145,178,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <PhoneCall size={26} color="#0891b2" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 900 }}>{callModal.recipient}</h3>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 24px' }}>{callModal.number}</p>
            <button onClick={() => setCallModal({ open: false, recipient: '', number: '' })} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', width: '100%', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>End Call</button>
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
