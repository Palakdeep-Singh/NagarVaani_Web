/**
 * RegisterForm.jsx — Complete registration with all profile fields
 * Place: client/src/pages/RegisterForm.jsx
 */
import { useState } from "react";
import API from "../api/api.js";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Puducherry", "Chandigarh",
];

const OCCUPATIONS = [
  "Farmer / Kisan", "Agricultural Labour", "Animal Husbandry / Dairy",
  "Fisherman / Fisher", "Daily Wage Labour", "Construction Worker",
  "Artisan / Craftsman", "Carpenter", "Blacksmith / Lohar", "Weaver / Handloom",
  "Tailor / Darzi", "Barber / Nai", "Potter / Kumhar", "Goldsmith / Sunar",
  "Cobbler / Mochi", "Street Vendor / Hawker", "Small Shopkeeper",
  "Business / Trader", "MSME / Small Enterprise", "Transport / Driver",
  "Domestic Worker", "Asha Worker / Anganwadi", "Social / NGO Worker",
  "Student", "Salaried (Private)", "Salaried (Govt)", "Self Employed",
  "Homemaker", "Retired / Pensioner", "Unemployed / Job Seeker", "Other",
];

const STEP_LABELS = ["Personal", "Address", "Socioeconomic", "Identity"];

export default function RegisterForm({ phone, onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Personal
    full_name: "", gender: "", date_of_birth: "",
    religion: "", marital_status: "", disability: "no",
    // Address
    state: "", district: "", ward: "", village: "", booth: "",
    pincode: "", area_type: "rural",
    // Socioeconomic
    category: "", occupation: "", annual_income: "",
    land_acres: "", bpl_card: "no",
    // Identity
    aadhaar_number: "", voter_id: "",
  });

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: null }));
  };

  const setNum = (f) => (e) =>
    setForm(p => ({ ...p, [f]: e.target.value.replace(/\D/g, "") }));

  // Per-step validation
  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.full_name.trim()) e.full_name = "Required";
      if (!form.gender) e.gender = "Required";
    }
    if (s === 1) {
      if (!form.state) e.state = "Required";
      if (!form.district.trim()) e.district = "Required";
      if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = "Must be 6 digits";
    }
    if (s === 2) {
      if (!form.category) e.category = "Required";
    }
    if (s === 3) {
      if (form.aadhaar_number && !/^\d{12}$/.test(form.aadhaar_number))
        e.aadhaar_number = "Must be 12 digits";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const submit = async () => {
    if (!validate(3)) return;
    setLoading(true);
    try {
      const res = await API.post("/api/auth/register", { phone, ...form });
      onSuccess(res.data);
    } catch (e) {
      alert(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const Err = ({ f }) => errors[f]
    ? <div style={{ fontSize: 10, color: "var(--rd)", marginTop: 3 }}>{errors[f]}</div>
    : null;

  const inputStyle = (f) => ({
    ...(errors[f] ? { borderColor: "var(--rd)" } : {}),
  });

  return (
    <div className="login-screen on">
      <div className="login-box" style={{ width: 440, maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div className="login-logo">
          <div className="login-logo-ic">🇮🇳</div>
          <div className="login-brand">NagarikConnect <span>New Citizen Registration</span></div>
        </div>
        <div className="login-title">Complete Your Profile</div>
        <div className="login-sub" style={{ marginBottom: 16 }}>
          +91 {phone} · Step {step + 1} of 4
        </div>

        {/* Step progress bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {STEP_LABELS.map((l, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: 4, borderRadius: 4,
                background: i <= step ? "var(--nv)" : "var(--gy-l)",
                transition: "background .3s",
              }} />
              <div style={{
                fontSize: 9.5, marginTop: 3, textAlign: "center",
                color: i <= step ? "var(--nv)" : "var(--t3)",
                fontWeight: i === step ? 700 : 400,
              }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ── STEP 0: Personal ── */}
        {step === 0 && (
          <>
            <div style={sectionStyle}>👤 Personal Details</div>
            <div className="form-group">
              <label className="form-label">Full Name * <span style={{ fontWeight: 400, color: "var(--t3)", fontSize: 10 }}>(as on Aadhaar)</span></label>
              <input className="form-input" placeholder="Full Name" value={form.full_name}
                onChange={set("full_name")} style={inputStyle("full_name")} />
              <Err f="full_name" />
            </div>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-input" value={form.gender} onChange={set("gender")} style={inputStyle("gender")}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
                <Err f="gender" />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
              </div>
            </div>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Religion</label>
                <select className="form-input" value={form.religion} onChange={set("religion")}>
                  <option value="">Select</option>
                  <option>Hindu</option><option>Muslim</option><option>Christian</option>
                  <option>Sikh</option><option>Buddhist</option><option>Jain</option>
                  <option>Parsi / Zoroastrian</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Marital Status</label>
                <select className="form-input" value={form.marital_status} onChange={set("marital_status")}>
                  <option value="">Select</option>
                  <option>Single</option><option>Married</option>
                  <option>Widowed</option><option>Divorced</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Disability (Divyangjan)</label>
              <select className="form-input" value={form.disability} onChange={set("disability")}>
                <option value="no">No disability</option>
                <option value="yes">Yes — Divyangjan (Person with Disability)</option>
              </select>
            </div>
          </>
        )}

        {/* ── STEP 1: Address ── */}
        {step === 1 && (
          <>
            <div style={sectionStyle}>📍 Address</div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <select className="form-input" value={form.state} onChange={set("state")} style={inputStyle("state")}>
                <option value="">Select State</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
              <Err f="state" />
            </div>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">District *</label>
                <input className="form-input" placeholder="e.g. Latur"
                  value={form.district} onChange={set("district")} style={inputStyle("district")} />
                <Err f="district" />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-input" placeholder="6-digit"
                  value={form.pincode} onChange={setNum("pincode")} maxLength={6} style={inputStyle("pincode")} />
                <Err f="pincode" />
              </div>
            </div>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Ward / Taluka</label>
                <input className="form-input" placeholder="Ward or Taluka"
                  value={form.ward} onChange={set("ward")} />
              </div>
              <div className="form-group">
                <label className="form-label">Village / Locality</label>
                <input className="form-input" placeholder="Village name"
                  value={form.village} onChange={set("village")} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Booth / Polling Station</label>
              <input className="form-input" placeholder="e.g. Booth No. 42 / Primary School"
                value={form.booth} onChange={set("booth")} />
            </div>
            <div className="form-group">
              <label className="form-label">Area Type</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["rural", "urban"].map(t => (
                  <label key={t} style={{
                    flex: 1, display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 14px", border: `.5px solid ${form.area_type === t ? "var(--nv)" : "var(--gy-m)"}`,
                    borderRadius: "var(--rs)", cursor: "pointer",
                    background: form.area_type === t ? "var(--nv-l)" : "var(--wh)",
                    color: form.area_type === t ? "var(--nv)" : "var(--t2)",
                    fontWeight: form.area_type === t ? 700 : 400,
                    fontSize: 13, transition: "all .2s",
                  }}>
                    <input type="radio" name="area_type" value={t}
                      checked={form.area_type === t} onChange={set("area_type")}
                      style={{ accentColor: "var(--nv)" }} />
                    {t === "rural" ? "🏘 Rural" : "🏙 Urban"}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: Socioeconomic ── */}
        {step === 2 && (
          <>
            <div style={sectionStyle}>📋 Socioeconomic Details</div>
            <div style={{
              background: "var(--sf-l)", border: ".5px solid var(--sf-m)",
              borderRadius: "var(--rs)", padding: "9px 12px", marginBottom: 12,
              fontSize: 11.5, color: "var(--sf)",
            }}>
              💡 These details determine your scheme eligibility. Fill accurately for best matches.
            </div>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Caste Category *</label>
                <select className="form-input" value={form.category} onChange={set("category")} style={inputStyle("category")}>
                  <option value="">Select</option>
                  <option>General</option><option>OBC</option>
                  <option>SC</option><option>ST</option><option>EWS</option>
                </select>
                <Err f="category" />
              </div>
              <div className="form-group">
                <label className="form-label">Occupation</label>
                <select className="form-input" value={form.occupation} onChange={set("occupation")}>
                  <option value="">Select Occupation</option>
                  {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Annual Family Income (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 120000"
                  value={form.annual_income}
                  onChange={e => setForm(p => ({ ...p, annual_income: e.target.value.replace(/[^0-9.]/g, "") }))} />
                <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 3 }}>
                  Used for income-based scheme eligibility
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Land Holding (acres)</label>
                <input className="form-input" placeholder="e.g. 2.5 (0 if none)"
                  value={form.land_acres} onChange={set("land_acres")} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">BPL Card Status</label>
              <select className="form-input" value={form.bpl_card} onChange={set("bpl_card")}>
                <option value="no">No BPL Card / Not Sure</option>
                <option value="yes">Yes — I have a BPL Card</option>
              </select>
            </div>
          </>
        )}

        {/* ── STEP 3: Identity ── */}
        {step === 3 && (
          <>
            <div style={sectionStyle}>🪪 Identity Documents</div>
            <div style={{
              background: "var(--am-l)", border: ".5px solid var(--am)",
              borderRadius: "var(--rs)", padding: "9px 12px", marginBottom: 14,
              fontSize: 11.5, color: "var(--am)",
            }}>
              🔒 All sensitive data is encrypted with AES-256-GCM before storage.
              Your Aadhaar number is never stored in plain text.
            </div>
            <div className="form-group">
              <label className="form-label">Aadhaar Number</label>
              <input className="form-input" placeholder="12-digit Aadhaar number"
                value={form.aadhaar_number} onChange={setNum("aadhaar_number")}
                maxLength={12} style={inputStyle("aadhaar_number")} />
              <Err f="aadhaar_number" />
              {form.aadhaar_number.length === 12 && (
                <div style={{ fontSize: 10, color: "var(--gn)", marginTop: 3 }}>✓ Valid format</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Voter ID <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
              <input className="form-input" placeholder="e.g. MH/18/142/0083921"
                value={form.voter_id} onChange={set("voter_id")} />
            </div>

            {/* Summary before submit */}
            <div style={{
              background: "var(--nv-l)", border: ".5px solid var(--nv-m)",
              borderRadius: "var(--r)", padding: 12, marginTop: 8,
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--nv)", marginBottom: 8 }}>
                📋 Registration Summary
              </div>
              <div style={{ fontSize: 11, color: "var(--t2)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px" }}>
                {[
                  ["Name", form.full_name || "—"],
                  ["Gender", form.gender || "—"],
                  ["State", form.state || "—"],
                  ["District", form.district || "—"],
                  ["Category", form.category || "—"],
                  ["Occupation", form.occupation || "—"],
                  ["Income", form.annual_income ? "₹" + Number(form.annual_income).toLocaleString("en-IN") : "—"],
                  ["Area", form.area_type === "urban" ? "Urban" : "Rural"],
                  ["BPL Card", form.bpl_card === "yes" ? "Yes" : "No"],
                  ["Religion", form.religion || "—"],
                ].map(([k, v]) => (
                  <div key={k}><span style={{ color: "var(--t3)" }}>{k}:</span> <strong>{v}</strong></div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          {step > 0 && (
            <button className="login-btn" onClick={back}
              style={{ background: "var(--gy-m)", flex: "0 0 80px" }}>
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button className="login-btn sf" onClick={next} style={{ flex: 1 }}>
              Next: {STEP_LABELS[step + 1]} →
            </button>
          ) : (
            <button className="login-btn sf" onClick={submit} disabled={loading} style={{ flex: 1 }}>
              {loading ? "⏳ Registering..." : "✅ Complete Registration →"}
            </button>
          )}
        </div>
      </div>
      <div className="login-footer">
        Government of India · Secure Portal · All data encrypted
      </div>
    </div>
  );
}

const sectionStyle = {
  fontSize: 11, fontWeight: 700, color: "var(--nv)",
  margin: "4px 0 12px",
  textTransform: "uppercase", letterSpacing: ".06em",
  borderBottom: ".5px solid var(--gy-l)", paddingBottom: 6,
};

const gridTwo = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };