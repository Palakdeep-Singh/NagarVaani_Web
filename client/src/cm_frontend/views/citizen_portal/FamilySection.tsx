/**
 * FamilySection.jsx — Manage family members for better scheme matching
 * Place: client/src/pages/FamilySection.jsx
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

  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Family</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1>👨‍👩‍👧‍👦 My Family</h1>
          <p>Add your family members to unlock more government schemes for your entire household</p>
        </div>
        <button className="btn b-sf" onClick={() => setShowForm(true)} style={{ flexShrink: 0 }}>
          ➕ Add Family Member
        </button>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bl-l) 0%, #e8f4fd 100%)',
        border: '.5px solid var(--bl)',
        borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 14,
        fontSize: 12, color: 'var(--bl)', display: 'flex', gap: 10, alignItems: 'center'
      }}>
        <span style={{ fontSize: 22 }}>💡</span>
        <div>
          <strong>Why add family?</strong> Many government schemes like Sukanya Samriddhi, Beti Bachao, PM Matru Vandana
          check family details. Adding members can unlock 20+ additional schemes automatically!
        </div>
      </div>

      {/* Add Member Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 14, borderLeft: '3px solid var(--sf)' }}>
          <div className="card-title" style={{ marginBottom: 12, fontSize: 13 }}>
            ➕ Add New Family Member
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: 'var(--rd)' }}>*</span></label>
              <input className="form-input" placeholder="e.g. Sunita Devi"
                value={form.full_name} onChange={set('full_name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Relation <span style={{ color: 'var(--rd)' }}>*</span></label>
              <select className="form-input" value={form.relation} onChange={set('relation')}>
                <option value="">Select Relation</option>
                {RELATIONS.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            </div>
            <div className="form-group">
              <label className="form-label">Occupation</label>
              <input className="form-input" placeholder="e.g. Student, Homemaker"
                value={form.occupation} onChange={set('occupation')} />
            </div>
            <div className="form-group">
              <label className="form-label">Education Level</label>
              <select className="form-input" value={form.education_level} onChange={set('education_level')}>
                <option value="">Select</option>
                {EDUCATION.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_disabled} onChange={set('is_disabled')} />
              Divyangjan / Disabled
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
            <button className="btn b-gh" onClick={() => { setShowForm(false); setForm(emptyForm()); }}>Cancel</button>
            <button className="btn b-sf" onClick={addMember} disabled={saving}>
              {saving ? '⏳ Saving...' : '✅ Add Member'}
            </button>
          </div>
        </div>
      )}

      {/* Family Members List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>⏳ Loading family...</div>
      ) : members.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>
            No family members added yet
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 14 }}>
            Add your spouse, children, and parents to get matched with family-specific schemes
          </div>
          <button className="btn b-sf" onClick={() => setShowForm(true)}>➕ Add Your First Member</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {members.map(m => {
            const age = getAge(m.date_of_birth);
            const icon = RELATION_ICONS[(m.relation || '').toLowerCase()] || '👤';
            return (
              <div key={m.id} className="card" style={{
                padding: '14px 16px', position: 'relative',
                borderLeft: `3px solid ${m.is_disabled ? 'var(--am)' : 'var(--nv)'}`,
                transition: 'all .2s ease'
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'var(--nv-l)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, flexShrink: 0
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                      {m.full_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                      {(m.relation || '').charAt(0).toUpperCase() + (m.relation || '').slice(1)}
                      {m.gender && ` · ${m.gender}`}
                      {age !== null && ` · ${age} yrs`}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {m.occupation && <span className="pill p-nv" style={{ fontSize: 9 }}>{m.occupation}</span>}
                      {m.education_level && <span className="pill p-gy" style={{ fontSize: 9 }}>📚 {m.education_level}</span>}
                      {m.is_disabled && <span className="pill p-am" style={{ fontSize: 9 }}>♿ Divyangjan</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMember(m.id)}
                    disabled={deleting === m.id}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 16, color: 'var(--rd)', opacity: 0.5,
                      transition: 'opacity .2s', padding: 4
                    }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.5}
                    title="Remove member"
                  >
                    {deleting === m.id ? '⏳' : '🗑'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {members.length > 0 && (
        <div style={{
          marginTop: 14, padding: '10px 14px', background: 'var(--gn-l)',
          border: '.5px solid var(--gn)', borderRadius: 'var(--rs)',
          fontSize: 11.5, color: 'var(--gn)', fontWeight: 600
        }}>
          ✅ {members.length} family member{members.length > 1 ? 's' : ''} added · Scheme matching will now consider your entire household
        </div>
      )}
    </div>
  );
}
