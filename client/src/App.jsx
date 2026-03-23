/**
 * App.jsx
 * Place: client/src/App.jsx
 *
 * ROUTING:
 *   not logged in + showAdmin=false → LoginUser
 *   not logged in + showAdmin=true  → LoginAdmin
 *   citizen role                    → UserApp
 *   district/state/central role     → AdminApp
 */
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import LoginUser from './pages/LoginUser.jsx';
import LoginAdmin from './pages/LoginAdmin.jsx';
import UserApp from './pages/UserApp.jsx';
import AdminApp from './pages/AdminApp.jsx';

export default function App() {
  const { user, token, loading, isAdmin, showAdmin, switchToAdmin, switchToUser } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>☸️</div>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Loading NagarikConnect…</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!token || !user) {
    if (showAdmin) return <LoginAdmin />;
    return (
      <div>
        <LoginUser />
        <div style={{ textAlign: 'center', padding: '8px 0 20px', fontSize: 12, color: 'var(--t3)', background: 'var(--bg)' }}>
          Government officer?{' '}
          <span
            onClick={switchToAdmin}
            style={{ color: 'var(--nv)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
            Admin Login →
          </span>
        </div>
      </div>
    );
  }

  // Admin
  if (isAdmin) return <AdminApp />;

  // Citizen
  return <UserApp />;
}