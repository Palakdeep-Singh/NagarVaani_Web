import { useState, useContext } from "react";
import API from "../api/api.js";
import { AuthContext } from "../context/AuthContext.jsx";

const ROLES = { district: "District Admin", state: "State Authority", central: "Central Command" };
const JURS = { district: "Latur, Maharashtra", state: "Maharashtra", central: "New Delhi — India" };

export default function LoginAdmin() {
  const { loginAdmin, switchToUser } = useContext(AuthContext);
  const [role, setRole] = useState("district");
  const [email, setEmail] = useState("DC-MAH-LAT-001");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !password) return alert("Enter credentials");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/admin", { email, password });
      loginAdmin(res.data);
    } catch (e) { alert(e.response?.data?.error || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-screen on">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-ic">🏛</div>
          <div className="login-brand">NagarikConnect Admin <span>Official Government Portal</span></div>
        </div>
        <div className="login-title">Admin Login</div>
        <div className="login-sub">Select your authority level to continue</div>

        <div className="login-role-tabs">
          {Object.entries(ROLES).map(([k, v]) => (
            <button key={k} className={`lrt${role === k ? " on" : ""}`} onClick={() => setRole(k)}>
              {k === "district" ? "🏛" : k === "state" ? "🗺" : "🏛"} {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Employee ID / Official Email</label>
          <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Enter password" onKeyDown={e => e.key === "Enter" && doLogin()} />
        </div>
        <div className="form-group">
          <label className="form-label">Jurisdiction</label>
          <input className="form-input" value={JURS[role]} disabled />
        </div>
        <button className="login-btn" onClick={doLogin} disabled={loading}>
          {loading ? "Logging in..." : `Login as ${ROLES[role]} →`}
        </button>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "var(--t3)" }}>
          Citizen?{" "}
          <a href="#" onClick={e => { e.preventDefault(); switchToUser(); }}
            style={{ color: "var(--nv)", fontWeight: 600 }}>Back to Citizen Login</a>
        </div>
      </div>
      <div className="login-footer">Restricted Access · For Authorized Officials Only</div>
    </div>
  );
}