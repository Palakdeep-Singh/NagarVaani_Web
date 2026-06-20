import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginUser } = useStore();
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Please enter your credentials.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const success = loginUser(username.trim(), password);
    setLoading(false);
    if (!success) setError('Invalid credentials. Contact your System Administrator (NIC Help Desk: 1800-111-555).');
  };

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const demoCreds = [
    { label: 'CM Office',  u: 'cm',   p: 'cm123' },
    { label: 'DM Office',  u: 'dm',   p: 'dm123' },
    { label: 'Dept. Head', u: 'dept', p: 'dept123' },
  ];

  return (
    <div className="login-page">
      <div className="login-tricolor" />

      <div className="login-govbar">
        <div className="login-govbar-left">
          <span style={{ fontSize: '1.05rem' }}>🇮🇳</span>
          <span>Government of National Capital Territory of Delhi</span>
        </div>
        <span className="login-govbar-right">Classification: RESTRICTED · {today}</span>
      </div>

      <div className="login-main">
        <div className="login-box fade-in">

          <div className="login-header">
            <div className="login-logo">
              <ShieldCheck size={28} color="#fff" />
            </div>
            <h1 className="login-title">NagarVaani</h1>
            <div className="login-subtitle">Chief Minister&apos;s Grievance &amp; Intelligence Portal</div>
            <div className="login-meta">Powered by NIC · ECI Compliant · GNCT Delhi</div>
          </div>

          <div className="login-notice restricted">
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>RESTRICTED ACCESS</strong> — This portal is for authorised government personnel only.
              Unauthorized access is a cognizable offence under Section 66 of the IT Act, 2000.
              All sessions are logged and monitored.
            </div>
          </div>

          <div className="login-demo">
            <div className="login-demo-head">
              <Info size={14} />
              Demo Credentials (MVP)
            </div>
            {demoCreds.map(c => (
              <div key={c.u} className="login-demo-row">
                <span className="login-demo-label">{c.label}</span>
                <button type="button" className="login-demo-btn" onClick={() => { setUsername(c.u); setPassword(c.p); }}>
                  {c.u} / {c.p}
                </button>
              </div>
            ))}
          </div>

          <div className="login-card">
            <div className="login-card-head">
              <div className="login-card-head-title">Secure Sign In</div>
              <div className="login-card-head-sub">NIC Single Sign-On · Session duration: 8 hours</div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <div className="login-field">
                <label className="login-label" htmlFor="login-username">Username / Employee ID</label>
                <div className="login-input-wrap">
                  <User size={14} className="login-input-icon" />
                  <input
                    id="login-username"
                    type="text"
                    className="login-input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">Password</label>
                <div className="login-input-wrap">
                  <Lock size={14} className="login-input-icon" />
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    className="login-input"
                    style={{ paddingRight: 38 }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-input-toggle"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="login-submit">
                {loading ? 'Authenticating…' : 'Sign In to Portal'}
              </button>

              <div className="login-terms">
                By signing in you agree to the Government of India&apos;s<br />
                Acceptable Use Policy for Official IT Systems (2019)
              </div>
            </form>
          </div>

          {/* Fast Dev Bypass Authorization */}
          <div className="mt-4 pt-4 border-t border-slate-200/80">
            <div className="text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              ⚡ Fast Authorization Access (Dev Mode)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginUser('cm', 'cm123')}
                className="py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-700 font-bold rounded-xl text-[10px] transition-colors cursor-pointer text-center"
              >
                👑 CM View
              </button>
              <button
                type="button"
                onClick={() => loginUser('newdelhidm', 'dm123')}
                className="py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-700 font-bold rounded-xl text-[10px] transition-colors cursor-pointer text-center"
              >
                🏢 DM View
              </button>
              <button
                type="button"
                onClick={() => loginUser('healthhead', 'dept123')}
                className="py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-700 font-bold rounded-xl text-[10px] transition-colors cursor-pointer text-center"
              >
                💼 Dept Nodal
              </button>
            </div>
          </div>

          <div className="login-footer mt-6">
            NagarVaani v2.0 · National Informatics Centre (NIC)<br />
            Ministry of Electronics &amp; Information Technology, GoI<br />
            IT Act 2000 · RTI Act 2005 · ECI Model Code Compliant
          </div>
        </div>
      </div>
    </div>
  );
};
