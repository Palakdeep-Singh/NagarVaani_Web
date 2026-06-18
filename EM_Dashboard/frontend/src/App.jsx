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

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('em_auth_token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('em_auth_user');
    return u ? JSON.parse(u) : null;
  });
  const [currentView, setCurrentView] = useState('login'); // 'login', 'dashboard', 'portal'

  useEffect(() => {
    if (token && user) {
      setCurrentView('dashboard');
    } else if (currentView !== 'portal') {
      setCurrentView('login');
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
    setCurrentView('login');
  };

  // 1. Voter Portal View
  if (currentView === 'portal') {
    return <VoterPortal onGoBack={() => setCurrentView('login')} />;
  }

  // 2. Dashboard View (Logged in)
  if (token && user) {
    if (user.role === 'CM') {
      return (
        <CMDboard
          user={user}
          onLogout={handleLogout}
        />
      );
    } else if (user.role === 'Sector Officer') {
      return (
        <SectorOfficerDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    } else if (user.role === 'Returning Officer') {
      return (
        <ReturningOfficerDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    } else if (user.role === 'DEO') {
      return (
        <DistrictElectionOfficerDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    } else if (user.role === 'CEO') {
      return (
        <ChiefElectoralOfficerDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    } else if (user.role === 'ECI') {
      return (
        <ECIDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    } else if (user.role === 'Polling Officer') {
      return (
        <PollingOfficerDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    } else {
      return (
        <PresidingOfficerDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    }
  }

  // 3. Login Page (Not Logged in)
  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onGoToPortal={() => setCurrentView('portal')}
    />
  );
}