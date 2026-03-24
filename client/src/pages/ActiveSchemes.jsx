/**
 * ActiveSchemes.jsx — Real-time milestone tracker
 * Auto-fetches docs from Document Locker. Real-time via Supabase.
 */
import { useState, useEffect } from 'react';
import API from '../api/api.js';
import { subscribeToMilestones, subscribeToDocuments } from '../services/realtime.js';

// ── Per-scheme required documents ─────────────────────────────────────────────
const SCHEME_DOCS = {
  'nsp': ['Aadhaar Card', 'Income Certificate', 'Caste Certificate', 'Marksheet (Last Qualifying Exam)', 'Bank Passbook', 'Passport Photo', 'Institute Bonafide Certificate'],
  'scholarship': ['Aadhaar Card', 'Income Certificate', 'Caste Certificate', 'Marksheet', 'Bank Passbook', 'Passport Photo'],
  'agriculture': ['Aadhaar Card', 'Kisan Registration', 'Land Records / Khatauni', 'Bank Passbook', 'Self Declaration'],
  'kusum': ['Aadhaar Card', 'Land Ownership Proof', 'Electricity Bill', 'Bank Passbook', 'Site Photos'],
  'health': ['Aadhaar Card', 'Ration Card / BPL Card', 'Hospital Referral Letter', 'Bank Passbook'],
  'pension': ['Aadhaar Card', 'Age Proof (Birth Certificate)', 'Bank Passbook', 'Passport Photo', 'Self Declaration'],
  'housing': ['Aadhaar Card', 'Income Certificate', 'Land Ownership / No-Land Certificate', 'Bank Passbook', 'Photograph of Plot'],
  'default': ['Aadhaar Card', 'Identity Proof', 'Address Proof', 'Bank Passbook', 'Passport Photo'],
};

function getRequiredDocs(scheme) {
  const name = (scheme.name || '').toLowerCase();
  const cat = (scheme.category || '').toLowerCase();
  if (name.includes('nsp') || name.includes('scholarship') || name.includes('minority')) return SCHEME_DOCS.nsp;
  if (name.includes('kusum') || name.includes('solar')) return SCHEME_DOCS.kusum;
  if (name.includes('kisan') || cat === 'agriculture') return SCHEME_DOCS.agriculture;
  if (name.includes('ayushman') || cat === 'health') return SCHEME_DOCS.health;
  if (name.includes('pension') || name.includes('vaya vandana')) return SCHEME_DOCS.pension;
  if (name.includes('awas') || cat === 'housing') return SCHEME_DOCS.housing;
  if (cat === 'education') return SCHEME_DOCS.scholarship;
  return SCHEME_DOCS.default;
}

// ── Document Locker fuzzy matching ────────────────────────────────────────────
const LOCKER_ALIAS = {
  'aadhaar': ['Aadhaar Card'],
  'aadhaar_card': ['Aadhaar Card'],
  'voter_id': ['Identity Proof', 'Voter ID'],
  'pan_card': ['Identity Proof', 'PAN Card'],
  'pan': ['Identity Proof', 'PAN Card'],
  'income_certificate': ['Income Certificate'],
  'income certificate': ['Income Certificate'],
  'caste_certificate': ['Caste Certificate'],
  'caste certificate': ['Caste Certificate'],
  'residence_proof': ['Address Proof', 'Residence Proof'],
  'address_proof': ['Address Proof', 'Residence Proof'],
  'bank_passbook': ['Bank Passbook'],
  'bank passbook': ['Bank Passbook'],
  'passbook': ['Bank Passbook'],
  'passport_photo': ['Passport Photo'],
  'passport photo': ['Passport Photo'],
  'photo': ['Passport Photo'],
  'marksheet': ['Marksheet', 'Marksheet (Last Qualifying Exam)'],
  'mark_sheet': ['Marksheet', 'Marksheet (Last Qualifying Exam)'],
  'bonafide': ['Institute Bonafide Certificate'],
  'land_records': ['Land Records / Khatauni', 'Land Ownership Proof'],
  'land records': ['Land Records / Khatauni', 'Land Ownership Proof'],
  'ration_card': ['Ration Card / BPL Card'],
  'ration card': ['Ration Card / BPL Card'],
  'bpl_card': ['Ration Card / BPL Card'],
  'birth_certificate': ['Age Proof (Birth Certificate)'],
  'birth certificate': ['Age Proof (Birth Certificate)'],
  'self_declaration': ['Self Declaration'],
  'self declaration': ['Self Declaration'],
  'electricity_bill': ['Electricity Bill'],
  'electricity bill': ['Electricity Bill'],
};

