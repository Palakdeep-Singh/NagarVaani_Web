/**
 * App.jsx
 *
 * ROUTING:
 *   no session + no portal chosen → LandingPage
 *   no session + showAdmin=false  → LoginUser  (Citizen)
 *   no session + showAdmin=true   → LoginAdmin (Admin)
 *   citizen role                  → UserApp
 *   district/state/central role   → AdminApp
 */
import { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import LoginUser from './pages/LoginUser.jsx';
import UserApp from './pages/UserApp.jsx';
import AdminApp from './pages/AdminApp.jsx';
import LandingPage from './pages/LandingPage.jsx';

// CM Frontend (scoped under .cm-scope)
import CMApp from './cm_frontend/App';
import './cm_frontend/index.css';

export default function App() {
  const { user, token, loading, isAdmin, showAdmin, switchToAdmin, switchToUser } = useContext(AuthContext);
  const [portalChoice, setPortalChoice] = useState(() => {
    const p = new URLSearchParams(window.location.search).get('portal');
    return p === 'citizen' || p === 'admin' ? p : null;
  });

  useState(() => {
    const p = new URLSearchParams(window.location.search).get('portal');
    if (p === 'admin') switchToAdmin();
    if (p === 'citizen') switchToUser();
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏛️</div>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Loading NagarVaani…</div>
        </div>
      </div>
    );
  }

  // Logged in
  if (token && user) {
    if (isAdmin) return <AdminApp />;
    return <UserApp />;
  }

  // Landing
  if (!portalChoice) {
    return (
      <LandingPage
        onCitizen={() => { setPortalChoice('citizen'); switchToUser(); }}
        onAdmin={() => { setPortalChoice('admin'); switchToAdmin(); }}
      />
    );
  }

  // CM Dashboard portal — render inside .cm-scope wrapper
  if (portalChoice === 'admin' || showAdmin) {
    return (
      <div className="cm-scope">
        <CMApp setPortalChoice={(choice) => {
          if (choice === 'citizen') {
            setPortalChoice('citizen');
            switchToUser();
          } else {
            setPortalChoice(null);
          }
        }} />
      </div>
    );
  }

  // Citizen login
  const BackLink = () => (
    <div style={{ textAlign: 'center', padding: '8px 0 20px', fontSize: 12, color: 'var(--t3)', background: 'var(--bg)' }}>
      <span
        onClick={() => { setPortalChoice(null); switchToUser(); }}
        style={{ color: 'var(--nv)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
      >← Back to Home</span>
      <span style={{ marginLeft: 12 }}>
        Government officer?{' '}
        <span
          onClick={() => { setPortalChoice('admin'); switchToAdmin(); }}
          style={{ color: 'var(--sf)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
        >👑 CM Dashboard →</span>
      </span>
    </div>
  );

  return <><LoginUser /><BackLink /></>;
}