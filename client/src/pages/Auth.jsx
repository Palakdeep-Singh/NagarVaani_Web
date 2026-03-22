import { useState, useContext } from "react";
import API from "../api/api.js";
import { AuthContext } from "../context/AuthContext.jsx";

// ─── Step machine ────────────────────────────────────────────────────────────
// "phone"    → enter mobile number
// "otp"      → enter OTP
// "register" → new user: fill profile
// "done"     → logged in (redirects via App)

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const Auth = () => {
  const [tab, setTab] = useState("citizen"); // citizen | admin
  const [step, setStep] = useState("phone");   // phone | otp | register

  // Citizen fields
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Admin fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [form, setForm] = useState({
    full_name: "", gender: "", date_of_birth: "",
    state: "", district: "", ward: "", village: "", pincode: "",
    category: "", occupation: "", annual_income: "", land_acres: "",
    aadhaar_number: "", voter_id: "",
  });

  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) return alert("Enter a valid 10-digit mobile number");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/otp/send", { phone });
      alert("OTP sent! (dev mode OTP: " + res.data.otp + ")");
      setStep("otp");
    } catch (err) {
      alert(err.response?.data?.error ?? "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOTP = async () => {
    if (!/^\d{6}$/.test(otp)) return alert("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/otp/verify", { phone, otp });

      if (res.data.phoneVerified && !res.data.user) {
        // New user — go to registration
        setStep("register");
      } else {
        // Existing user — log in directly
        login(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.error ?? "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async () => {
    const required = ["full_name", "gender", "date_of_birth", "state", "district", "pincode", "category"];
    for (const f of required) {
      if (!form[f]) return alert(`Please fill in: ${f.replace(/_/g, " ")}`);
    }
    if (form.aadhaar_number && !/^\d{12}$/.test(form.aadhaar_number))
      return alert("Aadhaar must be 12 digits");
    if (!/^\d{6}$/.test(form.pincode))
      return alert("Pincode must be 6 digits");

    setLoading(true);
    try {
      const res = await API.post("/api/auth/register", { phone, ...form });
      login(res.data);
    } catch (err) {
      alert(err.response?.data?.error ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Admin Login ───────────────────────────────────────────────────────────
  const adminLogin = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Invalid email");
    if (password.length < 6) return alert("Password too short");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/admin", { email, password });
      login(res.data);
    } catch (err) {
      alert(err.response?.data?.error ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container">
      <h2>🏛 NagarVaani</h2>

      {/* Tabs — only show when not mid-registration */}
      {step !== "register" && (
        <div className="tabs">
          <div className={`tab ${tab === "citizen" ? "active" : ""}`}
            onClick={() => { setTab("citizen"); setStep("phone"); }}>
            Citizen
          </div>
          <div className={`tab ${tab === "admin" ? "active" : ""}`}
            onClick={() => { setTab("admin"); setStep("phone"); }}>
            Admin
          </div>
        </div>
      )}

      {/* ── CITIZEN FLOW ── */}
      {tab === "citizen" && (
        <>
          {step === "phone" && (
            <>
              <p style={{ color: "#555", fontSize: 14 }}>Enter your mobile number to continue</p>
              <input
                placeholder="10-digit Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                inputMode="numeric"
              />
              <button onClick={sendOTP} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <p style={{ color: "#555", fontSize: 14 }}>
                OTP sent to <strong>+91 {phone}</strong>
              </p>
              <input
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                inputMode="numeric"
              />
              <button onClick={verifyOTP} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                onClick={() => { setStep("phone"); setOtp(""); }}
                style={{ background: "#888", marginTop: 8 }}
              >
                ← Change Number
              </button>
            </>
          )}

          {step === "register" && (
            <>
              <h3 style={{ color: "#0a3d62" }}>Complete Your Profile</h3>
              <p style={{ color: "#555", fontSize: 13 }}>
                First time here! Fill in your details to register.
              </p>

              <label className="field-label">Full Name *</label>
              <input placeholder="Full Name" value={form.full_name} onChange={set("full_name")} />

              <label className="field-label">Gender *</label>
              <select value={form.gender} onChange={set("gender")}>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <label className="field-label">Date of Birth *</label>
              <input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />

              <hr style={{ margin: "16px 0", borderColor: "#eee" }} />
              <p style={{ fontWeight: "bold", color: "#0a3d62", margin: "8px 0" }}>📍 Address</p>

              <label className="field-label">State *</label>
              <select value={form.state} onChange={set("state")}>
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>

              <label className="field-label">District *</label>
              <input placeholder="District" value={form.district} onChange={set("district")} />

              <label className="field-label">Ward</label>
              <input placeholder="Ward" value={form.ward} onChange={set("ward")} />

              <label className="field-label">Village / Area</label>
              <input placeholder="Village / Area" value={form.village} onChange={set("village")} />

              <label className="field-label">Pincode *</label>
              <input placeholder="6-digit Pincode" value={form.pincode}
                onChange={(e) => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, "") }))}
                maxLength={6} inputMode="numeric" />

              <hr style={{ margin: "16px 0", borderColor: "#eee" }} />
              <p style={{ fontWeight: "bold", color: "#0a3d62", margin: "8px 0" }}>📋 Details</p>

              <label className="field-label">Category *</label>
              <select value={form.category} onChange={set("category")}>
                <option value="">Select Category</option>
                <option>General</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
                <option>EWS</option>
              </select>

              <label className="field-label">Occupation</label>
              <input placeholder="Occupation" value={form.occupation} onChange={set("occupation")} />

              <label className="field-label">Annual Income (₹)</label>
              <input placeholder="Annual Income" value={form.annual_income}
                onChange={(e) => setForm(f => ({ ...f, annual_income: e.target.value.replace(/\D/g, "") }))}
                inputMode="numeric" />

              <label className="field-label">Land (acres)</label>
              <input placeholder="Land in acres (if any)" value={form.land_acres}
                onChange={set("land_acres")} inputMode="decimal" />

              <hr style={{ margin: "16px 0", borderColor: "#eee" }} />
              <p style={{ fontWeight: "bold", color: "#0a3d62", margin: "8px 0" }}>🪪 Identity</p>

              <label className="field-label">Aadhaar Number</label>
              <input placeholder="12-digit Aadhaar" value={form.aadhaar_number}
                onChange={(e) => setForm(f => ({ ...f, aadhaar_number: e.target.value.replace(/\D/g, "") }))}
                maxLength={12} inputMode="numeric" />

              <label className="field-label">Voter ID</label>
              <input placeholder="Voter ID (optional)" value={form.voter_id} onChange={set("voter_id")} />

              <button onClick={register} disabled={loading} style={{ marginTop: 20 }}>
                {loading ? "Registering..." : "✅ Complete Registration"}
              </button>
            </>
          )}
        </>
      )}

      {/* ── ADMIN FLOW ── */}
      {tab === "admin" && step !== "register" && (
        <>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <button onClick={adminLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </>
      )}
    </div>
  );
};

export default Auth;