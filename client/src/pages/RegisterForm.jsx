import { useState } from "react";
import API from "../api/api.js";

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"];

export default function RegisterForm({ phone, onSuccess }) {
  const [form, setForm] = useState({
    full_name: "", gender: "", date_of_birth: "",
    state: "", district: "", ward: "", village: "", pincode: "",
    category: "", occupation: "", annual_income: "", land_acres: "",
    aadhaar_number: "", voter_id: "",
  });
  const [loading, setLoading] = useState(false);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const submit = async () => {
    const req = ["full_name", "gender", "date_of_birth", "state", "district", "pincode", "category"];
    for (const f of req) if (!form[f]) return alert("Please fill: " + f.replace(/_/g, " "));
    if (form.aadhaar_number && !/^\d{12}$/.test(form.aadhaar_number)) return alert("Aadhaar must be 12 digits");
    if (!/^\d{6}$/.test(form.pincode)) return alert("Pincode must be 6 digits");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/register", { phone, ...form });
      onSuccess(res.data);
    } catch (e) { alert(e.response?.data?.error || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-screen on">
      <div className="login-box" style={{ width: 440, maxHeight: "90vh", overflowY: "auto" }}>
        <div className="login-logo">
          <div className="login-logo-ic">🇮🇳</div>
          <div className="login-brand">NagarikConnect <span>New Citizen Registration</span></div>
        </div>
        <div className="login-title">Complete Your Profile</div>
        <div className="login-sub" style={{ marginBottom: 16 }}>First time? Fill in your details to register. +91 {phone}</div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--nv)", margin: "10px 0 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>👤 Personal Details</div>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" placeholder="Full Name" value={form.full_name} onChange={set("full_name")} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select className="form-input" value={form.gender} onChange={set("gender")}>
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth *</label>
            <input className="form-input" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--nv)", margin: "10px 0 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>📍 Address</div>
        <div className="form-group">
          <label className="form-label">State *</label>
          <select className="form-input" value={form.state} onChange={set("state")}>
            <option value="">Select State</option>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">District *</label>
            <input className="form-input" placeholder="District" value={form.district} onChange={set("district")} />
          </div>
          <div className="form-group">
            <label className="form-label">Pincode *</label>
            <input className="form-input" placeholder="6-digit" value={form.pincode}
              onChange={e => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, "") }))} maxLength={6} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Ward</label>
            <input className="form-input" placeholder="Ward" value={form.ward} onChange={set("ward")} />
          </div>
          <div className="form-group">
            <label className="form-label">Village / Area</label>
            <input className="form-input" placeholder="Village" value={form.village} onChange={set("village")} />
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--nv)", margin: "10px 0 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>📋 Socioeconomic Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input" value={form.category} onChange={set("category")}>
              <option value="">Select</option>
              <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Occupation</label>
            <input className="form-input" placeholder="Farmer / Labour..." value={form.occupation} onChange={set("occupation")} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Annual Income (₹)</label>
            <input className="form-input" placeholder="120000" value={form.annual_income}
              onChange={e => setForm(p => ({ ...p, annual_income: e.target.value.replace(/\D/g, "") }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Land (acres)</label>
            <input className="form-input" placeholder="2.4" value={form.land_acres} onChange={set("land_acres")} />
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--nv)", margin: "10px 0 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>🪪 Identity Documents</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Aadhaar Number</label>
            <input className="form-input" placeholder="12-digit Aadhaar" value={form.aadhaar_number}
              onChange={e => setForm(p => ({ ...p, aadhaar_number: e.target.value.replace(/\D/g, "") }))} maxLength={12} />
          </div>
          <div className="form-group">
            <label className="form-label">Voter ID</label>
            <input className="form-input" placeholder="Voter ID (optional)" value={form.voter_id} onChange={set("voter_id")} />
          </div>
        </div>

        <button className="login-btn sf" onClick={submit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? "Registering..." : "Complete Registration →"}
        </button>
      </div>
      <div className="login-footer">Government of India · Secure Portal · All data encrypted</div>
    </div>
  );
}