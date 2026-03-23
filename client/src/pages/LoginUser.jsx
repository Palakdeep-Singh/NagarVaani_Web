/**
 * LoginUser.jsx — Fixed
 * 
 * FIX 1: was calling login(res.data) — AuthContext exports loginCitizen, not login.
 *         That undefined call was silently crashing → "OTP verification failed".
 * 
 * FIX 2: After OTP verify succeeds, if server returns role=district/state/central
 *         that means an admin's phone was used. Block them and redirect to Admin Login.
 */
import { useState, useContext } from 'react';
import API from '../api/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import RegisterForm from './RegisterForm.jsx';

export default function LoginUser() {
  const { loginCitizen, switchToAdmin } = useContext(AuthContext); // FIX: loginCitizen not login

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');  // show OTP in dev mode without alert()

  const sendOTP = async () => {
    setError('');
    setDevOtp('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/api/auth/otp/send', { phone });
      // Dev mode: server returns OTP in response — show inline, no alert()
      if (res.data.otp) setDevOtp(res.data.otp);
      setStep('otp');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/api/auth/otp/verify', { phone, otp });
      const data = res.data;

      // FIX 2: Block admin accounts from using citizen login
      // If role is district/state/central, this is an admin — redirect them
      const adminRoles = ['district', 'state', 'central'];
      if (data.role && adminRoles.includes(data.role) && !data.needsRegister) {
        setError('This phone is registered as a Government Official. Please use Admin Login.');
        setStep('phone');
        setOtp('');
        return;
      }

      if (data.phoneVerified && !data.user && !data.token) {
        // New user — go to registration
        setStep('register');
      } else {
        // Existing citizen — login
        // FIX 1: was login(data) — function is loginCitizen(userData, jwt)
        loginCitizen(data.user || data, data.token);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = (data) => {
    // Called by RegisterForm after successful registration
    loginCitizen(data.user || data, data.token);
  };

  if (step === 'register') {
    return <RegisterForm phone={phone} onSuccess={handleRegisterSuccess} />;
  }

  return (
    <div className="login-screen on">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-ic">🇮🇳</div>
          <div className="login-brand">
            NagarikConnect
            <span>Smart Governance Platform</span>
          </div>
        </div>

        <div className="wa-login-note">
          💬 Came from WhatsApp? Your profile is already ready!
        </div>

        <div className="login-title">Citizen Login</div>
        <div className="login-sub">Track your schemes, milestones and complaints</div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: '#FDF2F2', border: '.5px solid var(--rd)',
            borderRadius: 'var(--rs)', padding: '8px 12px',
            marginBottom: 12, fontSize: 12, color: 'var(--rd)',
          }}>
            ❌ {error}
            {error.includes('Government Official') && (
              <span
                onClick={switchToAdmin}
                style={{
                  marginLeft: 8, fontWeight: 700, cursor: 'pointer',
                  color: 'var(--nv)', textDecoration: 'underline'
                }}>
                Go to Admin Login →
              </span>
            )}
          </div>
        )}

        {step === 'phone' && (
          <>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                className="form-input"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && sendOTP()}
                maxLength={10}
              />
            </div>
            <button className="login-btn sf" onClick={sendOTP} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="form-group">
              <label className="form-label">Mobile</label>
              <input className="form-input" value={'+91 ' + phone} disabled />
            </div>

            {/* Dev mode OTP display — inline, no alert() popup */}
            {devOtp && (
              <div style={{
                background: 'var(--gn-l)', border: '.5px solid var(--gn)',
                borderRadius: 'var(--rs)', padding: '8px 12px',
                marginBottom: 10, fontSize: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: 'var(--t2)' }}>
                  🔐 Dev OTP:&nbsp;
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--gn)', letterSpacing: 2 }}>
                    {devOtp}
                  </strong>
                </span>
                <button
                  onClick={() => { setOtp(devOtp); setDevOtp(''); }}
                  style={{
                    fontSize: 10, padding: '2px 8px', border: '.5px solid var(--gn)',
                    borderRadius: 4, background: 'transparent', color: 'var(--gn)',
                    cursor: 'pointer', fontWeight: 700
                  }}>
                  Fill
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                placeholder="6-digit OTP"
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && verifyOTP()}
                maxLength={6}
                autoFocus
              />
            </div>

            <button className="login-btn sf" onClick={verifyOTP} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login →'}
            </button>
            <button
              className="login-btn"
              onClick={() => { setStep('phone'); setOtp(''); setError(''); setDevOtp(''); }}
              style={{ background: '#888', marginTop: 8 }}>
              ← Change Number
            </button>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'var(--t3)' }}>
          Government officer?{' '}
          <span
            onClick={switchToAdmin}
            style={{ color: 'var(--nv)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
            Admin Login →
          </span>
        </div>
      </div>

      <div className="login-footer">
        Government of India · Secure Portal · Data Protected
      </div>
    </div>
  );
}