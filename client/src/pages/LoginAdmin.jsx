/**
 * LoginAdmin.jsx — CM Dashboard Panel Login
 * Three-role portal: Chief Minister | District Magistrate | Nodal Officer
 * With Fast Authorization to skip directly to CM Dashboard (CM_Frontend)
 */
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

const CM_DASHBOARD_URL = 'http://localhost:5174'; // CM_Frontend dev port

const ROLES = [
  {
    id: 'cm',
    label: "Chief Minister's Office",
    shortLabel: 'CM Office',
    icon: '👑',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF9500 100%)',
    color: '#FF6B35',
    glow: 'rgba(255,107,53,0.35)',
    badgeColor: '#FF6B35',
    username: 'cm',
    password: 'cm123',
    desc: "Full system access — governance command centre, district oversight & analytics",
    emailFmt: 'chief.minister@delhi.gov.in',
    passFmt: 'CM@Office2025',
    hint: 'CM@Office2025',
    tab: 'Overview',
  },
  {
    id: 'dm',
    label: 'District Magistrate',
    shortLabel: 'DM Office',
    icon: '🏛️',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.35)',
    badgeColor: '#3B82F6',
    username: 'newdelhidm',
    password: 'dm123',
    desc: "District-level grievance management, field reporting and compliance dashboard",
    emailFmt: 'dm.newdelhi@delhi.gov.in',
    passFmt: 'DM@[District]25',
    hint: 'DM@[YourDistrict]25',
    tab: 'DistrictMinistry',
  },
  {
    id: 'nodal',
    label: 'Nodal Officer',
    shortLabel: 'Nodal Officer',
    icon: '💼',
    gradient: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.35)',
    badgeColor: '#10B981',
    username: 'healthhead',
    password: 'dept123',
    desc: "Departmental nodal officer — scheme execution, officer workspace & reporting",
    emailFmt: 'nodal.dept@delhi.gov.in',
    passFmt: 'Nodal@[Dept]25',
    hint: 'Nodal@[YourDept]25',
    tab: 'OfficerWorkspace',
  },
];

