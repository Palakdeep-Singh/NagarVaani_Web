/**
 * AdminApp.jsx — Fixed + Real-time + Fund Predictor
 * Place: client/src/pages/AdminApp.jsx
 *
 * FIXES:
 *  - api.js token bug (nc_token) → Access Denied on manage_admins RESOLVED
 *  - All sections fetch real data from API (no hardcoded values)
 *  - Global Supabase subscription → re-fetch trigger across all sections
 *  - 30s polling on every data section
 *  - Central gets 💰 Fund Predictor with commit/disburse/predict bars
 */
import { useState, useEffect, useContext, useCallback } from 'react';
import API from '../api/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { subscribeToAdminAll, subscribeToDistrictComplaints } from '../services/realtime.js';

const ROLE_META = {
  central: { label: 'Central Authority', icon: '🏛', color: 'var(--gn)' },
  state: { label: 'State Authority', icon: '🗺', color: 'var(--sf)' },
  district: { label: 'District Authority', icon: '🏙', color: 'var(--nv)' },
};

const ACCESS = {
  overview: ['central', 'state', 'district'],
  complaints: ['central', 'state', 'district'],
  milestones: ['central', 'state', 'district'],
  documents: ['central', 'district'],
  district_view: ['central', 'state'],
  scheme_stats: ['central', 'state'],
  fund_predictor: ['central'],
  manage_admins: ['central', 'state'],
};
const can = (role, section) => ACCESS[section]?.includes(role) ?? false;

const SIDEBAR = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'complaints', icon: '📢', label: 'Complaints' },
  { id: 'milestones', icon: '📋', label: 'Milestones' },
  { id: 'documents', icon: '📄', label: 'Document Review' },
  { id: 'district_view', icon: '🗺', label: 'District View' },
  { id: 'scheme_stats', icon: '📈', label: 'Scheme Analytics' },
  { id: 'fund_predictor', icon: '💰', label: 'Fund Predictor' },
  { id: 'manage_admins', icon: '👥', label: 'Manage Admins' },
];

/* Pulse-dot live indicator */
const LiveDot = ({ label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--gn)', fontWeight: 700 }}>
    <span style={{
      width: 6, height: 6, borderRadius: '50%', background: 'var(--gn)', display: 'inline-block',
      animation: 'nv-pulse 1.8s infinite'
    }} />
    {label}
  </span>
);

/* Auto-refresh hook — calls fn immediately, then every `seconds` */
function useAutoRefresh(fn, seconds = 30) {
  useEffect(() => {
    fn();
    const id = setInterval(fn, seconds * 1000);
    return () => clearInterval(id);
  }, []);
}

