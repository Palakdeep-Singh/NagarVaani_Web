import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';

export const Login: React.FC<{ setPortalChoice?: (v: string | null) => void }> = ({ setPortalChoice }) => {
  const { loginUser } = useStore();
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [fastAuthLoading, setFastAuthLoading] = useState<string | null>(null);
  const [autoLoginMsg, setAutoLoginMsg] = useState('');

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Handle auto-login from NagarVaani portal fast-auth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isAutoLogin = params.get('autologin') === 'true';
    const role = params.get('role');

    if (isAutoLogin) {
      // Try to read stored quick-auth credentials
      const stored = localStorage.getItem('cm_quick_auth');
      if (stored) {
        try {
          const auth = JSON.parse(stored);
          // Only use if fresh (within 30 seconds)
          if (Date.now() - auth.timestamp < 30000) {
            setAutoLoginMsg(`⚡ Fast auth from NagarVaani Portal — logging in as ${role || 'CM'}…`);
            setTimeout(() => {
              loginUser(auth.username, auth.password);
              localStorage.removeItem('cm_quick_auth');
            }, 600);
            return;
          }
        } catch {}
      }
      // Fallback based on role param
      const roleMap: Record<string, { u: string; p: string }> = {
        cm:    { u: 'cm',          p: 'cm123'    },
        dm:    { u: 'newdelhidm',  p: 'dm123'    },
        nodal: { u: 'healthhead',  p: 'dept123'  },
      };
      const cred = role ? roleMap[role] : roleMap['cm'];
      if (cred) {
        setAutoLoginMsg(`⚡ Fast auth from NagarVaani Portal — logging in…`);
        setTimeout(() => loginUser(cred.u, cred.p), 600);
      }
    }
  }, [loginUser]);

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

  const handleFastLogin = async (u: string, p: string, label: string) => {
    setFastAuthLoading(label);
    setError('');
    await new Promise(r => setTimeout(r, 450));
    loginUser(u, p);
    setFastAuthLoading(null);
  };

  const fastRoles = [
    { label: 'CM Office',    icon: '👑', u: 'cm',          p: 'cm123',   color: '#F59E0B' },
    { label: 'DM Office',    icon: '🏛️', u: 'newdelhidm',  p: 'dm123',   color: '#3B82F6' },
    { label: 'Nodal Officer',icon: '💼', u: 'healthhead',  p: 'dept123', color: '#10B981' },
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

          {/* Auto-login notice */}
          {autoLoginMsg && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              fontSize: 12, color: '#F59E0B',
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'fadeIn 0.3s ease',
            }}>
              <Zap size={14} style={{ flexShrink: 0 }} />
              {autoLoginMsg}
            </div>
          )}

          {/* Demo Credentials Panel */}
          <div className="login-demo">
            <div className="login-demo-head">
              <Zap size={14} />
              Demo Credentials (MVP)
            </div>
            {[
              { label: 'CM Office',  u: 'cm',          p: 'cm123'    },
              { label: 'DM Office',  u: 'newdelhidm',  p: 'dm123'    },
              { label: 'Nodal Off.', u: 'healthhead',  p: 'dept123'  },
            ].map(c => (
              <div key={c.u} className="login-demo-row">
                <span className="login-demo-label">{c.label}</span>
                <button type="button" className="login-demo-btn"
                  onClick={() => { setUsername(c.u); setPassword(c.p); }}>
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

          {/* ── Enhanced Fast Authorization Access ── */}
          <div style={{
            marginTop: 16,
            padding: '16px 18px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.04) 100%)',
            border: '1px dashed rgba(245,158,11,0.45)',
            borderRadius: 14,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, marginBottom: 12,
            }}>
              <Zap size={13} color="#F59E0B" />
              <span style={{
                fontSize: 10.5, fontWeight: 800, color: '#F59E0B',
                textTransform: 'uppercase', letterSpacing: '.1em',
              }}>
                Fast Authorization Access
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {fastRoles.map(r => (
                <button
                  key={r.u}
                  type="button"
                  disabled={fastAuthLoading !== null}
                  onClick={() => handleFastLogin(r.u, r.p, r.label)}
                  style={{
                    padding: '10px 6px',
                    background: fastAuthLoading === r.label
                      ? `${r.color}22`
                      : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${fastAuthLoading === r.label ? r.color : 'rgba(245,158,11,0.3)'}`,
                    borderRadius: 10, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    boxShadow: fastAuthLoading === r.label ? `0 4px 14px ${r.color}30` : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!fastAuthLoading) {
                      e.currentTarget.style.background = `${r.color}15`;
                      e.currentTarget.style.borderColor = r.color;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!fastAuthLoading) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  <span style={{ fontSize: 18 }}>
                    {fastAuthLoading === r.label ? '⟳' : r.icon}
                  </span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: fastAuthLoading === r.label ? r.color : '#D97706' }}>
                    {fastAuthLoading === r.label ? 'Logging in…' : r.label}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPortalChoice && setPortalChoice('citizen')}
                style={{
                  padding: '10px 6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(245,158,11,0.3)',
                  borderRadius: 10, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#8B5CF615';
                  e.currentTarget.style.borderColor = '#8B5CF6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span style={{ fontSize: 18 }}>🧑‍🤝‍🧑</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#D97706' }}>Citizen Portal</span>
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
