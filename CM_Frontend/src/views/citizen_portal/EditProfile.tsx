import { useState, useContext } from 'react';
import { API, AuthContext } from './mockHelpers';

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"];

const OCCUPATIONS = ["Farmer / Kisan", "Agricultural Labour", "Animal Husbandry / Dairy", "Fisherman / Fisher", "Daily Wage Labour", "Construction Worker", "Artisan / Craftsman", "Carpenter", "Blacksmith / Lohar", "Weaver / Handloom", "Tailor / Darzi", "Barber / Nai", "Potter / Kumhar", "Goldsmith / Sunar", "Cobbler / Mochi", "Street Vendor / Hawker", "Small Shopkeeper", "Business / Trader", "MSME / Small Enterprise", "Transport / Driver", "Domestic Worker", "Asha Worker / Anganwadi", "Social / NGO Worker", "Student", "Salaried (Private)", "Salaried (Govt)", "Self Employed", "Homemaker", "Retired / Pensioner", "Unemployed / Job Seeker", "Other"];

export default function EditProfile({ onBack, onSaved, onComplaints }) {
  const { user, login } = useContext(AuthContext);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    gender: user?.gender || '',
    date_of_birth: user?.date_of_birth || '',
    state: user?.state || '',
    district: user?.district || '',
    ward: user?.ward || '',
    village: user?.village || '',
    pincode: user?.pincode || '',
    category: user?.category || '',
    occupation: user?.occupation || '',
    annual_income: user?.annual_income || '',
    land_acres: user?.land_acres || '',
    voter_id: user?.voter_id || '',
    religion: user?.religion || '',
    marital_status: user?.marital_status || '',
    disability: user?.disability || '',
    area_type: user?.area_type || 'rural',
    bpl_card: user?.bpl_card || '',
  });
  const [loading, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [openSections, setOpenSections] = useState({ personal: false, address: false, socioeconomic: false, identity: false });

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: null }));
    setSaved(false);
  };

  const toggleSection = (s) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.gender) e.gender = 'Required';
    if (!form.state) e.state = 'Required';
    if (!form.district.trim()) e.district = 'Required';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = '6 digits required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await API.put('/api/user/profile', form);
      login({ user: data, token: localStorage.getItem('nc_token') });
      setSaved(true);
      setTimeout(() => { if (onSaved) onSaved(data); }, 800);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const fields = ['full_name', 'gender', 'date_of_birth', 'state', 'district', 'category', 'occupation', 'annual_income', 'marital_status', 'religion', 'pincode', 'ward', 'village', 'area_type', 'bpl_card', 'voter_id'];
  const filled = fields.filter(f => form[f] && String(form[f]).trim() !== '').length;
  const completionPct = Math.round((filled / fields.length) * 100);
  const missing = fields.filter(f => !form[f] || String(form[f]).trim() === '');

  const missingLabels = {
    full_name: 'Full Name', gender: 'Gender', date_of_birth: 'Date of Birth',
    state: 'State', district: 'District', category: 'Caste Category',
    occupation: 'Occupation', annual_income: 'Annual Income', marital_status: 'Marital Status',
    religion: 'Religion', pincode: 'Pincode', ward: 'Ward/Taluka',
    village: 'Village/Area', area_type: 'Area Type', bpl_card: 'BPL Status', voter_id: 'Voter ID',
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '12px 14px', border: `1px solid ${errors[field] ? '#FECACA' : '#E2E8F0'}`,
    borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none',
    background: errors[field] ? '#FEF2F2' : '#F8FAFC', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 700, color: '#374151',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  const SectionCard = ({ id, icon, title, subtitle, color, children }) => (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: `5px solid ${color}`,
      borderRadius: 16, marginBottom: 20, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div
        onClick={() => toggleSection(id)}
        style={{
          padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          background: openSections[id] ? '#FFFFFF' : '#FAFBFC', transition: 'background 0.2s',
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{title}</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{subtitle}</div>
        </div>
        <span style={{ fontSize: 20, color: '#94A3B8', transition: 'transform 0.2s', transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </div>
      {openSections[id] && (
        <div style={{ padding: '0 24px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page on">
      <div className="hero-modern-saas" style={{ marginBottom: 32 }}>
        <div className="hero-saas-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FAF5FF', color: '#7C3AED', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <span>👤</span> Account Settings
          </div>
          <h1 className="hero-saas-title">Personal Profile</h1>
          <p className="hero-saas-desc">
            Manage your personal information to improve scheme recommendations and eligibility matching. Complete profiles unlock up to 3x more schemes.
          </p>
          <div className="hero-saas-stats">
            <div className="hero-saas-stat-card"><span>📊</span> {completionPct}% Complete</div>
            <div className="hero-saas-stat-card"><span>🎯</span> {filled}/{fields.length} Fields Filled</div>
            <div className="hero-saas-stat-card"><span>🔒</span> AES-256 Encrypted</div>
          </div>
        </div>

        <div className="hero-saas-visual">
          <div className="hero-floating-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>📊</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Profile Strength</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Eligibility impact</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Completion</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: completionPct >= 80 ? '#10B981' : completionPct >= 50 ? '#D97706' : '#DC2626' }}>{completionPct}%</span>
            </div>
            <div style={{ height: 8, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${completionPct}%`, background: completionPct >= 80 ? 'linear-gradient(90deg, #10B981, #34D399)' : completionPct >= 50 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' : 'linear-gradient(90deg, #EF4444, #F87171)', borderRadius: 100, transition: 'width 1s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div style={{
          background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14,
          padding: '16px 20px', marginBottom: 24, fontSize: 14, color: '#166534', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>✅</span> Profile updated! Your scheme matches will be re-calculated automatically.
        </div>
      )}

      <div style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '12px 0', marginBottom: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(248, 250, 252, 0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
      }}>
        <button onClick={onBack} style={{
          padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700,
          background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', cursor: 'pointer',
        }}>← Back to Dashboard</button>
        <button className="btn-apply-modern" onClick={save} disabled={loading} style={{
          padding: '12px 32px', fontSize: 15,
          background: saved ? '#16A34A' : undefined,
          boxShadow: saved ? '0 4px 6px -1px rgba(22, 163, 74, 0.2)' : undefined,
        }}>
          {loading ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      {missing.length > 0 && (
        <div style={{
          background: 'linear-gradient(to right, #F3E8FF, #F5F3FF)', border: '1px solid #E9D5FF',
          borderRadius: 16, padding: '20px 24px', marginBottom: 24,
          display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.05)'
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
            boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
          }}>✨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#4C1D95', marginBottom: 4 }}>
              AI Profile Suggestion
            </div>
            <div style={{ fontSize: 13, color: '#5B21B6', lineHeight: 1.5 }}>
              Completing your profile will instantly unlock <strong>up to 3x more eligible schemes</strong>. 
              Our AI recommends filling in your <strong style={{ color: '#4C1D95' }}>{missing.slice(0, 2).map(f => missingLabels[f]).join(' and ')}</strong> to maximize your benefits right now.
            </div>
          </div>
          <button onClick={() => toggleSection('socioeconomic')} style={{
            background: '#ffffff', color: '#7C3AED', border: '1px solid #D8B4FE', padding: '10px 20px',
            borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)'
          }}>
            Fix Profile
          </button>
        </div>
      )}

      <SectionCard id="personal" icon="👤" title="Personal Information" subtitle="Basic identity and demographic details" color="#2563EB">
        <div>
          <label style={labelStyle}>Full Name <span style={{ color: '#DC2626' }}>*</span></label>
          <input style={inputStyle('full_name')} value={form.full_name} onChange={set('full_name')} placeholder="As on Aadhaar" />
        </div>
        <div>
          <label style={labelStyle}>Gender <span style={{ color: '#DC2626' }}>*</span></label>
          <select style={inputStyle('gender')} value={form.gender} onChange={set('gender')}>
            <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Date of Birth</label>
          <input type="date" style={inputStyle('date_of_birth')} value={form.date_of_birth} onChange={set('date_of_birth')} />
        </div>
        <div>
          <label style={labelStyle}>Marital Status</label>
          <select style={inputStyle('marital_status')} value={form.marital_status} onChange={set('marital_status')}>
            <option value="">Select</option><option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Religion</label>
          <select style={inputStyle('religion')} value={form.religion} onChange={set('religion')}>
            <option value="">Select</option><option>Hindu</option><option>Muslim</option><option>Christian</option><option>Sikh</option><option>Buddhist</option><option>Jain</option><option>Parsi / Zoroastrian</option><option>Other</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Disability (if any)</label>
          <select style={inputStyle('disability')} value={form.disability} onChange={set('disability')}>
            <option value="">None</option><option value="yes">Yes — Divyangjan</option>
          </select>
        </div>
      </SectionCard>

      <SectionCard id="address" icon="📍" title="Address Details" subtitle="Location data for region-specific scheme matching" color="#10B981">
        <div>
          <label style={labelStyle}>State <span style={{ color: '#DC2626' }}>*</span></label>
          <select style={inputStyle('state')} value={form.state} onChange={set('state')}>
            <option value="">Select State</option>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>District <span style={{ color: '#DC2626' }}>*</span></label>
          <input style={inputStyle('district')} value={form.district} onChange={set('district')} placeholder="e.g. Latur" />
        </div>
        <div>
          <label style={labelStyle}>Ward / Taluka</label>
          <input style={inputStyle('ward')} value={form.ward} onChange={set('ward')} placeholder="Ward or Taluka name" />
        </div>
        <div>
          <label style={labelStyle}>Village / Area</label>
          <input style={inputStyle('village')} value={form.village} onChange={set('village')} placeholder="Village or locality" />
        </div>
        <div>
          <label style={labelStyle}>Pincode</label>
          <input style={inputStyle('pincode')} value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" />
        </div>
        <div>
          <label style={labelStyle}>Area Type</label>
          <select style={inputStyle('area_type')} value={form.area_type} onChange={set('area_type')}>
            <option value="rural">Rural</option>
            <option value="urban">Urban</option>
          </select>
        </div>
      </SectionCard>

      <SectionCard id="socioeconomic" icon="💰" title="Financial Information" subtitle="Income and economic status for eligibility assessment" color="#D97706">
        <div>
          <label style={labelStyle}>Caste Category</label>
          <select style={inputStyle('category')} value={form.category} onChange={set('category')}>
            <option value="">Select</option><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Occupation</label>
          <select style={inputStyle('occupation')} value={form.occupation} onChange={set('occupation')}>
            <option value="">Select Occupation</option>
            {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Annual Income (₹)</label>
          <input style={inputStyle('annual_income')} type="number" value={form.annual_income}
            onChange={e => setForm(p => ({ ...p, annual_income: e.target.value.replace(/[^0-9]/g, '') }))} placeholder="e.g. 120000" />
        </div>
        <div>
          <label style={labelStyle}>Land Holding (acres)</label>
          <input style={inputStyle('land_acres')} value={form.land_acres} onChange={set('land_acres')} placeholder="e.g. 2.5 (enter 0 if none)" />
        </div>
        <div>
          <label style={labelStyle}>BPL Card</label>
          <select style={inputStyle('bpl_card')} value={form.bpl_card} onChange={set('bpl_card')}>
            <option value="">Not Sure / No</option><option value="yes">Yes — Have BPL Card</option><option value="no">No BPL Card</option>
          </select>
        </div>
      </SectionCard>

      <SectionCard id="identity" icon="🪪" title="Identity Information" subtitle="Government-issued ID verification" color="#7C3AED">
        <div>
          <label style={labelStyle}>Voter ID</label>
          <input style={inputStyle('voter_id')} value={form.voter_id} onChange={set('voter_id')} placeholder="e.g. MH/18/142/0083921" />
        </div>
        <div>
          <label style={labelStyle}>Aadhaar (Masked)</label>
          <input style={{ ...inputStyle(''), background: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }}
            value={user?.aadhaar_number ? `XXXX-XXXX-${String(user.aadhaar_number).slice(-4)}` : 'Not provided'} disabled />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>Official Correction Request</div>
              <div style={{ fontSize: 12, color: '#A16207', lineHeight: 1.4 }}>
                Fields like Name, DOB, and Aadhaar can only be updated via official verification.
              </div>
            </div>
            <button className="btn-apply-modern" onClick={onComplaints} style={{ padding: '10px 20px', fontSize: 13, flexShrink: 0, background: '#D97706', boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.2)' }}>
              📝 Request Correction
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}