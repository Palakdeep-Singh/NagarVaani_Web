/**
 * FamilySection.tsx — Modern Household Management Dashboard
 */
import { useState, useEffect, useCallback } from 'react';
import { API } from './mockHelpers';

const RELATIONS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Grandfather', 'Grandmother', 'Brother', 'Sister', 'Child', 'Other'];
const GENDERS = ['Male', 'Female', 'Other'];
const EDUCATION = ['None', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post Graduate', 'Diploma / ITI'];

const RELATION_ICONS = {
  spouse: '💑', son: '👦', daughter: '👧', father: '👴', mother: '👵',
  grandfather: '👴', grandmother: '👵',
  brother: '🧑', sister: '👩', child: '🧒', other: '👤'
};

const RELATION_COLORS = {
  spouse: { bg: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)', border: '#F9A8D4', text: '#BE185D' },
  son: { bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '#93C5FD', text: '#1D4ED8' },
  daughter: { bg: 'linear-gradient(135deg, #FDF4FF, #FAE8FF)', border: '#E9D5FF', text: '#9333EA' },
  father: { bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '#86EFAC', text: '#16A34A' },
  mother: { bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '#FDE68A', text: '#D97706' },
  grandfather: { bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '#86EFAC', text: '#16A34A' },
  grandmother: { bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '#FDE68A', text: '#D97706' },
  brother: { bg: 'linear-gradient(135deg, #ECFEFF, #CFFAFE)', border: '#67E8F9', text: '#0891B2' },
  sister: { bg: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', border: '#FDA4AF', text: '#E11D48' },
  child: { bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '#93C5FD', text: '#1D4ED8' },
  other: { bg: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)', border: '#CBD5E1', text: '#475569' },
};

const emptyForm = () => ({
  full_name: '', relation: '', gender: '', date_of_birth: '',
  occupation: '', is_disabled: false, education_level: '',
});

export default function FamilySection({ user }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/api/user/family');
      setMembers(data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (f) => (e) => setForm(p => ({
    ...p,
    [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }));

  const addMember = async () => {
    if (!form.full_name.trim() || !form.relation) return alert('Name and relation are required');
    setSaving(true);
    try {
      await API.post('/api/user/family', form);
      setForm(emptyForm());
      setShowForm(false);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to add family member');
    } finally { setSaving(false); }
  };

  const deleteMember = async (id) => {
    if (!confirm('Remove this family member?')) return;
    setDeleting(id);
    try {
      await API.delete(`/api/user/family/${id}`);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to remove');
    } finally { setDeleting(null); }
  };

  const getAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 ? age : null;
  };

  const getEligibilityContribution = (m) => {
    let score = 0;
    if (m.full_name) score += 15;
    if (m.relation) score += 15;
    if (m.gender) score += 10;
    if (m.date_of_birth) score += 15;
    if (m.occupation) score += 15;
    if (m.education_level) score += 15;
    if (m.is_disabled) score += 15;
    else score += 10;
    return Math.min(score, 95);
  };

  const householdScore = members.length > 0
    ? Math.min(Math.round(60 + members.length * 8), 98)
    : 35;

  return (
    <div className="page on">
      {/* ── HERO SECTION ── */}
      <div className="hero-modern-saas" style={{ marginBottom: 32 }}>
        <div className="hero-saas-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <span>🏡</span> Household Management
          </div>
          <h1 className="hero-saas-title">
            Household Benefits
          </h1>
          <p className="hero-saas-desc">
            Manage family members and unlock government schemes available for your entire household. More members means more scheme eligibility.
          </p>
          <div className="hero-saas-stats">
            <div className="hero-saas-stat-card">
              <span>👥</span> {members.length} Family Members
            </div>
            <div className="hero-saas-stat-card">
              <span>📋</span> {members.length > 0 ? Math.max(members.length * 4, 8) : 0} Eligible Schemes
            </div>
            <div className="hero-saas-stat-card">
              <span>⚡</span> AI-Powered Matching
            </div>
          </div>
        </div>

        <div className="hero-saas-visual">
          <div className="hero-floating-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>🏠</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Household Score</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Overall eligibility</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Eligibility</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: householdScore >= 70 ? '#10B981' : '#D97706' }}>{householdScore}%</span>
            </div>
            <div style={{ height: 8, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${householdScore}%`, background: householdScore >= 70 ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #F59E0B, #FBBF24)', borderRadius: 100, transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                <span style={{ color: '#10B981' }}>✓</span> {members.length} member{members.length !== 1 ? 's' : ''} registered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                <span style={{ color: '#10B981' }}>✓</span> Household data verified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── OVERVIEW STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: '👥', label: 'Family Members', value: members.length, color: '#2563EB', bg: '#EFF6FF' },
          { icon: '📋', label: 'Eligible Schemes', value: members.length > 0 ? Math.max(members.length * 4, 8) : 0, color: '#10B981', bg: '#F0FDF4' },
          { icon: '💰', label: 'Est. Benefits', value: members.length > 0 ? `₹${(members.length * 12000).toLocaleString('en-IN')}` : '₹0', color: '#D97706', bg: '#FFFBEB' },
          { icon: '🎯', label: 'Household Score', value: `${householdScore}%`, color: '#7C3AED', bg: '#FAF5FF' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderLeft: `5px solid ${stat.color}`,
            borderRadius: 16,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION HEADER ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>👥</span> Family Members
        </h2>
        <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>
          {members.length > 0 ? `${members.length} member${members.length > 1 ? 's' : ''} in your household` : 'Start building your household profile'}
        </p>
      </div>

      {/* ── ADD MEMBER FORM ── */}
      {showForm && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderLeft: '5px solid #2563EB',
          borderRadius: 16,
          padding: 28,
          marginBottom: 28,
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.06)',
          animation: 'fadeInUp 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>➕</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Add New Family Member</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Fill in the details to unlock more schemes</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Full Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', transition: 'border-color 0.2s', background: '#F8FAFC', boxSizing: 'border-box' }}
                placeholder="e.g. Sunita Devi"
                value={form.full_name} onChange={set('full_name')}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Relation <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                value={form.relation} onChange={set('relation')}
              >
                <option value="">Select Relation</option>
                {RELATIONS.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</label>
              <select
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                value={form.gender} onChange={set('gender')}
              >
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</label>
              <input
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                type="date" value={form.date_of_birth} onChange={set('date_of_birth')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Occupation</label>
              <input
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                placeholder="e.g. Student, Homemaker"
                value={form.occupation} onChange={set('occupation')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Education Level</label>
              <select
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                value={form.education_level} onChange={set('education_level')}
              >
                <option value="">Select</option>
                {EDUCATION.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#334155', fontWeight: 600 }}>
              <input type="checkbox" checked={form.is_disabled} onChange={set('is_disabled')}
                style={{ width: 18, height: 18, accentColor: '#2563EB' }}
              />
              ♿ Divyangjan / Person with Disability
            </label>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm()); }}
              style={{
                padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = '#E2E8F0'; }}
              onMouseLeave={e => { e.target.style.background = '#F1F5F9'; }}
            >Cancel</button>
            <button className="btn-apply-modern" onClick={addMember} disabled={saving} style={{ padding: '12px 28px', fontSize: 14 }}>
              {saving ? '⏳ Saving...' : '✅ Add Member'}
            </button>
          </div>
        </div>
      )}

      {/* ── FAMILY MEMBERS GRID ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Loading household data...</div>
        </div>
      ) : members.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          border: '2px dashed #E2E8F0',
          borderRadius: 20,
          textAlign: 'center',
          padding: '60px 24px',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
            Build Your Household Profile
          </div>
          <div style={{ fontSize: 14, color: '#64748B', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Add your family members to unlock family-specific government schemes like Sukanya Samriddhi, PM Matru Vandana, and 20+ more.
          </div>
          <button className="btn-apply-modern" onClick={() => setShowForm(true)} style={{ padding: '14px 28px', fontSize: 15 }}>
            <span style={{ marginRight: 8 }}>+</span> Add Your First Member
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {members.map(m => {
            const age = getAge(m.date_of_birth);
            const rel = (m.relation || 'other').toLowerCase();
            const icon = RELATION_ICONS[rel] || '👤';
            const colors = RELATION_COLORS[rel] || RELATION_COLORS.other;
            const eligibility = getEligibilityContribution(m);

            return (
              <div key={m.id} style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderLeft: `5px solid ${colors.border}`,
                borderRadius: 16,
                padding: 0,
                overflow: 'hidden',
                boxShadow: '0 4px 12px -2px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px -6px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.04)'; }}
              >
                {/* Card Header */}
                <div style={{ padding: '20px 20px 0' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: colors.bg,
                      border: `2px solid ${colors.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, flexShrink: 0,
                    }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                        {m.full_name}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          background: colors.bg, color: colors.text,
                          padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.3px',
                        }}>
                          {(m.relation || 'Other').charAt(0).toUpperCase() + (m.relation || 'Other').slice(1)}
                        </span>
                        {m.gender && (
                          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                            {m.gender}
                          </span>
                        )}
                        {age !== null && (
                          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                            · {age} yrs
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMember(m.id)}
                      disabled={deleting === m.id}
                      style={{
                        background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
                        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: 14, color: '#DC2626',
                        transition: 'all 0.2s', flexShrink: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                      title="Remove member"
                    >
                      {deleting === m.id ? '⏳' : '🗑'}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {m.occupation && (
                    <span style={{ background: '#F8FAFC', color: '#334155', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      💼 {m.occupation}
                    </span>
                  )}
                  {m.education_level && (
                    <span style={{ background: '#F8FAFC', color: '#334155', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      📚 {m.education_level}
                    </span>
                  )}
                  {m.is_disabled && (
                    <span style={{ background: '#FFFBEB', color: '#D97706', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 4 }}>
                      ♿ Divyangjan
                    </span>
                  )}
                </div>

                {/* Eligibility Contribution Footer */}
                <div style={{ padding: '14px 20px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Eligibility Contribution</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: eligibility >= 70 ? '#10B981' : '#D97706' }}>{eligibility}%</span>
                  </div>
                  <div style={{ height: 6, background: '#E2E8F0', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${eligibility}%`,
                      background: eligibility >= 70 ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                      borderRadius: 100,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Member Card */}
          <div
            onClick={() => setShowForm(true)}
            style={{
              background: '#FFFFFF',
              border: '2px dashed #CBD5E1',
              borderRadius: 16,
              padding: '40px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: 200,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FFFFFF'; }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: '#2563EB', marginBottom: 12,
            }}>+</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Add Family Member</div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>Unlock more schemes</div>
          </div>
        </div>
      )}
    </div>
  );
}
