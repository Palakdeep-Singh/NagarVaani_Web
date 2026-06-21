/**
 * ComplaintsPage.tsx — Modern Grievance Tracker Dashboard
 */
import { useState, useEffect } from 'react';
import { API, subscribeToNotifications as subscribeToComplaints, subscribeToNotifications as subscribeToComplaintTimeline } from './mockHelpers';

const CATEGORIES = ['Water Supply', 'Electricity', 'Roads', 'Sanitation', 'Scheme Issue', 'Public Health', 'Education', 'Data Correction', 'Other'];

const CATEGORY_ICONS = {
  'Water Supply': '💧', 'Electricity': '⚡', 'Roads': '🛣️', 'Sanitation': '🧹',
  'Scheme Issue': '📋', 'Public Health': '🏥', 'Education': '🎓', 'Data Correction': '🔧', 'Other': '📌'
};

const STATUS_CONFIG = {
  open: { label: 'Filed', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '📋' },
  district_assigned: { label: 'District Review', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '🏛' },
  state_escalated: { label: 'State Escalated', color: '#7C3AED', bg: '#FAF5FF', border: '#E9D5FF', icon: '🗺' },
  central_escalated: { label: 'Central Escalated', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: '🏛' },
  resolved: { label: 'Resolved', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: '✅' },
  closed: { label: 'Closed', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', icon: '🔒' },
};

const SLA_DAYS = (filedAt, dueAt) => {
  const total = Math.round((new Date(dueAt) - new Date(filedAt)) / 86400000);
  const used = Math.round((new Date() - new Date(filedAt)) / 86400000);
  const left = Math.max(0, Math.round((new Date(dueAt) - new Date()) / 86400000));
  const pct = Math.min(100, Math.round((used / total) * 100));
  return { total, used, left, pct };
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
    if (!user?.id) return;
    const unsub = subscribeToComplaints(user.id, (payload) => {
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 3000);
      if (payload.eventType === 'INSERT') {
        setComplaints(c => c.some(x => x.id === payload.new.id) ? c : [{ ...payload.new, timeline: [] }, ...c]);
      } else if (payload.eventType === 'UPDATE') {
        setComplaints(c => c.map(comp => comp.id === payload.new.id ? { ...comp, ...payload.new } : comp));
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
    open: complaints.filter(c => c.status === 'open').length,
    review: complaints.filter(c => ['district_assigned'].includes(c.status)).length,
    escalated: complaints.filter(c => c.status.includes('escalated')).length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
  };

  return (
    <div className="page on">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 18, zIndex: 9999,
          background: toast.t === 'success' ? '#16A34A' : '#DC2626',
          color: '#fff', borderRadius: 14, padding: '14px 20px',
          fontSize: 14, fontWeight: 600, maxWidth: 380,
          boxShadow: '0 8px 30px rgba(0,0,0,.2)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'nv-fadein .2s ease'
        }}>
          {toast.t === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <div className="hero-modern-saas" style={{ marginBottom: 32 }}>
        <div className="hero-saas-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF2F2', color: '#DC2626', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <span>🛡️</span> Grievance Management
            {liveIndicator && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, color: '#16A34A' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', animation: 'pulse 1s infinite' }}></span>
                Live
              </span>
            )}
          </div>
          <h1 className="hero-saas-title">
            Grievance Tracker
          </h1>
          <p className="hero-saas-desc">
            Track complaints, monitor escalations, and stay informed throughout the resolution process. Auto-escalation: District (14 days) → State (14 days) → Central.
          </p>
          <div className="hero-saas-stats">
            <div className="hero-saas-stat-card" onClick={() => setShowForm(true)} style={{ cursor: 'pointer', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <span>+</span> File New Complaint
            </div>
            <div className="hero-saas-stat-card">
              <span>📊</span> {complaints.length} Total Cases
            </div>
          </div>
        </div>

        <div className="hero-saas-visual">
          <div className="hero-floating-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #DC2626, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>🛡️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Resolution Summary</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>All time statistics</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Resolution Rate', value: complaints.length > 0 ? Math.round((stats.resolved / complaints.length) * 100) : 0, color: '#10B981' },
                { label: 'Escalation Rate', value: complaints.length > 0 ? Math.round((stats.escalated / complaints.length) * 100) : 0, color: '#D97706' },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 800 }}>{item.value}%</span>
                  </div>
                  <div style={{ height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: 100, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: '📋', label: 'Open Cases', value: stats.open, color: '#D97706', bg: '#FFFBEB' },
          { icon: '🔍', label: 'Under Review', value: stats.review, color: '#2563EB', bg: '#EFF6FF' },
          { icon: '⚡', label: 'Escalated', value: stats.escalated, color: '#7C3AED', bg: '#FAF5FF' },
          { icon: '✅', label: 'Resolved', value: stats.resolved, color: '#16A34A', bg: '#F0FDF4' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: `5px solid ${stat.color}`,
            borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── NEW COMPLAINT FORM ── */}
      {showForm && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '5px solid #2563EB',
          borderRadius: 16, padding: 28, marginBottom: 28,
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>File New Complaint</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Your grievance will be assigned to the appropriate department</div>
            </div>
          </div>
          <div className="profile-form-grid">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Title <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                placeholder="Brief description of the issue"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Category <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                    } catch { showToast('Could not fetch address', 'error'); }
                  }, () => showToast('Permission denied', 'error'));
                }} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0, marginLeft: 8 }}>📍 Auto-detect</button>
              </label>
              <input style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                placeholder="Ward 4, Near Hanuman Mandir..."
                value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
            <textarea style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }}
              placeholder="Detailed description of the problem..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', cursor: 'pointer' }}>Cancel</button>
            <button className="btn-apply-modern" onClick={submit} disabled={submitting} style={{ padding: '12px 28px', fontSize: 14 }}>
              {submitting ? '⏳ Filing...' : '🚀 File Complaint'}
            </button>
          </div>
        </div>
      )}

      {/* ── COMPLAINTS LIST ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Loading complaints...</div>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ background: '#FFFFFF', border: '2px dashed #E2E8F0', borderRadius: 20, textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>No Complaints Filed</div>
          <div style={{ fontSize: 14, color: '#64748B', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            File a complaint to track its resolution status in real-time with automatic escalation
          </div>
          <button className="btn-apply-modern" onClick={() => setShowForm(true)} style={{ padding: '14px 28px', fontSize: 15 }}>
            + File Your First Complaint
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {complaints.map(c => (
            <ComplaintCard key={c.id} complaint={c} expanded={!!expanded[c.id]}
              onToggle={() => toggle(c.id)} userId={user?.id} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Complaint Card ─────────────────────────────────────────────────────────
function ComplaintCard({ complaint: c, expanded, onToggle, userId }) {
  const [timeline, setTimeline] = useState(c.timeline || []);
  const [liveFlash, setLiveFlash] = useState(false);

  useEffect(() => {
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
  const slaColor = !sla ? '#64748B' : sla.left > 7 ? '#16A34A' : sla.left > 3 ? '#D97706' : '#DC2626';
  const catIcon = CATEGORY_ICONS[c.category] || '📌';

  const escalationSteps = [
    { label: 'Filed', done: true },
    { label: 'District', done: ['district_assigned', 'state_escalated', 'central_escalated', 'resolved', 'closed'].includes(c.status) },
    { label: 'State', done: ['state_escalated', 'central_escalated', 'resolved', 'closed'].includes(c.status) },
    { label: 'Central', done: ['central_escalated', 'resolved', 'closed'].includes(c.status) },
    { label: 'Resolved', done: c.status === 'resolved' || c.status === 'closed' },
  ];

  const currentStepIndex = escalationSteps.filter(s => s.done).length - 1;

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${liveFlash ? '#16A34A' : '#E2E8F0'}`,
      borderLeft: `5px solid ${sc.color}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: liveFlash ? '0 0 0 3px rgba(22,163,74,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start' }} onClick={onToggle}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: sc.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
          border: `1px solid ${sc.border}`,
        }}>
          {catIcon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{c.title}</span>
            {liveFlash && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', animation: 'pulse 1s infinite' }}></span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: '#64748B', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>#{c.ticket_no || 'Pending'}</span>
            <span>📅 {new Date(c.filed_at).toLocaleDateString('en-IN')}</span>
            {c.category && <span>🏷️ {c.category}</span>}
            {c.location && <span>📍 {c.location}</span>}
          </div>

          {/* Escalation Pipeline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
            {escalationSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < escalationSteps.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: step.done ? (i === currentStepIndex ? sc.color : '#10B981') : '#F1F5F9',
                    color: step.done ? '#FFFFFF' : '#94A3B8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                    border: step.done ? 'none' : '2px solid #E2E8F0',
                    transition: 'all 0.3s ease',
                  }}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: step.done ? '#334155' : '#94A3B8', whiteSpace: 'nowrap' }}>{step.label}</span>
                </div>
                {i < escalationSteps.length - 1 && (
                  <div style={{ flex: 1, height: 3, background: step.done && escalationSteps[i + 1]?.done ? '#10B981' : step.done ? `linear-gradient(90deg, #10B981, #E2E8F0)` : '#E2E8F0', borderRadius: 10, margin: '0 6px', marginBottom: 18, transition: 'background 0.5s ease' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span style={{
            background: sc.bg, color: sc.color, padding: '6px 14px', borderRadius: 100,
            fontSize: 12, fontWeight: 700, border: `1px solid ${sc.border}`, whiteSpace: 'nowrap',
          }}>
            {sc.icon} {sc.label}
          </span>
          {sla && c.status !== 'resolved' && c.status !== 'closed' && (
            <span style={{ fontSize: 12, color: slaColor, fontWeight: 700 }}>
              {sla.left === 0 ? '🚨 SLA Breached' : `⏱ ${sla.left}d left`}
            </span>
          )}
          <span style={{ fontSize: 18, color: '#94A3B8', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </div>
      </div>

      {/* SLA Progress Bar */}
      {sla && c.status !== 'resolved' && c.status !== 'closed' && (
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${sla.pct}%`, background: slaColor, borderRadius: 100, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#94A3B8' }}>
            <span>Day {sla.used} of {sla.total}</span>
            <span style={{ color: slaColor, fontWeight: 600 }}>{sla.left} days remaining</span>
          </div>
        </div>
      )}

      {/* Expanded: Timeline + Details */}
      {expanded && (
        <div style={{ padding: '24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
          {c.description && (
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '16px', fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20,
            }}>
              {c.description}
            </div>
          )}
          {c.admin_notes && c.status !== 'open' && (
            <div style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12,
              padding: '16px', fontSize: 14, marginBottom: 20, borderLeft: '4px solid #2563EB',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>Admin Response</div>
              <div style={{ color: '#1E40AF' }}>{c.admin_notes}</div>
            </div>
          )}

          {/* Activity Timeline */}
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📜</span> Activity Timeline
            {liveFlash && (
              <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }}></span> Live
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            {timeline.length === 0 && (
              <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>No activity yet — updates will appear here in real-time</div>
            )}
            {timeline.map((t, i) => {
              const actorColor = t.actor_role === 'admin' ? '#2563EB' : t.actor_role === 'system' ? '#D97706' : '#10B981';
              const actorBg = t.actor_role === 'admin' ? '#EFF6FF' : t.actor_role === 'system' ? '#FFFBEB' : '#F0FDF4';
              return (
                <div key={i} className="timeline-modern-item completed" style={{ paddingBottom: i < timeline.length - 1 ? 24 : 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: actorBg,
                      border: `2px solid ${actorColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: actorColor, zIndex: 2, position: 'relative',
                    }}>
                      {t.actor_role === 'admin' ? 'A' : t.actor_role === 'system' ? 'S' : 'C'}
                    </div>
                    {i < timeline.length - 1 && (
                      <div style={{ position: 'absolute', left: 15, top: 34, bottom: -8, width: 2, background: '#E2E8F0' }} />
                    )}
                  </div>
                  <div className="timeline-modern-content" style={{ borderLeftColor: actorColor }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{t.message}</div>
                    <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>{t.actor}</span>
                      <span>·</span>
                      <span>{new Date(t.created_at).toLocaleString('en-IN')}</span>
                      {t.new_status && (
                        <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
                          → {t.new_status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
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