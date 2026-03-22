import { useState, useContext } from "react";
import API from "../api/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import RegisterForm from "./RegisterForm.jsx";

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh", "Andaman and Nicobar Islands", "Lakshadweep", "Dadra and Nagar Haveli", "Daman and Diu"];

export default function LoginUser() {
  const { login, switchToAdmin } = useContext(AuthContext);
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) return alert("Enter a valid 10-digit mobile number");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/otp/send", { phone });
      alert("OTP: " + res.data.otp + " (dev mode)");
      setStep("otp");
    } catch (e) { alert(e.response?.data?.error || "Failed to send OTP"); }
    finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    if (!/^\d{6}$/.test(otp)) return alert("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/otp/verify", { phone, otp });
      if (res.data.phoneVerified && !res.data.user) { setStep("register"); }
      else { login(res.data); }
    } catch (e) { alert(e.response?.data?.error || "OTP verification failed"); }
    finally { setLoading(false); }
  };

  if (step === "register") return <RegisterForm phone={phone} onSuccess={login} />;

  return (
    <div className="login-screen on">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-ic">🇮🇳</div>
          <div className="login-brand">NagarikConnect <span>Smart Governance Platform</span></div>
        </div>
        <div className="wa-login-note">💬 Came from WhatsApp? Your profile is already ready!</div>
        <div className="login-title">Citizen Login</div>
        <div className="login-sub">
          Track your schemes, milestones and complaints!</div>

        {step === "phone" && (
          <>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input className="form-input" type="tel" placeholder="9876543210"
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} maxLength={10} />
            </div>
            <button className="login-btn sf" onClick={sendOTP} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP →"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="form-group">
              <label className="form-label">Mobile</label>
              <input className="form-input" value={"+91 " + phone} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input className="form-input" type="text" placeholder="6-digit OTP"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} />
            </div>
            <button className="login-btn sf" onClick={verifyOTP} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login →"}
            </button>
            <button className="login-btn" onClick={() => { setStep("phone"); setOtp(""); }}
              style={{ background: "#888", marginTop: 8 }}>
              ← Change Number
            </button>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "var(--t3)" }}>
          Admin login?{" "}
          <a href="#" onClick={e => { e.preventDefault(); switchToAdmin(); }}
            style={{ color: "var(--nv)", fontWeight: 600 }}>Click here</a>
        </div>
      </div>
      <div className="login-footer">Government of India · Secure Portal · Data Protected</div>
    </div>
  );
}