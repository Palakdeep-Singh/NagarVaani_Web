/**
 * EditProfile.jsx — Full profile editing with all fields
 * Place: client/src/pages/EditProfile.jsx
 */
import { useState, useContext } from 'react';
import API from '../api/api.js';
import { AuthContext } from '../context/AuthContext.jsx';

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"];

const OCCUPATIONS = ["Farmer / Kisan", "Agricultural Labour", "Animal Husbandry / Dairy", "Fisherman / Fisher", "Daily Wage Labour", "Construction Worker", "Artisan / Craftsman", "Carpenter", "Blacksmith / Lohar", "Weaver / Handloom", "Tailor / Darzi", "Barber / Nai", "Potter / Kumhar", "Goldsmith / Sunar", "Cobbler / Mochi", "Street Vendor / Hawker", "Small Shopkeeper", "Business / Trader", "MSME / Small Enterprise", "Transport / Driver", "Domestic Worker", "Asha Worker / Anganwadi", "Social / NGO Worker", "Student", "Salaried (Private)", "Salaried (Govt)", "Self Employed", "Homemaker", "Retired / Pensioner", "Unemployed / Job Seeker", "Other"];

export default function EditProfile({ onBack, onSaved }) {
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

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: null }));
    setSaved(false);
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.gender) e.gender = 'Required';
    if (!form.state) e.state = 'Required';
    if (!form.district.trim()) e.district = 'Required';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = '6 digits required';
    if (form.aadhaar_number && !/^\d{12}$/.test(String(form.aadhaar_number).replace(/\s/g, ''))) e.aadhaar_number = '12 digits required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await API.put('/api/user/profile', form);
      // Update auth context with new user data
      login({ user: data, token: localStorage.getItem('token') });
      setSaved(true);
      setTimeout(() => { if (onSaved) onSaved(data); }, 800);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const Field = ({ label, field, type = 'text', required = false, children, hint }) => (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span style={{ color: 'var(--rd)' }}>*</span>}
      </label>
      {children || (
        <input className="form-input" type={type} value={form[field]}
          onChange={set(field)} placeholder={hint || label}
          style={errors[field] ? { borderColor: 'var(--rd)' } : {}} />
      )}
      {errors[field] && <div style={{ fontSize: 10, color: 'var(--rd)', marginTop: 3 }}>{errors[field]}</div>}
    </div>
  );

  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Edit Profile</span></div>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1>✏️ Edit Profile</h1>
          <p>Update your details to get better scheme matches · All data is encrypted</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn b-gh" onClick={onBack}>← Back</button>
          <button className="btn b-sf" onClick={save} disabled={loading}
            style={{ minWidth: 100 }}>
            {loading ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{
          background: 'var(--gn-l)', border: '.5px solid var(--gn)', borderRadius: 'var(--r)',
          padding: '11px 14px', marginBottom: 14, fontSize: 12, color: 'var(--gn)', fontWeight: 600
        }}>
          ✅ Profile updated! Your scheme matches will be re-calculated.
        </div>
      )}

      {/* Section: Personal */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 14, fontSize: 13 }}>👤 Personal Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Full Name" field="full_name" required hint="As on Aadhaar" />
          <div className="form-group">
            <label className="form-label">Gender <span style={{ color: 'var(--rd)' }}>*</span></label>
            <select className="form-input" value={form.gender} onChange={set('gender')}
              style={errors.gender ? { borderColor: 'var(--rd)' } : {}}>
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
            {errors.gender && <div style={{ fontSize: 10, color: 'var(--rd)', marginTop: 3 }}>{errors.gender}</div>}
          </div>
          <Field label="Date of Birth" field="date_of_birth" type="date" />
          <div className="form-group">
            <label className="form-label">Marital Status</label>
            <select className="form-input" value={form.marital_status} onChange={set('marital_status')}>
              <option value="">Select</option>
              <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Religion</label>
            <select className="form-input" value={form.religion} onChange={set('religion')}>
              <option value="">Select</option>
              <option>Hindu</option><option>Muslim</option><option>Christian</option>
              <option>Sikh</option><option>Buddhist</option><option>Jain</option>
              <option>Parsi / Zoroastrian</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Disability (if any)</label>
            <select className="form-input" value={form.disability} onChange={set('disability')}>
              <option value="">None</option>
              <option value="yes">Yes — Divyangjan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Address */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 14, fontSize: 13 }}>📍 Address</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-group">
            <label className="form-label">State <span style={{ color: 'var(--rd)' }}>*</span></label>
            <select className="form-input" value={form.state} onChange={set('state')}
              style={errors.state ? { borderColor: 'var(--rd)' } : {}}>
              <option value="">Select State</option>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
            {errors.state && <div style={{ fontSize: 10, color: 'var(--rd)', marginTop: 3 }}>{errors.state}</div>}
          </div>
          <Field label="District" field="district" required hint="e.g. Latur" />
          <Field label="Ward / Taluka" field="ward" hint="Ward or Taluka name" />
          <Field label="Village / Area" field="village" hint="Village or locality" />
          <Field label="Pincode" field="pincode" hint="6-digit pincode" />
          <div className="form-group">
            <label className="form-label">Area Type</label>
            <select className="form-input" value={form.area_type} onChange={set('area_type')}>
              <option value="rural">Rural</option>
              <option value="urban">Urban</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Socioeconomic */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 14, fontSize: 13 }}>📋 Socioeconomic Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Caste Category <span style={{ color: 'var(--rd)' }}>*</span></label>
            <select className="form-input" value={form.category} onChange={set('category')}>
              <option value="">Select</option>
              <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Occupation</label>
            <select className="form-input" value={form.occupation} onChange={set('occupation')}>
              <option value="">Select Occupation</option>
              {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Annual Income (₹)</label>
            <input className="form-input" type="number" value={form.annual_income}
              onChange={e => setForm(p => ({ ...p, annual_income: e.target.value.replace(/[^0-9]/g, '') }))}
              placeholder="e.g. 120000" />
            <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 3 }}>Used for income-based scheme eligibility</div>
          </div>
          <Field label="Land Holding (acres)" field="land_acres" hint="e.g. 2.5 (enter 0 if none)" />
          <div className="form-group">
            <label className="form-label">BPL Card</label>
            <select className="form-input" value={form.bpl_card} onChange={set('bpl_card')}>
              <option value="">Not Sure / No</option>
              <option value="yes">Yes — Have BPL Card</option>
              <option value="no">No BPL Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Identity */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 14, fontSize: 13 }}>🪪 Identity Documents</div>
        <div style={{
          background: 'var(--am-l)', border: '.5px solid var(--am)', borderRadius: 'var(--rs)',
          padding: '9px 12px', marginBottom: 12, fontSize: 11.5, color: 'var(--am)'
        }}>
          ⚠️ Aadhaar number is encrypted with AES-256-GCM. It is never stored in plain text.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Voter ID</label>
            <input className="form-input" value={form.voter_id} onChange={set('voter_id')}
              placeholder="e.g. MH/18/142/0083921" />
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
          To update Aadhaar number, please contact District Administration for re-verification.
        </div>
      </div>

      {/* Save button at bottom */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8, marginBottom: 20 }}>
        <button className="btn b-gh" onClick={onBack}>← Cancel</button>
        <button className="btn b-sf" onClick={save} disabled={loading} style={{ minWidth: 130 }}>
          {loading ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Profile'}
        </button>
      </div>
    </div>
  );
}