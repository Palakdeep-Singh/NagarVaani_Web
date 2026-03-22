/**
 * DocumentLocker.jsx
 * Place: client/src/pages/DocumentLocker.jsx
 */
import { useState, useEffect, useRef } from 'react';
import API from '../api/api.js';
import { subscribeToDocuments, uploadDocument } from '../services/realtime.js';

const DOC_TYPES = [
  { type: 'aadhaar', label: 'Aadhaar Card', icon: '🪪', required: true },
  { type: 'voter_id', label: 'Voter ID Card', icon: '🗳', required: true },
  { type: 'passbook', label: 'Bank Passbook', icon: '🏦', required: true },
  { type: 'land_record', label: 'Land Record (7-12)', icon: '📜', required: false },
  { type: 'photo', label: 'Passport Photo', icon: '📷', required: true },
  { type: 'ration_card', label: 'Ration Card', icon: '🏠', required: false },
  { type: 'income_cert', label: 'Income Certificate', icon: '📋', required: false },
  { type: 'caste_cert', label: 'Caste Certificate', icon: '📋', required: false },
  { type: 'birth_cert', label: 'Birth Certificate', icon: '📋', required: false },
  { type: 'custom', label: 'Other Document', icon: '📄', required: false },
];

const STATUS_CONFIG = {
  pending: { color: 'var(--am)', bg: 'var(--am-l)', label: 'Pending Verification', icon: '⏳', cardClass: ' pending' },
  verified: { color: 'var(--gn)', bg: 'var(--gn-l)', label: 'Verified ✓', icon: '✅', cardClass: ' verified' },
  rejected: { color: 'var(--rd)', bg: 'var(--rd-l)', label: 'Rejected — Re-upload', icon: '❌', cardClass: '' },
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

// ── Preview Modal — fetches blob, no iframe to localhost ──────────────────────
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
      .then(res => {
        if (!res.ok) throw new Error(`Could not load file (${res.status})`);
        return res.blob();
      })
      .then(blob => setBlobUrl(URL.createObjectURL(blob)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));

    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [doc?.id]);

  if (!doc) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--wh)', borderRadius: 'var(--rl)', overflow: 'hidden',
        maxWidth: 720, maxHeight: '92vh', width: '100%', display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '12px 16px', background: 'var(--nv)', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{doc.doc_name}</div>
            <div style={{ fontSize: 10, opacity: .65 }}>
              🔒 AES-256-GCM encrypted · Decrypted only for viewing
              {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)} KB` : ''}
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflow: 'auto', padding: 16, textAlign: 'center',
          background: '#f8f9fa', display: 'flex', alignItems: 'center',
          justifyContent: 'center', minHeight: 240,
        }}>
          {loading && (
            <div style={{ color: 'var(--t3)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔓</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nv)' }}>Decrypting file...</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Fetching encrypted bytes and decrypting</div>
            </div>
          )}
          {error && (
            <div style={{ color: 'var(--rd)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>❌</div>
              <div style={{ fontWeight: 600 }}>{error}</div>
            </div>
          )}
          {blobUrl && !loading && (
            doc.mime_type?.startsWith('image') ? (
              <img src={blobUrl} alt={doc.doc_name}
                style={{
                  maxWidth: '100%', maxHeight: '68vh', borderRadius: 8,
                  objectFit: 'contain', boxShadow: 'var(--sh)'
                }} />
            ) : doc.mime_type === 'application/pdf' ? (
              <object data={blobUrl} type="application/pdf"
                style={{ width: '100%', height: '68vh', border: 'none', borderRadius: 8 }}>
                <div style={{ padding: 32, color: 'var(--t3)' }}>
                  <div style={{ marginBottom: 12 }}>PDF preview not available in this browser.</div>
                  <a href={blobUrl} download={doc.doc_name} className="btn b-nv">⬇ Download PDF</a>
                </div>
              </object>
            ) : (
              <div style={{ padding: 48 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--tx)' }}>{doc.doc_name}</div>
                <a href={blobUrl} download={doc.doc_name} className="btn b-nv">⬇ Download File</a>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {blobUrl && (
          <div style={{
            padding: '10px 16px', borderTop: '.5px solid var(--gy-l)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>
              🔒 Decrypted in memory only · Not stored in browser cache
            </span>
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
        setTimeout(() => setLiveFlash(f => ({ ...f, [id]: false })), 4000);
      }
      if (payload.eventType === 'UPDATE') {
        setDocs(d => d.map(doc => doc.id === payload.new.id ? { ...doc, ...payload.new } : doc));
        if (payload.new?.status === 'verified')
          toast(`✅ ${payload.new.doc_name || 'Document'} verified by District Admin!`, 'success');
        else if (payload.new?.status === 'rejected')
          toast(`❌ ${payload.new.doc_name || 'Document'} rejected. Please re-upload.`, 'error');
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
      if (result.db_error) toast(`File saved, metadata error: ${result.db_error}`, 'info');
      else toast(`${file.name} encrypted & uploaded! Pending admin verification.`, 'success');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(u => ({ ...u, [selectedType]: false }));
      setSelectedType(null);
    }
  };

  const deleteDoc = async (doc) => {
    if (!window.confirm(`Delete "${doc.doc_name}"?`)) return;
    try {
      await API.delete(`/api/documents/${doc.id}`);
      setDocs(d => d.filter(x => x.id !== doc.id));
      toast(`${doc.doc_name} deleted.`, 'info');
    } catch (e) { toast('Delete failed: ' + e.message, 'error'); }
  };

  const docMap = {};
  docs.forEach(d => {
    const ex = docMap[d.doc_type];
    if (!ex || d.status === 'verified' || (d.status === 'pending' && ex.status === 'rejected'))
      docMap[d.doc_type] = d;
  });

  const verified = docs.filter(d => d.status === 'verified').length;
  const pending = docs.filter(d => d.status === 'pending').length;
  const rejected = docs.filter(d => d.status === 'rejected').length;

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
        <p>AES-256-GCM encrypted storage · Real-time verification · 1-click scheme attachment</p>
      </div>

      {/* Encryption notice */}
      <div style={{
        background: 'var(--nv-l)', border: '.5px solid var(--nv-m)',
        borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
      }}>
        <span style={{ fontSize: 20 }}>🔒</span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--nv)' }}>End-to-End File Encryption Active</div>
          <div style={{ color: 'var(--t3)', fontSize: 11, marginTop: 2 }}>
            Files encrypted with AES-256-GCM before upload. Supabase Storage only sees unreadable binary.
            Decryption happens only on our server when you view.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="sr" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
        <div className="sc c-gn"><div className="sl">Verified</div><div className="sv">{verified}</div><div className="ss">Ready to attach</div></div>
        <div className="sc c-am"><div className="sl">Pending</div><div className="sv">{pending}</div><div className="ss">Under review</div></div>
        <div className="sc c-nv"><div className="sl">Encrypted</div><div className="sv">{docs.length}</div><div className="ss">Total files</div></div>
      </div>

      {rejected > 0 && (
        <div style={{
          background: 'var(--rd-l)', border: '.5px solid var(--rd)', borderRadius: 'var(--r)',
          padding: '11px 14px', marginBottom: 14, fontSize: 12, color: 'var(--rd)',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>❌</span>
          {rejected} document{rejected > 1 ? 's' : ''} rejected — tap Re-upload to fix
        </div>
      )}

      <div className="quick-attach-notice">
        ⚡ Verified documents auto-attach to scheme applications — no re-uploading needed
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          Loading encrypted documents...
        </div>
      ) : (
        <div className="doc-grid">
          {DOC_TYPES.map(dt => {
            const doc = docMap[dt.type];
            const sc = doc ? STATUS_CONFIG[doc.status] : null;
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
                {doc && <div style={{ position: 'absolute', top: 7, left: 7, fontSize: 10, opacity: .5 }}>🔒</div>}

                {doc ? (
                  <span className="doc-status" style={{
                    background: isFlash ? 'var(--gn-l)' : sc?.bg,
                    color: isFlash ? 'var(--gn)' : sc?.color,
                    position: 'absolute', top: 7, right: 7,
                    fontSize: '9.5px', padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                    border: `1px solid ${isFlash ? 'var(--gn)' : sc?.color}40`,
                  }}>
                    {isFlash ? '🟢 Updated!' : `${sc?.icon} ${sc?.label}`}
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

                {doc && (
                  <div style={{ fontSize: '9.5px', color: 'var(--t3)', marginTop: 3, textAlign: 'center' }}>
                    {doc.doc_name}
                    {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)}KB` : ''}
                  </div>
                )}

                {doc?.status === 'rejected' && doc.reject_reason && (
                  <div style={{
                    fontSize: 10, color: 'var(--rd)', marginTop: 5, textAlign: 'center',
                    lineHeight: 1.4, background: 'var(--rd-l)', borderRadius: 6, padding: '4px 8px',
                  }}>{doc.reject_reason}</div>
                )}

                {isUploading && (
                  <div style={{
                    marginTop: 8, height: 3, borderRadius: 3,
                    background: 'var(--gy-l)', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%', background: 'var(--nv)', borderRadius: 3,
                      animation: 'docProgress 1.5s infinite ease-in-out'
                    }}></div>
                  </div>
                )}

                <div style={{ marginTop: 10, display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {(!doc || doc.status === 'rejected') && (
                    <button className="btn b-nv b-sm"
                      onClick={() => triggerUpload(dt.type)} disabled={isUploading}>
                      {isUploading ? '⏳' : doc ? '🔄 Re-upload' : '+ Upload'}
                    </button>
                  )}
                  {doc?.id && (
                    <button className="btn b-gh b-sm" onClick={() => setPreviewDoc(doc)}>
                      👁 View
                    </button>
                  )}
                  {doc?.status === 'pending' && (
                    <button className="btn b-am b-sm"
                      onClick={() => triggerUpload(dt.type)} disabled={isUploading}>
                      🔄
                    </button>
                  )}
                  {doc && doc.status !== 'verified' && (
                    <button className="btn b-rd b-sm" onClick={() => deleteDoc(doc)}>🗑</button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="doc-card doc-add" onClick={() => triggerUpload('custom')}
            style={{ cursor: 'pointer' }}>
            <div className="doc-ic" style={{ color: 'var(--t3)' }}>➕</div>
            <div className="doc-name" style={{ color: 'var(--t3)' }}>Add Document</div>
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