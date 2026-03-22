/**
 * SchemesPage.jsx — Production v3 (all bugs fixed)
 * Place: client/src/pages/SchemesPage.jsx
 *
 * FIXES:
 * 1. "All Schemes" tab now shows real match scores from API (not raw DB)
 * 2. Grade labels (Excellent/High/Good/Partial/Not Eligible) correct thresholds
 * 3. Profile values update via re-match button
 * 4. Ineligible schemes show WHY (hard_fail_reason)
 */
import { useState, useEffect, useCallback } from 'react';
import API from '../api/api.js';

const CAT_ICON = {
  agriculture: '🌾', health: '🏥', education: '🎓', housing: '🏠',
  employment: '💼', welfare: '🤝', women: '👩', financial: '🏦', food: '🍚',
  transport: '🚗', digital: '💻', minority: '☪️', disability: '♿',
  infrastructure: '🏗️', default: '📋'
};

const CAT_COLOR = {
  agriculture: '#E8F5E9', health: '#E3F2FD', education: '#FFF8E1',
  housing: '#FCE4EC', employment: '#EDE7F6', welfare: '#FFF3EA', women: '#FCE4EC',
  financial: '#E8EAF6', food: '#FFF8E1', transport: '#E0F7FA', digital: '#E8EAF6',
  minority: '#F3E5F5', disability: '#E0F2F1', infrastructure: '#ECEFF1', default: '#F5F5F5'
};

// These must match server/src/services/scheme.matcher.js scoreToGrade thresholds
const GRADE = {
  excellent: { label: 'Excellent Match', color: '#1B7F4A', bg: '#E6F5ED', bar: '#1B7F4A', min: 85 },
  high: { label: 'High Match', color: '#1B7F4A', bg: '#E6F5ED', bar: '#1B7F4A', min: 70 },
  medium: { label: 'Good Match', color: '#E67E22', bg: '#FEF3E5', bar: '#E67E22', min: 50 },
  low: { label: 'Partial Match', color: '#D4A017', bg: '#FBF5E0', bar: '#D4A017', min: 35 },
  none: { label: 'Not Eligible', color: '#C0392B', bg: '#FDEDEB', bar: '#C0392B', min: 0 },
};

const STATUS_PILL = {
  eligible: { cls: 'p-gn', txt: '✓ Eligible' },
  applied: { cls: 'p-bl', txt: '📋 Applied' },
  active: { cls: 'p-gn', txt: '✅ Active' },
  completed: { cls: 'p-nv', txt: '🏁 Completed' },
  rejected: { cls: 'p-rd', txt: '✗ Rejected' },
  ineligible: { cls: 'p-rd', txt: '✗ Not Eligible' },
};

const CATS = ['all', 'agriculture', 'health', 'education', 'housing', 'employment',
  'welfare', 'women', 'financial', 'food', 'disability', 'minority', 'infrastructure'];

