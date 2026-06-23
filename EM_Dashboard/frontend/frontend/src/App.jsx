import React, { useState, useContext } from 'react';
import LoginUser from './pages/LoginUser.jsx';
import PresidingOfficerDashboard from './pages/PresidingOfficerDashboard.jsx';

import VoterPortal from './pages/VoterPortal.jsx';
import SectorOfficerDashboard from './pages/SectorOfficerDashboard.jsx';
import ReturningOfficerDashboard from './pages/ReturningOfficerDashboard.jsx';
import DistrictElectionOfficerDashboard from './pages/DistrictElectionOfficerDashboard.jsx';
import ChiefElectoralOfficerDashboard from './pages/ChiefElectoralOfficerDashboard.jsx';
import ECIDashboard from './pages/ECIDashboard.jsx';
import PollingOfficerDashboard from './pages/PollingOfficerDashboard.jsx';
import { CallProvider } from './context/CallContext';
import { CallOverlay } from './components/CallOverlay';
import { AuthContext } from './context/AuthContext.jsx';

export default function App() {
  const { user, token, logout, loading } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'portal'

  // If AuthContext is still loading
  if (loading) return <div>Loading...</div>;

  // 1. Voter Portal View
  if (currentView === 'portal' && !token) {
    return <VoterPortal onGoBack={() => setCurrentView('home')} />;
  }

  // 2. Dashboard View (Logged in)
  if (token && user) {
    const renderDashboard = () => {
      // Map roles from backend correctly
      // CM dashboard removed per user request
      if (user.role === 'SO') return <SectorOfficerDashboard user={user} onLogout={logout} />;
      if (user.role === 'RO') return <ReturningOfficerDashboard user={user} onLogout={logout} />;
      if (user.role === 'DEO') return <DistrictElectionOfficerDashboard user={user} onLogout={logout} />;
      if (user.role === 'CEO') return <ChiefElectoralOfficerDashboard user={user} onLogout={logout} />;
      if (user.role === 'ECI') return <ECIDashboard user={user} onLogout={logout} />;
      if (user.role === 'PO') return <PollingOfficerDashboard user={user} onLogout={logout} />;
      if (user.role === 'PRO') return <PresidingOfficerDashboard user={user} onLogout={logout} />;
      // Fallback
      return <PresidingOfficerDashboard user={user} onLogout={logout} />;
    };

    return (
      <CallProvider selfId={user.id || user.role} selfName={user.name || user.role}>
        {renderDashboard()}
        <CallOverlay />
      </CallProvider>
    );
  }

  // 3. Login View
  if (currentView === 'login') {
    return (
      <div style={{position: 'relative'}}>
        <button 
          onClick={() => setCurrentView('home')}
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#333', color: '#fff', cursor: 'pointer' }}>
          ← Back to Home
        </button>
        <LoginUser />
      </div>
    );
  }

  // 4. Main Home
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: 'white', padding: '2rem', fontFamily: '"Inter", sans-serif' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '3rem', fontWeight: 'bold', textShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>NagarVaani</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '800px' }}>
        <button
          onClick={() => setCurrentView('login')}
          style={{
            padding: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: '#fff',
            background: 'rgba(46, 204, 113, 0.2)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(46, 204, 113, 0.4)', borderRadius: '16px',
            cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = 'rgba(46, 204, 113, 0.4)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(46, 204, 113, 0.2)'; }}
        >
          Official Login
        </button>
        <button
          onClick={() => setCurrentView('portal')}
          style={{
            padding: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: '#fff',
            background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px',
            cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
        >
          User Complaint Portal
        </button>
      </div>
    </div>
  );
}