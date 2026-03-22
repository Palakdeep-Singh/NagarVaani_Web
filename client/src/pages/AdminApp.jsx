/**
 * AdminApp.jsx — Full Admin Dashboard with Real-time
 * Place: client/src/pages/AdminApp.jsx
 */
import { useState, useEffect, useContext } from 'react';
import API from '../api/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { subscribeToDistrictComplaints } from '../services/realtime.js';

export default function AdminApp() {
  const { user, logout } = useContext(AuthContext);
  const [role, setRole] = useState('district');
  const [page, setPage] = useState('complaints');
  const [liveCount, setLiveCount] = useState(0);

  return (
    <div id="app-admin" className="app on">
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo">🏛</div>
          <div className="nav-brand-txt">
            NagarikConnect Admin
            <span>{{ district: 'District Authority', state: 'State Authority', central: 'Central Command' }[role]}</span>
          </div>
        </div>
        <div className="nav-tabs">
          {['district', 'state', 'central'].map(r => (
            <button key={r} className={`ntab${role === r ? ' on' : ''}`} onClick={() => setRole(r)}>
              {r === 'district' ? '🏛 District' : r === 'state' ? '🗺 State' : '🏛 Central'}
            </button>
          ))}
        </div>
        <div className="nav-r">
          {liveCount > 0 && (
            <div style={{
              fontSize: 11, color: 'var(--gn)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
              background: 'var(--gn-l)', padding: '3px 10px', borderRadius: 20, border: '.5px solid var(--gn)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gn)', display: 'inline-block' }}></span>
              {liveCount} live update{liveCount > 1 ? 's' : ''}
            </div>
          )}
          <div className="nav-user">
            <div className="nav-av">DC</div>
            <div className="nav-uname">DC Priya Sharma</div>
          </div>
          <button className="nav-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="layout">
        <aside className="sidebar">
          <div className="s-lbl">Latur District</div>
          {[
            { id: 'complaints', icon: '📢', label: 'Complaints', badge: 14 },
            { id: 'milestones', icon: '📋', label: 'Scheme Milestones', badge: 12 },
            { id: 'documents', icon: '📄', label: 'Document Verify', badge: 8 },
            { id: 'overview', icon: '📊', label: 'District Overview' },
          ].map(item => (
            <div key={item.id} className={`si${page === item.id ? ' on' : ''}`} onClick={() => setPage(item.id)}>
              <span className="si-ic">{item.icon}</span>
              {item.label}
              {item.badge && <span className="sbadge">{item.badge}</span>}
            </div>
          ))}
          <div className="sb-profile" style={{ margin: '12px 8px 0', background: 'var(--nv-l)', borderRadius: 'var(--r)', padding: 11 }}>
            <div className="sbp-name" style={{ color: 'var(--nv)' }}>Latur District</div>
            <div className="sbp-sub">Maharashtra · DC Office</div>
          </div>
        </aside>

        <main className="main">
          {page === 'complaints' && <AdminComplaints onLiveUpdate={n => setLiveCount(n)} />}
          {page === 'milestones' && <AdminMilestones />}
          {page === 'documents' && <AdminDocuments />}
          {page === 'overview' && <AdminOverview />}
        </main>
      </div>
    </div>
  );
}

