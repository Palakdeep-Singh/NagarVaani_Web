/**
 * ComplaintsPage.jsx — Real-time complaint tracking
 * Place: client/src/pages/ComplaintsPage.jsx
 */
import { useState, useEffect, useRef } from 'react';
import API from '../api/api.js';
import { subscribeToComplaints, subscribeToComplaintTimeline } from '../services/realtime.js';

const CATEGORIES = ['Water Supply', 'Electricity', 'Roads', 'Sanitation', 'Scheme Issue', 'Public Health', 'Education', 'Data Correction', 'Other'];

const STATUS_CONFIG = {
  open: { label: 'Filed — Awaiting Assignment', color: 'var(--am)', bg: 'var(--am-l)', icon: '📋' },
  district_assigned: { label: 'Assigned to District Officer', color: 'var(--bl)', bg: 'var(--bl-l)', icon: '🏛' },
  state_escalated: { label: 'Escalated to State', color: 'var(--sf)', bg: 'var(--sf-l)', icon: '🗺' },
  central_escalated: { label: 'Escalated to Central', color: 'var(--nv)', bg: 'var(--nv-l)', icon: '🏛' },
  resolved: { label: 'Resolved ✓', color: 'var(--gn)', bg: 'var(--gn-l)', icon: '✅' },
  closed: { label: 'Closed', color: 'var(--gy)', bg: 'var(--gy-l)', icon: '🔒' },
};

const SLA_DAYS = (filedAt, dueAt) => {
  const total = Math.round((new Date(dueAt) - new Date(filedAt)) / 86400000);
  const used = Math.round((new Date() - new Date(filedAt)) / 86400000);
  const left = Math.max(0, Math.round((new Date(dueAt) - new Date()) / 86400000));
  const pct = Math.min(100, Math.round((used / total) * 100));
  return { total, used, left, pct, overdue: left === 0 && !['resolved', 'closed'].includes('x') };
};

