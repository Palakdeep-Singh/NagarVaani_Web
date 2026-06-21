import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, HelpCircle, Lock, User } from 'lucide-react';
import axios from 'axios';

export default function Login({ onLoginSuccess, onGoToPortal }) {
  const [selectedRole, setSelectedRole] = useState('ECI');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [fastAuthRole, setFastAuthRole] = useState('ECI');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    "ECI", "CEO", "DEO", 
    "Returning Officer", "Sector Officer", 
    "Presiding Officer", "Polling Officer"
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await axios.post(`${apiUrl}/auth/login`, {
        role: selectedRole,
        employeeId: employeeId,
        password: password
      });

      if (res.data && res.data.token) {
        onLoginSuccess(res.data.token, res.data.user);
      } else {
        setError('Invalid login response');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFastLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await axios.post(`${apiUrl}/auth/login`, {
        role: fastAuthRole,
        password: 'mock-bypass-password'
      });

      if (res.data && res.data.token) {
        onLoginSuccess(res.data.token, res.data.user);
      } else {
        setError('Invalid login response');
      }
    } catch (err) {
      console.error(err);
      setError('Fast Auth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #1e3a8a 0%, #0f172a 100%)',
      color: '#ffffff',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(16px)',
        textAlign: 'center'
      }}>
        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '16px',
            borderRadius: '20px',
            color: '#60a5fa',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={36} />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '6px',
            color: '#ffffff'
          }}>NagarVaani</h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>Election Officer Dashboard</p>
        </header>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '600',
            textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>Officer Level / Role</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px 14px 12px 40px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '18px'
                }}
              >
                {roles.map(r => <option key={r} value={r} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{r}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>Employee ID</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="e.g. PRO-B101"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px 14px 12px 40px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>Security Pin / Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px 14px 12px 40px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Officer'}
            <ChevronRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: '#475569',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
          <span style={{ padding: '0 12px' }}>Developer Fast Auth</span>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
        </div>

        {/* Developer Fast Auth Control */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          <select
            value={fastAuthRole}
            onChange={(e) => setFastAuthRole(e.target.value)}
            style={{
              flex: '1.2',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {roles.map(r => <option key={r} value={r} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{r}</option>)}
          </select>

          <button
            onClick={handleFastLogin}
            disabled={loading}
            style={{
              flex: '1',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            Fast Login ⚡
          </button>
        </div>

        {/* Back to Citizen Voter Portal Link */}
        <div style={{ marginTop: '28px', fontSize: '13px' }}>
          <span
            onClick={onGoToPortal}
            style={{
              color: '#60a5fa',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '600'
            }}
          >
            Looking for Citizen Voter Portal? Access here →
          </span>
        </div>
      </div>

      <footer style={{
        marginTop: '32px',
        fontSize: '11px',
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        Authorized Election Day Operations Hub
      </footer>
    </div>
  );
}
