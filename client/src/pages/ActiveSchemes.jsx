/**
 * ActiveSchemes.jsx — Real-time milestone tracker
 * Place: client/src/pages/ActiveSchemes.jsx
 */
import { useState, useEffect } from 'react';
import API from '../api/api.js';
import { subscribeToMilestones } from '../services/realtime.js';

const MS_STATUS = {
  completed: { dot: 'md-ok', icon: '✓', color: 'var(--gn)', label: 'Completed' },
  pending: { dot: 'md-pend', icon: '○', color: 'var(--gy)', label: 'Pending' },
  error: { dot: 'md-err', icon: '!', color: 'var(--rd)', label: 'Error' },
  blocked: { dot: 'md-err', icon: '🔒', color: 'var(--rd)', label: 'Blocked' },
  locked: { dot: 'md-pend', icon: '🔒', color: 'var(--gy)', label: 'Locked' },
  not_started: { dot: 'md-pend', icon: '○', color: 'var(--gy)', label: 'Not Started' },
};

export default function ActiveSchemes({ user }) {
  const [schemeGroups, setSchemeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [uploads, setUploads] = useState({});
  const [uploading, setUploading] = useState({});
  const [liveFlash, setLiveFlash] = useState({});

  const load = async () => {
    try {
      const { data: matches } = await API.get('/api/schemes/matched');
      const applied = matches.filter(s => ['applied', 'active'].includes(s.application_status));

      // For each applied scheme, get milestones
      const groups = await Promise.all(applied.map(async (s) => {
        try {
          const { data: milestones } = await API.get(`/api/milestones/scheme/${s.id}`);
          return { scheme: s, milestones: milestones || [] };
        } catch { return { scheme: s, milestones: [] }; }
      }));
      setSchemeGroups(groups);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (!user?.id) return;

    // 🔴 REALTIME: live milestone updates
    const unsub = subscribeToMilestones(user.id, (payload) => {
      const msId = payload.new?.milestone_id || payload.old?.milestone_id;
      setLiveFlash(f => ({ ...f, [msId]: true }));
      setTimeout(() => setLiveFlash(f => ({ ...f, [msId]: false })), 3000);

      if (payload.eventType === 'UPDATE') {
        setSchemeGroups(groups =>
          groups.map(g => ({
            ...g,
            milestones: g.milestones.map(m =>
              m.id === payload.new.milestone_id
                ? { ...m, progress: { ...m.progress, ...payload.new } }
                : m
            )
          }))
        );
      }
    });
    return unsub;
  }, [user?.id]);

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const uploadDoc = async (schemeId, milestoneId, file) => {
    if (!file) return;
    const key = `${schemeId}-${milestoneId}`;
    setUploading(u => ({ ...u, [key]: true }));
    try {
      // Upload to Supabase Storage via realtime service
      const { uploadDocument } = await import('../services/realtime.js');
      const { path, url } = await uploadDocument(user.id, file, 'scheme_doc');

      // Register document linked to this milestone
      await API.post('/api/documents/register', {
        doc_type: 'scheme_doc',
        doc_name: file.name,
        file_path: path,
        file_url: url,
        file_size: file.size,
        mime_type: file.type,
        scheme_id: schemeId,
        milestone_id: milestoneId,
      });

      setUploads(u => ({ ...u, [key]: { name: file.name, url } }));
      alert('✅ Document uploaded! Admin will review within 24-48 hrs and update milestone status.');
    } catch (e) {
      alert('Upload failed: ' + e.message);
    } finally {
      setUploading(u => ({ ...u, [key]: false }));
    }
  };

  // Stats
  const totalMs = schemeGroups.reduce((a, g) => a + g.milestones.length, 0);
  const completedMs = schemeGroups.reduce((a, g) =>
    a + g.milestones.filter(m => m.progress?.status === 'completed').length, 0);
  const errorMs = schemeGroups.reduce((a, g) =>
    a + g.milestones.filter(m => m.progress?.status === 'error').length, 0);
  const totalBenefits = schemeGroups.reduce((a, g) =>
    a + g.milestones.filter(m => m.progress?.status === 'completed')
      .reduce((s, m) => s + (m.amount || 0), 0), 0);

  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Active Schemes</span></div>
      <div className="ph">
        <h1>📋 Active Schemes</h1>
        <p>Real-time milestone tracking · Upload documents at error stage</p>
      </div>

      <div className="sr">
        <div className="sc c-sf"><div className="sl">Active Schemes</div><div className="sv">{schemeGroups.length}</div><div className="ss">Currently enrolled</div></div>
        <div className="sc c-gn"><div className="sl">Benefits Received</div><div className="sv">₹{totalBenefits.toLocaleString('en-IN')}</div><div className="ss">This year</div></div>
        <div className="sc c-am"><div className="sl">Milestones Done</div><div className="sv">{completedMs}/{totalMs}</div><div className="ss">Completed</div></div>
        <div className="sc c-nv"><div className="sl">Errors</div><div className="sv">{errorMs}</div><div className="ss">{errorMs > 0 ? 'Action needed' : 'All clear'}</div></div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 32 }}>⏳</div><div style={{ marginTop: 8 }}>Loading milestones...</div>
        </div>
      ) : schemeGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>No active schemes yet</div>
          <div style={{ fontSize: 12, marginBottom: 14 }}>Apply for schemes from the AI Matched Schemes section</div>
        </div>
      ) : (
        schemeGroups.map(({ scheme: s, milestones }) => {
          const completed = milestones.filter(m => m.progress?.status === 'completed').length;
          const total = milestones.length;
          const hasError = milestones.some(m => ['error', 'blocked'].includes(m.progress?.status));
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div key={s.id} className={`sch s-active${hasError ? ' s-err' : ''}`}>
              <div className="sch-hdr" onClick={() => toggle(s.id)}>
                <div className="sch-ic" style={{ background: '#E8F5E9' }}>
                  {s.category === 'agriculture' ? '🌾' : s.category === 'health' ? '🏥' : s.category === 'education' ? '🎓' : '📋'}
                </div>
                <div className="sch-info">
                  <div className="sch-name">{s.name}</div>
                  <div className="sch-desc">Applied · Tracking {total} milestones</div>
                  <div className="sch-tags">
                    {hasError
                      ? <span className="tag p-rd">⚠️ Action Required</span>
                      : <span className="tag p-gn">✅ On Track</span>}
                    <span className="tag p-nv">{s.level || 'Central'}</span>
                  </div>
                </div>
                <div className="sch-right">
                  <span className={`pill ${hasError ? 'p-rd' : completed === total ? 'p-gn' : 'p-am'}`}>
                    {completed}/{total} done
                  </span>
                  <span className={`tgl${expanded[s.id] ? ' op' : ''}`}>▼</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="prog-w">
                <div className="prog-b">
                  <div className={`prog-f ${hasError ? 'rd' : pct === 100 ? 'nv' : 'am'}`} style={{ width: pct + '%' }}></div>
                </div>
                <div className="prog-m">
                  <span>{completed} of {total} milestones completed</span>
                  <span style={{ color: hasError ? 'var(--rd)' : pct === 100 ? 'var(--nv)' : 'var(--gn)', fontWeight: 700 }}>
                    {hasError ? 'Error — upload required' : pct === 100 ? 'Completed!' : `${pct}% done`}
                  </span>
                </div>
              </div>

              {/* Milestones */}
              {expanded[s.id] && (
                <div className="ms-panel op">
                  <div className="ms-lbl">All Milestones — Real-time</div>
                  <div className="ms-list">
                    {milestones.map((m) => {
                      const prog = m.progress || {};
                      const mStatus = prog.status || 'not_started';
                      const msCfg = MS_STATUS[mStatus] || MS_STATUS.not_started;
                      const key = `${s.id}-${m.id}`;
                      const isFlash = liveFlash[m.id];

                      return (
                        <div key={m.id} className="ms-item" style={{
                          background: isFlash ? 'var(--gn-l)' : 'transparent',
                          borderRadius: isFlash ? 6 : 0,
                          transition: 'background .5s',
                          padding: isFlash ? '4px 6px' : '0',
                        }}>
                          <div className={`ms-dot ${msCfg.dot}`}>{msCfg.icon}</div>
                          <div className="ms-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div className="ms-name">{m.step_number}. {m.title}</div>
                              {isFlash && <span style={{ fontSize: 10, color: 'var(--gn)', fontWeight: 700 }}>🟢 Updated!</span>}
                            </div>
                            {m.description && <div className="ms-date">{m.description}</div>}
                            {m.amount > 0 && <span className="ms-amt">₹{m.amount.toLocaleString('en-IN')}</span>}
                            {m.expected_days > 0 && prog.status !== 'completed' && (
                              <div className="ms-date">Est. {m.expected_days} days</div>
                            )}
                            {prog.completed_at && (
                              <div className="ms-date" style={{ color: 'var(--gn)', fontWeight: 600 }}>
                                ✓ Completed {new Date(prog.completed_at).toLocaleDateString('en-IN')}
                              </div>
                            )}

                            {/* Locked message */}
                            {mStatus === 'locked' && (
                              <div className="locked-info">🔒 Locked — complete previous milestones first</div>
                            )}

                            {/* Admin notes */}
                            {prog.admin_notes && (
                              <div style={{
                                fontSize: 11, color: 'var(--nv)', marginTop: 4, background: 'var(--nv-l)',
                                padding: '5px 9px', borderRadius: 'var(--rs)'
                              }}>
                                📌 Admin: {prog.admin_notes}
                              </div>
                            )}

                            {/* Error state — upload required */}
                            {mStatus === 'error' && (
                              <div className="err-box" style={{ marginTop: 8 }}>
                                <div className="err-lbl">Document Required at This Stage</div>
                                <div className="err-txt">
                                  {prog.admin_notes || 'Please upload the required document to proceed.'}
                                </div>
                                <div className="err-circles">
                                  {[1, 2, 3].map(n => (
                                    <div key={n} className={`ec ${n <= (prog.error_count || 1) ? 'ec-on' : 'ec-off'}`}>{n}</div>
                                  ))}
                                  <span className="ec-lbl">Error {prog.error_count || 1}/3 — 3 triggers support</span>
                                </div>

                                {!uploads[key] ? (
                                  <label className="up-zone" style={{ cursor: 'pointer' }}>
                                    <span style={{ fontSize: 16 }}>📎</span>
                                    <div>
                                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--nv)' }}>
                                        Upload Required Document
                                      </div>
                                      <div style={{ fontSize: '9.5px', color: 'var(--t3)' }}>
                                        PDF, JPG, PNG · Max 10MB
                                      </div>
                                    </div>
                                    <input type="file" accept=".jpg,.jpeg,.png,.pdf"
                                      style={{ display: 'none' }}
                                      onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadDoc(s.id, m.id, file);
                                        e.target.value = '';
                                      }} />
                                  </label>
                                ) : (
                                  <div className="up-done" style={{ display: 'flex' }}>
                                    ✅ {uploads[key].name} uploaded — pending admin verification
                                  </div>
                                )}
                                {uploading[key] && (
                                  <div style={{ fontSize: 11, color: 'var(--am)', marginTop: 5 }}>⏳ Uploading...</div>
                                )}

                                {/* 3× error — support */}
                                {(prog.error_count || 0) >= 3 && (
                                  <div className="sup-alert" style={{ marginTop: 8 }}>
                                    <div className="sup-title">🔴 Support Ticket Raised</div>
                                    <div className="sup-desc">3 errors reached. District officer assigned.</div>
                                    <div className="sup-btns">
                                      <button className="btn b-rd b-sm">📞 1800-111-565</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}