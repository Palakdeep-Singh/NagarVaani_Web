/**
 * DocumentLocker.jsx — Personal secure file cabinet
 * Place: client/src/pages/DocumentLocker.jsx
 *
 * FLOW: Upload once → instantly available → auto-attach to any scheme application
 * No admin approval needed. Admin can only flag suspicious docs.
 */
import { useState, useEffect, useRef } from 'react';
import { API, subscribeToNotifications as subscribeToDocuments, subscribeToNotifications as uploadDocument } from './mockHelpers';

const DOC_TYPES = [
  { type: 'aadhaar', label: 'Aadhaar Card', icon: '🪪', required: true, hint: 'Front side, clear photo' },
  { type: 'voter_id', label: 'Voter ID (EPIC)', icon: '🗳', required: true, hint: 'Both sides if applicable' },
  { type: 'passbook', label: 'Bank Passbook', icon: '🏦', required: true, hint: 'First page with account details' },
  { type: 'photo', label: 'Passport Photo', icon: '📷', required: true, hint: 'Recent photo, white background' },
  { type: 'land_record', label: 'Land Record (7-12)', icon: '📜', required: false, hint: 'For agriculture schemes' },
  { type: 'ration_card', label: 'Ration Card', icon: '🏠', required: false, hint: 'All pages' },
  { type: 'income_cert', label: 'Income Certificate', icon: '📋', required: false, hint: 'Issued by Tahsildar' },
  { type: 'caste_cert', label: 'Caste Certificate', icon: '📋', required: false, hint: 'For SC/ST/OBC schemes' },
  { type: 'birth_cert', label: 'Birth Certificate', icon: '📋', required: false, hint: 'For age-based schemes' },
  { type: 'disability', label: 'Disability Certificate', icon: '♿', required: false, hint: 'From Govt Hospital, 40%+' },
  { type: 'custom', label: 'Other Document', icon: '📄', required: false, hint: 'Any other govt document' },
];

