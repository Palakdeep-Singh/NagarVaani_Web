import { useState, useContext } from 'react';
import API from '../api/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function LoginUser() {
  const { loginAdmin } = useContext(AuthContext); // Assuming we use loginAdmin for officers now

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SO'); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'ECI', label: 'Election Commission of India (ECI)' },
    { value: 'CEO', label: 'Chief Electoral Officer (CEO)' },
    { value: 'DEO', label: 'District Election Officer (DEO)' },
    { value: 'RO', label: 'Returning Officer (RO)' },
    { value: 'SO', label: 'Sector Officer (SO)' },
    { value: 'PRO', label: 'Presiding Officer (PRO)' },
    { value: 'PO', label: 'Polling Officer (PO)' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !password || !role) {
      setError('Please provide Employee ID, Password, and Role');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', { employeeId, password, role });
      const data = res.data;

      // Log in with the token
      loginAdmin(data.user, data.token);
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen on">
      <div className="login-box" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        <div className="login-logo">
          <div className="login-logo-ic">
            <Logo size={40} color="var(--nv)" />
          </div>
          <div className="login-brand">
            NagarVaani
            <span>Election Management Dashboard</span>
          </div>
        </div>

        <div className="wa-login-note">
          Delhi NCT Official Login Portal
        </div>

        {error && (
          <div style={{
            background: '#FDF2F2', border: '.5px solid var(--rd)',
            borderRadius: 'var(--rs)', padding: '8px 12px',
            marginBottom: 12, fontSize: 12, color: 'var(--rd)',
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-input"
              value={role}
              onChange={e => { setRole(e.target.value); setError(''); }}
              style={{ background: '#fff', cursor: 'pointer' }}
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: 15 }}>
            <label className="form-label">Employee ID</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. SO-AC40-12"
              value={employeeId}
              onChange={e => { setEmployeeId(e.target.value); setError(''); }}
            />
          </div>

          <div className="form-group" style={{ marginTop: 15 }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          <button className="login-btn sf" type="submit" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Authenticating...' : 'Secure Login →'}
          </button>
        </form>
      </div>

      <div className="login-footer">
        Government of NCT of Delhi · Secure Portal · Data Protected
      </div>
    </div>
  );
}