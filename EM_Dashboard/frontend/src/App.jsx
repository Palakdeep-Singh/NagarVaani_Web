import React, { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import PresidingOfficerDashboard from './pages/PresidingOfficerDashboard.jsx';
import CMDboard from './pages/CMDboard.jsx';
import VoterPortal from './pages/VoterPortal.jsx';
import SectorOfficerDashboard from './pages/SectorOfficerDashboard.jsx';
import ReturningOfficerDashboard from './pages/ReturningOfficerDashboard.jsx';
import DistrictElectionOfficerDashboard from './pages/DistrictElectionOfficerDashboard.jsx';
import ChiefElectoralOfficerDashboard from './pages/ChiefElectoralOfficerDashboard.jsx';
import ECIDashboard from './pages/ECIDashboard.jsx';
import PollingOfficerDashboard from './pages/PollingOfficerDashboard.jsx';
import HierarchySelector from './components/HierarchySelector.jsx';
import { CallProvider } from './context/CallContext';
import { CallOverlay } from './components/CallOverlay';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('em_auth_token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('em_auth_user');
    return u ? JSON.parse(u) : null;
  });
  const [currentView, setCurrentView] = useState('home'); // 'home', 'hierarchy_selection', 'dashboard', 'portal'
  const [targetRole, setTargetRole] = useState('');

  useEffect(() => {
    if (token && user) {
      setCurrentView('dashboard');
    } else if (currentView !== 'portal' && currentView !== 'hierarchy_selection') {
      setCurrentView('home');
    }
  }, [token, user]);

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('em_auth_token', newToken);
    localStorage.setItem('em_auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('em_auth_token');
    localStorage.removeItem('em_auth_user');
    setToken(null);
    setUser(null);
    setCurrentView('hierarchy_selection');
  };

  const handleGoHome = () => {
    localStorage.removeItem('em_auth_token');
    localStorage.removeItem('em_auth_user');
    setToken(null);
    setUser(null);
    setCurrentView('home');
  };

  // 1. Voter Portal View
  if (currentView === 'portal') {
    return <VoterPortal onGoBack={() => setCurrentView('login')} />;
  }

  // 2. Dashboard View (Logged in)
  if (token && user) {
    const renderDashboard = () => {
      if (user.role === 'CM') {
        return <CMDboard user={user} onLogout={handleLogout} />;
      } else if (user.role === 'Sector Officer') {
        return <SectorOfficerDashboard user={user} onLogout={handleLogout} />;
      } else if (user.role === 'Returning Officer') {
        return <ReturningOfficerDashboard user={user} onLogout={handleLogout} />;
      } else if (user.role === 'DEO') {
        return <DistrictElectionOfficerDashboard user={user} onLogout={handleLogout} />;
      } else if (user.role === 'CEO') {
        return <ChiefElectoralOfficerDashboard user={user} onLogout={handleLogout} />;
      } else if (user.role === 'ECI') {
        return <ECIDashboard user={user} onLogout={handleLogout} />;
      } else if (user.role === 'Polling Officer') {
        return <PollingOfficerDashboard user={user} onLogout={handleLogout} />;
      } else {
        return <PresidingOfficerDashboard user={user} onLogout={handleLogout} />;
      }
    };

    return (
      <CallProvider selfId={user.id || user.role} selfName={user.name || user.role}>
        {renderDashboard()}
        <CallOverlay />
      </CallProvider>
    );
  }

  // 3. Hierarchy Selection View
  if (currentView === 'hierarchy_selection') {
    return (
      <HierarchySelector 
        targetRole={targetRole} 
        onSelectOfficer={(officer) => handleLoginSuccess('mock-token', officer)}
        onGoBack={() => setCurrentView('home')}
      />
    );
  }

  // 4. Role Selector (Not Logged in) - Main Home
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: 'white', padding: '2rem', fontFamily: '"Inter", sans-serif' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '3rem', fontWeight: 'bold', textShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>NagarVaani</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '1200px' }}>
        {[
          { label: 'ECI', role: 'ECI' },
          { label: 'CEO', role: 'CEO' },
          { label: 'DEO', role: 'DEO' },
          { label: 'Returning Officer', role: 'Returning Officer' },
          { label: 'Sector Officer', role: 'Sector Officer' },
          { label: 'Presiding Officer', role: 'Presiding Officer' },
          { label: 'Polling Officer', role: 'Polling Officer' },
          { label: 'User Complaint', role: 'portal' },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => {
              if (btn.role === 'portal') {
                setCurrentView('portal');
              } else {
                setTargetRole(btn.role);
                setCurrentView('hierarchy_selection');
              }
            }}
            style={{
              padding: '1.5rem',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#fff',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}