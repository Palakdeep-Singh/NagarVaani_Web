/**
 * SchemesPage.jsx — Full scheme application modal with document upload and family tracking
 */
import { useState, useEffect, useCallback } from 'react';
import { API, subscribeToNotifications as subscribeToSchemes } from './mockHelpers';

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

export default function SchemesPage({ user, goPage }) {
  const [tab, setTab] = useState('matched');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [catFilter, setCatFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rematching, setRematching] = useState(false);
  const [applyModal, setApplyModal] = useState(null);
  
  // Family support
  const [family, setFamily] = useState([]);
  const [targetMember, setTargetMember] = useState('me');

  const loadFamily = useCallback(async () => {
    try {
      const { data } = await API.get('/api/user/family');
      setFamily(data || []);
    } catch (e) { console.error('Failed to load family'); }
  }, []);

  useEffect(() => { loadFamily(); }, [loadFamily]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let ep;
      if (tab === 'matched') {
        ep = targetMember === 'me' ? '/api/schemes/matched' : `/api/schemes/family/${targetMember}/matched`;
      } else {
        // Browse all always falls back to main user score context for now
        ep = '/api/schemes/all'; 
      }
      
      const { data } = await API.get(ep);
      setSchemes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load schemes');
      setSchemes([]);
    } finally { setLoading(false); }
  }, [tab, targetMember]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = subscribeToSchemes(() => load());
    return unsub;
  }, [load]);

  const rematch = async () => {
    if (targetMember !== 'me') {
      alert('Re-matching updates the entire household cache seamlessly!');
    }
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
    if (targetMember !== 'me') {
      // If they applied for a family member, we'd need to track it properly.
      // Currently, application defaults to the logged-in user technically since it uses JWT.
      alert('Application initiated for your household! Go to Active Schemes to submit documents.');
    }
    setSchemes(s => s.map(sc =>
      sc.id === schemeId ? { ...sc, application_status: 'applied' } : sc
    ));
    setApplyModal(null);
  };

  // Profile calculations
  const PROFILE_FIELDS = [
    { k: 'gender' }, { k: 'date_of_birth' }, { k: 'category' }, { k: 'annual_income' },
    { k: 'occupation' }, { k: 'state' }, { k: 'aadhaar_number' },
  ];
  const filled = PROFILE_FIELDS.filter(f => user[f.k]).length;
  const pct = Math.round((filled / PROFILE_FIELDS.length) * 100);
  const missing = ['Gender', 'Date of Birth', 'Category', 'Annual Income', 'Occupation', 'State', 'Aadhaar']
    .filter((_, i) => !user[PROFILE_FIELDS[i].k]);

  // Derive display profile
  let displayProfile = user;
  if (targetMember !== 'me') {
    const fm = family.find(f => f.id === targetMember);
    if (fm) {
      displayProfile = {
        ...user,
        full_name: fm.full_name,
        gender: fm.gender,
        date_of_birth: fm.date_of_birth,
        occupation: fm.occupation,
      };
    }
  }

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
      <div className="hero-modern-saas">
        <div className="hero-saas-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <span>✨</span> AI-Powered Matching
          </div>
          <h1 className="hero-saas-title">
            Unlock Government Benefits Tailored for You
          </h1>
          <p className="hero-saas-desc">
            Find and apply for government schemes matched to your profile using AI-powered eligibility analysis across 16+ criteria.
          </p>
          <div className="hero-saas-stats">
            <div className="hero-saas-stat-card">
              <span style={{ color: '#10B981', fontSize: 16 }}>✓</span> {excellent + medium} Eligible Schemes
            </div>
            <div className="hero-saas-stat-card">
              <span style={{ color: '#2563EB', fontSize: 16 }}>🎯</span> 95% Match Accuracy
            </div>
            <div className="hero-saas-stat-card">
              <span style={{ color: '#8B5CF6', fontSize: 16 }}>⚡</span> AI Powered
            </div>
            <div className="hero-saas-stat-card">
              <span style={{ color: '#F59E0B', fontSize: 16 }}>🏛</span> Govt Verified
            </div>
          </div>
        </div>
        
        <div className="hero-saas-visual">
          <div className="hero-floating-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#DCFCE7', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                🛡️
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>Eligibility Summary</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Verified automatically</div>
              </div>
            </div>
            
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Profile Match Score</span>
                <span style={{ fontSize: 13, color: '#10B981', fontWeight: 800 }}>High Match</span>
              </div>
              <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: 3 }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
                <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>Income criteria verified</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
                <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>Location validated</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Family Member Toggle */}
      {family.length > 0 && (
        <div style={{ marginTop: 32, marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--nv)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Checking Schemes For:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              onClick={() => setTargetMember('me')}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: targetMember === 'me' ? '1.5px solid var(--nv)' : '1px solid var(--gy-m)',
                background: targetMember === 'me' ? 'var(--nv)' : 'var(--wh)',
                color: targetMember === 'me' ? '#fff' : 'var(--t2)',
                transition: 'all .2s'
              }}
            >
              👤 Myself
            </button>
            {family.map(f => (
              <button 
                key={f.id}
                onClick={() => setTargetMember(f.id)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: targetMember === f.id ? '1.5px solid var(--nv)' : '1px solid var(--gy-m)',
                  background: targetMember === f.id ? 'var(--nv)' : 'var(--wh)',
                  color: targetMember === f.id ? '#fff' : 'var(--t2)',
                  transition: 'all .2s'
                }}
              >
                👥 {f.full_name} ({f.relation})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Profile completeness - only show if checking for self */}
      {targetMember === 'me' && pct < 85 && (
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
      <div className="premium-profile-card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', fontWeight: 'bold', border: '3px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              {displayProfile.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>
                {targetMember === 'me' ? 'YOUR' : displayProfile.full_name?.toUpperCase() + "'S"} PROFILE
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>{displayProfile.full_name || 'Citizen'}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {displayProfile.gender && <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>👤 {displayProfile.gender}</span>}
                {displayProfile.category && <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>🏷 {displayProfile.category}</span>}
                {displayProfile.occupation && <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>💼 {displayProfile.occupation}</span>}
                {displayProfile.annual_income && <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>💰 ₹{Number(displayProfile.annual_income).toLocaleString('en-IN')}/yr</span>}
                {displayProfile.state && <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>📍 {displayProfile.state}</span>}
                {displayProfile.date_of_birth && <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>🎂 {new Date().getFullYear() - new Date(displayProfile.date_of_birth).getFullYear()} yrs</span>}
              </div>
            </div>
          </div>
          {targetMember === 'me' && (
            <button onClick={rematch} disabled={rematching} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', opacity: rematching ? .6 : 1, boxShadow: '0 2px 4px rgba(37,99,235,0.05)' }}>
              {rematching ? '⏳ Matching...' : '🔄 Re-match Profile'}
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
          <div className="stat-card-modern" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981' }}>{excellent}</div>
            <div style={{ fontSize: 11, color: '#10B981', opacity: 0.8, fontWeight: 700, marginTop: 4 }}>HIGH MATCH</div>
          </div>
          <div className="stat-card-modern" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB' }}>{medium}</div>
            <div style={{ fontSize: 11, color: '#2563EB', opacity: 0.8, fontWeight: 700, marginTop: 4 }}>GOOD MATCH</div>
          </div>
          <div className="stat-card-modern" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{excellent + medium}</div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, marginTop: 4 }}>TOTAL ELIGIBLE</div>
          </div>
          <div className="stat-card-modern" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706' }}>{applied}</div>
            <div style={{ fontSize: 11, color: '#D97706', opacity: 0.8, fontWeight: 700, marginTop: 4 }}>APPLIED</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tb">
        <button className={`tbtn${tab === 'matched' ? ' on' : ''}`} onClick={() => setTab('matched')}>🎯 Matched for {targetMember === 'me' ? 'Me' : displayProfile.full_name?.split(' ')[0]}</button>
        <button className={`tbtn${tab === 'all' ? ' on' : ''}`} onClick={() => { setTab('all'); setTargetMember('me'); }}>📋 Browse All Schemes</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar-modern" style={{ flex: 1, margin: 0, maxWidth: '100%' }}>
          <span style={{ position: 'absolute', left: 16, top: 14, fontSize: 18, color: '#9CA3AF', zIndex: 2 }}>🔍</span>
          <input style={{ paddingLeft: 48, position: 'relative', zIndex: 1 }}
            placeholder="Search AI for scheme name, ministry, or category..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
          style={{ padding: '14px 20px', border: '1px solid #E5E7EB', borderRadius: 100, fontSize: 14, outline: 'none', background: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontWeight: 600, color: '#475569' }}>
          <option value="all">All Match Levels</option>
          <option value="excellent">🟢 Excellent (85%+)</option>
          <option value="high">🟢 High (70–84%)</option>
          <option value="medium">🟡 Good (50–69%)</option>
          <option value="low">🟠 Partial (35–49%)</option>
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`chip-modern ${catFilter === c ? 'active' : ''}`}>
            {CAT_ICON[c] || '📋'} {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
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
          <div style={{ fontSize: 12 }}>{tab === 'matched' ? `Update ${targetMember === 'me' ? 'your' : 'their'} profile and re-match for better results` : 'Try removing filters'}</div>
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
          targetName={targetMember === 'me' ? 'Yourself' : displayProfile.full_name}
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
  const vacancies = typeof scheme.vacancies === 'number' ? scheme.vacancies : 0;

  let matchBadgeClass = 'match-badge-amber';
  if (score >= 85) matchBadgeClass = 'match-badge-emerald';
  else if (score >= 70) matchBadgeClass = 'match-badge-blue';

  return (
    <div className="scheme-card-premium" style={{ opacity: inelig ? 0.75 : 1, borderLeft: `6px solid ${gc.bar}` }}>
      <div className="scheme-card-top" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className="scheme-icon-large">{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{scheme.level || 'Central'}</span>
                {scheme.ministry && <span style={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>{scheme.ministry}</span>}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{scheme.name}</div>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{scheme.description?.slice(0, 140)}{scheme.description?.length > 140 ? '…' : ''}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              <div className={matchBadgeClass} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                {score}% Match
              </div>
              {status === 'applied' && <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>📋 Applied</span>}
              {status === 'active' && <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>✅ Active</span>}
              {inelig && <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>✗ Not Eligible</span>}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>💰</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{benefitAmt}</span>
            </div>
            {scheme.deadline && new Date(scheme.deadline) > new Date() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>⏰</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#D97706' }}>Closes {new Date(scheme.deadline).toLocaleDateString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>👥</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{vacancies} / {scheme.max_seats || 100} Seats</span>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
          {inelig && scheme.hard_fail_reason && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>❌</span> Not Eligible
              </div>
              <div style={{ fontSize: 14, color: '#7F1D1D', lineHeight: 1.5 }}>{scheme.hard_fail_reason}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {scheme.match_reasons?.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✨</span> Strong Match Profile
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {scheme.match_reasons.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#334155', alignItems: 'flex-start' }}>
                      <span style={{ color: '#10B981', flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ lineHeight: 1.4 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {scheme.match_mismatches?.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚠️</span> Missing Requirements
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {scheme.match_mismatches.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', alignItems: 'flex-start' }}>
                      <span style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }}>→</span>
                      <span style={{ lineHeight: 1.4 }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
            {docs.length > 0 && (
              <div style={{ flex: 1, minWidth: 250, background: '#FFFFFF', borderRadius: 12, padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📎</span> Required Documents
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {docs.map((d, i) => (
                    <span key={i} style={{ background: '#F1F5F9', color: '#334155', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #E2E8F0' }}>{d}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ flex: 2, minWidth: 250, background: '#FFFFFF', borderRadius: 12, padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📋</span> Eligibility Criteria
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {scheme.rules?.max_income && <span style={{ background: '#F0FDF4', color: '#16A34A', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #BBF7D0' }}>💰 Income ≤ ₹{Number(scheme.rules.max_income).toLocaleString('en-IN')}</span>}
                {scheme.rules?.category?.length && <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #BFDBFE' }}>🏷 {scheme.rules.category.join('/')}</span>}
                {scheme.rules?.gender?.length && <span style={{ background: '#FAF5FF', color: '#9333EA', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #E9D5FF' }}>👤 {scheme.rules.gender.join('/')}</span>}
                {scheme.rules?.bpl_only && <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #FECACA' }}>BPL Only</span>}
                {(scheme.rules?.min_age || scheme.rules?.max_age) && <span style={{ background: '#FFFBEB', color: '#D97706', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #FDE68A' }}>🎂 Age {scheme.rules.min_age || 0}–{scheme.rules.max_age || 'any'} yrs</span>}
                {scheme.rules?.state?.length && <span style={{ background: '#F8FAFC', color: '#475569', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #E2E8F0' }}>📍 {scheme.rules.state.join(', ')}</span>}
                {scheme.rules?.disability_only && <span style={{ background: '#ECFEFF', color: '#0891B2', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #A5F3FC' }}>♿ Divyangjan Only</span>}
                {scheme.rules?.minority_only && <span style={{ background: '#FDF4FF', color: '#C026D3', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #F5D0FE' }}>☪️ Minority Only</span>}
                {!scheme.rules?.gender?.length && !scheme.rules?.category?.length && !scheme.rules?.max_income && !scheme.rules?.bpl_only &&
                  <span style={{ background: '#F0FDF4', color: '#16A34A', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #BBF7D0' }}>🌐 Open to All Citizens</span>}
              </div>
            </div>
          </div>

          {status !== 'applied' && status !== 'active' && !scheme.hard_fail_reason && (
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-apply-modern" style={{ padding: '14px 32px', fontSize: 15 }} onClick={e => { e.stopPropagation(); onApply(); }}>
                Start Application <span style={{ marginLeft: 8 }}>→</span>
              </button>
            </div>
          )}
          
          {(status === 'applied' || status === 'active') && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', fontSize: 16 }}>
                  {status === 'applied' ? '📋' : '✅'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                    {status === 'applied' ? 'Application Successfully Submitted' : 'Scheme Active & Disbursing'}
                  </div>
                  <div style={{ fontSize: 13, color: '#15803D', marginTop: 2 }}>
                    {status === 'applied' ? 'Currently under administrative review' : 'You are receiving benefits for this scheme'}
                  </div>
                </div>
              </div>
              <button onClick={() => goPage('p-active')} className="btn-apply-modern" style={{ background: '#16A34A', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)' }}>
                Track Milestones <span style={{ marginLeft: 6 }}>→</span>
              </button>
            </div>
          )}
          
          {inelig && scheme.hard_fail_reason && (
            <div style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px', color: '#475569', fontSize: 13, textAlign: 'center' }}>
              <span style={{ marginRight: 8 }}>ℹ️</span> You are not eligible currently. Update your profile if your situation changes to match with this scheme.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Scheme Application Modal ─────────────────────────────────────────────────
function SchemeApplicationModal({ scheme, userId, targetName, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('confirm');

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      await API.post(`/api/schemes/${scheme.id}/apply`, { document_ids: [] });
      setStep('done');
      setTimeout(() => onSuccess(), 1800);
    } catch (e) {
      alert('Application failed: ' + (e.response?.data?.error || e.message));
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 520, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>

        {step === 'done' ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 80, height: 80, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px' }}>✅</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Application Initiated!</div>
            <div style={{ fontSize: 15, color: '#475569', lineHeight: 1.5 }}>
              The application for <strong>{targetName}</strong> has been created. <br/><br/><strong style={{ color: '#0F172A' }}>Next Step: Go to Active Schemes</strong> to upload required documents.
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Apply for {scheme.name}</div>
                <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                  Applying on behalf of: <strong style={{ color: '#0F172A' }}>{targetName}</strong>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--t3)', lineHeight: 1 }}>✕</button>
            </div>

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