/* ─── ROOT ─────────────────────────────────────────────────────────────────── */
export default function AdminApp() {
  const { user, logout } = useContext(AuthContext);
  const role = user?.role || 'district';
  const district = user?.district || '';
  const state = user?.state || '';
  const meta = ROLE_META[role] || ROLE_META.district;

  const visible = SIDEBAR.filter(s => can(role, s.id));
  const [page, setPage] = useState(visible[0]?.id || 'overview');
  const [live, setLive] = useState(0);
  const [tick, setTick] = useState(0);   // global refresh trigger

  /* Global Supabase subscription → bump tick → every section re-fetches */
  useEffect(() => {
    const unsub = subscribeToAdminAll(payload => {
      setTick(t => t + 1);
      if (payload.table === 'complaints') {
        setLive(c => c + 1);
        setTimeout(() => setLive(c => Math.max(0, c - 1)), 8000);
      }
    });
    return unsub;
  }, []);

  const scopeLabel =
    role === 'district' ? (district || 'My District') :
      role === 'state' ? (state || 'My State') : 'All India';

  return (
    <div id="app-admin" className="app on">
      <style>{`
        @keyframes nv-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes nv-fadein { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .live-row { animation: nv-fadein .3s ease; }
      `}</style>

      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo">{meta.icon}</div>
          <div className="nav-brand-txt">NagarikConnect <span>{meta.label}</span></div>
        </div>
        <div className="nav-r">
          {live > 0 && (
            <div style={{
              fontSize: 11, color: 'var(--gn)', fontWeight: 700, display: 'flex',
              alignItems: 'center', gap: 4, background: 'var(--gn-l)', padding: '3px 10px',
              borderRadius: 20, border: '.5px solid var(--gn)'
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--gn)',
                display: 'inline-block', animation: 'nv-pulse 1.8s infinite'
              }} />
              {live} live
            </div>
          )}
          <div className="nav-user">
            <div className="nav-av">
              {(user?.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="nav-uname">{user?.name || 'Admin'}</div>
          </div>
          <button className="nav-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="layout">
        <aside className="sidebar">
          <div className="s-lbl" style={{ color: meta.color }}>{scopeLabel}</div>
          <div style={{
            fontSize: 9, color: 'var(--t3)', padding: '0 12px 8px',
            textTransform: 'uppercase', letterSpacing: '.06em'
          }}>
            {user?.designation || meta.label}
          </div>
          {visible.map(item => (
            <div key={item.id} className={`si${page === item.id ? ' on' : ''}`} onClick={() => setPage(item.id)}>
              <span className="si-ic">{item.icon}</span>
              {item.label}
              {item.id === 'complaints' && live > 0 && <span className="sbadge">{live}</span>}
            </div>
          ))}
          <div className="sb-profile">
            <div className="sbp-name">{user?.name}</div>
            <div className="sbp-sub">
              {user?.designation}
              {district ? ` · ${district}` : state ? ` · ${state}` : '· National'}
            </div>
            <div style={{ marginTop: 5 }}><LiveDot label="Live" /></div>
          </div>
        </aside>

        <main className="main">
          {page === 'overview' && can(role, 'overview') && <AdminOverview role={role} district={district} state={state} user={user} tick={tick} />}
          {page === 'complaints' && can(role, 'complaints') && <AdminComplaints role={role} district={district} state={state} onLive={setLive} tick={tick} />}
          {page === 'milestones' && can(role, 'milestones') && <AdminMilestones tick={tick} />}
          {page === 'documents' && can(role, 'documents') && <AdminDocuments tick={tick} />}
          {page === 'district_view' && can(role, 'district_view') && <AdminDistrictView role={role} state={state} tick={tick} />}
          {page === 'scheme_stats' && can(role, 'scheme_stats') && <AdminSchemeStats tick={tick} />}
          {page === 'fund_predictor' && can(role, 'fund_predictor') && <AdminFundPredictor tick={tick} />}
          {page === 'manage_admins' && can(role, 'manage_admins') && <AdminManageAdmins role={role} creatorState={state} />}
          {!can(role, page) && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--t3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>Access Restricted</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Your role ({role}) cannot access this section.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── OVERVIEW ─────────────────────────────────────────────────────────────── */
function AdminOverview({ role, district, state, user, tick }) {
  const [s, setS] = useState(null);
  const [ldg, setLdg] = useState(true);

  const load = useCallback(async () => {
    try { const { data } = await API.get('/api/admin/stats'); setS(data); }
    catch (e) { console.error(e); } finally { setLdg(false); }
  }, []);

  useAutoRefresh(load, 30);
  useEffect(() => { if (tick > 0) load(); }, [tick]);

  const fmt = (n) => n >= 1e7 ? '₹' + (n / 1e7).toFixed(1) + 'Cr' : n >= 1e5 ? '₹' + (n / 1e5).toFixed(0) + 'L' : n;

  const title = role === 'district' ? (district || 'Your') + ' District'
    : role === 'state' ? (state || 'Your') + ' State'
      : 'National Overview';

  const cards = {
    district: [
      { l: 'Citizens', v: s?.totalUsers ?? '…', sub: 'Registered', c: 'c-sf' },
      { l: 'Complaints', v: s?.openComplaints ?? '…', sub: 'Open', c: 'c-am' },
      { l: 'Delivery', v: s?.deliveryRate ? s.deliveryRate + '%' : '…', sub: 'Rate', c: 'c-gn' },
      { l: 'Funds', v: s?.fundsUtilized ? fmt(s.fundsUtilized) : '…', sub: 'Utilised', c: 'c-nv' },
    ],
    state: [
      { l: 'Citizens', v: s?.totalUsers ?? '…', sub: 'Registered', c: 'c-sf' },
      { l: 'Escalated', v: s?.openComplaints ?? '…', sub: 'Open', c: 'c-am' },
      { l: 'Coverage', v: s?.deliveryRate ? s.deliveryRate + '%' : '…', sub: 'Enrolled', c: 'c-gn' },
      { l: 'DBT Sent', v: s?.fundsUtilized ? fmt(s.fundsUtilized) : '…', sub: 'Disbursed', c: 'c-nv' },
    ],
    central: [
      { l: 'Citizens', v: s?.totalUsers ?? '…', sub: 'Registered', c: 'c-sf' },
      { l: 'Complaints', v: s?.openComplaints ?? '…', sub: 'Open', c: 'c-am' },
      { l: 'Delivery', v: s?.deliveryRate ? s.deliveryRate + '%' : '…', sub: 'National avg', c: 'c-gn' },
      { l: 'DBT', v: s?.fundsUtilized ? fmt(s.fundsUtilized) : '…', sub: 'FY 2024-25', c: 'c-nv' },
    ],
  };

  return (
    <div>
      <div className="bc">Admin › <span>Overview</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>📊 {title}</h1><p>{user?.designation} · {user?.name}</p></div>
        <LiveDot label="Refreshes every 30s" />
      </div>
      <div className="sr">
        {(cards[role] || cards.district).map((c, i) => (
          <div key={i} className={`sc ${c.c}`}>
            <div className="sl">{c.l}</div>
            <div className="sv">{ldg ? '…' : c.v}</div>
            <div className="ss">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── COMPLAINTS ───────────────────────────────────────────────────────────── */
function AdminComplaints({ role, district, state, onLive, tick }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState({});
  const [liveIds, setLiveIds] = useState(new Set());
  const [updated, setUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (role === 'district' && district) p.set('district', district);
      if (role === 'state' && state) p.set('state', state);
      if (filter !== 'all') p.set('status', filter);
      const { data } = await API.get(`/api/complaints/admin/district?${p}`);
      setComplaints(data || []);
      setUpdated(new Date());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [filter, role, district, state]);

  useAutoRefresh(load, 30);
  useEffect(() => { if (tick > 0) load(); }, [tick]);

  useEffect(() => {
    const unsub = subscribeToDistrictComplaints(district || 'all', payload => {
      if (payload.table !== 'complaints') return;
      const id = payload.new?.id;
      if (id) {
        setLiveIds(s => new Set([...s, id]));
        setTimeout(() => setLiveIds(s => { const n = new Set(s); n.delete(id); return n; }), 5000);
        onLive(c => (typeof c === 'number' ? c : 0) + 1);
        setTimeout(() => onLive(c => Math.max(0, (typeof c === 'number' ? c : 1) - 1)), 8000);
      }
      if (payload.eventType === 'INSERT') setComplaints(c => [payload.new, ...c]);
      if (payload.eventType === 'UPDATE') setComplaints(c => c.map(x => x.id === payload.new.id ? { ...x, ...payload.new } : x));
      setUpdated(new Date());
    });
    return unsub;
  }, [district]);

  const doAction = async (id, status, notes = '') => {
    try {
      await API.patch(`/api/complaints/admin/${id}`, { status, admin_notes: notes });
      setComplaints(c => c.map(x => x.id === id ? { ...x, status } : x));
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const bulkAction = async (action) => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return;
    try {
      await API.post('/api/complaints/admin/bulk', { ids, action });
      setComplaints(c => c.map(x => ids.includes(x.id) ? { ...x, status: action } : x));
      setSelected({});
    } catch { alert('Bulk action failed'); }
  };

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);
  const sel = Object.values(selected).filter(Boolean).length;
  const st = {
    open: complaints.filter(c => c.status === 'open').length,
    asgn: complaints.filter(c => c.status === 'district_assigned').length,
    done: complaints.filter(c => c.status === 'resolved').length,
    over: complaints.filter(c => c.due_at && new Date(c.due_at) < new Date() && !['resolved', 'closed'].includes(c.status)).length,
  };
  const scopeTitle = role === 'district' ? (district || 'Your District') : role === 'state' ? (state || 'Your State') : 'National';

  return (
    <div>
      <div className="bc">Admin › <span>Complaints</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>📢 {scopeTitle} Complaints</h1><p>Real-time · SLA 14 days · Auto-escalation</p></div>
        <div style={{ textAlign: 'right' }}>
          <LiveDot label="Live" />
          {updated && <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 3 }}>Updated {updated.toLocaleTimeString('en-IN')}</div>}
        </div>
      </div>

      <div className="sr">
        <div className="sc c-am"><div className="sl">Open</div><div className="sv">{st.open}</div><div className="ss">Awaiting</div></div>
        <div className="sc c-nv"><div className="sl">Assigned</div><div className="sv">{st.asgn}</div><div className="ss">In progress</div></div>
        <div className="sc c-gn"><div className="sl">Resolved</div><div className="sv">{st.done}</div><div className="ss">Done</div></div>
        <div className="sc c-sf"><div className="sl">Overdue</div><div className="sv" style={{ color: 'var(--rd)' }}>{st.over}</div><div className="ss">SLA breach</div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tb" style={{ margin: 0 }}>
          {['all', 'open', 'district_assigned', 'state_escalated', 'resolved'].map(s => (
            <button key={s} className={`tbtn${filter === s ? ' on' : ''}`}
              onClick={() => setFilter(s)} style={{ fontSize: 11, padding: '4px 9px' }}>
              {s === 'all' ? `All (${complaints.length})` : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        {sel > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn b-gn b-sm" onClick={() => bulkAction('resolved')}>✅ Resolve {sel}</button>
            <button className="btn b-nv b-sm" onClick={() => bulkAction('district_assigned')}>📋 Assign {sel}</button>
            {role !== 'central' && <button className="btn b-sf b-sm" onClick={() => bulkAction(role === 'district' ? 'state_escalated' : 'central_escalated')}>⬆ Escalate {sel}</button>}
          </div>
        )}
        <button className="btn b-gh b-sm" onClick={load}>🔄</button>
      </div>

      <div style={{ background: 'var(--wh)', borderRadius: 'var(--r)', border: '.5px solid var(--gy-m)', overflowX: 'auto' }}>
        <table className="dtbl" style={{ width: '100%', minWidth: 580 }}>
          <thead><tr>
            <th style={{ width: 32 }}><input type="checkbox" onChange={e => { const m = {}; filtered.forEach(c => { m[c.id] = e.target.checked }); setSelected(m); }} /></th>
            <th>Ticket</th><th>Category</th><th>Status</th><th>SLA</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {loading ? (<tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--t3)' }}>Loading...</td></tr>)
              : filtered.length === 0 ? (<tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>No complaints found</td></tr>)
                : filtered.map(c => {
                  const isLive = liveIds.has(c.id);
                  const slaLeft = c.due_at ? Math.round((new Date(c.due_at) - new Date()) / 86400000) : null;
                  const slaPct = c.due_at && c.filed_at ? Math.min(100, Math.round((new Date() - new Date(c.filed_at)) / (new Date(c.due_at) - new Date(c.filed_at)) * 100)) : 0;
                  const slaClr = slaLeft === null ? 'var(--gy)' : slaLeft < 0 ? 'var(--rd)' : slaLeft < 3 ? 'var(--am)' : 'var(--gn)';
                  return (
                    <tr key={c.id} className={isLive ? 'live-row' : ''} style={{
                      background: isLive ? 'var(--gn-l)' : slaLeft < 0 && !['resolved', 'closed'].includes(c.status) ? '#FFF5F5' : 'inherit',
                      transition: 'background .4s'
                    }}>
                      <td><input type="checkbox" checked={!!selected[c.id]} onChange={e => setSelected(s => ({ ...s, [c.id]: e.target.checked }))} /></td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>#{c.ticket_no || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--t3)' }}>{c.title?.slice(0, 32)}</div>
                        <div style={{ fontSize: 10, color: 'var(--t3)' }}>{c.district} · {new Date(c.filed_at).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td><span className="pill p-nv" style={{ fontSize: 10 }}>{c.category}</span></td>
                      <td>
                        <span className={`pill ${c.status === 'resolved' ? 'p-gn' : c.status.includes('escalated') ? 'p-sf' : c.status === 'district_assigned' ? 'p-bl' : 'p-am'}`} style={{ fontSize: 10 }}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {slaLeft !== null && !['resolved', 'closed'].includes(c.status) ? (
                          <div>
                            <div style={{ background: 'var(--gy-l)', borderRadius: 4, height: 4, width: 64, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: slaPct + '%', background: slaClr, borderRadius: 4 }} />
                            </div>
                            <div style={{ fontSize: 10, color: slaClr, fontWeight: 700, marginTop: 2 }}>
                              {slaLeft < 0 ? 'OVERDUE' : slaLeft + 'd left'}
                            </div>
                          </div>
                        ) : <span style={{ fontSize: 10, color: 'var(--gn)', fontWeight: 600 }}>Done</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <button className="btn b-gn b-sm" onClick={() => doAction(c.id, 'resolved', 'Resolved')}>✓</button>
                          <button className="btn b-nv b-sm" onClick={() => { const n = prompt('Assign to:'); if (n) doAction(c.id, 'district_assigned', n); }}>Assign</button>
                          {role !== 'central' && <button className="btn b-sf b-sm" onClick={() => doAction(c.id, role === 'district' ? 'state_escalated' : 'central_escalated', 'Escalated')}>⬆</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── MILESTONES ───────────────────────────────────────────────────────────── */
function AdminMilestones({ tick }) {
  const [ms, setMs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('error');
  const [proc, setProc] = useState({});
  const [updated, setUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await API.get('/api/milestones/admin/district');
      setMs(data || []); setUpdated(new Date());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useAutoRefresh(load, 30);
  useEffect(() => { if (tick > 0) load(); }, [tick]);

  const update = async (id, status, notes) => {
    setProc(p => ({ ...p, [id]: true }));
    try {
      await API.patch(`/api/milestones/admin/${id}`, { status, admin_notes: notes });
      setMs(m => m.map(x => x.id === id ? { ...x, status } : x));
    } catch { alert('Update failed'); }
    finally { setProc(p => ({ ...p, [id]: false })); }
  };

  const filtered = ms.filter(m => filter === 'all' || m.status === filter);

  return (
    <div>
      <div className="bc">Admin › <span>Milestones</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>📋 Scheme Milestones</h1><p>Mark complete · Citizen notified in real-time</p></div>
        <div style={{ textAlign: 'right' }}>
          <LiveDot label="Live" />
          {updated && <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 3 }}>Updated {updated.toLocaleTimeString('en-IN')}</div>}
        </div>
      </div>
      <div className="tb">
        {[['error', 'Errors'], ['pending', 'Pending'], ['completed', 'Completed'], ['all', 'All']].map(([v, l]) => (
          <button key={v} className={`tbtn${filter === v ? ' on' : ''}`} onClick={() => setFilter(v)}>
            {l} ({v === 'all' ? ms.length : ms.filter(m => m.status === v).length})
          </button>
        ))}
      </div>
      {loading ? (<div style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>Loading...</div>)
        : filtered.length === 0 ? (<div style={{ textAlign: 'center', padding: 48, color: 'var(--t3)' }}><div style={{ fontSize: 36 }}>✅</div><div>No milestones here</div></div>) : (
          <div style={{ background: 'var(--wh)', borderRadius: 'var(--r)', border: '.5px solid var(--gy-m)', overflowX: 'auto' }}>
            <table className="dtbl" style={{ minWidth: 580 }}>
              <thead><tr><th>Citizen</th><th>Scheme</th><th>Milestone</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} style={{ background: m.status === 'error' ? '#FFF5F5' : m.status === 'completed' ? '#F0FFF4' : 'inherit' }}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{m.users?.full_name || '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.users?.phone} · {m.users?.district}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{m.schemes?.name || '—'}</td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{m.scheme_milestones?.title || '—'}</div>
                      {m.admin_notes && <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.admin_notes}</div>}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 700, color: 'var(--gn)' }}>
                      {m.scheme_milestones?.amount > 0 ? `₹${m.scheme_milestones.amount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td><span className={`pill ${m.status === 'completed' ? 'p-gn' : m.status === 'error' ? 'p-rd' : m.status === 'pending' ? 'p-am' : 'p-gy'}`}>{m.status || 'pending'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {m.status !== 'completed' && <button className="btn b-gn b-sm" disabled={proc[m.id]} onClick={() => update(m.id, 'completed', 'Verified')}>{proc[m.id] ? '...' : '✓'}</button>}
                        <button className="btn b-rd b-sm" disabled={proc[m.id]} onClick={() => { const n = prompt('Error reason:'); if (n) update(m.id, 'error', n); }}>✗</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

/* ─── DOCUMENT REVIEW ──────────────────────────────────────────────────────── */
function AdminDocuments({ tick }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [proc, setProc] = useState({});

  const load = useCallback(async () => {
    try { const { data } = await API.get('/api/documents/admin/all'); setDocs(data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useAutoRefresh(load, 30);
  useEffect(() => { if (tick > 0) load(); }, [tick]);

  const flag = async (id) => {
    const reason = prompt('Flag reason (sent to citizen):', 'Document is unclear — please re-upload');
    if (!reason) return;
    setProc(p => ({ ...p, [id]: true }));
    try {
      await API.patch(`/api/documents/admin/${id}/flag`, { reason });
      setDocs(d => d.map(x => x.id === id ? { ...x, status: 'flagged' } : x));
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setProc(p => ({ ...p, [id]: false })); }
  };

  return (
    <div>
      <div className="bc">Admin › <span>Document Review</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>📄 Document Review</h1><p>Documents available immediately. Flag suspicious ones.</p></div>
        <LiveDot label="Live" />
      </div>
      <div style={{
        background: 'var(--am-l)', border: '.5px solid var(--am)', borderRadius: 'var(--r)',
        padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'var(--am)'
      }}>
        ℹ️ Citizens can use their documents immediately after upload. Flag any that appear blurry, wrong, or fraudulent.
      </div>
      {loading ? (<div style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>Loading...</div>)
        : docs.length === 0 ? (<div style={{ textAlign: 'center', padding: 60, color: 'var(--t3)' }}><div style={{ fontSize: 40 }}>✅</div><div>No documents yet</div></div>) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map(d => (
              <div key={d.id} style={{
                background: 'var(--wh)',
                border: `.5px solid ${d.status === 'flagged' ? 'var(--am)' : 'var(--gy-m)'}`,
                borderRadius: 'var(--r)', padding: 14
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, background: 'var(--nv-l)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
                  }}>
                    {d.mime_type?.startsWith('image') ? '🖼️' : '📄'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {d.doc_name}
                      <span className={`pill ${d.status === 'flagged' ? 'p-am' : d.status === 'available' ? 'p-gn' : 'p-gy'}`} style={{ fontSize: 10 }}>{d.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>
                      <span className="pill p-nv" style={{ fontSize: 10, marginRight: 6 }}>{(d.doc_type || '').replace(/_/g, ' ')}</span>
                      {d.file_size ? `${(d.file_size / 1024).toFixed(0)} KB` : ''} · {d.mime_type?.split('/')[1]?.toUpperCase()}
                    </div>
                    <div style={{ marginTop: 6, padding: '5px 10px', background: 'var(--gy-l)', borderRadius: 'var(--rs)', fontSize: 11 }}>
                      👤 {d.users?.full_name} · {d.users?.phone} · {d.users?.district}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn b-gh b-sm" onClick={() => setPreview(d)}>👁 Preview</button>
                  {d.status !== 'flagged' && <button className="btn b-am b-sm" disabled={proc[d.id]} onClick={() => flag(d.id)}>{proc[d.id] ? '...' : '⚠️ Flag'}</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      {preview && <DocPreview doc={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function DocPreview({ doc, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!doc?.id) return;
    const token = localStorage.getItem('nc_token'); // FIX: was 'token'
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
    fetch(`${base}/api/documents/view/${doc.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.blob(); })
      .then(b => setBlobUrl(URL.createObjectURL(b)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [doc?.id]);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }} onClick={onClose}>
      <div style={{
        background: 'var(--wh)', borderRadius: 'var(--rl)', overflow: 'hidden',
        maxWidth: 720, maxHeight: '92vh', width: '100%', display: 'flex', flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '12px 16px', background: 'var(--nv)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{doc.doc_name}</div>
            <div style={{ fontSize: 10, opacity: .65 }}>Admin preview · {doc.users?.full_name} · 🔒 Decrypted</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        <div style={{
          flex: 1, overflow: 'auto', padding: 16, textAlign: 'center', background: '#f8f9fa',
          display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240
        }}>
          {loading && <div style={{ color: 'var(--t3)' }}><div style={{ fontSize: 40 }}>🔓</div><div>Decrypting...</div></div>}
          {error && <div style={{ color: 'var(--rd)' }}>{error}</div>}
          {blobUrl && !loading && (doc.mime_type?.startsWith('image')
            ? <img src={blobUrl} alt={doc.doc_name} style={{ maxWidth: '100%', maxHeight: '68vh', borderRadius: 8, objectFit: 'contain' }} />
            : <object data={blobUrl} type="application/pdf" style={{ width: '100%', height: '68vh', border: 'none', borderRadius: 8 }}>
              <a href={blobUrl} download={doc.doc_name} className="btn b-nv">Download</a></object>)}
        </div>
        {blobUrl && <div style={{ padding: '10px 16px', borderTop: '.5px solid var(--gy-l)', display: 'flex', justifyContent: 'flex-end' }}>
          <a href={blobUrl} download={doc.doc_name} className="btn b-gh b-sm">⬇ Download</a></div>}
      </div>
    </div>
  );
}

/* ─── DISTRICT VIEW — dynamic ──────────────────────────────────────────────── */
function AdminDistrictView({ role, state, tick }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (role === 'state' && state) p.set('state', state);
      const { data } = await API.get(`/api/complaints/admin/district?${p}`);
      setComplaints(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [role, state]);

  useAutoRefresh(load, 30);
  useEffect(() => { if (tick > 0) load(); }, [tick]);

  const byDistrict = complaints.reduce((acc, c) => {
    const d = c.district || 'Unknown';
    if (!acc[d]) acc[d] = { open: 0, resolved: 0, escalated: 0, total: 0 };
    acc[d].total++;
    if (c.status === 'resolved' || c.status === 'closed') acc[d].resolved++;
    else if (c.status.includes('escalated')) acc[d].escalated++;
    else acc[d].open++;
    return acc;
  }, {});
  const districts = Object.entries(byDistrict).sort((a, b) => b[1].open - a[1].open);

  return (
    <div>
      <div className="bc">Admin › <span>District View</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>🗺 Districts — {role === 'state' ? (state || 'Your State') : 'All States'}</h1><p>Live complaint breakdown</p></div>
        <LiveDot label="Live" />
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>Loading...</div>
        : districts.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--t3)' }}><div style={{ fontSize: 36 }}>📭</div><div>No data yet</div></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 10 }}>
            {districts.map(([dist, s]) => {
              const pct = s.total > 0 ? Math.round(s.resolved / s.total * 100) : 100;
              return (
                <div key={dist} style={{ background: 'var(--wh)', border: '.5px solid var(--gy-m)', borderRadius: 'var(--r)', padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🏙 {dist}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                    {s.open > 0 && <span className="pill p-am" style={{ fontSize: 10 }}>{s.open} open</span>}
                    {s.escalated > 0 && <span className="pill p-sf" style={{ fontSize: 10 }}>{s.escalated} escalated</span>}
                    {s.resolved > 0 && <span className="pill p-gn" style={{ fontSize: 10 }}>{s.resolved} resolved</span>}
                  </div>
                  <div style={{ background: 'var(--gy-l)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, transition: 'width .3s',
                      background: pct >= 80 ? 'var(--gn)' : pct >= 50 ? 'var(--am)' : 'var(--rd)', width: pct + '%'
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 3 }}>{pct}% resolved · {s.total} total</div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

/* ─── SCHEME STATS ─────────────────────────────────────────────────────────── */
function AdminSchemeStats({ tick }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const { data } = await API.get('/api/schemes/admin/stats'); setStats(data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useAutoRefresh(load, 60);
  useEffect(() => { if (tick > 0) load(); }, [tick]);

  const totals = stats.reduce((a, s) => ({
    total: a.total + 1, matched: a.matched + (s.total_matched || 0),
    applied: a.applied + (s.total_applied || 0), completed: a.completed + (s.total_completed || 0),
  }), { total: 0, matched: 0, applied: 0, completed: 0 });

  return (
    <div>
      <div className="bc">Admin › <span>Scheme Analytics</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>📈 Scheme Analytics</h1><p>Live from matching engine</p></div>
        <LiveDot label="Refreshes every 60s" />
      </div>
      <div className="sr">
        <div className="sc c-sf"><div className="sl">Total</div><div className="sv">{totals.total || '…'}</div><div className="ss">Schemes</div></div>
        <div className="sc c-nv"><div className="sl">Matched</div><div className="sv">{totals.matched || '…'}</div><div className="ss">Eligible</div></div>
        <div className="sc c-am"><div className="sl">Applied</div><div className="sv">{totals.applied || '…'}</div><div className="ss">Applications</div></div>
        <div className="sc c-gn"><div className="sl">Completed</div><div className="sv">{totals.completed || '…'}</div><div className="ss">Beneficiaries</div></div>
      </div>
      {!loading && stats.length > 0 && (
        <div style={{ background: 'var(--wh)', borderRadius: 'var(--r)', border: '.5px solid var(--gy-m)', overflowX: 'auto', marginTop: 16 }}>
          <table className="dtbl" style={{ minWidth: 500 }}>
            <thead><tr><th>Scheme</th><th>Category</th><th>Matched</th><th>Applied</th><th>Completed</th><th>Avg Score</th></tr></thead>
            <tbody>
              {stats.slice(0, 30).map(s => (
                <tr key={s.id}>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</td>
                  <td><span className="pill p-nv" style={{ fontSize: 10 }}>{s.category}</span></td>
                  <td style={{ fontSize: 12 }}>{s.total_matched || 0}</td>
                  <td style={{ fontSize: 12 }}>{s.total_applied || 0}</td>
                  <td style={{ fontSize: 12, color: 'var(--gn)', fontWeight: 600 }}>{s.total_completed || 0}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, color: s.avg_score >= 70 ? 'var(--gn)' : s.avg_score >= 50 ? 'var(--am)' : 'var(--t3)' }}>{s.avg_score || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── FUND PREDICTOR (Central only) ────────────────────────────────────────── */
function AdminFundPredictor({ tick }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const { data } = await API.get('/api/schemes/admin/stats'); setSchemes(data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useAutoRefresh(load, 60);
  useEffect(() => { if (tick > 0) load(); }, [tick]);

  const m = schemes.reduce((a, s) => {
    const amt = s.benefit_amount || 0;
    return {
      committed: a.committed + (s.total_applied || 0) * amt,
      disbursed: a.disbursed + (s.total_completed || 0) * amt,
      potential: a.potential + (s.total_matched || 0) * amt,
      totalApplied: a.totalApplied + (s.total_applied || 0),
      totalDone: a.totalDone + (s.total_completed || 0),
      totalMatched: a.totalMatched + (s.total_matched || 0),
    };
  }, { committed: 0, disbursed: 0, potential: 0, totalApplied: 0, totalDone: 0, totalMatched: 0 });

  const approvalRate = m.totalApplied > 0 ? Math.round(m.totalDone / m.totalApplied * 100) : 0;
  const conversionRate = m.totalMatched > 0 ? Math.round(m.totalApplied / m.totalMatched * 100) : 0;
  const predictedNext = m.committed > 0 ? Math.round(m.committed * (approvalRate / 100) * 1.1) : 0;

  const fmt = (n) => n >= 1e7 ? '₹' + (n / 1e7).toFixed(1) + ' Cr' : n >= 1e5 ? '₹' + (n / 1e5).toFixed(1) + ' L' : '₹' + n.toLocaleString('en-IN');

  const topSchemes = [...schemes]
    .filter(s => s.benefit_amount > 0)
    .map(s => ({
      ...s,
      committed: (s.total_applied || 0) * (s.benefit_amount || 0),
      disbursed: (s.total_completed || 0) * (s.benefit_amount || 0),
    }))
    .sort((a, b) => b.committed - a.committed).slice(0, 10);
  const maxC = topSchemes[0]?.committed || 1;

  return (
    <div>
      <div className="bc">Admin › <span>Fund Predictor</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>💰 Fund Predictor</h1><p>DBT commitment forecast based on live scheme data</p></div>
        <LiveDot label="Refreshes every 60s" />
      </div>

      <div className="sr" style={{ marginBottom: 16 }}>
        <div className="sc c-nv"><div className="sl">Committed</div><div className="sv">{loading ? '…' : fmt(m.committed)}</div><div className="ss">Applied × benefit</div></div>
        <div className="sc c-gn"><div className="sl">Disbursed</div><div className="sv">{loading ? '…' : fmt(m.disbursed)}</div><div className="ss">Completed milestones</div></div>
        <div className="sc c-sf"><div className="sl">Potential</div><div className="sv">{loading ? '…' : fmt(m.potential)}</div><div className="ss">All matched × benefit</div></div>
        <div className="sc c-am"><div className="sl">Predicted Qtr</div><div className="sv">{loading ? '…' : fmt(predictedNext)}</div><div className="ss">At current rate ×1.1</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Approval Rate', value: approvalRate, sub: `${m.totalDone} of ${m.totalApplied} approved`, color: 'var(--gn)' },
          { label: 'Conversion Rate', value: conversionRate, sub: `${m.totalApplied} of ${m.totalMatched} applied`, color: 'var(--nv)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: 'var(--wh)', border: '.5px solid var(--gy-m)', borderRadius: 'var(--r)', padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color, marginBottom: 4 }}>{value}%</div>
            <div style={{ background: 'var(--gy-l)', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: value + '%', background: color, borderRadius: 4, transition: 'width .5s' }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {!loading && topSchemes.length > 0 && (
        <div style={{ background: 'var(--wh)', border: '.5px solid var(--gy-m)', borderRadius: 'var(--r)', padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Top Schemes by Fund Commitment</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topSchemes.map(s => {
              const bW = Math.round(s.committed / maxC * 100);
              const dW = s.committed > 0 ? Math.round(s.disbursed / s.committed * 100) : 0;
              return (
                <div key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span style={{ color: 'var(--t3)', fontSize: 11 }}>{fmt(s.committed)} committed</span>
                  </div>
                  <div style={{ background: 'var(--gy-l)', borderRadius: 4, height: 8, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: bW + '%', background: 'var(--nv-m)', borderRadius: 4, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: dW + '%', background: 'var(--gn)', borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>
                    <span><span style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--nv-m)', display: 'inline-block', marginRight: 3 }} />Committed</span>
                    <span><span style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--gn)', display: 'inline-block', marginRight: 3 }} />Disbursed ({dW}%)</span>
                    <span style={{ marginLeft: 'auto' }}>{fmt(s.disbursed)} of {fmt(s.committed)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MANAGE ADMINS ────────────────────────────────────────────────────────── */
function AdminManageAdmins({ role, creatorState }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'district', state: '', district: '', designation: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [creds, setCreds] = useState(null);
  const [toast, setToast] = useState(null);
  const [proc, setProc] = useState({});

  const showT = (msg, t = 'success') => { setToast({ msg, t }); setTimeout(() => setToast(null), 5000); };

  const load = () => {
    API.get('/api/admin/list-admins')
      .then(r => setAdmins(r.data || []))
      .catch(e => showT(e.response?.data?.error || 'Failed to load', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (role === 'state') setForm(f => ({ ...f, role: 'district', state: creatorState })); }, [role, creatorState]);

  const previewPass = () => {
    const c = s => (s || '').replace(/\s+/g, '');
    if (form.role === 'district') return `DC@${c(form.district) || '[District]'}25`;
    if (form.role === 'state') return `State@${c(form.state) || '[State]'}25`;
    return 'Central@India25';
  };

  const createAdmin = async () => {
    if (!form.email || !form.name) { showT('Name and email required', 'error'); return; }
    setSaving(true);
    try {
      const payload = role === 'state' ? { ...form, role: 'district', state: creatorState } : form;
      const { data } = await API.post('/api/admin/create-admin', payload);
      setCreds(data.credentials);
      setShowForm(false);
      setForm({ email: '', name: '', role: 'district', state: role === 'state' ? creatorState : '', district: '', designation: '', phone: '' });
      load();
    } catch (e) { showT(e.response?.data?.error || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const toggle = async (id, is_active) => {
    setProc(p => ({ ...p, [id]: true }));
    try {
      await API.patch(`/api/admin/toggle-admin/${id}`, { is_active });
      setAdmins(a => a.map(x => x.id === id ? { ...x, is_active } : x));
      showT(is_active ? 'Admin activated' : 'Admin deactivated');
    } catch { showT('Failed', 'error'); }
    finally { setProc(p => ({ ...p, [id]: false })); }
  };

  const resetPW = async (id) => {
    if (!confirm('Reset to default pattern password?')) return;
    try { const { data } = await API.patch(`/api/admin/reset-password/${id}`, {}); setCreds(data.credentials); }
    catch { showT('Reset failed', 'error'); }
  };

  const deleteAdmin = async (id, name) => {
    if (!confirm(`Delete ${name}? Cannot be undone.`)) return;
    try {
      await API.delete(`/api/admin/delete-admin/${id}`);
      setAdmins(a => a.filter(x => x.id !== id));
      showT('Admin deleted');
    } catch (e) { showT(e.response?.data?.error || 'Delete failed', 'error'); }
  };

  const copyCredLetter = (c) => {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    navigator.clipboard?.writeText(
      `GOVERNMENT OF INDIA — NagarikConnect Portal\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nADMIN ACCESS CREDENTIALS\nDate of Issue: ${today}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPortal URL : https://nagarikconnect.gov.in/admin\nEmail ID   : ${c.email}\nPassword   : ${c.password}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚠ CONFIDENTIAL — Change password after first login.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    showT('Credential letter copied!');
  };

  const RPILL = { central: 'p-gn', state: 'p-sf', district: 'p-nv' };
  const creatableRoles = role === 'central' ? ['state', 'district'] : ['district'];

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, right: 18, zIndex: 9999,
          background: toast.t === 'success' ? 'var(--gn)' : 'var(--rd)',
          color: '#fff', borderRadius: 'var(--r)', padding: '11px 16px',
          fontSize: 12.5, fontWeight: 600, maxWidth: 340, boxShadow: 'var(--sh2)'
        }}>
          {toast.t === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {creds && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, maxWidth: 480, width: '100%',
            boxShadow: '0 24px 64px rgba(0,0,0,.3)', overflow: 'hidden'
          }}>
            <div style={{ background: 'linear-gradient(135deg,#0F1E36 0%,#1A3A6B 100%)', padding: '18px 22px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>🏛</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>NAGARIKCONNECT PORTAL</div>
                  <div style={{ fontSize: 10, opacity: .7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Government of India · Official Credentials</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 22px' }}>
              <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: 10, padding: '16px 18px', background: '#F8FAFF', marginBottom: 16, fontFamily: 'monospace' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>
                  — ADMIN LOGIN CREDENTIALS —
                </div>
                {[
                  { label: 'Portal URL', value: 'https://nagarikconnect.gov.in/admin', icon: '🌐' },
                  { label: 'Email ID', value: creds.email, icon: '📧' },
                  { label: 'Password', value: creds.password, icon: '🔑', hl: true },
                ].map(({ label, value, icon, hl }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid #E2E8F0', gap: 12
                  }}>
                    <span style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>{icon} {label}</span>
                    <span style={{
                      fontSize: hl ? 13 : 11, fontWeight: 700, color: hl ? '#1A3A6B' : '#334155',
                      background: hl ? '#EFF6FF' : 'transparent', padding: hl ? '3px 8px' : '0',
                      borderRadius: hl ? 5 : 0, border: hl ? '1px solid #BFDBFE' : 'none'
                    }}>{value}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 14, padding: '8px 10px', background: '#FFFBEB', border: '1px solid #FDE68A',
                  borderRadius: 6, fontSize: 10.5, color: '#92400E', lineHeight: 1.5
                }}>
                  ⚠️ <strong>Confidential:</strong> Password shown once only. Change after first login.
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
                Issued on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn b-nv" style={{ flex: 1 }} onClick={() => copyCredLetter(creds)}>📋 Copy as Letter</button>
                <button className="btn b-gn" style={{ flex: 1 }} onClick={() => setCreds(null)}>✅ Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bc">Admin › <span>Manage Admins</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1>👥 Admin Accounts</h1>
          <p>{role === 'central' ? 'Central can create State and District admins' : 'State admin can create District admins'}</p>
        </div>
        <button className="btn b-sf" onClick={() => setShowForm(s => !s)}>{showForm ? '✕ Cancel' : '+ Create Admin'}</button>
      </div>

      <div style={{ background: 'var(--gy-l)', border: '.5px solid var(--gy-m)', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>Auto-generated password pattern</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {[['District', 'DC@[District]25'], ['State', 'State@[State]25'], ['Central', 'Central@India25']].map(([r, p]) => (
            <div key={r} style={{ background: 'var(--wh)', borderRadius: 'var(--rs)', padding: '7px 10px' }}>
              <div style={{ fontWeight: 600, fontSize: 11 }}>{r}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--nv)' }}>{p}</div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 14, border: '.5px solid var(--sf)' }}>
          <div className="card-title" style={{ marginBottom: 12, color: 'var(--sf)' }}>New Admin Account</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group"><label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Officer Full Name" /></div>
            <div className="form-group"><label className="form-label">Official Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="officer@dept.gov.in" /></div>
            <div className="form-group"><label className="form-label">Role *</label>
              {role === 'state' ? (
                <div className="form-input" style={{ background: 'var(--gy-l)', color: 'var(--t3)', cursor: 'default' }}>district (locked)</div>
              ) : (
                <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {creatableRoles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              )}</div>
            <div className="form-group"><label className="form-label">Designation</label>
              <input className="form-input" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="District Collector, Joint Secretary..." /></div>
            {(form.role === 'district' || form.role === 'state') && (
              <div className="form-group"><label className="form-label">State *</label>
                {role === 'state' ? (
                  <div className="form-input" style={{ background: 'var(--gy-l)', color: 'var(--t3)', cursor: 'default' }}>{creatorState} (locked)</div>
                ) : (
                  <input className="form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="e.g. Maharashtra, Gujarat" />
                )}</div>
            )}
            {form.role === 'district' && (
              <div className="form-group"><label className="form-label">District *</label>
                <input className="form-input" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="e.g. Pune, Surat" /></div>
            )}
            <div className="form-group"><label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Official contact" /></div>
          </div>
          <div style={{ background: 'var(--nv-l)', borderRadius: 'var(--rs)', padding: '9px 12px', marginTop: 10, fontSize: 12 }}>
            <span style={{ color: 'var(--t3)' }}>Auto-generated password: </span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--nv)', fontSize: 13 }}>{previewPass()}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn b-sf" onClick={createAdmin} disabled={saving}>{saving ? '⏳ Creating...' : '✅ Create Account'}</button>
            <button className="btn b-gh" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>Credentials shown once — copy and deliver officially.</div>
        </div>
      )}

      {loading ? (<div style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>Loading...</div>) : (
        <div style={{ background: 'var(--wh)', borderRadius: 'var(--r)', border: '.5px solid var(--gy-m)', overflowX: 'auto' }}>
          <table className="dtbl" style={{ minWidth: 640 }}>
            <thead><tr><th>Officer</th><th>Email</th><th>Role</th><th>Jurisdiction</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {admins.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>No admin accounts yet. Create one above.</td></tr>
              ) : admins.map(a => (
                <tr key={a.id} style={{ opacity: a.is_active ? 1 : .45 }}>
                  <td><div style={{ fontWeight: 600, fontSize: 12 }}>{a.name}</div><div style={{ fontSize: 10, color: 'var(--t3)' }}>{a.designation || '—'}</div></td>
                  <td style={{ fontSize: 11, color: 'var(--t3)' }}>{a.email}</td>
                  <td><span className={`pill ${RPILL[a.role] || 'p-gy'}`} style={{ fontSize: 10 }}>{a.role}</span></td>
                  <td style={{ fontSize: 11 }}>{[a.district, a.state].filter(Boolean).join(', ') || 'National'}</td>
                  <td>
                    <span className={`pill ${a.is_active ? 'p-gn' : 'p-gy'}`} style={{ fontSize: 10 }}>{a.is_active ? 'Active' : 'Inactive'}</span>
                    {a.last_login && <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>Last: {new Date(a.last_login).toLocaleDateString('en-IN')}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button className={`btn b-sm ${a.is_active ? 'b-rd' : 'b-gn'}`} disabled={proc[a.id]} onClick={() => toggle(a.id, !a.is_active)}>
                        {proc[a.id] ? '...' : a.is_active ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn b-am b-sm" onClick={() => resetPW(a.id)}>Reset PW</button>
                      <button className="btn b-rd b-sm" onClick={() => deleteAdmin(a.id, a.name)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}