// ── Admin Complaints ──────────────────────────────────────────────────────────
function AdminComplaints({ onLiveUpdate }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { id, type }
  const [actionForm, setActionForm] = useState({ officer: '', notes: '', status: '' });
  const [liveIds, setLiveIds] = useState(new Set());

  const load = async () => {
    try {
      const { data } = await API.get('/api/complaints/admin/district?district=Latur');
      setComplaints(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    // 🔴 REALTIME
    const unsub = subscribeToDistrictComplaints('Latur', (payload) => {
      if (payload.table === 'complaints') {
        setLiveIds(s => new Set([...s, payload.new?.id]));
        setTimeout(() => setLiveIds(s => { const n = new Set(s); n.delete(payload.new?.id); return n; }), 4000);
        onLiveUpdate(c => c + 1);
        setTimeout(() => onLiveUpdate(c => Math.max(0, c - 1)), 5000);

        if (payload.eventType === 'INSERT') {
          setComplaints(c => [payload.new, ...c]);
        } else if (payload.eventType === 'UPDATE') {
          setComplaints(c => c.map(x => x.id === payload.new.id ? { ...x, ...payload.new } : x));
        }
      }
    });
    return unsub;
  }, []);

  const doAction = async (id, status, officer, notes) => {
    try {
      await API.patch(`/api/complaints/admin/${id}`, {
        status, assigned_to: officer, admin_notes: notes
      });
      setComplaints(c => c.map(x => x.id === id ? { ...x, status, assigned_to: officer, admin_notes: notes } : x));
      setActionModal(null);
      setActionForm({ officer: '', notes: '', status: '' });
    } catch (e) { alert(e.response?.data?.error || 'Action failed'); }
  };

  const bulkAction = async (action) => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return alert('Select at least one complaint');
    if (!confirm(`${action === 'resolved' ? 'Resolve' : 'Assign'} ${ids.length} complaint${ids.length > 1 ? 's' : ''}?`)) return;
    try {
      await API.post('/api/complaints/admin/bulk', { ids, action });
      setComplaints(c => c.map(x => ids.includes(x.id) ? { ...x, status: action } : x));
      setSelected({});
    } catch (e) { alert('Bulk action failed'); }
  };

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);
  const stats = {
    open: complaints.filter(c => c.status === 'open').length,
    assigned: complaints.filter(c => c.status === 'district_assigned').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    overdue: complaints.filter(c => c.due_at && new Date(c.due_at) < new Date() && !['resolved', 'closed'].includes(c.status)).length,
  };

  const SLA_COLOR = (c) => {
    if (['resolved', 'closed'].includes(c.status)) return 'var(--gn)';
    if (!c.due_at) return 'var(--gy)';
    const left = Math.round((new Date(c.due_at) - new Date()) / 86400000);
    return left < 0 ? 'var(--rd)' : left < 3 ? 'var(--am)' : 'var(--gn)';
  };

  return (
    <div>
      <div className="bc">Admin › Latur › <span>Complaints</span></div>
      <div className="ph"><h1>📢 District Complaints</h1><p>Real-time complaints from citizens · SLA: 14 days before escalation</p></div>

      <div className="sr">
        <div className="sc c-am"><div className="sl">Open</div><div className="sv">{stats.open}</div><div className="ss">Awaiting assignment</div></div>
        <div className="sc c-nv"><div className="sl">Assigned</div><div className="sv">{stats.assigned}</div><div className="ss">Officer working</div></div>
        <div className="sc c-gn"><div className="sl">Resolved</div><div className="sv">{stats.resolved}</div><div className="ss">This month</div></div>
        <div className="sc c-sf"><div className="sl">SLA Breach Risk</div><div className="sv" style={{ color: 'var(--rd)' }}>{stats.overdue}</div><div className="ss">Overdue</div></div>
      </div>

      {/* Filters + Bulk Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tb" style={{ margin: 0 }}>
          {['all', 'open', 'district_assigned', 'state_escalated', 'resolved'].map(s => (
            <button key={s} className={`tbtn${filter === s ? ' on' : ''}`} onClick={() => setFilter(s)}
              style={{ fontSize: 11, padding: '4px 10px' }}>
              {s === 'all' ? `All (${complaints.length})` : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className="btn b-gn b-sm" onClick={() => bulkAction('resolved')}>✅ Resolve Selected</button>
          <button className="btn b-nv b-sm" onClick={() => bulkAction('district_assigned')}>📋 Assign Selected</button>
          <button className="btn b-rd b-sm" onClick={() => bulkAction('state_escalated')}>⬆ Escalate Selected</button>
        </div>
      </div>

      {/* Complaints Table */}
      <div style={{ background: 'var(--wh)', borderRadius: 'var(--r)', border: '.5px solid var(--gy-m)', overflow: 'hidden' }}>
        <table className="dtbl" style={{ width: '100%' }}>
          <thead><tr>
            <th><input type="checkbox" onChange={e => { const m = {}; filtered.forEach(c => { m[c.id] = e.target.checked }); setSelected(m) }} /></th>
            <th>Ticket & Citizen</th><th>Category</th><th>Status</th><th>SLA</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--t3)' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--t3)' }}>No complaints in this filter</td></tr>
            ) : filtered.map(c => {
              const isLive = liveIds.has(c.id);
              const slaLeft = c.due_at ? Math.round((new Date(c.due_at) - new Date()) / 86400000) : null;
              const slaPct = c.due_at && c.filed_at ? Math.min(100, Math.round(
                (new Date() - new Date(c.filed_at)) / (new Date(c.due_at) - new Date(c.filed_at)) * 100)) : 0;

              return (
                <>
                  <tr key={c.id} style={{
                    background: isLive ? 'var(--gn-l)' : c.due_at && new Date(c.due_at) < new Date() && !['resolved', 'closed'].includes(c.status) ? '#FFF5F5' : 'inherit',
                    transition: 'background .4s',
                  }}>
                    <td><input type="checkbox" checked={!!selected[c.id]} onChange={e => setSelected(s => ({ ...s, [c.id]: e.target.checked }))} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div className="u-av" style={{ background: 'var(--nv-l)', color: 'var(--nv)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                          {c.ticket_no?.slice(0, 2) || '??'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>#{c.ticket_no || 'Pending'}</div>
                          <div style={{ fontSize: 10, color: 'var(--t3)' }}>{c.title.slice(0, 35)}{c.title.length > 35 ? '...' : ''}</div>
                          <div style={{ fontSize: 10, color: 'var(--t3)' }}>{new Date(c.filed_at).toLocaleDateString('en-IN')}{c.location ? ' · ' + c.location : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="pill p-nv" style={{ fontSize: 10 }}>{c.category}</span></td>
                    <td>
                      <span className={`pill ${c.status === 'resolved' ? 'p-gn' : c.status.includes('escalated') ? 'p-sf' : c.status === 'district_assigned' ? 'p-bl' : 'p-am'}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {slaLeft !== null && !['resolved', 'closed'].includes(c.status) ? (
                        <div>
                          <div className="sla-b" style={{ width: 80 }}>
                            <div className={`sla-f ${slaLeft < 0 ? 'sla-c' : slaLeft < 3 ? 'sla-w' : 'sla-ok'}`} style={{ width: slaPct + '%' }}></div>
                          </div>
                          <div style={{ fontSize: 10, color: slaLeft < 0 ? 'var(--rd)' : slaLeft < 3 ? 'var(--am)' : 'var(--gn)', fontWeight: 700, marginTop: 2 }}>
                            {slaLeft < 0 ? 'OVERDUE' : slaLeft + 'd left'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 10, color: 'var(--gn)', fontWeight: 600 }}>✓ Done</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn b-gn b-sm"
                          onClick={() => doAction(c.id, 'resolved', 'District Admin', 'Resolved by DC Office')}>
                          ✓ Resolve
                        </button>
                        <button className="btn b-nv b-sm"
                          onClick={() => { setActionModal({ id: c.id, type: 'assign' }); setExpandedId(c.id); }}>
                          Assign
                        </button>
                        <button className="btn b-sf b-sm"
                          onClick={() => doAction(c.id, 'state_escalated', '', 'Escalated to State Water Board')}>
                          ⬆
                        </button>
                        <button className="btn b-gh b-sm" onClick={() => setExpandedId(id => id === c.id ? null : c.id)}>
                          {expandedId === c.id ? '▲' : 'Timeline'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Timeline row */}
                  {expandedId === c.id && (
                    <tr key={c.id + '_timeline'}>
                      <td colSpan={6} style={{ padding: '0 12px 12px', background: 'var(--gy-l)' }}>
                        <div style={{ paddingTop: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, textTransform: 'uppercase' }}>
                            Activity Timeline
                          </div>
                          {(c.complaint_timeline || []).length === 0 ? (
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>No timeline entries yet</div>
                          ) : (c.complaint_timeline || []).map((t, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                              <div style={{
                                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                background: t.actor_role === 'admin' ? 'var(--nv-l)' : 'var(--gn-l)',
                                border: `1.5px solid ${t.actor_role === 'admin' ? 'var(--nv)' : 'var(--gn)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 8, fontWeight: 700, color: t.actor_role === 'admin' ? 'var(--nv)' : 'var(--gn)'
                              }}>
                                {t.actor_role === 'admin' ? 'A' : 'C'}
                              </div>
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 600 }}>{t.message}</div>
                                <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                                  {t.actor} · {new Date(t.created_at).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* Quick assign form */}
                          {actionModal?.id === c.id && (
                            <div style={{ marginTop: 10, background: 'var(--wh)', borderRadius: 'var(--rs)', padding: '10px 12px', border: '.5px solid var(--nv-m)' }}>
                              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--nv)' }}>Assign to Officer</div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <input style={{ flex: 1, padding: '6px 10px', border: '.5px solid var(--gy-m)', borderRadius: 'var(--rs)', fontSize: 12, outline: 'none' }}
                                  placeholder="Officer name" value={actionForm.officer}
                                  onChange={e => setActionForm(f => ({ ...f, officer: e.target.value }))} />
                                <input style={{ flex: 2, padding: '6px 10px', border: '.5px solid var(--gy-m)', borderRadius: 'var(--rs)', fontSize: 12, outline: 'none' }}
                                  placeholder="Notes for citizen" value={actionForm.notes}
                                  onChange={e => setActionForm(f => ({ ...f, notes: e.target.value }))} />
                                <button className="btn b-nv b-sm"
                                  onClick={() => doAction(c.id, 'district_assigned', actionForm.officer, actionForm.notes)}>
                                  Assign
                                </button>
                                <button className="btn b-gh b-sm" onClick={() => setActionModal(null)}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Milestones ──────────────────────────────────────────────────────────
function AdminMilestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('error');
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    API.get('/api/milestones/admin/district').then(r => {
      setMilestones(r.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateMS = async (id, status, notes) => {
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      const { data } = await API.patch(`/api/milestones/admin/${id}`, { status, admin_notes: notes });
      setMilestones(m => m.map(x => x.id === id ? { ...x, ...data, status } : x));
    } catch (e) { alert('Update failed: ' + e.message); }
    finally { setProcessing(p => ({ ...p, [id]: false })); }
  };

  const filtered = milestones.filter(m => filter === 'all' || m.status === filter);

  return (
    <div>
      <div className="bc">Admin › <span>Scheme Milestones</span></div>
      <div className="ph"><h1>📋 Milestone Tracker</h1><p>Review & update milestone status for all district citizens</p></div>

      <div className="tb">
        {[['error', '⚠️ Errors'], ['pending', '⏳ Pending'], ['completed', '✅ Completed'], ['all', 'All']].map(([v, l]) => (
          <button key={v} className={`tbtn${filter === v ? ' on' : ''}`} onClick={() => setFilter(v)}>
            {l} ({v === 'all' ? milestones.length : milestones.filter(m => m.status === v).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>Loading milestones...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>No milestones in this category</div>
      ) : (
        <div style={{ background: 'var(--wh)', borderRadius: 'var(--r)', border: '.5px solid var(--gy-m)', overflow: 'hidden' }}>
          <table className="dtbl">
            <thead><tr>
              <th>Citizen</th><th>Scheme</th><th>Milestone</th><th>Amount</th><th>Document</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} style={{ background: m.status === 'error' ? '#FFF5F5' : m.status === 'completed' ? '#F0FFF4' : 'inherit' }}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{m.users?.full_name || '—'}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.users?.phone || ''} · {m.users?.ward || m.users?.district || ''}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{m.schemes?.name || '—'}</td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{m.scheme_milestones?.title || '—'}</div>
                    {m.admin_notes && <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.admin_notes}</div>}
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 700, color: 'var(--gn)' }}>
                    {m.scheme_milestones?.amount > 0 ? `₹${m.scheme_milestones.amount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td>
                    {m.documents?.file_url ? (
                      <div>
                        <a href={m.documents.file_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: 'var(--bl)', fontWeight: 600 }}>
                          📄 {m.documents.doc_name || 'View'}
                        </a>
                        <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.documents.status}</div>
                      </div>
                    ) : <span style={{ fontSize: 11, color: 'var(--t3)' }}>No document</span>}
                  </td>
                  <td>
                    <span className={`pill ${m.status === 'completed' ? 'p-gn' : m.status === 'error' ? 'p-rd' : m.status === 'pending' ? 'p-am' : 'p-gy'}`}>
                      {m.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {m.status !== 'completed' && (
                        <button className="btn b-gn b-sm" disabled={processing[m.id]}
                          onClick={() => updateMS(m.id, 'completed', 'Milestone verified and completed by DC office')}>
                          {processing[m.id] ? '...' : '✓ Complete'}
                        </button>
                      )}
                      {m.status !== 'error' && (
                        <button className="btn b-rd b-sm" disabled={processing[m.id]}
                          onClick={() => {
                            const notes = prompt('Enter error reason for citizen:', 'Please re-upload correct document');
                            if (notes) updateMS(m.id, 'error', notes);
                          }}>
                          ✗ Error
                        </button>
                      )}
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

// ── Admin Documents ───────────────────────────────────────────────────────────
function AdminDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    API.get('/api/documents/admin/pending').then(r => setDocs(r.data || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const verify = async (id, action) => {
    setProcessing(p => ({ ...p, [id]: true }));
    const rejectReason = action === 'rejected' ? prompt('Rejection reason (will be sent to citizen):', 'Invalid document format') : null;
    if (action === 'rejected' && !rejectReason) return;
    try {
      await API.patch(`/api/documents/admin/${id}`, { action, reject_reason: rejectReason });
      setDocs(d => d.filter(x => x.id !== id));
    } catch (e) { alert('Action failed'); }
    finally { setProcessing(p => ({ ...p, [id]: false })); }
  };

  const bulkVerify = async (action) => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return alert('Select documents first');
    try {
      await API.post('/api/documents/admin/bulk', { ids, action });
      setDocs(d => d.filter(x => !ids.includes(x.id)));
      setSelected({});
    } catch (e) { alert('Bulk action failed'); }
  };

  return (
    <div>
      <div className="bc">Admin › <span>Document Verification</span></div>
      <div className="ph"><h1>📄 Document Verification Queue</h1><p>Verify citizen documents for scheme applications · Updates push to citizens in real-time</p></div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--t3)', flex: 1 }}>{docs.length} documents pending</span>
        <button className="btn b-gn b-sm" onClick={() => bulkVerify('verified')}>✅ Approve All Selected</button>
        <button className="btn b-rd b-sm" onClick={() => bulkVerify('rejected')}>❌ Reject All Selected</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>Loading documents...</div>
      ) : docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 52, color: 'var(--t3)' }}>
          <div style={{ fontSize: 40 }}>✅</div>
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600 }}>No documents pending verification!</div>
        </div>
      ) : (
        <div style={{ background: 'var(--wh)', borderRadius: 'var(--r)', border: '.5px solid var(--gy-m)', overflow: 'hidden' }}>
          <table className="dtbl">
            <thead><tr>
              <th><input type="checkbox" onChange={e => { const m = {}; docs.forEach(d => { m[d.id] = e.target.checked }); setSelected(m) }} /></th>
              <th>Citizen</th><th>Document</th><th>Type</th><th>Uploaded</th><th>Preview</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id}>
                  <td><input type="checkbox" checked={!!selected[d.id]} onChange={e => setSelected(s => ({ ...s, [d.id]: e.target.checked }))} /></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{d.users?.full_name || '—'}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{d.users?.phone} · {d.users?.district}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{d.doc_name}</div>
                    {d.file_size && <div style={{ fontSize: 10, color: 'var(--t3)' }}>{(d.file_size / 1024).toFixed(0)}KB · {d.mime_type?.split('/')[1]?.toUpperCase()}</div>}
                  </td>
                  <td><span className="pill p-nv" style={{ fontSize: 10 }}>{d.doc_type.replace(/_/g, ' ')}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--t3)' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    {d.file_url ? (
                      d.mime_type?.startsWith('image') ? (
                        <img src={d.file_url} alt="doc" style={{ width: 50, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                          onClick={() => window.open(d.file_url, '_blank')} />
                      ) : (
                        <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                          className="btn b-gh b-sm">📄 View PDF</a>
                      )
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn b-gn b-sm" disabled={processing[d.id]}
                        onClick={() => verify(d.id, 'verified')}>
                        {processing[d.id] ? '...' : '✓ Verify'}
                      </button>
                      <button className="btn b-rd b-sm" disabled={processing[d.id]}
                        onClick={() => verify(d.id, 'rejected')}>
                        ✗ Reject
                      </button>
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

// ── Admin Overview ─────────────────────────────────────────────────────────
function AdminOverview() {
  return (
    <div>
      <div className="bc">Admin › <span>District Overview</span></div>
      <div className="ph"><h1>📊 District Command Center</h1><p>Latur · 8,92,000 citizens · 47 active schemes</p></div>
      <div className="sr">
        <div className="sc c-sf"><div className="sl">Beneficiaries</div><div className="sv">2,84,391</div><div className="ss">+1,247 this month</div></div>
        <div className="sc c-gn"><div className="sl">Schemes Delivered</div><div className="sv">41/47</div><div className="ss">87% delivery rate</div></div>
        <div className="sc c-am"><div className="sl">Open Complaints</div><div className="sv">14</div><div className="ss" style={{ color: 'var(--rd)' }}>3 near SLA breach</div></div>
        <div className="sc c-nv"><div className="sl">Docs Pending</div><div className="sv">8</div><div className="ss">Awaiting verification</div></div>
      </div>
    </div>
  );
}