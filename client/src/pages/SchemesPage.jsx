/**
 * SchemesPage.jsx — Full scheme application modal with document upload
 * When clicking Apply, prompts citizen to upload ALL required documents
 * before submitting. Documents routed to correct admin level.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api/api.js';

// Government scheme document requirements by category (sourced from govt portals)
const SCHEME_DOCS = {
  agriculture: ['Aadhaar Card', 'Bank Passbook', 'Land Records (7/12)', 'Farmer Registration Certificate', 'Passport Photo'],
  health: ['Aadhaar Card', 'BPL/Income Certificate', 'Medical Documents', 'Bank Passbook', 'Passport Photo'],
  education: ['Aadhaar Card', 'School/College Certificate', 'Income Certificate', 'Caste Certificate', 'Bank Passbook'],
  housing: ['Aadhaar Card', 'Income Certificate', 'Land/Property Documents', 'BPL Card', 'Bank Passbook'],
  employment: ['Aadhaar Card', 'Educational Certificates', 'Income Certificate', 'Bank Passbook', 'Passport Photo'],
  welfare: ['Aadhaar Card', 'Income Certificate', 'BPL Card', 'Bank Passbook', 'Passport Photo'],
  women: ['Aadhaar Card', 'Income Certificate', 'Bank Passbook', 'Passport Photo', 'Age Proof'],
  financial: ['Aadhaar Card', 'Bank Passbook', 'Income Certificate', 'PAN Card', 'Passport Photo'],
  food: ['Aadhaar Card', 'Ration Card', 'BPL Certificate', 'Family Photo'],
  disability: ['Aadhaar Card', 'Disability Certificate', 'Income Certificate', 'Bank Passbook', 'Passport Photo'],
  minority: ['Aadhaar Card', 'Minority/Religion Certificate', 'Income Certificate', 'Bank Passbook'],
  pension: ['Aadhaar Card', 'Age Proof', 'Bank Passbook', 'Income Certificate', 'Passport Photo'],
  default: ['Aadhaar Card', 'Bank Passbook', 'Income Certificate', 'Passport Photo'],
};

const getRequiredDocs = (scheme) => {
  const fromRules = scheme?.rules?.documents_required || [];
  if (fromRules.length > 0) return fromRules;
  return SCHEME_DOCS[scheme?.category] || SCHEME_DOCS.default;
};

const CAT_ICON = {
  agriculture: '🌾', health: '🏥', education: '🎓', housing: '🏠',
  employment: '💼', welfare: '🤝', women: '👩', financial: '🏦', food: '🍚',
  transport: '🚗', digital: '💻', minority: '☪️', disability: '♿',
  infrastructure: '🏗️', pension: '👴', default: '📋'
};

const GRADE = {
  excellent: { label: 'Excellent Match', color: '#1B7F4A', bg: '#E6F5ED', bar: '#1B7F4A' },
  high: { label: 'High Match', color: '#1B7F4A', bg: '#E6F5ED', bar: '#1B7F4A' },
  medium: { label: 'Good Match', color: '#E67E22', bg: '#FEF3E5', bar: '#E67E22' },
  low: { label: 'Partial Match', color: '#D4A017', bg: '#FBF5E0', bar: '#D4A017' },
  none: { label: 'Not Eligible', color: '#C0392B', bg: '#FDEDEB', bar: '#C0392B' },
};

const CATS = ['all', 'agriculture', 'health', 'education', 'housing', 'employment',
  'welfare', 'women', 'financial', 'food', 'disability', 'minority', 'infrastructure', 'pension'];

export default function SchemesPage({ user }) {
  const [tab, setTab] = useState('matched');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [catFilter, setCatFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rematching, setRematching] = useState(false);
  const [applyModal, setApplyModal] = useState(null); // scheme to apply for

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const ep = tab === 'matched' ? '/api/schemes/matched' : '/api/schemes/all';
      const { data } = await API.get(ep);
      setSchemes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load schemes');
      setSchemes([]);
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const rematch = async () => {
    setRematching(true);
    try {
      const { data } = await API.post('/api/schemes/rematch');
      await load();
      alert(`✅ Matching complete! Found ${data.matched} eligible schemes.`);
    } catch (e) {
      alert('Re-matching failed: ' + (e.response?.data?.error || e.message));
    } finally { setRematching(false); }
  };

  const handleApplySuccess = (schemeId) => {
    setSchemes(s => s.map(sc =>
      sc.id === schemeId ? { ...sc, application_status: 'applied' } : sc
    ));
    setApplyModal(null);
  };

  // Profile completeness
  const PROFILE_FIELDS = [
    { k: 'gender' }, { k: 'date_of_birth' }, { k: 'category' }, { k: 'annual_income' },
    { k: 'occupation' }, { k: 'state' }, { k: 'aadhaar_number' },
  ];
  const filled = PROFILE_FIELDS.filter(f => user[f.k]).length;
  const pct = Math.round((filled / PROFILE_FIELDS.length) * 100);
  const missing = ['Gender', 'Date of Birth', 'Category', 'Annual Income', 'Occupation', 'State', 'Aadhaar']
    .filter((_, i) => !user[PROFILE_FIELDS[i].k]);

  // Stats
  const excellent = schemes.filter(s => ['excellent', 'high'].includes(s.match_grade)).length;
  const medium = schemes.filter(s => s.match_grade === 'medium').length;
  const applied = schemes.filter(s => ['applied', 'active'].includes(s.application_status)).length;

  const filtered = schemes.filter(s => {
    if (catFilter !== 'all' && s.category !== catFilter) return false;
    if (gradeFilter !== 'all' && s.match_grade !== gradeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name?.toLowerCase().includes(q) &&
        !s.description?.toLowerCase().includes(q) &&
        !s.category?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Scheme Finder</span></div>
      <div className="ph">
        <h1>🤖 Government Scheme Finder</h1>
        <p>AI-matched using 16 eligibility criteria — income, caste, occupation, age, disability, BPL & more</p>
      </div>

      {/* Profile completeness */}
      {pct < 85 && (
        <div style={{ background: '#FFF8E1', border: '.5px solid #D4A017', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#7A5A00' }}>Profile {pct}% complete — incomplete profiles miss important schemes!</div>
            <div style={{ fontSize: 11, color: '#7A5A00', marginTop: 3 }}>Missing: {missing.join(' · ')}</div>
            <div style={{ background: '#E0C84080', borderRadius: 4, height: 4, marginTop: 7 }}>
              <div style={{ background: '#D4A017', height: '100%', width: pct + '%', borderRadius: 4, transition: 'width 1s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Profile summary + stats */}
      <div className="profile-card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, opacity: .6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>YOUR ELIGIBILITY PROFILE</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {user.gender && <span className="pc-badge">👤 {user.gender}</span>}
              {user.category && <span className="pc-badge">🏷 {user.category}</span>}
              {user.occupation && <span className="pc-badge">💼 {user.occupation}</span>}
              {user.annual_income && <span className="pc-badge">💰 ₹{Number(user.annual_income).toLocaleString('en-IN')}/yr</span>}
              {user.state && <span className="pc-badge">📍 {user.state}</span>}
              {user.date_of_birth && <span className="pc-badge">🎂 {new Date().getFullYear() - new Date(user.date_of_birth).getFullYear()} yrs</span>}
              {user.aadhaar_number && <span className="pc-badge">🪪 Aadhaar ✓</span>}
            </div>
          </div>
          <button onClick={rematch} disabled={rematching} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,.35)', borderRadius: 'var(--rs)', padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: rematching ? .6 : 1 }}>
            {rematching ? '⏳ Matching...' : '🔄 Re-match Profile'}
          </button>
        </div>
        <div className="pc-grid" style={{ marginTop: 16 }}>
          <div className="pc-cell"><div className="pc-val">{excellent}</div><div className="pc-lbl">High Match (70%+)</div></div>
          <div className="pc-cell"><div className="pc-val">{medium}</div><div className="pc-lbl">Good Match (50–69%)</div></div>
          <div className="pc-cell"><div className="pc-val">{applied}</div><div className="pc-lbl">Applied / Active</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tb">
        <button className={`tbtn${tab === 'matched' ? ' on' : ''}`} onClick={() => setTab('matched')}>🎯 Matched for Me</button>
        <button className={`tbtn${tab === 'all' ? ' on' : ''}`} onClick={() => setTab('all')}>📋 Browse All</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '.5px solid var(--gy-m)', borderRadius: 'var(--rs)', fontSize: 12.5, outline: 'none' }}
          placeholder="🔍 Search scheme name, ministry, category..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
          style={{ padding: '7px 10px', border: '.5px solid var(--gy-m)', borderRadius: 'var(--rs)', fontSize: 12, outline: 'none' }}>
          <option value="all">All Match Levels</option>
          <option value="excellent">🟢 Excellent (85%+)</option>
          <option value="high">🟢 High (70–84%)</option>
          <option value="medium">🟡 Good (50–69%)</option>
          <option value="low">🟠 Partial (35–49%)</option>
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '4px 11px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 600, background: catFilter === c ? 'var(--nv)' : 'var(--gy-l)', color: catFilter === c ? '#fff' : 'var(--t2)' }}>
            {CAT_ICON[c] || '📋'} {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {!loading && <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>Showing <strong>{filtered.length}</strong> of {schemes.length} schemes</div>}

      {loading && <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--t3)' }}><div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div><div style={{ fontSize: 13, fontWeight: 600 }}>Running AI matching engine...</div></div>}
      {!loading && error && <div style={{ background: 'var(--rd-l)', border: '.5px solid var(--rd)', borderRadius: 'var(--r)', padding: 16, textAlign: 'center', color: 'var(--rd)' }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No schemes found</div>
          <div style={{ fontSize: 12 }}>{tab === 'matched' ? 'Update your profile and re-match for better results' : 'Try removing filters'}</div>
        </div>
      )}

      {!loading && !error && filtered.map(scheme => (
        <SchemeCard key={scheme.id} scheme={scheme}
          expanded={!!expanded[scheme.id]}
          onToggle={() => setExpanded(e => ({ ...e, [scheme.id]: !e[scheme.id] }))}
          onApply={() => setApplyModal(scheme)}
        />
      ))}

      {/* Application Modal */}
      {applyModal && (
        <SchemeApplicationModal
          scheme={applyModal}
          userId={user.id}
          onClose={() => setApplyModal(null)}
          onSuccess={() => handleApplySuccess(applyModal.id)}
        />
      )}
    </div>
  );
}

// ── Scheme Card ───────────────────────────────────────────────────────────────
function SchemeCard({ scheme, expanded, onToggle, onApply }) {
  const score = typeof scheme.match_score === 'number' ? scheme.match_score : 0;
  const grade = scheme.match_grade ||
    (score >= 85 ? 'excellent' : score >= 70 ? 'high' : score >= 50 ? 'medium' : score >= 35 ? 'low' : 'none');
  const gc = GRADE[grade] || GRADE.none;
  const inelig = grade === 'none';
  const status = scheme.application_status || (scheme.is_matched ? 'eligible' : 'ineligible');
  const icon = CAT_ICON[scheme.category] || '📋';
  const docs = getRequiredDocs(scheme);
  const benefitAmt = scheme.benefit_amount > 0 ? `₹${Number(scheme.benefit_amount).toLocaleString('en-IN')}` : 'Non-monetary';

  return (
    <div className="sch" style={{ borderLeft: `3px solid ${gc.color}`, opacity: inelig ? .72 : 1, marginBottom: 10 }}>
      <div className="sch-hdr" onClick={onToggle}>
        <div className="sch-ic">{icon}</div>
        <div className="sch-info" style={{ flex: 1, minWidth: 0 }}>
          <div className="sch-name">{scheme.name}</div>
          <div className="sch-desc">{scheme.description?.slice(0, 120)}{scheme.description?.length > 120 ? '…' : ''}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            <span className="tag p-nv">{scheme.level || 'Central'}</span>
            {scheme.ministry && <span className="tag p-gy" style={{ fontSize: '10px' }}>{scheme.ministry}</span>}
            {scheme.deadline && new Date(scheme.deadline) > new Date() &&
              <span className="tag p-sf">⏰ {new Date(scheme.deadline).toLocaleDateString('en-IN')}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0, marginLeft: 8 }}>
          <div style={{ background: gc.bg, color: gc.color, borderRadius: 20, padding: '4px 11px', fontSize: 11, fontWeight: 700, border: `1px solid ${gc.color}30`, whiteSpace: 'nowrap' }}>
            {score}% · {gc.label}
          </div>
          {status === 'applied' && <span className="pill p-bl">📋 Applied</span>}
          {status === 'active' && <span className="pill p-gn">✅ Active</span>}
          {status === 'eligible' && !inelig && <span className="pill p-gn">✓ Eligible</span>}
          {inelig && <span className="pill p-rd">✗ Not Eligible</span>}
          <span className={`tgl${expanded ? ' op' : ''}`}>▼</span>
        </div>
      </div>

      {/* Match bar */}
      <div className="prog-w">
        <div className="prog-b">
          <div style={{ height: '100%', width: score + '%', background: gc.bar, borderRadius: 4, transition: 'width .8s' }} />
        </div>
        <div className="prog-m">
          <span>{benefitAmt} · {scheme.ministry || 'Govt of India'}</span>
          <span style={{ color: gc.color, fontWeight: 700 }}>{score}% match</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="ms-panel op" style={{ padding: '14px 16px' }}>
          {inelig && scheme.hard_fail_reason && (
            <div style={{ background: 'var(--rd-l)', border: '.5px solid var(--rd)', borderRadius: 'var(--rs)', padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rd)', marginBottom: 3 }}>❌ Why Not Eligible</div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{scheme.hard_fail_reason}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {scheme.match_reasons?.length > 0 && (
              <div>
                <div className="ms-lbl">✅ Why You Qualify</div>
                {scheme.match_reasons.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 11.5, color: 'var(--t2)' }}>
                    <span style={{ color: 'var(--gn)', fontWeight: 700, flexShrink: 0 }}>✓</span>{r}
                  </div>
                ))}
              </div>
            )}
            {scheme.match_mismatches?.length > 0 && (
              <div>
                <div className="ms-lbl">📋 Profile Gaps</div>
                {scheme.match_mismatches.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 11.5, color: 'var(--t2)' }}>
                    <span style={{ color: 'var(--am)', fontWeight: 700, flexShrink: 0 }}>→</span>{m}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Required documents preview */}
          {docs.length > 0 && (
            <div style={{ background: 'var(--nv-l)', borderRadius: 'var(--rs)', padding: '10px 12px', marginBottom: 12 }}>
              <div className="ms-lbl" style={{ marginBottom: 6 }}>📎 Documents Required to Apply</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {docs.map((d, i) => <span key={i} className="pill p-nv" style={{ fontSize: 11 }}>{d}</span>)}
              </div>
            </div>
          )}

          {/* Eligibility criteria */}
          <div style={{ background: 'var(--wh)', borderRadius: 'var(--rs)', padding: '10px 12px', marginBottom: 12, border: '.5px solid var(--gy-m)' }}>
            <div className="ms-lbl" style={{ marginBottom: 7 }}>📋 Eligibility Criteria</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {scheme.rules?.max_income && <span className="pill p-gy">💰 Income ≤ ₹{Number(scheme.rules.max_income).toLocaleString('en-IN')}</span>}
              {scheme.rules?.category?.length && <span className="pill p-gy">🏷 {scheme.rules.category.join('/')}</span>}
              {scheme.rules?.gender?.length && <span className="pill p-gy">👤 {scheme.rules.gender.join('/')}</span>}
              {scheme.rules?.bpl_only && <span className="pill p-rd">BPL Only</span>}
              {(scheme.rules?.min_age || scheme.rules?.max_age) && <span className="pill p-gy">🎂 Age {scheme.rules.min_age || 0}–{scheme.rules.max_age || 'any'} yrs</span>}
              {scheme.rules?.state?.length && <span className="pill p-nv">📍 {scheme.rules.state.join(', ')}</span>}
              {scheme.rules?.disability_only && <span className="pill p-bl">♿ Divyangjan Only</span>}
              {scheme.rules?.minority_only && <span className="pill p-bl">☪️ Minority Only</span>}
              {!scheme.rules?.gender?.length && !scheme.rules?.category?.length && !scheme.rules?.max_income && !scheme.rules?.bpl_only &&
                <span className="pill p-gn">🌐 Open to All Citizens</span>}
            </div>
          </div>

          {/* Action */}
          {status !== 'applied' && status !== 'active' && !scheme.hard_fail_reason && (
            <button className="btn b-sf" onClick={e => { e.stopPropagation(); onApply(); }}>
              📎 Apply for Scheme →
            </button>
          )}
          {(status === 'applied' || status === 'active') && (
            <div className="notice" style={{ background: 'var(--gn-l)', borderColor: 'var(--gn)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', marginBottom: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--gn)', fontWeight: 600 }}>
                {status === 'applied' ? '📋 Application submitted.' : '✅ Scheme active.'}
              </div>
              <a href="/active-schemes" style={{ 
                background: 'var(--gn)', color: '#fff', padding: '6px 12px', 
                borderRadius: 'var(--rs)', fontSize: 11, fontWeight: 700, textDecoration: 'none' 
              }}>
                Track Milestones →
              </a>
            </div>
          )}
          {inelig && scheme.hard_fail_reason && (
            <div className="notice" style={{ background: 'var(--gy-l)', borderColor: 'var(--gy-m)', color: 'var(--t2)', fontSize: 12, marginBottom: 0 }}>
              ℹ️ Not eligible currently. Update profile if situation changes, then click Re-match.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Scheme Application Modal ─────────────────────────────────────────────────
function SchemeApplicationModal({ scheme, userId, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('confirm'); // confirm | done

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      // Empty document_ids since docs are uploaded via Active Schemes now
      await API.post(`/api/schemes/${scheme.id}/apply`, { document_ids: [] });
      setStep('done');
      setTimeout(() => onSuccess(), 1800);
    } catch (e) {
      alert('Application failed: ' + (e.response?.data?.error || e.message));
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--wh)', borderRadius: 12, padding: '24px 28px', width: '100%', maxWidth: 500 }} onClick={e => e.stopPropagation()}>

        {step === 'done' ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gn)', marginBottom: 8 }}>Application Initiated!</div>
            <div style={{ fontSize: 13, color: 'var(--t2)' }}>
              Your application has been created. <strong>You must now go to Active Schemes</strong> to upload required documents.
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--nv)' }}>Apply for {scheme.name}</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
                  {scheme.level || 'Central'} Scheme · Managed by {scheme.level?.toLowerCase() || 'district'} admin
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--t3)', lineHeight: 1 }}>✕</button>
            </div>

            {/* Scheme info */}
            <div style={{ background: 'var(--bl-l)', borderRadius: 'var(--rs)', padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 28 }}>{CAT_ICON[scheme.category] || '📋'}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--nv)' }}>Benefit: {scheme.benefit_amount > 0 ? `₹${Number(scheme.benefit_amount).toLocaleString('en-IN')}` : 'Non-monetary'} · {scheme.benefit_type || 'Direct Benefit'}</div>
                <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>{scheme.ministry || 'Ministry of Government of India'}</div>
              </div>
            </div>

            <div style={{ fontSize: 14, color: 'var(--t1)', marginBottom: 24, lineHeight: 1.5 }}>
              By clicking submit, your application profile will be sent to the authorities.
              <div style={{ marginTop: 12, padding: '12px', background: 'var(--am-l)', color: '#7A5A00', borderRadius: 'var(--rs)', fontSize: 12.5, fontWeight: 600 }}>
                ⚠️ Next Step: After applying, you must go to your <strong>Active Schemes</strong> dashboard to upload the required documents. Your application will not be processed until documents are provided.
              </div>
            </div>

            {/* Submit button */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px', border: '1px solid var(--gy-m)', borderRadius: 'var(--rs)', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={submitting}
                style={{
                  flex: 2, padding: '10px', borderRadius: 'var(--rs)', border: 'none',
                  background: 'var(--gn)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14, fontWeight: 700,
                  opacity: submitting ? .7 : 1,
                }}>
                {submitting ? '⏳ Submitting...' : '✅ Start Application →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}