/**
 * ActiveSchemes.jsx — Real-time milestone tracker
 * Auto-fetches docs from Document Locker. Real-time via Supabase.
 */
import { useState, useEffect } from 'react';
import { API, subscribeToNotifications as subscribeToMilestones, subscribeToNotifications as subscribeToDocuments } from './mockHelpers';

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

export default function ActiveSchemes({ user, filterState = 'active' }) {
  const [schemeGroups, setSchemeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [uploads, setUploads] = useState({});
  const [uploading, setUploading] = useState({});
  const [liveFlash, setLiveFlash] = useState({});
  const [withdrawOpen, setWithdrawOpen] = useState(null);
  const [withdrawText, setWithdrawText] = useState('');

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


  const submitMilestone = async (progressId) => {
    try {
      setUploading(u => ({ ...u, [progressId]: true }));
      await API.post(`/api/milestones/${progressId}/submit`, {});
      load();
    } catch (e) {
      alert('Submission failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setUploading(u => ({ ...u, [progressId]: false }));
    }
  };

  const handleWithdraw = async (schemeId) => {
    if (withdrawText !== 'WITHDRAW') {
      alert('Please type WITHDRAW exactly to confirm.');
      return;
    }
    setUploading(u => ({ ...u, [`withdraw-${schemeId}`]: true }));
    try {
      await API.post(`/api/schemes/${schemeId}/withdraw`);
      setWithdrawOpen(null);
      setWithdrawText('');
      load(); // Reloads scheme list
    } catch (e) {
      alert('Withdrawal failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setUploading(u => ({ ...u, [`withdraw-${schemeId}`]: false }));
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
      {/* No breadcrumb */}
      <div className="hero-modern-saas" style={{ marginBottom: 32 }}>
        <div className="hero-saas-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <span>✨</span> Live Updates
          </div>
          <h1 className="hero-saas-title">
            {filterState === 'active' ? '🚀 My Scheme Journey' : '🌟 Completed Schemes'}
          </h1>
          <p className="hero-saas-desc">
            {filterState === 'active' ? 'Track application progress, milestones, approvals, document verification, and benefit disbursement in one place.' : 'View your completely successful scheme applications and milestones.'}
          </p>
          <div className="hero-saas-stats">
            <div className="hero-saas-stat-card">
              <span style={{ color: '#2563EB', fontSize: 16 }}>📋</span> {schemeGroups.filter(g => g.milestones.some(m => m.progress?.status !== 'completed')).length} Active Applications
            </div>
            <div className="hero-saas-stat-card">
              <span style={{ color: '#10B981', fontSize: 16 }}>✓</span> {completedMs} Completed Milestones
            </div>
            <div className="hero-saas-stat-card">
              <span style={{ color: '#F59E0B', fontSize: 16 }}>⏳</span> {totalMs - completedMs} Upcoming Actions
            </div>
            <div className="hero-saas-stat-card">
              <span style={{ color: '#8B5CF6', fontSize: 16 }}>💰</span> ₹{totalBenefits.toLocaleString('en-IN')} Estimated Benefits
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>Loading...</div>
      ) : (() => {
        const targetGroups = filterState === 'active' 
          ? schemeGroups.filter(g => g.milestones.length === 0 || g.milestones.some(m => m.progress?.status !== 'completed'))
          : schemeGroups.filter(g => g.milestones.length > 0 && g.milestones.every(m => m.progress?.status === 'completed'));
        
        if (targetGroups.length === 0) {
          return (
            <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--t3)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>
                {filterState === 'active' ? 'No active schemes yet' : 'No completed schemes yet'}
              </div>
              <div style={{ fontSize: 12 }}>
                {filterState === 'active' ? 'Apply for schemes from the Scheme Finder section' : 'Applied schemes appear here once fully processed'}
              </div>
            </div>
          );
        }

        return targetGroups.map(({ scheme: s, milestones }) => {
          const isOpen = expanded[s.id];
          const completed = milestones.filter(m => m.progress?.status === 'completed').length;
          const total = milestones.length;
          const requiredDocs = getRequiredDocs(s);
          const activeMilestone = milestones.find(m => (m.progress?.status || 'not_started') !== 'completed') || milestones[0];
          const isSubmitted = milestones.length > 0 && milestones.some(m => m.progress?.status === 'applied' || m.progress?.status === 'completed');
          const isApplicationLocked = isSubmitted;

          return (
            <div key={s.id} className="tracking-card-modern" style={{ borderLeft: `6px solid ${completed === total && total > 0 ? '#10B981' : '#2563EB'}` }}>
              {/* Header */}
              <div className="tracking-card-header" onClick={() => toggle(s.id)}>
                <div className="tracking-card-icon">
                  {s.category === 'agriculture' ? '🌾' : s.category === 'health' ? '🏥' : s.category === 'education' ? '🎓' : s.category === 'housing' ? '🏠' : '📋'}
                </div>
                <div className="tracking-card-info">
                  <div className="tracking-card-title">{s.name}</div>
                  <div className="tracking-card-subtitle">
                    <span>🏛️ {s.ministry || 'Government of India'}</span>
                    <span>•</span>
                    <span className={`status-badge-modern ${completed === total && total > 0 ? 'completed' : 'pending'}`}>
                      {completed === total && total > 0 ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
                  <div className="tracking-progress-text" style={{ textAlign: 'right' }}>
                    <div className="stage" style={{ marginBottom: 4 }}>{completed}/{total > 0 ? total : 1} Milestones</div>
                    <div className="date">{total > 0 && completed === total ? 'Disbursed' : 'Awaiting action'}</div>
                  </div>
                  
                  {/* Progress Ring */}
                  <div style={{ position: 'relative', width: 48, height: 48 }}>
                    <svg width="48" height="48" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={completed === total && total > 0 ? '#10B981' : '#2563EB'} strokeWidth="3" strokeDasharray={`${total > 0 ? (completed / total) * 100 : 0}, 100`} style={{ transition: 'stroke-dasharray 1s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0F172A' }}>
                      {total > 0 ? Math.round((completed / total) * 100) : 0}%
                    </div>
                  </div>
                  
                  <div style={{ fontSize: 20, color: '#9CA3AF', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</div>
                </div>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--gy-l)' }}>

                  {/* Phase 1: Upload Documents (Hide after submission) */}
                  {!isSubmitted && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nv)', marginBottom: 10 }}>
                        Required Documents for {s.name}
                      </div>
                      <div style={{ 
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
                        gap: 10, marginBottom: 14 
                      }}>
                        {requiredDocs.map((docName, idx) => {
                          const key = `${s.id}-${docName}`;
                          const uploaded = uploads[key];
                          const isProcessing = uploading[key];

                          return (
                            <div key={idx} style={{
                              padding: '10px', borderRadius: 10, background: uploaded ? 'var(--gn-l)' : 'var(--gy-l)',
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
                      <div style={{ fontSize: 10.5, color: 'var(--t3)', marginBottom: 14 }}>
                        Documents from your Locker are auto-linked. Uploaded files go to {s.level || 'district'} admin for verification.
                      </div>
                    </div>
                  )}

                  {/* Action Buttons — Submit (Phase 1) or Withdraw (Phase 2) */}
                  <div style={{ marginTop: 14 }}>
                    {(() => {
                      const allDocsUploaded = requiredDocs.every(doc => uploads[`${s.id}-${doc}`]);

                      if (isSubmitted) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{
                              padding: '10px 14px', background: 'var(--bl-l)',
                              border: '.5px solid var(--bl)', borderRadius: 'var(--rs)',
                              fontSize: 12, color: 'var(--bl)', fontWeight: 600, textAlign: 'center'
                            }}>
                              📋 Application Submitted — Under Admin Review
                            </div>
                            <button 
                              className="btn b-rd b-sm" 
                              style={{ width: 'fit-content', padding: '8px 20px', fontSize: 12, fontWeight: 700 }}
                              onClick={() => setWithdrawOpen(s)}
                            >
                              Withdraw Application
                            </button>
                          </div>
                        );
                      }

                      if (allDocsUploaded) {
                        return (
                          <button
                            className="btn b-bl b-sm"
                            style={{ padding: '8px 24px', fontSize: 12.5, fontWeight: 700, background: '#1d4ed8', color: '#fff' }}
                            disabled={uploading[`sub-${s.id}`]}
                            onClick={async () => {
                               setUploading(u => ({ ...u, [`sub-${s.id}`]: true }));
                               try {
                                 // 1. Force state synchronization via apply endpoint
                                 // This marks the scheme as 'applied' in user_scheme_matches
                                 const docIds = getRequiredDocs(s)
                                   .map(d => uploads[`${s.id}-${d}`]?.id)
                                   .filter(Boolean);
                                 await API.post(`/api/schemes/${s.id}/apply`, { document_ids: docIds });
                                 
                                 // 2. Submit the first milestone specifically
                                 // This triggers the admin verification workflow
                                 const { data: freshMs } = await API.get(`/api/milestones/scheme/${s.id}`);
                                 const firstMs = freshMs?.[0];
                                 if (firstMs?.progress?.id && firstMs.progress.status !== 'completed' && firstMs.progress.status !== 'applied') {
                                   await API.post(`/api/milestones/${firstMs.progress.id}/submit`, {});
                                 }
                                 
                                 // 3. Final reload to toggle UI to milestones view
                                 load();
                               } catch (e) {
                                 alert('Submission failed: ' + (e.response?.data?.error || e.message));
                               } finally {
                                 setUploading(u => ({ ...u, [`sub-${s.id}`]: false }));
                               }
                             }}
                          >
                            {uploading[`sub-${s.id}`] ? '⏳ Submitting...' : '🚀 Submit Application'}
                          </button>
                        );
                      } else {
                        return (
                          <div style={{ 
                            padding: '10px', background: 'var(--gy-l)', borderRadius: 8, 
                            fontSize: 11.5, color: 'var(--t3)', textAlign: 'center', fontWeight: 600, width: 'fit-content'
                          }}>
                            📎 Upload all documents to enable Submit
                          </div>
                        );
                      }
                    })()}
                  </div>

                  {/* Milestone Progress — Only show after submission */}
                  {milestones.length > 0 && milestones.some(m => m.progress?.status === 'applied' || m.progress?.status === 'completed') && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nv)', marginBottom: 10 }}>
                        Application Tracking & Milestones
                      </div>
                      <div className="timeline-modern">
                        {milestones.map((m) => {
                          const prog = m.progress || {};
                          const mStatus = prog.status || 'not_started';
                          if (mStatus === 'not_started') return null;
                          const cfg = MS_STATUS[mStatus] || MS_STATUS.not_started;
                          const isFlash = liveFlash[m.id];
                          
                          const statusClass = mStatus === 'completed' ? 'completed' : mStatus === 'error' ? 'error' : mStatus === 'applied' || mStatus === 'pending' ? 'active' : '';

                          return (
                            <div key={m.id} className={`timeline-modern-item ${statusClass}`}>
                              <div className="timeline-modern-line"></div>
                              <div className="timeline-modern-dot">
                                {mStatus === 'completed' ? '✓' : mStatus === 'locked' ? '🔒' : m.step_number}
                              </div>
                              <div className="timeline-modern-content" style={{ transition: 'background .5s', background: isFlash ? '#DCFCE7' : undefined }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Step {m.step_number}: {m.title}</div>
                                    {m.description && <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{m.description}</div>}
                                  </div>
                                  <span className={`status-badge-modern ${mStatus === 'completed' ? 'completed' : mStatus === 'error' ? 'error' : mStatus === 'applied' || mStatus === 'pending' ? 'pending' : 'locked'}`}>
                                    {cfg.label}
                                  </span>
                                </div>
                                
                                {m.amount > 0 && (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: mStatus === 'completed' ? '#DCFCE7' : '#F1F5F9', padding: '4px 10px', borderRadius: 8, marginTop: 8 }}>
                                    <span style={{ fontSize: 14 }}>💰</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: mStatus === 'completed' ? '#16A34A' : '#475569' }}>
                                      {mStatus === 'completed' ? 'Disbursed' : 'Amount'}: ₹{Number(m.amount).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                )}
                                
                                {prog.completed_at && (
                                  <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span>✓</span> Completed on {new Date(prog.completed_at).toLocaleDateString('en-IN')}
                                  </div>
                                )}
                                
                                {prog.admin_notes && (
                                  <div style={{ fontSize: 12, color: '#DC2626', marginTop: 12, background: '#FEE2E2', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid #DC2626' }}>
                                    <strong>Admin Note:</strong> {prog.admin_notes}
                                  </div>
                                )}
                                
                                {mStatus === 'locked' && (
                                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>🔒</span> Complete previous steps to unlock this milestone
                                  </div>
                                )}
                                
                                {mStatus === 'error' && prog.id && (
                                  prog.error_count >= 3 ? (
                                    <div style={{ marginTop: 16, padding: 16, background: '#FEE2E2', borderRadius: 10, textAlign: 'center', border: '1px solid #FCA5A5' }}>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 12 }}>
                                        Rejected 3 times. Please contact support.
                                      </div>
                                      <button className="btn-apply-modern" style={{ background: '#DC2626', boxShadow: 'none' }}>Contact Support 📞</button>
                                    </div>
                                  ) : (
                                    <div style={{ marginTop: 16, background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px dashed #FCA5A5' }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Upload corrected document:</div>
                                      <input 
                                        type="file" 
                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                        style={{ display: 'block', width: '100%', fontSize: 12, marginBottom: 12, padding: 8, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6 }}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) uploadDoc(s.id, prog.id, file, m.title);
                                        }} 
                                      />
                                      <button
                                        className="btn-apply-modern"
                                        style={{ width: '100%', padding: '10px 0', fontSize: 13 }}
                                        disabled={uploading[prog.id]}
                                        onClick={() => submitMilestone(prog.id)}
                                      >
                                        {uploading[prog.id] ? 'Submitting...' : '🚀 Re-submit Corrected Milestone'}
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        });
      })()}

      {/* WITHDRAW MODAL */}
      {withdrawOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, animation: 'nv-fadein .2s ease'
        }}>
          <div style={{
            background: 'var(--wh)', padding: '24px', borderRadius: 12, 
            width: '90%', maxWidth: 400, boxShadow: 'var(--sh-l)'
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--rd)' }}>⚠️ Withdraw Application?</h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--t2)', lineHeight: 1.4 }}>
              Are you sure you want to withdraw from <strong>{withdrawOpen.name}</strong>? This will permanently cancel your application and remove milestone tracking.
            </p>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--rd)' }}>
                Type <strong style={{ fontFamily: 'monospace', background: '#fEE2E2', padding: '2px 4px', borderRadius: 4 }}>WITHDRAW</strong> to confirm
              </label>
              <input 
                className="form-input" 
                placeholder="WITHDRAW" 
                value={withdrawText} 
                onChange={e => setWithdrawText(e.target.value)}
                style={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: 14 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button 
                className="btn b-gh" 
                style={{ flex: 1 }} 
                onClick={() => { setWithdrawOpen(null); setWithdrawText(''); }}
              >
                Cancel
              </button>
              <button 
                className={`btn ${withdrawText === 'WITHDRAW' ? 'b-rd' : 'b-gy'}`} 
                style={{ flex: 1, 
                  cursor: withdrawText === 'WITHDRAW' ? 'pointer' : 'not-allowed', 
                  opacity: withdrawText === 'WITHDRAW' ? 1 : 0.6 
                }} 
                disabled={withdrawText !== 'WITHDRAW' || uploading[`withdraw-${withdrawOpen.id}`]}
                onClick={() => handleWithdraw(withdrawOpen.id)}
              >
                {uploading[`withdraw-${withdrawOpen.id}`] ? '⏳ Processing...' : '🚨 Confirm Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}