/**
 * DocumentLocker.jsx — Personal secure file cabinet
 * Place: client/src/pages/DocumentLocker.jsx
 *
 * FLOW: Upload once → instantly available → auto-attach to any scheme application
 * No admin approval needed. Admin can only flag suspicious docs.
 */
import { useState, useEffect, useRef } from 'react';
import API from '../api/api.js';
import { subscribeToDocuments, uploadDocument } from '../services/realtime.js';

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

    const token = localStorage.getItem('token');
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
      await API.delete(`/api/documents/${doc.id}`);
      setDocs(d => d.filter(x => x.id !== doc.id));
      toast(`${doc.doc_name} removed from locker.`, 'info');
    } catch (e) { toast('Delete failed: ' + e.message, 'error'); }
  };

  // Best doc per type (prefer available over flagged)
  const docMap = {};
  docs.forEach(d => {
    const ex = docMap[d.doc_type];
    if (!ex || d.status === 'available') docMap[d.doc_type] = d;
  });

  const available = docs.filter(d => d.status === 'available').length;
  const flagged = docs.filter(d => d.status === 'flagged').length;

  return (
    <div className="page on">
      <Toast toasts={toasts} />
      <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      <input ref={fileRef} type="file"
        accept=".jpg,.jpeg,.png,.pdf,.webp,.heic,.heif,.doc,.docx"
        style={{ display: 'none' }} onChange={handleFileChange} />

      <div className="bc">Dashboard › <span>Document Locker</span></div>
      <div className="ph">
        <h1>🔐 Document Locker</h1>
        <p>Upload once · Use in any scheme application instantly · AES-256-GCM encrypted</p>
      </div>

      {/* How it works banner */}
      <div style={{
        background: 'var(--nv-l)', border: '.5px solid var(--nv-m)',
        borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 14,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--nv)', fontSize: 12.5, marginBottom: 4 }}>
            How Document Locker works
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              '1️⃣  Upload your documents here once (Aadhaar, Voter ID, Passbook, etc.)',
              '2️⃣  Documents are encrypted and stored securely in your private locker',
              '3️⃣  When you apply for a scheme, documents auto-attach — no re-uploading',
              '4️⃣  View or delete your documents anytime from here',
            ].map((s, i) => (
              <div key={i} style={{ fontSize: 11.5, color: 'var(--t2)' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="sr" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
        <div className="sc c-gn">
          <div className="sl">Available</div>
          <div className="sv">{available}</div>
          <div className="ss">Ready to use</div>
        </div>
        <div className="sc c-nv">
          <div className="sl">Encrypted</div>
          <div className="sv">{docs.length}</div>
          <div className="ss">Total files</div>
        </div>
        <div className="sc c-sf">
          <div className="sl">Required</div>
          <div className="sv">{DOC_TYPES.filter(d => d.required && !docMap[d.type]).length}</div>
          <div className="ss">Still missing</div>
        </div>
      </div>

      {/* Flagged warning */}
      {flagged > 0 && (
        <div style={{
          background: 'var(--am-l)', border: '.5px solid var(--am)', borderRadius: 'var(--r)',
          padding: '11px 14px', marginBottom: 14, fontSize: 12, color: 'var(--am)',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠️</span>
          {flagged} document{flagged > 1 ? 's' : ''} flagged by admin — please re-upload a clearer copy
        </div>
      )}

      <div style={{
        background: 'var(--gn-l)', border: '.5px solid var(--gn)', borderRadius: 'var(--rs)',
        padding: '8px 14px', marginBottom: 14, fontSize: 11.5,
        color: 'var(--gn)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        ⚡ Documents marked ✅ Available are automatically attached to scheme applications
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          Loading your locker...
        </div>
      ) : (
        <div className="doc-grid">
          {DOC_TYPES.map(dt => {
            const doc = docMap[dt.type];
            const sc = doc ? (STATUS_CONFIG[doc.status] || STATUS_CONFIG.available) : null;
            const isFlash = doc && liveFlash[doc.id];
            const isUploading = uploading[dt.type];

            return (
              <div key={dt.type}
                className={`doc-card${sc?.cardClass || ''}`}
                style={{
                  border: isFlash ? '2px solid var(--gn)' : undefined,
                  boxShadow: isFlash ? '0 0 0 4px var(--gn-l)' : undefined,
                  transition: 'all .3s', position: 'relative',
                }}
              >
                {/* Lock icon */}
                {doc && (
                  <div style={{ position: 'absolute', top: 7, left: 7, fontSize: 9, opacity: .4 }}>🔒</div>
                )}

                {/* Status badge */}
                {doc ? (
                  <span className="doc-status" style={{
                    background: isFlash ? 'var(--gn-l)' : sc?.bg,
                    color: isFlash ? 'var(--gn)' : sc?.color,
                    position: 'absolute', top: 7, right: 7,
                    fontSize: '9.5px', padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                    border: `1px solid ${isFlash ? 'var(--gn)' : sc?.color}40`,
                  }}>
                    {isFlash ? '🟢 Saved!' : `${sc?.icon} ${sc?.label}`}
                  </span>
                ) : dt.required ? (
                  <span className="doc-status" style={{
                    background: 'var(--rd-l)', color: 'var(--rd)',
                    position: 'absolute', top: 7, right: 7,
                    fontSize: '9.5px', padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                  }}>Required</span>
                ) : null}

                <div className="doc-ic">{dt.icon}</div>
                <div className="doc-name">{dt.label}</div>

                {doc ? (
                  <div style={{ fontSize: '9.5px', color: 'var(--t3)', marginTop: 3, textAlign: 'center' }}>
                    {doc.doc_name}
                    {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)}KB` : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: '9.5px', color: 'var(--t3)', marginTop: 3, textAlign: 'center' }}>
                    {dt.hint}
                  </div>
                )}

                {isUploading && (
                  <div style={{ marginTop: 8, height: 3, borderRadius: 3, background: 'var(--gy-l)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: 'var(--nv)', borderRadius: 3,
                      animation: 'docProgress 1.5s infinite ease-in-out'
                    }}></div>
                  </div>
                )}

                <div style={{ marginTop: 10, display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!doc && (
                    <button className="btn b-nv b-sm" onClick={() => triggerUpload(dt.type)} disabled={isUploading}>
                      {isUploading ? '⏳' : '+ Upload'}
                    </button>
                  )}
                  {doc && (
                    <>
                      <button className="btn b-gh b-sm" onClick={() => setPreviewDoc(doc)}>👁 View</button>
                      <button className="btn b-am b-sm" onClick={() => triggerUpload(dt.type)} disabled={isUploading}>
                        🔄 Replace
                      </button>
                      <button className="btn b-rd b-sm" onClick={() => deleteDoc(doc)}>🗑</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add custom */}
          <div className="doc-card doc-add" onClick={() => triggerUpload('custom')} style={{ cursor: 'pointer' }}>
            <div className="doc-ic" style={{ color: 'var(--t3)' }}>➕</div>
            <div className="doc-name" style={{ color: 'var(--t3)' }}>Add More</div>
            <div className="doc-meta">Any govt document</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes docProgress  { 0%{width:0%;margin-left:0} 50%{width:60%;margin-left:20%} 100%{width:0%;margin-left:100%} }
      `}</style>
    </div>
  );
}