const STATUS_CONFIG = {
  available: { color: 'var(--gn)', bg: 'var(--gn-l)', label: 'Available ✓', icon: '✅', cardClass: ' verified' },
  flagged: { color: 'var(--am)', bg: 'var(--am-l)', label: 'Flagged', icon: '⚠️', cardClass: '' },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 18, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'success' ? 'var(--gn)' : t.type === 'error' ? 'var(--rd)' : 'var(--nv)',
          color: '#fff', borderRadius: 'var(--r)', padding: '11px 16px',
          fontSize: 12.5, fontWeight: 600, boxShadow: 'var(--sh2)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideInRight .25s ease',
        }}>
          {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'} {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ doc, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doc?.id) return;
    setLoading(true); setError(null); setBlobUrl(null);

    const token = localStorage.getItem('nc_token');
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

    fetch(`${API_URL}/api/documents/view/${doc.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.blob(); })
      .then(b => setBlobUrl(URL.createObjectURL(b)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));

    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [doc?.id]);

  if (!doc) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}
      onClick={onClose}>
      <div style={{
        background: 'var(--wh)', borderRadius: 'var(--rl)', overflow: 'hidden',
        maxWidth: 720, maxHeight: '92vh', width: '100%', display: 'flex', flexDirection: 'column'
      }}
        onClick={e => e.stopPropagation()}>

        <div style={{
          padding: '12px 16px', background: 'var(--nv)', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{doc.doc_name}</div>
            <div style={{ fontSize: 10, opacity: .65 }}>
              🔒 AES-256-GCM encrypted · {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : ''}
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        <div style={{
          flex: 1, overflow: 'auto', padding: 16, textAlign: 'center', background: '#f8f9fa',
          display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240
        }}>
          {loading && <div style={{ color: 'var(--t3)' }}><div style={{ fontSize: 40, marginBottom: 8 }}>🔓</div><div style={{ fontSize: 13, fontWeight: 600 }}>Decrypting...</div></div>}
          {error && <div style={{ color: 'var(--rd)' }}><div style={{ fontSize: 36, marginBottom: 8 }}>❌</div><div>{error}</div></div>}
          {blobUrl && !loading && (
            doc.mime_type?.startsWith('image') ? (
              <img src={blobUrl} alt={doc.doc_name}
                style={{ maxWidth: '100%', maxHeight: '68vh', borderRadius: 8, objectFit: 'contain', boxShadow: 'var(--sh)' }} />
            ) : doc.mime_type === 'application/pdf' ? (
              <object data={blobUrl} type="application/pdf"
                style={{ width: '100%', height: '68vh', border: 'none', borderRadius: 8 }}>
                <a href={blobUrl} download={doc.doc_name} className="btn b-nv">⬇ Download PDF</a>
              </object>
            ) : (
              <div style={{ padding: 48 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{doc.doc_name}</div>
                <a href={blobUrl} download={doc.doc_name} className="btn b-nv">⬇ Download</a>
              </div>
            )
          )}
        </div>

        {blobUrl && (
          <div style={{
            padding: '10px 16px', borderTop: '.5px solid var(--gy-l)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>🔒 Decrypted in memory only</span>
            <a href={blobUrl} download={doc.doc_name} className="btn b-gh b-sm">⬇ Download</a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DocumentLocker({ user }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [liveFlash, setLiveFlash] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileRef = useRef(null);

  const toast = (message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  };

  const load = async () => {
    try {
      const { data } = await API.get('/api/documents/my');
      setDocs(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (!user?.id) return;
    const unsub = subscribeToDocuments(user.id, (payload) => {
      const id = payload.new?.id || payload.old?.id;
      if (id) {
        setLiveFlash(f => ({ ...f, [id]: true }));
        setTimeout(() => setLiveFlash(f => ({ ...f, [id]: false })), 3000);
      }
      if (payload.eventType === 'UPDATE') {
        setDocs(d => d.map(doc => doc.id === payload.new.id ? { ...doc, ...payload.new } : doc));
        if (payload.new?.status === 'flagged')
          toast(`⚠️ ${payload.new.doc_name} was flagged — please re-upload a clearer copy`, 'error');
      } else if (payload.eventType === 'INSERT') {
        setDocs(d => d.find(x => x.id === payload.new.id) ? d : [payload.new, ...d]);
      } else if (payload.eventType === 'DELETE') {
        setDocs(d => d.filter(x => x.id !== payload.old?.id));
      }
    });
    return unsub;
  }, [user?.id]);

  const triggerUpload = (docType) => {
    setSelectedType(docType);
    setTimeout(() => fileRef.current?.click(), 50);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;
    e.target.value = '';
    if (file.size > 20 * 1024 * 1024) { toast('File too large. Max 20 MB.', 'error'); return; }

    setUploading(u => ({ ...u, [selectedType]: true }));
    try {
      const result = await uploadDocument(user.id, file, selectedType);
      if (result.db_error) toast(`Saved but DB error: ${result.db_error}`, 'info');
      else toast(`${file.name} saved to locker! Ready to use in scheme applications.`, 'success');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(u => ({ ...u, [selectedType]: false }));
      setSelectedType(null);
    }
  };

  const deleteDoc = async (doc) => {
    if (!window.confirm(`Delete "${doc.doc_name}" from your locker?`)) return;
    try {
      // Find all copies of this doc_type to prevent "ghost" documents reappearing from duplicates
      const duplicates = docs.filter(d => d.doc_type === doc.doc_type);
      await Promise.all(duplicates.map(d => API.delete(`/api/documents/${d.id}`)));
      setDocs(d => d.filter(x => x.doc_type !== doc.doc_type));
      toast(`${doc.doc_name} removed from locker.`, 'info');
    } catch (e) { toast('Delete failed: ' + e.message, 'error'); }
  };

  const ALIAS_MAP = {
    'aadhaar': ['aadhaar card', 'aadhaar'],
    'voter_id': ['voter id', 'voter id (epic)', 'identity proof'],
    'passbook': ['bank passbook', 'passbook'],
    'photo': ['passport photo', 'photo'],
    'land_record': ['land records / khatauni', 'land ownership proof', 'land records (7/12)', 'land record'],
    'ration_card': ['ration card', 'ration card / bpl card', 'bpl card', 'bpl certificate'],
    'income_cert': ['income certificate'],
    'caste_cert': ['caste certificate'],
    'birth_cert': ['birth certificate', 'age proof', 'age proof (birth certificate)'],
    'disability': ['disability certificate'],
  };

  // Best doc per type (prefer available over flagged)
  const docMap = {};
  docs.forEach(d => {
    let resolvedType = d.doc_type;
    const lowerType = (d.doc_type || d.doc_name || '').toLowerCase();
    
    // Attempt alias map resolution to map scheme naming convention back to locker card type
    for (const [key, aliases] of Object.entries(ALIAS_MAP)) {
      if (aliases.some(alias => lowerType.includes(alias))) {
        resolvedType = key;
        break;
      }
    }
    
    // Always fallback to custom if it's not a core type so it renders correctly
    if (!DOC_TYPES.find(dt => dt.type === resolvedType)) {
      resolvedType = 'custom_' + d.id;
    }

    const ex = docMap[resolvedType];
    if (!ex || d.status === 'available') docMap[resolvedType] = d;
  });

  const uniqueDocs = Object.values(docMap);
  const available = uniqueDocs.filter(d => d.status === 'available').length;
  const flagged = uniqueDocs.filter(d => d.status === 'flagged').length;

  return (
    <div className="page on" style={{ animation: 'nv-fadein 0.4s ease-out' }}>
      <Toast toasts={toasts} />
      <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      <input ref={fileRef} type="file"
        accept=".jpg,.jpeg,.png,.pdf,.webp,.heic,.heif,.doc,.docx"
        style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ── PREMIUM HERO SECTION ── */}
      <div className="hero-modern-saas" style={{ marginBottom: 32 }}>
        <div className="hero-saas-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <span>●</span> Bank-Grade Security
          </div>
          
          <h1 className="hero-saas-title">
            🛡️ Digital Vault
          </h1>
          <p className="hero-saas-desc" style={{ maxWidth: 540 }}>
            Store, verify, and securely reuse your documents across all government services. Upload once, verify once, use everywhere.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { text: 'Government Verified', icon: '✓', color: '#10B981' },
              { text: 'AES-256 Encrypted', icon: '🔒', color: '#F59E0B' },
              { text: 'Auto-Attach Enabled', icon: '⚡', color: '#3B82F6' },
              { text: 'Lifetime Secure Storage', icon: '♾️', color: '#8B5CF6' }
            ].map((badge, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', padding: '8px 16px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13, fontWeight: 700, color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ color: badge.color }}>{badge.icon}</span> {badge.text}
              </div>
            ))}
          </div>
        </div>
        
        {/* Large floating lock visual */}
        <div className="hero-saas-visual">
          <div style={{ fontSize: 120, opacity: 0.9, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))', transform: 'rotate(10deg)' }}>
            🔏
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS SECTION ── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 20 }}>How Document Locker Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, position: 'relative' }}>
          {/* Connecting line */}
          <div style={{ position: 'absolute', top: 32, left: '12%', right: '12%', height: 2, background: 'linear-gradient(90deg, #E2E8F0 0%, #2563EB 50%, #10B981 100%)', zIndex: 0, opacity: 0.5 }}></div>
          
          {[
            { step: '1️⃣', title: 'Upload Documents', desc: 'Aadhaar, PAN, Voter ID, Certificates & more.', color: '#F59E0B' },
            { step: '2️⃣', title: 'Verification', desc: 'Documents are securely validated.', color: '#3B82F6' },
            { step: '3️⃣', title: 'Secure Vault', desc: 'Verified documents are encrypted & stored.', color: '#8B5CF6' },
            { step: '4️⃣', title: 'Auto-Attach', desc: 'Documents attach to future applications.', color: '#10B981' }
          ].map((item, i) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderTop: `6px solid ${item.color}`, borderRadius: 20, padding: 24, position: 'relative', zIndex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F8FAFC', border: '4px solid #FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px auto', position: 'relative' }}>
                {item.step}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { title: 'Available Documents', value: uniqueDocs.length, icon: '📄', bg: '#EFF6FF', color: '#1E3A8A', borderLeftColor: '#3B82F6' },
          { title: 'Verified Documents', value: available, icon: '✅', bg: '#F0FDF4', color: '#14532D', borderLeftColor: '#10B981' },
          { title: 'Missing Documents', value: DOC_TYPES.filter(d => d.required && !docMap[d.type]).length, icon: '⚠️', bg: '#FFF7ED', color: '#9A3412', borderLeftColor: '#F59E0B' },
          { title: 'Security Status', value: 'Encrypted', icon: '🔐', bg: '#FAF5FF', color: '#581C87', borderLeftColor: '#8B5CF6' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: stat.bg, borderRadius: 16, padding: 16, borderLeft: `6px solid ${stat.borderLeftColor}`,
            display: 'flex', flexDirection: 'column', gap: 8,
            transition: 'transform 0.2s ease', cursor: 'default'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: stat.color, opacity: 0.8 }}>{stat.title}</div>
              <div style={{ fontSize: 20 }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Flagged warning */}
      {flagged > 0 && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #F87171', borderRadius: 16,
          padding: '16px 20px', marginBottom: 24, fontSize: 14, color: '#991B1B',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          {flagged} document{flagged > 1 ? 's' : ''} flagged by admin — please re-upload a clearer copy to ensure scheme eligibility.
        </div>
      )}

      {/* ── DOCUMENT GRID ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 48, marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Your Documents</h2>
        <button onClick={() => triggerUpload('custom')} style={{
          background: '#FFFFFF', color: '#000000', border: '1px solid #000000', borderRadius: 12,
          padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          ➕ Upload New Document
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <div style={{ fontSize: 40, marginBottom: 16, animation: 'pulse 2s infinite' }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Unlocking Vault...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, paddingBottom: 40 }}>
          {DOC_TYPES.map(dt => {
            const doc = docMap[dt.type];
            const isUploading = uploading[dt.type];
            
            // Determine card style based on state
            let bg, border, badgeBg, badgeColor, badgeText, badgeIcon, watermark;
            if (doc && doc.status === 'available') {
              bg = 'linear-gradient(145deg, #F0FDF4, #DCFCE7)';
              border = '#BBF7D0'; badgeBg = '#22C55E'; badgeColor = '#FFFFFF';
              badgeText = 'Verified & Ready'; badgeIcon = '✅'; watermark = '✓';
            } else if (doc && doc.status === 'flagged') {
              bg = 'linear-gradient(145deg, #FEF2F2, #FEE2E2)';
              border = '#FECACA'; badgeBg = '#EF4444'; badgeColor = '#FFFFFF';
              badgeText = 'Flagged Issue'; badgeIcon = '⚠️'; watermark = '!';
            } else if (dt.required) {
              bg = 'linear-gradient(145deg, #FFFBEB, #FEF3C7)';
              border = '#FDE68A'; badgeBg = '#F59E0B'; badgeColor = '#FFFFFF';
              badgeText = 'Required'; badgeIcon = '⚠'; watermark = '?';
            } else {
              bg = 'linear-gradient(145deg, #F8FAFC, #F1F5F9)';
              border = '#E2E8F0'; badgeBg = '#94A3B8'; badgeColor = '#FFFFFF';
              badgeText = 'Optional'; badgeIcon = 'ℹ️'; watermark = '+';
            }

            return (
              <div key={dt.type} style={{
                background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: 20,
                position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)',
                display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'default'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                
                {/* Watermark */}
                <div style={{ position: 'absolute', right: -10, bottom: -20, fontSize: 120, fontWeight: 900, color: border, opacity: 0.3, zIndex: 0, pointerEvents: 'none', lineHeight: 1 }}>
                  {watermark}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      {dt.icon}
                    </div>
                    <div style={{ background: badgeBg, color: badgeColor, padding: '4px 8px', borderRadius: 100, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {badgeIcon} {badgeText}
                    </div>
                  </div>

                  {/* Title & Meta */}
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>{dt.label}</h3>
                  {doc ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                      <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{doc.doc_name}</div>
                      <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                        <span>•</span>
                        <span>Auto-Attach ⚡</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                      <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>{dt.hint}</div>
                      {dt.required && <div style={{ fontSize: 11, color: '#B45309', fontWeight: 700 }}>Needed for eligibility unlocking</div>}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div style={{ marginBottom: 12, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.5)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#2563EB', borderRadius: 3, animation: 'docProgress 1.5s infinite ease-in-out' }}></div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                    {!doc ? (
                      <button onClick={() => triggerUpload(dt.type)} disabled={isUploading} style={{
                        flex: 1, padding: '10px', background: '#FFFFFF',
                        color: '#000000', border: '1px solid #000000',
                        borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}>
                        {isUploading ? '⏳ Uploading...' : 'Upload Document'}
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setPreviewDoc(doc)} style={{ flex: 1, padding: '8px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>👁 View</button>
                        <button onClick={() => triggerUpload(dt.type)} disabled={isUploading} style={{ flex: 1, padding: '8px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🔄 Replace</button>
                        <button onClick={() => deleteDoc(doc)} style={{ width: 36, padding: '8px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Render custom documents uploaded from Active Schemes */}
          {Object.keys(docMap).filter(key => key.startsWith('custom_')).map(key => {
            const doc = docMap[key];
            const sc = STATUS_CONFIG[doc.status] || STATUS_CONFIG.available;
            
            return (
              <div key={key} style={{
                background: 'linear-gradient(145deg, #F8FAFC, #F1F5F9)', border: '1px solid #E2E8F0',
                borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column',
                transition: 'transform 0.2s', cursor: 'default'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ position: 'absolute', right: -10, bottom: -20, fontSize: 120, fontWeight: 900, color: '#E2E8F0', opacity: 0.3, zIndex: 0, pointerEvents: 'none', lineHeight: 1 }}>+</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>📄</div>
                    <div style={{ background: '#94A3B8', color: '#FFFFFF', padding: '4px 8px', borderRadius: 100, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{sc.icon} {sc.label}</div>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', textTransform: 'capitalize' }}>{doc.doc_type === 'custom' ? doc.doc_name : doc.doc_type}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{doc.doc_name}</div>
                    <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                    <button onClick={() => setPreviewDoc(doc)} style={{ flex: 1, padding: '8px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>👁 View</button>
                    <button onClick={() => deleteDoc(doc)} style={{ width: 36, padding: '8px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes docProgress  { 0%{width:0%;margin-left:0} 50%{width:60%;margin-left:20%} 100%{width:0%;margin-left:100%} }
        @keyframes pulse        { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } }
      `}</style>
    </div>
  );
}