export default function ComplaintsPage({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, t = 'success') => { setToast({ msg, t }); setTimeout(() => setToast(null), 4000); };
  const [liveIndicator, setLiveIndicator] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '', location: '' });

  const load = async () => {
    try {
      const { data } = await API.get('/api/complaints/my');
      setComplaints(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();

    // 🔴 REALTIME: subscribe to complaint changes
    if (!user?.id) return;
    const unsub = subscribeToComplaints(user.id, (payload) => {
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 3000);

      if (payload.eventType === 'INSERT') {
        setComplaints(c => c.some(x => x.id === payload.new.id) ? c : [{ ...payload.new, timeline: [] }, ...c]);
      } else if (payload.eventType === 'UPDATE') {
        setComplaints(c => c.map(comp =>
          comp.id === payload.new.id ? { ...comp, ...payload.new } : comp
        ));
      }
    });
    return unsub;
  }, [user?.id]);

  const submit = async () => {
    if (!form.title || !form.category) { showToast('Title and category required', 'error'); return; }
    setSubmitting(true);
    try {
      const { data } = await API.post('/api/complaints', form);
      load();
      setForm({ title: '', category: '', description: '', location: '' });
      setShowForm(false);
      showToast(`Complaint #${data.ticket_no} filed! District will respond within 14 days.`);
    } catch (e) { showToast(e.response?.data?.error || 'Filing failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const stats = {
    open: complaints.filter(c => !['resolved', 'closed'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    escalated: complaints.filter(c => c.status.includes('escalated')).length,
  };

  return (
    <div className="page on">
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 18, zIndex: 9999,
          background: toast.t === 'success' ? 'var(--gn)' : 'var(--rd)',
          color: '#fff', borderRadius: 'var(--r)', padding: '12px 18px',
          fontSize: 13, fontWeight: 600, maxWidth: 340,
          boxShadow: '0 4px 20px rgba(0,0,0,.2)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'nv-fadein .2s ease'
        }}>
          {toast.t === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
      <div className="bc">Dashboard › <span>Complaints</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>📢 My Complaints</h1>
          <p>Auto-escalation: District (14 days) → State (14 days) → Central</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {liveIndicator && (
            <span style={{ fontSize: 11, color: 'var(--gn)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gn)', display: 'inline-block', animation: 'pulse 1s infinite' }}></span>
              Live update
            </span>
          )}
          <button className="btn b-sf" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ New Complaint'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="sr" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
        <div className="sc c-am"><div className="sl">Open</div><div className="sv">{stats.open}</div><div className="ss">Active complaints</div></div>
        <div className="sc c-sf"><div className="sl">Escalated</div><div className="sv">{stats.escalated}</div><div className="ss">Moved up</div></div>
        <div className="sc c-gn"><div className="sl">Resolved</div><div className="sv">{stats.resolved}</div><div className="ss">Closed successfully</div></div>
      </div>

      {/* New Complaint Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16, border: '.5px solid var(--sf)', boxShadow: '0 2px 12px rgba(255,107,0,.08)' }}>
          <div className="card-title" style={{ marginBottom: 12, color: 'var(--sf)' }}>📋 File New Complaint</div>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Brief description of the issue"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Location / Ward
                <button onClick={async () => {
                  if (!navigator.geolocation) return showToast('Geolocation not supported', 'error');
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                      const data = await res.json();
                      const loc = data.address.suburb || data.address.neighbourhood || data.address.city || data.display_name.split(',')[0];
                      setForm(f => ({ ...f, location: loc + ' (Auto-detected)' }));
                      showToast('Location detected!');
                    } catch (e) { showToast('Could not fetch address', 'error'); }
                  }, () => showToast('Permission denied', 'error'));
                }} style={{ background: 'none', border: 'none', color: 'var(--nv)', fontSize: 10, fontWeight: 700, cursor: 'pointer', padding: 0 }}>📍 Detect</button>
              </label>
              <input className="form-input" placeholder="Ward 4, Near Hanuman Mandir..."
                value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="Detailed description of the problem..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn b-sf" onClick={submit} disabled={submitting}>
              {submitting ? '⏳ Filing...' : '🚀 File Complaint'}
            </button>
            <button className="btn b-gh" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 32 }}>⏳</div><div style={{ marginTop: 8 }}>Loading complaints...</div>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>No complaints filed yet</div>
          <div style={{ fontSize: 12, marginBottom: 14 }}>File a complaint to track its resolution status in real-time</div>
          <button className="btn b-sf b-sm" onClick={() => setShowForm(true)}>+ File First Complaint</button>
        </div>
      ) : (
        complaints.map(c => (
          <ComplaintCard key={c.id} complaint={c} expanded={!!expanded[c.id]}
            onToggle={() => toggle(c.id)} userId={user?.id} />
        ))
      )}
    </div>
  );
}

// ── Complaint Card ─────────────────────────────────────────────────────────
function ComplaintCard({ complaint: c, expanded, onToggle, userId }) {
  const [timeline, setTimeline] = useState(c.timeline || []);
  const [liveFlash, setLiveFlash] = useState(false);

  useEffect(() => {
    // 🔴 REALTIME: subscribe to this complaint's timeline
    const unsub = subscribeToComplaintTimeline(c.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setTimeline(t => [...t, payload.new]);
        setLiveFlash(true);
        setTimeout(() => setLiveFlash(false), 2000);
      }
    });
    return unsub;
  }, [c.id]);

  const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
  const sla = c.due_at ? SLA_DAYS(c.filed_at, c.due_at) : null;
  const daysUsed = sla?.used || 0;
  const slaColor = !sla ? 'var(--gy)' : sla.left > 7 ? 'var(--gn)' : sla.left > 3 ? 'var(--am)' : 'var(--rd)';

  const escalationSteps = [
    { label: 'Filed', done: true },
    { label: 'District', done: ['district_assigned', 'state_escalated', 'central_escalated', 'resolved', 'closed'].includes(c.status) },
    { label: 'State', done: ['state_escalated', 'central_escalated', 'resolved', 'closed'].includes(c.status) },
    { label: 'Central', done: ['central_escalated', 'resolved', 'closed'].includes(c.status) },
    { label: 'Resolved', done: c.status === 'resolved' || c.status === 'closed' },
  ];

  return (
    <div className="card" style={{
      marginBottom: 12,
      border: `.5px solid ${liveFlash ? 'var(--gn)' : 'var(--gy-m)'}`,
      transition: 'border-color .5s',
      boxShadow: liveFlash ? '0 0 0 3px var(--gn-l)' : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }} onClick={onToggle}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: sc.bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
        }}>
          {sc.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{c.title}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
            #{c.ticket_no || 'Pending'} · Filed {new Date(c.filed_at).toLocaleDateString('en-IN')}
            {c.location && ` · ${c.location}`}
          </div>
          {/* Escalation path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            {escalationSteps.map((step, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: step.done ? 'var(--gn-l)' : 'var(--gy-l)',
                  color: step.done ? 'var(--gn)' : 'var(--t3)',
                }}>{step.done ? '✓ ' : ''}{step.label}</span>
                {i < escalationSteps.length - 1 && <span style={{ color: 'var(--gy-m)', fontSize: 10 }}>›</span>}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{
            background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 10px',
            fontSize: 10, fontWeight: 700, border: `1px solid ${sc.color}30`, whiteSpace: 'nowrap'
          }}>
            {sc.label}
          </div>
          {sla && c.status !== 'resolved' && (
            <div style={{ fontSize: 10, color: slaColor, fontWeight: 700 }}>
              {sla.left === 0 ? '🚨 SLA Breached' : `⏱ ${sla.left} days left`}
            </div>
          )}
          <span className={`tgl${expanded ? ' op' : ''}`}>▼</span>
        </div>
      </div>

      {/* SLA Bar */}
      {sla && c.status !== 'resolved' && (
        <div style={{ marginTop: 10, padding: '0 46px' }}>
          <div style={{ background: 'var(--gy-l)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: sla.pct + '%', background: slaColor, borderRadius: 4, transition: 'width 1s' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 10, color: 'var(--t3)' }}>
            <span>Day {sla.used} of {sla.total}</span>
            <span style={{ color: slaColor, fontWeight: 600 }}>{sla.left} days remaining</span>
          </div>
        </div>
      )}

      {/* Expanded: Timeline + Details */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '.5px solid var(--gy-l)' }}>
          {c.description && (
            <div style={{
              fontSize: 12, color: 'var(--t2)', marginBottom: 14, background: 'var(--gy-l)',
              borderRadius: 'var(--rs)', padding: '9px 12px'
            }}>
              {c.description}
            </div>
          )}
          {c.admin_notes && c.status !== 'open' && (
            <div style={{
              fontSize: 12, color: 'var(--nv)', marginBottom: 14, background: 'var(--nv-l)',
              borderRadius: 'var(--rs)', padding: '9px 12px', border: '.5px solid var(--nv-m)'
            }}>
              <strong>Admin note:</strong> {c.admin_notes}
            </div>
          )}

          {/* Live Timeline */}
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase',
            letterSpacing: '.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6
          }}>
            Activity Timeline
            {liveFlash && (
              <span style={{ fontSize: 10, color: 'var(--gn)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gn)', display: 'inline-block' }}></span>
                Live
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 1, background: 'var(--gy-m)' }}></div>
            {timeline.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--t3)', paddingLeft: 24 }}>No activity yet</div>
            )}
            {timeline.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: t.actor_role === 'admin' ? 'var(--nv-l)' : t.actor_role === 'system' ? 'var(--am-l)' : 'var(--gn-l)',
                  border: `2px solid ${t.actor_role === 'admin' ? 'var(--nv)' : t.actor_role === 'system' ? 'var(--am)' : 'var(--gn)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700,
                  color: t.actor_role === 'admin' ? 'var(--nv)' : t.actor_role === 'system' ? 'var(--am)' : 'var(--gn)',
                  zIndex: 1, position: 'relative'
                }}>
                  {t.actor_role === 'admin' ? 'A' : t.actor_role === 'system' ? 'S' : 'C'}
                </div>
                <div style={{ flex: 1, paddingTop: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{t.message}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>
                    {t.actor} · {new Date(t.created_at).toLocaleString('en-IN')}
                    {t.new_status && (
                      <span style={{
                        marginLeft: 6, background: 'var(--nv-l)', color: 'var(--nv)',
                        padding: '1px 6px', borderRadius: 10, fontWeight: 600
                      }}>
                        → {t.new_status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}