export default function SchemesPage({ user }) {
  const [tab, setTab] = useState('matched');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState({});
  const [expanded, setExpanded] = useState({});
  const [catFilter, setCatFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rematching, setRematching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // FIX: /all now returns real per-user scores from server matcher
      const ep = tab === 'matched' ? '/api/schemes/matched' : '/api/schemes/all';
      const { data } = await API.get(ep);
      setSchemes(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load schemes. Check server connection.');
      setSchemes([]);
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const apply = async (id, name) => {
    setApplying(a => ({ ...a, [id]: true }));
    try {
      await API.post(`/api/schemes/${id}/apply`);
      setSchemes(s => s.map(sc =>
        sc.id === id ? { ...sc, application_status: 'applied' } : sc
      ));
      alert(`✅ Applied for "${name}"! Track progress in Active Schemes.`);
    } catch (e) {
      alert('❌ ' + (e.response?.data?.error || 'Application failed'));
    } finally { setApplying(a => ({ ...a, [id]: false })); }
  };

  const rematch = async () => {
    setRematching(true);
    try {
      const { data } = await API.post('/api/schemes/rematch');
      await load(); // reload with fresh scores
      alert(`✅ Matching complete!\n\nFound ${data.matched} eligible schemes.\n\nTop matches:\n${(data.top || []).map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
    } catch (e) {
      alert('Re-matching failed: ' + (e.response?.data?.error || e.message));
    } finally { setRematching(false); }
  };

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  // Profile completeness check
  const PROFILE_FIELDS = [
    { k: 'gender', l: 'Gender' }, { k: 'date_of_birth', l: 'Date of Birth' },
    { k: 'category', l: 'Caste Category' }, { k: 'annual_income', l: 'Annual Income' },
    { k: 'occupation', l: 'Occupation' }, { k: 'state', l: 'State' },
    { k: 'aadhaar_number', l: 'Aadhaar' },
  ];
  const filled = PROFILE_FIELDS.filter(f => user[f.k]).length;
  const pct = Math.round((filled / PROFILE_FIELDS.length) * 100);
  const missing = PROFILE_FIELDS.filter(f => !user[f.k]).map(f => f.l);

  // Stats
  const matched = schemes.filter(s => s.is_matched !== false).length;
  const excellent = schemes.filter(s => ['excellent', 'high'].includes(s.match_grade)).length;
  const medium = schemes.filter(s => s.match_grade === 'medium').length;
  const applied = schemes.filter(s => ['applied', 'active'].includes(s.application_status)).length;

  // Filtering
  const filtered = schemes.filter(s => {
    if (catFilter !== 'all' && s.category !== catFilter) return false;
    if (gradeFilter !== 'all' && s.match_grade !== gradeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name?.toLowerCase().includes(q) &&
        !s.description?.toLowerCase().includes(q) &&
        !s.ministry?.toLowerCase().includes(q) &&
        !s.category?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>AI Matched Schemes</span></div>
      <div className="ph">
        <h1>🤖 Government Scheme Finder</h1>
        <p>AI-matched using 16 eligibility criteria — gender, age, caste, income, occupation, BPL, state & more</p>
      </div>

      {/* Profile Completeness Warning */}
      {pct < 85 && (
        <div style={{
          background: '#FFF8E1', border: '.5px solid #D4A017', borderRadius: 'var(--r)',
          padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#7A5A00' }}>
              Profile {pct}% complete — incomplete profiles miss important schemes!
            </div>
            <div style={{ fontSize: 11, color: '#7A5A00', marginTop: 3 }}>
              Missing: {missing.join(' · ')}
            </div>
            <div style={{ background: '#E0C84080', borderRadius: 4, height: 4, marginTop: 7 }}>
              <div style={{ background: '#D4A017', height: '100%', width: pct + '%', borderRadius: 4, transition: 'width 1s' }}></div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#7A5A00', fontWeight: 600, flexShrink: 0 }}>
            Update profile to improve match accuracy
          </div>
        </div>
      )}

      {/* Your Profile Summary */}
      <div className="profile-card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, opacity: .6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>
              YOUR ELIGIBILITY PROFILE
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {user.gender && <span className="pc-badge">👤 {user.gender}</span>}
              {user.category && <span className="pc-badge">🏷 {user.category}</span>}
              {user.occupation && <span className="pc-badge">💼 {user.occupation}</span>}
              {user.annual_income && <span className="pc-badge">💰 ₹{Number(user.annual_income).toLocaleString('en-IN')}/yr</span>}
              {user.state && <span className="pc-badge">📍 {user.state}</span>}
              {user.land_acres && <span className="pc-badge">🌱 {user.land_acres} acres</span>}
              {user.date_of_birth && <span className="pc-badge">🎂 {new Date().getFullYear() - new Date(user.date_of_birth).getFullYear()} yrs</span>}
              {user.aadhaar_number && <span className="pc-badge">🪪 Aadhaar ✓</span>}
              {user.voter_id && <span className="pc-badge">🗳 Voter ID ✓</span>}
              {!user.gender && !user.category && !user.occupation &&
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>Profile incomplete — update in My Dashboard</span>}
            </div>
            {lastUpdated && (
              <div style={{ fontSize: 10, opacity: .5, marginTop: 6 }}>
                Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
              </div>
            )}
          </div>
          <button onClick={rematch} disabled={rematching} style={{
            background: 'rgba(255,255,255,.15)', color: '#fff',
            border: '1.5px solid rgba(255,255,255,.35)', borderRadius: 'var(--rs)',
            padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            opacity: rematching ? 0.6 : 1, whiteSpace: 'nowrap'
          }}>
            {rematching ? '⏳ Running matcher...' : '🔄 Re-match Profile'}
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
        <button className={`tbtn${tab === 'matched' ? ' on' : ''}`} onClick={() => setTab('matched')}>
          🎯 Matched for Me ({tab === 'matched' ? filtered.length : schemes.length})
        </button>
        <button className={`tbtn${tab === 'all' ? ' on' : ''}`} onClick={() => setTab('all')}>
          📋 Browse All ({tab === 'all' ? filtered.length : schemes.length})
        </button>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{
            flex: 1, minWidth: 200, padding: '8px 12px', border: '.5px solid var(--gy-m)',
            borderRadius: 'var(--rs)', fontSize: 12.5, outline: 'none', fontFamily: 'inherit', color: 'var(--tx)'
          }}
          placeholder="🔍 Search scheme name, ministry, category..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
          style={{
            padding: '7px 10px', border: '.5px solid var(--gy-m)', borderRadius: 'var(--rs)',
            fontSize: 12, outline: 'none', fontFamily: 'inherit', color: 'var(--tx)'
          }}>
          <option value="all">All Match Levels</option>
          <option value="excellent">🟢 Excellent (85%+)</option>
          <option value="high">🟢 High (70–84%)</option>
          <option value="medium">🟡 Good (50–69%)</option>
          <option value="low">🟠 Partial (35–49%)</option>
          {tab === 'all' && <option value="none">🔴 Not Eligible</option>}
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: '4px 11px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 11.5, fontWeight: 600, transition: 'all .15s',
            background: catFilter === c ? 'var(--nv)' : 'var(--gy-l)',
            color: catFilter === c ? '#fff' : 'var(--t2)',
          }}>
            {CAT_ICON[c] || '📋'} {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Count row */}
      {!loading && (
        <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing <strong style={{ color: 'var(--nv)' }}>{filtered.length}</strong> of {schemes.length} schemes</span>
          {tab === 'all' && (
            <span>
              <span style={{ color: 'var(--gn)', fontWeight: 600 }}>{schemes.filter(s => s.is_matched).length} eligible</span>
              {' · '}
              <span style={{ color: 'var(--rd)', fontWeight: 600 }}>{schemes.filter(s => !s.is_matched).length} not eligible</span>
            </span>
          )}
        </div>
      )}

      {/* States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Running matching engine...</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Computing eligibility across all schemes for your profile</div>
        </div>
      )}
      {!loading && error && (
        <div style={{
          background: 'var(--rd-l)', border: '.5px solid var(--rd)', borderRadius: 'var(--r)',
          padding: '16px', textAlign: 'center', color: 'var(--rd)'
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{error}</div>
          <button className="btn b-rd b-sm" onClick={load}>Retry</button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>No schemes found</div>
          <div style={{ fontSize: 12, marginBottom: 14 }}>
            {tab === 'matched'
              ? `Your profile needs: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ' + more' : ''} for better matches`
              : 'Try removing category or grade filters'}
          </div>
          {tab === 'matched' && (
            <button className="btn b-sf b-sm" onClick={rematch} disabled={rematching}>
              {rematching ? '⏳ Matching...' : '🔄 Run Matching Engine Now'}
            </button>
          )}
        </div>
      )}

      {/* Scheme Cards */}
      {!loading && !error && filtered.map(scheme => (
        <SchemeCard key={scheme.id} scheme={scheme}
          expanded={!!expanded[scheme.id]}
          onToggle={() => toggle(scheme.id)}
          onApply={() => apply(scheme.id, scheme.name)}
          applying={!!applying[scheme.id]}
        />
      ))}
    </div>
  );
}

// ─── Scheme Card ──────────────────────────────────────────────────────────────
function SchemeCard({ scheme, expanded, onToggle, onApply, applying }) {
  // FIX: Always derive grade from score if match_grade missing
  const score = typeof scheme.match_score === 'number' ? scheme.match_score : 0;
  const grade = scheme.match_grade ||
    (score >= 85 ? 'excellent' : score >= 70 ? 'high' : score >= 50 ? 'medium' : score >= 35 ? 'low' : 'none');
  const gc = GRADE[grade] || GRADE.none;
  const status = scheme.application_status || (scheme.is_matched ? 'eligible' : 'ineligible');
  const spill = STATUS_PILL[status] || STATUS_PILL.eligible;
  const icon = CAT_ICON[scheme.category] || '📋';
  const bg = CAT_COLOR[scheme.category] || CAT_COLOR.default;
  const docs = scheme.rules?.documents_required || [];
  const inelig = grade === 'none';
  const benefitAmt = scheme.benefit_amount > 0
    ? `₹${Number(scheme.benefit_amount).toLocaleString('en-IN')}` : 'Non-monetary';

  return (
    <div className="sch" style={{
      borderLeft: `3px solid ${gc.color}`,
      opacity: inelig ? 0.72 : 1,
      marginBottom: 10,
    }}>
      {/* Header */}
      <div className="sch-hdr" onClick={onToggle}>
        <div className="sch-ic" style={{ background: bg }}>{icon}</div>
        <div className="sch-info" style={{ flex: 1, minWidth: 0 }}>
          <div className="sch-name">{scheme.name}</div>
          <div className="sch-desc" style={{ WebkitLineClamp: 2, overflow: 'hidden' }}>{scheme.description}</div>
          <div className="sch-tags" style={{ marginTop: 5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span className="tag" style={{ background: bg, color: 'var(--tx)', fontSize: '9.5px', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
              {icon} {(scheme.category || 'general').charAt(0).toUpperCase() + (scheme.category || 'general').slice(1)}
            </span>
            <span className="tag p-nv">{scheme.level || 'Central'}</span>
            {scheme.benefit_type && <span className="tag p-gy">{scheme.benefit_type}</span>}
            {scheme.deadline && new Date(scheme.deadline) > new Date() &&
              <span className="tag p-sf">⏰ Deadline {new Date(scheme.deadline).toLocaleDateString('en-IN')}</span>}
          </div>
        </div>
        <div className="sch-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0, marginLeft: 8 }}>
          {/* Grade badge — FIX: always shows correct grade text */}
          <div style={{
            background: gc.bg, color: gc.color, borderRadius: 20, padding: '4px 11px',
            fontSize: 11, fontWeight: 700, border: `1px solid ${gc.color}30`, whiteSpace: 'nowrap'
          }}>
            {score}% · {gc.label}
          </div>
          <span className={`pill ${spill.cls}`}>{spill.txt}</span>
          <span className={`tgl${expanded ? ' op' : ''}`}>▼</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="prog-w">
        <div className="prog-b">
          <div style={{ height: '100%', width: score + '%', background: gc.bar, borderRadius: 4, transition: 'width .8s ease' }}></div>
        </div>
        <div className="prog-m">
          <span>{benefitAmt} · {scheme.ministry || 'Govt of India'}</span>
          <span style={{ color: gc.color, fontWeight: 700 }}>{score}% match</span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="ms-panel op" style={{ padding: '14px 16px' }}>

          {/* Hard fail reason */}
          {inelig && scheme.hard_fail_reason && (
            <div style={{
              background: 'var(--rd-l)', border: '.5px solid var(--rd)', borderRadius: 'var(--rs)',
              padding: '10px 12px', marginBottom: 12
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rd)', marginBottom: 3 }}>❌ Why Not Eligible</div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{scheme.hard_fail_reason}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {/* Reasons */}
            {scheme.match_reasons?.length > 0 && (
              <div>
                <div className="ms-lbl">✅ Why You Qualify</div>
                {scheme.match_reasons.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, padding: '4px 0', fontSize: 11.5, color: 'var(--t2)' }}>
                    <span style={{ color: 'var(--gn)', fontWeight: 700, flexShrink: 0 }}>✓</span>{r}
                  </div>
                ))}
              </div>
            )}
            {/* Gaps */}
            {scheme.match_mismatches?.length > 0 && (
              <div>
                <div className="ms-lbl">📋 Profile Gaps</div>
                {scheme.match_mismatches.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, padding: '4px 0', fontSize: 11.5, color: 'var(--t2)' }}>
                    <span style={{ color: 'var(--am)', fontWeight: 700, flexShrink: 0 }}>→</span>{m}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Eligibility Criteria */}
          <div style={{
            background: 'var(--wh)', borderRadius: 'var(--rs)', padding: '10px 12px',
            marginBottom: 12, border: '.5px solid var(--gy-m)'
          }}>
            <div className="ms-lbl" style={{ marginBottom: 7 }}>📋 Eligibility Criteria</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {scheme.rules?.max_income &&
                <span className="pill p-gy">💰 Income ≤ ₹{Number(scheme.rules.max_income).toLocaleString('en-IN')}</span>}
              {scheme.rules?.category?.length &&
                <span className="pill p-gy">🏷 {scheme.rules.category.join(' / ')}</span>}
              {scheme.rules?.gender?.length &&
                <span className="pill p-gy">👤 {scheme.rules.gender.join(' / ')}</span>}
              {scheme.rules?.occupation?.length &&
                <span className="pill p-gy">💼 {scheme.rules.occupation.join(', ')}</span>}
              {scheme.rules?.max_land != null &&
                <span className="pill p-gy">🌱 Land ≤ {scheme.rules.max_land} acres</span>}
              {scheme.rules?.bpl_only &&
                <span className="pill p-rd">BPL Households Only</span>}
              {(scheme.rules?.min_age || scheme.rules?.max_age) &&
                <span className="pill p-gy">🎂 Age {scheme.rules.min_age || 0}–{scheme.rules.max_age || 'any'} yrs</span>}
              {scheme.rules?.state?.length &&
                <span className="pill p-nv">📍 {scheme.rules.state.join(', ')}</span>}
              {scheme.rules?.area_type && scheme.rules.area_type !== 'both' &&
                <span className="pill p-gy">{scheme.rules.area_type === 'rural' ? '🏘 Rural only' : '🏙 Urban only'}</span>}
              {scheme.rules?.disability_only && <span className="pill p-bl">♿ Divyangjan Only</span>}
              {scheme.rules?.minority_only && <span className="pill p-bl">☪️ Minority Only</span>}
              {scheme.rules?.student_only && <span className="pill p-bl">🎓 Students Only</span>}
              {scheme.rules?.ex_serviceman_only && <span className="pill p-bl">🎖 Ex-Servicemen Only</span>}
              {scheme.rules?.marital_status?.length &&
                <span className="pill p-gy">💍 {scheme.rules.marital_status.join('/')}</span>}
              {/* Universal badge when no restrictions */}
              {!scheme.rules?.gender?.length && !scheme.rules?.category?.length &&
                !scheme.rules?.occupation?.length && !scheme.rules?.max_income &&
                !scheme.rules?.bpl_only && !scheme.rules?.disability_only &&
                !scheme.rules?.minority_only && !scheme.rules?.student_only &&
                <span className="pill p-gn">🌐 Open to All Citizens</span>}
            </div>
          </div>

          {/* Documents Required */}
          {docs.length > 0 && (
            <div style={{ background: 'var(--nv-l)', borderRadius: 'var(--rs)', padding: '10px 12px', marginBottom: 12 }}>
              <div className="ms-lbl" style={{ marginBottom: 6 }}>📎 Documents Required</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {docs.map((d, i) => <span key={i} className="pill p-nv" style={{ fontSize: 11 }}>{d}</span>)}
              </div>
            </div>
          )}

          {/* Official Link */}
          {scheme.rules?.apply_url && (
            <div style={{ marginBottom: 10 }}>
              <a href={scheme.rules.apply_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--bl)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                🔗 Official Application Portal →
              </a>
            </div>
          )}

          {/* Action */}
          {status === 'eligible' && !inelig && (
            <button className="btn b-sf" onClick={e => { e.stopPropagation(); onApply(); }} disabled={applying}>
              {applying ? '⏳ Applying...' : `Apply for ${scheme.name.split('—')[0].trim()} →`}
            </button>
          )}
          {status === 'applied' && (
            <div className="notice" style={{ marginBottom: 0, fontSize: 12 }}>
              📋 Applied {scheme.applied_at ? 'on ' + new Date(scheme.applied_at).toLocaleDateString('en-IN') : 'recently'}. Track status in Active Schemes tab.
            </div>
          )}
          {status === 'active' && (
            <div className="notice" style={{ marginBottom: 0, background: 'var(--gn-l)', borderColor: 'var(--gn)', color: 'var(--gn)', fontSize: 12 }}>
              ✅ Scheme active. Check milestones in Active Schemes tab.
            </div>
          )}
          {inelig && (
            <div className="notice" style={{ marginBottom: 0, background: 'var(--gy-l)', borderColor: 'var(--gy-m)', color: 'var(--t2)', fontSize: 12 }}>
              ℹ️ Currently not eligible. Update your profile if your situation changes, then click Re-match.
            </div>
          )}
        </div>
      )}
    </div>
  );
}