function findLockerMatch(requiredDocName, lockerDocs) {
  const lower = requiredDocName.toLowerCase();
  // 1. Direct name match
  const direct = lockerDocs.find(d =>
    (d.doc_name || '').toLowerCase() === lower ||
    (d.doc_type || '').toLowerCase() === lower
  );
  if (direct) return direct;
  // 2. Partial name match
  const partial = lockerDocs.find(d =>
    (d.doc_name || '').toLowerCase().includes(lower.split(' ')[0]) ||
    lower.includes((d.doc_name || '').toLowerCase())
  );
  if (partial) return partial;
  // 3. Alias map lookup
  for (const [key, labels] of Object.entries(LOCKER_ALIAS)) {
    if (labels.some(l => l.toLowerCase() === lower)) {
      const match = lockerDocs.find(d =>
        (d.doc_type || '').toLowerCase().replace(/\s+/g, '_') === key ||
        (d.doc_name || '').toLowerCase().replace(/\s+/g, '_') === key ||
        (d.doc_type || '').toLowerCase() === key ||
        (d.doc_name || '').toLowerCase() === key
      );
      if (match) return match;
    }
  }
  return null;
}

const MS_STATUS = {
  completed: { dot: 'md-ok', label: 'Completed' },
  applied:   { dot: 'md-pend', label: 'Under Review' },
  pending:   { dot: 'md-pend', label: 'Pending' },
  error:     { dot: 'md-err', label: 'Rejected' },
  locked:    { dot: 'md-pend', label: 'Locked' },
  not_started: { dot: 'md-pend', label: 'Not Started' },
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
      // 1. Fetch all docs from Document Locker
      const { data: myDocs } = await API.get('/api/documents/my');
      const allDocs = myDocs || [];

      // 2. Fetch applied schemes + milestones
      const { data: matches } = await API.get('/api/schemes/matched');
      const applied = matches.filter(s => ['applied', 'active'].includes(s.application_status));
      const groups = await Promise.all(applied.map(async (s) => {
        try {
          const { data: milestones } = await API.get(`/api/milestones/scheme/${s.id}`);
          return { scheme: s, milestones: milestones || [] };
        } catch { return { scheme: s, milestones: [] }; }
      }));
      setSchemeGroups(groups);

      // 3. Build uploads map: scheme-specific docs + auto-match from locker
      const uploadsMap = {};
      // Already uploaded for specific schemes
      allDocs.forEach(doc => {
        if (doc.scheme_id && doc.doc_name) {
          uploadsMap[`${doc.scheme_id}-${doc.doc_name}`] = {
            name: doc.doc_name, id: doc.id, fromLocker: false
          };
        }
      });
      // Auto-match from Document Locker
      groups.forEach(({ scheme }) => {
        const requiredDocs = getRequiredDocs(scheme);
        requiredDocs.forEach(docName => {
          const key = `${scheme.id}-${docName}`;
          if (!uploadsMap[key]) {
            const match = findLockerMatch(docName, allDocs);
            if (match) {
              uploadsMap[key] = {
                name: match.doc_name || match.doc_type, id: match.id, fromLocker: true
              };
            }
          }
        });
      });
      setUploads(uploadsMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (!user?.id) return;
    // Real-time: milestones
    const unsubMs = subscribeToMilestones(user.id, (payload) => {
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
    // Real-time: documents — re-fetch when any doc changes
    const unsubDocs = subscribeToDocuments(user.id, () => { load(); });
    return () => { unsubMs(); unsubDocs(); };
  }, [user?.id]);

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const uploadDoc = async (schemeId, milestoneId, file, docLabel) => {
    if (!file) return;
    const key = `${schemeId}-${docLabel}`;
    setUploading(u => ({ ...u, [key]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scheme_id', schemeId);
      if (milestoneId) formData.append('milestone_id', milestoneId);
      formData.append('doc_type', docLabel);
      formData.append('doc_name', docLabel);
      await API.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploads(u => ({ ...u, [key]: { name: file.name, fromLocker: false } }));
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setUploading(u => ({ ...u, [key]: false }));
    }
  };

  // Stats
  const totalMs = schemeGroups.reduce((a, g) => a + g.milestones.length, 0);
  const completedMs = schemeGroups.reduce((a, g) =>
    a + g.milestones.filter(m => m.progress?.status === 'completed').length, 0);
  const totalBenefits = schemeGroups.reduce((a, g) =>
    a + g.milestones.filter(m => m.progress?.status === 'completed')
      .reduce((s, m) => s + (m.amount || 0), 0), 0);

  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Active Schemes</span></div>
      <div className="ph">
        <h1>Active Schemes & Milestones</h1>
        <p>Track your scheme applications, upload required documents, and monitor payment status</p>
      </div>

      <div className="sr" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="sc c-sf"><div className="sl">Active Schemes</div><div className="sv">{schemeGroups.length}</div><div className="ss">Currently enrolled</div></div>
        <div className="sc c-gn"><div className="sl">Benefits Received</div><div className="sv">₹{totalBenefits.toLocaleString('en-IN')}</div><div className="ss">Total credited</div></div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>Loading...</div>
      ) : schemeGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>No active schemes yet</div>
          <div style={{ fontSize: 12 }}>Apply for schemes from the Scheme Finder section</div>
        </div>
      ) : (
        schemeGroups.map(({ scheme: s, milestones }) => {
          const isOpen = expanded[s.id];
          const completed = milestones.filter(m => m.progress?.status === 'completed').length;
          const total = milestones.length;
          const requiredDocs = getRequiredDocs(s);
          const activeMilestone = milestones.find(m => m.progress?.status !== 'completed') || milestones[0];

          return (
            <div key={s.id} className="sch s-active" style={{ marginBottom: 14 }}>
              {/* Header */}
              <div className="sch-hdr" onClick={() => toggle(s.id)} style={{ cursor: 'pointer' }}>
                <div className="sch-info" style={{ flex: 1 }}>
                  <div className="sch-name">{s.name}</div>
                  <div className="sch-desc">{s.ministry || 'Government of India'} · {s.level || 'Central'}</div>
                  <div className="sch-tags">
                    <span className="tag p-nv">{s.level || 'Central'}</span>
                    <span className="tag p-am">{completed}/{total} milestones</span>
                  </div>
                </div>
                <div className="sch-right">
                  <span className={`pill ${completed === total && total > 0 ? 'p-gn' : 'p-am'}`}>
                    {completed === total && total > 0 ? 'Complete' : 'In Progress'}
                  </span>
                  <span className={`tgl${isOpen ? ' op' : ''}`}>▼</span>
                </div>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--gy-l)' }}>

                  {/* Required Documents Grid */}
                  <div style={{ marginTop: 16, marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nv)', marginBottom: 10 }}>
                      Required Documents for {s.name}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                      {requiredDocs.map((docName, idx) => {
                        const key = `${s.id}-${docName}`;
                        const uploaded = uploads[key];
                        const isProcessing = uploading[key];

                        return (
                          <div key={idx} style={{
                            padding: '10px 12px', borderRadius: 8,
                            background: uploaded ? '#f0fdf4' : 'var(--wh)',
                            border: `1px solid ${uploaded ? '#86efac' : 'var(--gy-m)'}`,
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6,
                          }}>
                            <div>
                              <div style={{ fontSize: 11.5, fontWeight: 600, color: uploaded ? 'var(--gn)' : 'var(--tx)' }}>
                                {idx + 1}. {docName}
                              </div>
                              <div style={{ fontSize: 9.5, color: uploaded ? 'var(--gn)' : 'var(--t3)', marginTop: 2 }}>
                                {uploaded
                                  ? uploaded.fromLocker
                                    ? `From Locker: ${uploaded.name}`
                                    : uploaded.name
                                  : 'Not uploaded'}
                              </div>
                              {uploaded?.fromLocker && (
                                <div style={{
                                  display: 'inline-block', marginTop: 4, fontSize: 9, fontWeight: 700,
                                  background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: 4,
                                }}>
                                  Auto-linked from Document Locker
                                </div>
                              )}
                            </div>
                            <label style={{ cursor: 'pointer' }}>
                              <input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                disabled={isProcessing}
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadDoc(s.id, activeMilestone?.id, file, docName);
                                  e.target.value = '';
                                }} />
                              <span style={{
                                display: 'block', textAlign: 'center', padding: '5px 0', fontSize: 11, fontWeight: 600,
                                borderRadius: 6, cursor: 'pointer',
                                background: isProcessing ? 'var(--gy-l)' : uploaded ? 'var(--wh)' : 'var(--nv)',
                                color: isProcessing ? 'var(--t3)' : uploaded ? 'var(--nv)' : '#fff',
                                border: uploaded ? '1px solid var(--nv)' : 'none',
                              }}>
                                {isProcessing ? 'Uploading...' : uploaded ? 'Replace' : 'Upload'}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 8 }}>
                      Documents from your Locker are auto-linked. Uploaded files go to {s.level || 'district'} admin for verification.
                    </div>
                  </div>

                  {/* Milestone Progress */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nv)', marginBottom: 10 }}>
                      Milestone Progress
                    </div>
                    <div className="ms-list">
                      {milestones.map((m) => {
                        const prog = m.progress || {};
                        const mStatus = prog.status || 'not_started';
                        const cfg = MS_STATUS[mStatus] || MS_STATUS.not_started;
                        const isFlash = liveFlash[m.id];

                        return (
                          <div key={m.id} className="ms-item" style={{
                            background: isFlash ? 'var(--gn-l)' : 'transparent',
                            borderRadius: 6, transition: 'background .5s', padding: '4px 6px',
                          }}>
                            <div className={`ms-dot ${cfg.dot}`}>
                              {mStatus === 'completed' ? '✓' : mStatus === 'locked' ? '🔒' : m.step_number}
                            </div>
                            <div className="ms-body">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="ms-name">Step {m.step_number}: {m.title}</div>
                                <span style={{
                                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                                  background: mStatus === 'completed' ? 'var(--gn-l)' : mStatus === 'error' ? 'var(--rd-l)' : mStatus === 'applied' ? 'var(--bl-l)' : 'var(--gy-l)',
                                  color: mStatus === 'completed' ? 'var(--gn)' : mStatus === 'error' ? 'var(--rd)' : mStatus === 'applied' ? 'var(--bl)' : 'var(--t3)',
                                }}>{cfg.label}</span>
                              </div>
                              {m.description && <div className="ms-date">{m.description}</div>}
                              {m.amount > 0 && (
                                <div style={{ fontSize: 11, fontWeight: 600, color: mStatus === 'completed' ? 'var(--gn)' : 'var(--t2)', marginTop: 2 }}>
                                  {mStatus === 'completed' ? 'Disbursed' : 'Amount'}: ₹{Number(m.amount).toLocaleString('en-IN')}
                                </div>
                              )}
                              {prog.completed_at && (
                                <div className="ms-date" style={{ color: 'var(--gn)', fontWeight: 600 }}>
                                  Completed on {new Date(prog.completed_at).toLocaleDateString('en-IN')}
                                </div>
                              )}
                              {prog.admin_notes && (
                                <div style={{ fontSize: 11, color: 'var(--rd)', marginTop: 4, background: 'var(--rd-l)', padding: '4px 8px', borderRadius: 4 }}>
                                  Admin: {prog.admin_notes}
                                </div>
                              )}
                              {mStatus === 'locked' && (
                                <div style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 2 }}>Complete previous step to unlock</div>
                              )}
                              {isFlash && <span style={{ fontSize: 10, color: 'var(--gn)', fontWeight: 700 }}>Updated just now</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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