export default function LoginAdmin() {
  const { switchToUser } = useContext(AuthContext);
  const [activeRole, setActiveRole] = useState('cm');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPW, setShowPW] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fastLoading, setFastLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [particles, setParticles] = useState([]);

  const role = ROLES.find(r => r.id === activeRole) || ROLES[0];

  useEffect(() => {
    // Ambient particles
    const pts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      dur: 6 + Math.random() * 8,
      delay: Math.random() * 5,
    }));
    setParticles(pts);
  }, []);

  const handleTabSwitch = (roleId) => {
    setActiveRole(roleId);
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const openCMDashboard = (tab = 'Overview') => {
    const url = `${CM_DASHBOARD_URL}?autologin=true&tab=${tab}`;
    // Store quick auth in localStorage for CM_Frontend to pick up
    localStorage.setItem('cm_quick_auth', JSON.stringify({
      username: role.username,
      password: role.password,
      tab,
      timestamp: Date.now(),
    }));
    window.open(url, '_blank');
  };

  const doLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your official email and password.');
      return;
    }
    setLoading(true);
    // Simulate authentication delay
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSuccess(`✓ Authenticated as ${role.label}. Opening CM Dashboard…`);
    setTimeout(() => openCMDashboard(role.tab), 800);
  };

  const doFastAuth = async (roleObj) => {
    setFastLoading(true);
    setError('');
    // Store fast-auth credentials for CM_Frontend
    localStorage.setItem('cm_quick_auth', JSON.stringify({
      username: roleObj.username,
      password: roleObj.password,
      tab: roleObj.tab,
      timestamp: Date.now(),
    }));
    await new Promise(r => setTimeout(r, 500));
    setFastLoading(false);
    setSuccess(`⚡ Fast auth as ${roleObj.shortLabel}. Opening CM Dashboard…`);
    const url = `${CM_DASHBOARD_URL}?autologin=true&role=${roleObj.id}`;
    setTimeout(() => window.open(url, '_blank'), 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060B19 0%, #0D1628 35%, #111827 70%, #0A0F1E 100%)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: role.color,
            opacity: 0.12,
            animation: `nvFloat ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
          }} />
        ))}
        {/* Glowing orbs */}
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: `radial-gradient(circle, ${role.glow} 0%, transparent 65%)`,
          transition: 'background 0.6s ease',
          animation: 'nvPulseOrb 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-8%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
          animation: 'nvPulseOrb 11s ease-in-out infinite reverse',
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Top tricolor stripe */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 100,
        background: 'linear-gradient(90deg, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%)',
      }} />

      {/* Government header bar */}
      <div style={{
        position: 'fixed', top: 3, left: 0, right: 0, zIndex: 99,
        background: 'rgba(6,11,25,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={28} color={role.color} />
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>
              NagarVaani
              <span style={{
                marginLeft: 8, fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: role.color,
                background: `${role.glow}`,
                padding: '2px 8px', borderRadius: 20,
                border: `1px solid ${role.color}44`,
              }}>
                CM Dashboard Portal
              </span>
            </div>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Government of NCT Delhi · Restricted Access
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
            🇮🇳 GNCT Delhi
          </div>
          <button
            onClick={switchToUser}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, padding: '6px 16px', fontSize: 11, fontWeight: 700,
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            ← Citizen Portal
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 60px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 30, padding: '6px 18px', marginBottom: 20,
              backdropFilter: 'blur(10px)',
            }}>
              <span style={{ fontSize: 14 }}>🏛️</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                Government Officials Only
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 900,
              color: '#fff', letterSpacing: '-0.03em', marginBottom: 8,
              lineHeight: 1.1,
            }}>
              CM Dashboard <span style={{
                background: role.gradient, WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Portal</span>
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
              Select your access level to continue to the Chief Minister's<br />
              Grievance & Intelligence Dashboard
            </p>
          </div>

          {/* Role Tab Switcher */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
            marginBottom: 24,
          }}>
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => handleTabSwitch(r.id)}
                style={{
                  padding: '14px 8px',
                  background: activeRole === r.id
                    ? r.gradient
                    : 'rgba(255,255,255,0.04)',
                  border: activeRole === r.id
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, cursor: 'pointer',
                  transition: 'all .25s cubic-bezier(0.16,1,0.3,1)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  boxShadow: activeRole === r.id ? `0 8px 24px ${r.glow}` : 'none',
                  transform: activeRole === r.id ? 'translateY(-2px)' : 'none',
                }}
                onMouseEnter={e => {
                  if (activeRole !== r.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  if (activeRole !== r.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                <span style={{ fontSize: 22 }}>{r.icon}</span>
                <span style={{
                  fontSize: 10.5, fontWeight: 800, letterSpacing: '.02em',
                  color: activeRole === r.id ? '#fff' : 'rgba(255,255,255,0.55)',
                  textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3,
                }}>{r.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Login Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${role.color}30`,
            borderRadius: 20, padding: 28, marginBottom: 16,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
            transition: 'border-color 0.3s ease',
          }}>
            {/* Role header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 20, paddingBottom: 16,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: role.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, boxShadow: `0 6px 18px ${role.glow}`,
                flexShrink: 0,
              }}>{role.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                  {role.label}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                  {role.desc}
                </div>
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                fontSize: 12, color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div style={{
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                fontSize: 12, color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: 8,
                animation: 'nvFadeIn 0.3s ease',
              }}>
                {success}
              </div>
            )}

            {/* Email field */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7,
              }}>
                Official Email / Employee ID
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 14, opacity: 0.4,
                }}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder={role.emailFmt}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '11px 14px 11px 36px',
                    fontSize: 13, color: '#fff', outline: 'none',
                    transition: 'border-color .2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = role.color + '80'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 14, opacity: 0.4,
                }}>🔒</span>
                <input
                  type={showPW ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '11px 44px 11px 36px',
                    fontSize: 13, color: '#fff', outline: 'none',
                    transition: 'border-color .2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = role.color + '80'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <button
                  onClick={() => setShowPW(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, color: 'rgba(255,255,255,0.35)', padding: 0,
                  }}
                  tabIndex={-1}
                >
                  {showPW ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password hint */}
              <div style={{
                marginTop: 7, fontSize: 10.5, color: 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span>Format:</span>
                <code style={{ color: role.color, fontWeight: 700 }}>{role.hint}</code>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={doLogin}
              disabled={loading || !!success}
              style={{
                width: '100%', padding: '13px 24px',
                background: loading || success ? 'rgba(255,255,255,0.06)' : role.gradient,
                border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 800, color: '#fff',
                cursor: loading || success ? 'default' : 'pointer',
                transition: 'all .25s',
                boxShadow: !loading && !success ? `0 8px 24px ${role.glow}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => {
                if (!loading && !success) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${role.glow}`;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = !loading && !success ? `0 8px 24px ${role.glow}` : 'none';
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'nvSpin 1s linear infinite', fontSize: 16 }}>⟳</span>
                  Authenticating…
                </>
              ) : success ? (
                <>✓ Redirecting to Dashboard…</>
              ) : (
                <>{role.icon} Sign In as {role.shortLabel} →</>
              )}
            </button>
          </div>

          {/* ── Fast Authorization Access ── */}
          <div style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px dashed rgba(245,158,11,0.5)',
            borderRadius: 18, padding: '18px 20px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 15 }}>⚡</span>
              <span style={{
                fontSize: 11, fontWeight: 800, color: '#F59E0B',
                textTransform: 'uppercase', letterSpacing: '.1em',
              }}>
                Fast Authorization — Skip to CM Dashboard
              </span>
            </div>
            <p style={{
              fontSize: 11, color: 'rgba(245,158,11,0.7)', textAlign: 'center',
              marginBottom: 14, lineHeight: 1.5,
            }}>
              One-click access without credentials. Opens the CM Dashboard directly in a new tab.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => doFastAuth(r)}
                  disabled={fastLoading}
                  style={{
                    padding: '10px 8px',
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    borderRadius: 12, cursor: 'pointer',
                    transition: 'all .2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(245,158,11,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(245,158,11,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: 18 }}>{r.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B' }}>
                    {r.shortLabel}
                  </span>
                </button>
              ))}
            </div>
            <div style={{
              marginTop: 12, fontSize: 10, color: 'rgba(245,158,11,0.45)',
              textAlign: 'center',
            }}>
              Dev Mode · All sessions are logged · NagarVaani v2.0
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center', marginTop: 24,
            fontSize: 10.5, color: 'rgba(255,255,255,0.2)',
            lineHeight: 1.7,
          }}>
            Restricted Access · National Informatics Centre (NIC)<br />
            Ministry of Electronics & Information Technology, GoI<br />
            IT Act 2000 · Section 66 · All sessions are monitored
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes nvFloat {
          0% { transform: translateY(0px) scale(1); opacity: 0.12; }
          100% { transform: translateY(-20px) scale(1.1); opacity: 0.22; }
        }
        @keyframes nvPulseOrb {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.08) rotate(5deg); opacity: 1; }
        }
        @keyframes nvSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes nvFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: none; }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input { color: white !important; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  );
}