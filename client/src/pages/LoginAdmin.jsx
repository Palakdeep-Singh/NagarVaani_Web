/**
 * LoginAdmin.jsx — Fixed: No hardcoded test credentials
 * Place: client/src/pages/LoginAdmin.jsx
 */
import { useState, useContext } from 'react';
import API from '../api/api.js';
import { AuthContext } from '../context/AuthContext.jsx';

const ROLE_HINTS = [
  {
    role: 'district',
    icon: '',
    label: 'District',
    color: 'var(--nv)',
    emailFmt: 'dc.yourdistrict@yourstate.gov.in',
    passFmt: 'DC@DistrictName25',
    example: 'DC@[YourDistrict]25',
  },
  {
    role: 'state',
    icon: '',
    label: 'State',
    color: 'var(--sf)',
    emailFmt: 'cs.yourstate@gov.in',
    passFmt: 'State@StateName25',
    example: 'State@[YourState]25',
  },
  {
    role: 'central',
    icon: '',
    label: 'Central',
    color: 'var(--gn)',
    emailFmt: 'secretary@ministry.gov.in',
    passFmt: 'Central@India25',
    example: 'Central@India25',
  },
];

export default function LoginAdmin() {
  const { loginAdmin, switchToUser } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPW, setShowPW] = useState(false);
  const [hintRole, setHintRole] = useState('district');

  const doLogin = async () => {
    setError('');
    if (!email.trim() || !password) { setError('Enter your official email and password'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/api/auth/admin', { email: email.trim(), password });
      loginAdmin(data.admin, data.token);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const activeHint = ROLE_HINTS.find(r => r.role === hintRole) || ROLE_HINTS[0];

  return (
    <div
      className="login-screen on"
      style={{ background: 'linear-gradient(135deg, #0F1E36 0%, #1A2B4A 40%, #2A4B8C 100%)' }}
    >
      <div className="login-box" style={{ maxWidth: 440, width: '100%' }}>

        {/* Header */}
        <div className="login-logo">
          <div className="login-logo-ic" style={{ background: 'var(--nv)' }}></div>
          <div className="login-brand">
            NagarikConnect Admin
            <span>Official Government Portal · Restricted Access</span>
          </div>
        </div>

        <div className="login-title">Admin Portal Login</div>
        <div className="login-sub">Authorised Government Officials Only</div>

        {/* Role selector — for password hint display only */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10.5, color: 'var(--t3)', marginBottom: 6,
            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em'
          }}>
            Your Role
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {ROLE_HINTS.map(r => (
              <button
                key={r.role}
                onClick={() => setHintRole(r.role)}
                style={{
                  flex: 1, padding: '7px 4px',
                  border: `.5px solid ${r.color}`,
                  borderRadius: 8,
                  background: hintRole === r.role ? r.color : 'transparent',
                  color: hintRole === r.role ? '#fff' : r.color,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  transition: 'all .15s', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 2,
                }}
              >
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FDF2F2', border: '.5px solid var(--rd)', borderRadius: 'var(--rs)',
            padding: '8px 12px', marginBottom: 14, fontSize: 12, color: 'var(--rd)',
          }}>
             {error}
          </div>
        )}

        {/* Form */}
        <div className="form-group">
          <label className="form-label">Official Email / Employee ID</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder={activeHint.emailFmt}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="form-input"
              type={showPW ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter your password"
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button
              onClick={() => setShowPW(s => !s)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 15, color: 'var(--t3)', padding: 0
              }}
              tabIndex={-1}
              title={showPW ? 'Hide password' : 'Show password'}
            >
              {showPW ? '' : ''}
            </button>
          </div>
        </div>

        {/* Password hint — generic pattern */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--rs)',
          padding: '9px 12px', marginBottom: 16,
          border: `.5px solid ${activeHint.color}33`,
          fontSize: 11.5,
        }}>
          <div style={{ color: 'var(--t3)', marginBottom: 3 }}>
            {activeHint.icon} {activeHint.label} password format:
          </div>
          <code style={{ color: activeHint.color, fontWeight: 700, fontSize: 12 }}>
            {activeHint.example}
          </code>
          <div style={{ color: 'var(--t3)', marginTop: 4, fontSize: 10.5 }}>
            Credentials are issued by your superior officer upon account creation.
          </div>
        </div>

        <button
          className="login-btn"
          onClick={doLogin}
          disabled={loading}
          style={{ marginBottom: 16 }}
        >
          {loading ? ' Authenticating…' : ' Login to Admin Portal →'}
        </button>

        {/* Help note */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--rs)',
          padding: '9px 12px', marginBottom: 14, fontSize: 11, color: 'rgba(255,255,255,0.45)',
          textAlign: 'center', lineHeight: 1.5
        }}>
          Forgot your password? Contact your superior officer or Central Admin to reset it.
        </div>

        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--t3)' }}>
          Citizen?{' '}
          <span
            onClick={switchToUser}
            style={{ color: 'var(--nv)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Back to Citizen Login
          </span>
        </div>
      </div>

      <div className="login-footer">
         Restricted Access · For Authorised Officials Only · NagarikConnect v2.0
      </div>
    </div>
  );
}