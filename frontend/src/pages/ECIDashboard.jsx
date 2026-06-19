import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, FileText, Users, ShieldAlert, Cpu, 
  Settings, AlertTriangle, Building, CheckCircle, Percent, RefreshCw, BarChart2,
  Clock, MapPin, UserCheck, LogOut, Truck, AlertCircle, BookOpen, Map, Server, Lock
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

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export default function ECIDashboard({ user, onLogout }) {
  const userName = user?.name || 'ECI Admin';

  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Real data state
  const [stats, setStats] = useState(null);
  const [complaintsData, setComplaintsData] = useState(null);
  const [districtsData, setDistrictsData] = useState(null);
  const [dataError, setDataError] = useState(null);

  // Transparency Portal Config State
  const [portalConfig, setPortalConfig] = useState({
    'Live Turnout Data': true,
    'Booth Locations & Queue length': true,
    'Election Results (Counting Day)': false,
    'Candidate Affidavits': true,
    'EVM Randomization Status': true,
    'MCC Violation Public Ledger': false,
  });

  const toggleConfig = (name) => {
    setPortalConfig(prev => ({ ...prev, [name]: !prev[name] }));
  };

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
      // National level data (no state/district filter)
      const [s, c, d] = await Promise.all([
        emApi.getStats({}),
        emApi.getComplaints({ limit: 100 }),
        emApi.getUsersDist({}),
      ]);
      setStats(s);
      setComplaintsData(c);
      setDistrictsData(d);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setDataError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const id = setInterval(fetchAll, 60000); return () => clearInterval(id); }, [fetchAll]);

  /* ── Sidebar ─────────────────────────────────────────────────────────── */
  const menuItems = [
    { id: 'Dashboard', name: 'National Overview', icon: <LayoutDashboard size={15} /> },
    { id: 'National GIS Center', name: 'National GIS Command', icon: <Map size={15} /> },
    { id: 'Critical Incidents', name: 'Critical Incident Center', icon: <ShieldAlert size={15} />, badge: stats?.openComplaints > 0 ? stats.openComplaints : null },
    { id: 'MCC Monitor', name: 'MCC Violation Dashboard', icon: <AlertTriangle size={15} /> },
    { id: 'AI Risk Analytics', name: 'AI Risk Prediction', icon: <Cpu size={15} /> },
    { id: 'Repoll Management', name: 'Repoll Approvals', icon: <RefreshCw size={15} /> },
    { id: 'Audit Trail', name: 'System Audit Trail', icon: <Server size={15} /> },
    { id: 'Public Transparency', name: 'Public Portal Config', icon: <BookOpen size={15} /> },
  ];

  /* ── RENDER ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 260, background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 12 }}>ECI</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>NagarVaani</div>
              <div style={{ color: '#a78bfa', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>National Command Center</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {menuItems.map(item => (
            <div key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                background: activeMenu === item.id ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : 'transparent',
                color: activeMenu === item.id ? '#fff' : '#94a3b8',
                fontWeight: activeMenu === item.id ? 700 : 500, fontSize: 12,
                transition: 'all 0.15s ease',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{item.icon}<span>{item.name}</span></div>
              {item.badge && <span style={{ background: item.badge === 'GOLD' ? '#eab308' : '#dc2626', color: item.badge === 'GOLD' ? '#000' : '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 999 }}>{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>National Summary</div>
            <div style={{ marginBottom: 4 }}>Total States: <strong style={{ color: '#fff' }}>28</strong></div>
            <div style={{ marginBottom: 4 }}>Booths: <strong style={{ color: '#fff' }}>10.5 Lakh</strong></div>
            <div style={{ marginBottom: 4 }}>Registered Voters: <strong style={{ color: '#fff' }}>96.8 Crore</strong></div>
            <div style={{ marginBottom: 4 }}>National Turnout: <strong style={{ color: '#fff' }}>67.12%</strong></div>
            <div>Current Phase: <strong style={{ color: '#fff' }}>3/7</strong></div>
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
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Election Commission of India (ECI)</h1>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: '#dcfce7', color: '#15803d' }}>● LIVE COMMAND</span>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', margin: '3px 0 0', fontWeight: 500 }}>
              General Elections 2026 · Prime Minister's War Room for Elections
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>ECI</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{userName}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Chief Commissioner</div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ════ DASHBOARD ════ */}
          {activeMenu === 'Dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                <KpiCard label="Total Booths" value="10.5 Lakh" color="#6366f1" icon={<Building size={16} />} loading={loading} />
                <KpiCard label="Total Voters" value="96.8 Cr" color="#2563eb" icon={<Users size={16} />} loading={loading} />
                <KpiCard label="Total EVMs" value="55 Lakh" color="#7c3aed" icon={<Cpu size={16} />} loading={loading} />
                <KpiCard label="States Active" value="28" color="#16a34a" icon={<MapPin size={16} />} loading={loading} />
                <KpiCard label="Current Phase" value="3/7" color="#f59e0b" icon={<Clock size={16} />} loading={loading} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Turnout Map */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>National Turnout Map</h3>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <svg width="150" height="180" viewBox="0 0 100 120" style={{ flexShrink: 0 }}>
                      <path d="M40,5 Q50,0 55,20 L60,40 Q75,30 85,50 L95,65 Q80,75 75,90 L60,110 L50,115 L35,80 L20,70 L15,40 L30,25 Z" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M40,5 L55,20 L45,35 L30,25 Z" fill="#22c55e" stroke="#fff" strokeWidth="0.8" />
                      <path d="M55,20 L65,30 L60,45 L45,35 Z" fill="#22c55e" stroke="#fff" strokeWidth="0.8" />
                      <path d="M30,25 L45,35 L40,65 L20,55 Z" fill="#eab308" stroke="#fff" strokeWidth="0.8" />
                      <path d="M45,35 L60,45 L65,70 L40,65 Z" fill="#ea580c" stroke="#fff" strokeWidth="0.8" />
                      <path d="M60,45 L85,50 L80,68 L65,70 Z" fill="#86efac" stroke="#fff" strokeWidth="0.8" />
                      <path d="M40,65 L65,70 L55,95 L45,90 Z" fill="#ef4444" stroke="#fff" strokeWidth="0.8" />
                      <path d="M45,90 L55,95 L50,112 L40,105 Z" fill="#f97316" stroke="#fff" strokeWidth="0.8" />
                    </svg>
                    <div style={{ flexGrow: 1, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#f0fdf4', borderRadius: 6 }}><span style={{ fontWeight: 700, color: '#16a34a' }}>High Turnout</span><strong style={{ color: '#16a34a' }}>12 States</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#fefce8', borderRadius: 6 }}><span style={{ fontWeight: 700, color: '#ca8a04' }}>Average Turnout</span><strong style={{ color: '#ca8a04' }}>5 States</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#fef2f2', borderRadius: 6 }}><span style={{ fontWeight: 700, color: '#dc2626' }}>Low Turnout</span><strong style={{ color: '#dc2626' }}>3 States</strong></div>
                    </div>
                  </div>
                </div>

                {/* Election Readiness */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Election Readiness (Phase 3)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { state: 'Uttar Pradesh', booths: 95, training: 88, evms: 100 },
                      { state: 'Maharashtra', booths: 100, training: 98, evms: 100 },
                      { state: 'Bihar', booths: 82, training: 75, evms: 90 },
                    ].map((s, i) => (
                      <div key={i} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>{s.state}</div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#64748b' }}>
                          <div>Booths Ready: <strong style={{ color: s.booths > 90 ? '#16a34a' : '#ea580c' }}>{s.booths}%</strong></div>
                          <div>Staff Trained: <strong style={{ color: s.training > 90 ? '#16a34a' : '#ea580c' }}>{s.training}%</strong></div>
                          <div>EVM Assigned: <strong style={{ color: s.evms === 100 ? '#16a34a' : '#ea580c' }}>{s.evms}%</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════ AI RISK ANALYTICS ════ */}
          {activeMenu === 'AI Risk Analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Cpu size={24} color="#eab308" />
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Predictive AI Risk Analytics</h3>
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 24 }}>AI predicts potential disruptions based on historical violence data, current security force deployment ratios, and real-time social media/complaint sentiment.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    { loc: 'Meerut Constituency', score: 88, risk: 'CRITICAL', reasons: ['Past Violence (2019)', 'Low CRPF Deployment', 'High Hate Speech Volume'] },
                    { loc: 'Varanasi Constituency', score: 45, risk: 'MEDIUM', reasons: ['High Traffic Anticipated', 'VIP Candidate Movement'] },
                    { loc: 'Lucknow Constituency', score: 30, risk: 'LOW', reasons: ['Normal Operations', 'Optimal Force Ratio'] },
                  ].map((r, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{r.loc}</div>
                        <div style={{ background: r.score > 80 ? '#dc2626' : r.score > 40 ? '#f59e0b' : '#16a34a', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>Score: {r.score}</div>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 8, letterSpacing: '0.5px' }}>RISK FACTORS:</div>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#f1f5f9', lineHeight: 1.6 }}>
                        {r.reasons.map((rsn, j) => <li key={j}>{rsn}</li>)}
                      </ul>
                      {r.score > 80 && (
                        <button style={{ marginTop: 16, width: '100%', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Deploy Additional Forces</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ NATIONAL GIS COMMAND ════ */}
          {activeMenu === 'National GIS Center' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>National GIS Command Center</h3>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#dc2626', fontSize: 18 }}>●</span> Critical Incidents</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#2563eb', fontSize: 18 }}>●</span> Security Forces</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#f59e0b', fontSize: 18 }}>●</span> Sensitive Booths</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#7c3aed', fontSize: 18 }}>●</span> EVM Movement GPS</div>
                  </div>
                </div>
                
                <div style={{ position: 'relative', height: 450, background: '#1e293b', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Faux Map Background */}
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.1 }}>
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                  
                  {/* Simulated India Map Points */}
                  <div style={{ position: 'absolute', top: '20%', left: '30%', width: 12, height: 12, background: '#dc2626', borderRadius: '50%', boxShadow: '0 0 10px #dc2626', animation: 'pulse 2s infinite' }} />
                  <div style={{ position: 'absolute', top: '40%', left: '45%', width: 10, height: 10, background: '#f59e0b', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', top: '60%', left: '35%', width: 8, height: 8, background: '#2563eb', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', top: '70%', left: '50%', width: 8, height: 8, background: '#7c3aed', borderRadius: '50%' }} />
                  
                  <div style={{ position: 'absolute', top: '20%', left: '32%', background: 'rgba(15,23,42,0.9)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid #dc2626' }}>
                    <div style={{ color: '#fca5a5', fontSize: 9, marginBottom: 2 }}>INCIDENT DETECTED</div>
                    Violence Reported at Booth 154
                  </div>

                  <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', padding: 12, borderRadius: 8, color: '#fff', fontSize: 11 }}>
                    <div>Live tracking 10.5L booths & 55L EVMs</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ AUDIT TRAIL ════ */}
          {activeMenu === 'Audit Trail' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>System Audit Trail</h3>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Immutable log of all officer actions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { time: '10:22 AM', officer: 'RO Nagpur', action: 'Requested Repoll for Booth 154 due to EVM malfunction', ip: '112.196.15.2' },
                  { time: '09:45 AM', officer: 'CEO Uttar Pradesh', action: 'Approved Force Re-allocation for Meerut District', ip: '103.45.67.89' },
                  { time: '09:15 AM', officer: 'DEO Varanasi', action: 'Marked Booth 42 as Hyper-Sensitive', ip: '115.244.18.9' },
                  { time: '08:30 AM', officer: 'Sector Officer', action: 'Reported BU replacement complete at Polling Station 12', ip: '49.36.211.55' },
                ].map((log, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8fafc', borderRadius: 10, borderLeft: '4px solid #1e293b' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{log.officer}</div>
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{log.action}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 6, fontFamily: 'monospace' }}>IP: {log.ip}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>{log.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ CRITICAL INCIDENTS & MCC ════ */}
          {activeMenu === 'Critical Incidents' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>National Incident Center</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Violence: 6</div>
                  <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Booth Capture: 2</div>
                  <div style={{ background: '#dbeafe', color: '#2563eb', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>EVM Failure: 14</div>
                </div>
              </div>
              
              {loading ? <Skeleton h={200} /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Ticket No</th>
                      <th style={{ padding: '12px' }}>Incident Type</th>
                      <th style={{ padding: '12px' }}>Location</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(complaintsData?.complaints || []).slice(0, 15).map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{c.ticket_no}</td>
                        <td style={{ padding: '12px', color: '#475569', fontWeight: 500 }}>{c.category}</td>
                        <td style={{ padding: '12px', color: '#1e293b', fontWeight: 600 }}>{c.district}, {c.state}</td>
                        <td style={{ padding: '12px' }}>{statusBadge(c.status)}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: c.priority === 'high' || c.priority === 'critical' ? '#dc2626' : c.priority === 'medium' ? '#f59e0b' : '#2563eb', fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}>
                            {c.priority || 'Informational'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ════ MCC MONITOR ════ */}
          {activeMenu === 'MCC Monitor' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>MCC Violations by State</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { state: 'Uttar Pradesh', count: 542 },
                    { state: 'Maharashtra', count: 301 },
                    { state: 'Rajasthan', count: 182 },
                    { state: 'Bihar', count: 145 },
                  ].map((s, i) => {
                    const pct = Math.round(s.count / 600 * 100);
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                          <span style={{ color: '#1e293b' }}>{s.state}</span>
                          <span style={{ color: '#dc2626' }}>{s.count} Complaints</span>
                        </div>
                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#dc2626', borderRadius: 999 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>MCC Violation Types</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { type: 'Illegal Campaigning', val: 245 },
                    { type: 'Hate Speech', val: 188 },
                    { type: 'Cash Distribution', val: 156 },
                    { type: 'Liquor Distribution', val: 89 },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8fafc', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{s.type}</span>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>{s.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ REPOLL MANAGEMENT ════ */}
          {activeMenu === 'Repoll Management' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>Repoll Approvals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { booth: 'Booth 154 - Nagpur East', state: 'Maharashtra', reason: 'Booth Capture / Violence', status: 'Pending Review' },
                  { booth: 'Booth 88 - Lucknow Central', state: 'Uttar Pradesh', reason: 'EVM VVPAT Failure', status: 'Pending Review' },
                ].map((r, i) => (
                  <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{r.booth}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{r.state} · Reason: <span style={{ color: '#dc2626', fontWeight: 700 }}>{r.reason}</span></div>
                      </div>
                      <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>{r.status}</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, flex: 1, fontSize: 11 }}>
                        <div style={{ color: '#64748b', fontWeight: 700, marginBottom: 4 }}>Chain of Verification:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600 }}>✓ RO Recommended</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600 }}>✓ DEO Verified</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600 }}>✓ CEO Reviewed</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        <button style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Approve Repoll</button>
                        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                          <button style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Reject</button>
                          <button style={{ flex: 1, background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Ask CEO For Info</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ PUBLIC TRANSPARENCY ════ */}
          {activeMenu === 'Public Transparency' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Lock size={20} color="#2563eb" />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Public Transparency Portal Config</h3>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Controls what data is pushed to the citizen-facing transparency portal to fight misinformation.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {Object.entries(portalConfig).map(([name, status], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{name}</span>
                    <div onClick={() => toggleConfig(name)} style={{ width: 44, height: 24, borderRadius: 12, background: status ? '#16a34a' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <div style={{ position: 'absolute', top: 2, left: status ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); } 70% { box-shadow: 0 0 0 10px rgba(220,38,38,0); } 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
      `}</style>
    </div>
  );
}
