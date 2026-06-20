import React from 'react';
import { VideoCall } from '../components/VideoCall';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Activity, Users, Percent, ShieldAlert,
  Cpu, MessageSquare, PhoneCall, FileText, CheckSquare,
  Package, HelpCircle, Bell, ChevronDown, Check,
  Clock, AlertTriangle, Battery, LogOut, Send, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

export default function PresidingOfficerDashboard({ user, onLogout, boothIdOverride, onBackToCM }) {
  const userRole = user?.role || 'Presiding Officer';
  const userName = user?.name || 'Officer';

  // Navigation Menu Active state
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Backend state sync
  const [isOnline, setIsOnline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('11:33 AM');
  const [syncLoading, setSyncLoading] = useState(false);

  // Booth core data
  const [boothId, setBoothId] = useState(boothIdOverride || 147);
  const [boothData, setBoothData] = useState({
    name: "Government School, Ward 12",
    constituency: "56 - North City",
    status: "Operational"
  });

  const [turnout, setTurnout] = useState({
    percentage: 42,
    voted: 543,
    total: 1287
  });

  const [queue, setQueue] = useState({
    length: "Medium",
    count: 15,
    waitTime: 18
  });

  const [timeState, setTimeState] = useState({
    current: "11:34 AM",
    date: "25 Apr 2024"
  });

  const [healthScore, setHealthScore] = useState(() => Math.floor(Math.random() * 52) + 60);
  const [healthChecks, setHealthChecks] = useState({
    evm: true,
    power: true,
    queue: "warning",
    internet: true,
    staff: true
  });

  const [officers, setOfficers] = useState([
    { id: 1, name: "Polling Officer 1", status: "Present" },
    { id: 2, name: "Polling Officer 2", status: "Present" },
    { id: 3, name: "Polling Officer 3", status: "Present" },
    { id: 4, name: "Polling Officer 4", status: "Not Checked In" }
  ]);

  const [hourlyTurnout, setHourlyTurnout] = useState([
    { hour: "8 AM", value: 7 },
    { hour: "9 AM", value: 18 },
    { hour: "10 AM", value: 29 },
    { hour: "11 AM", value: 42 },
    { hour: "12 PM", value: null },
    { hour: "1 PM", value: null },
    { hour: "2 PM", value: null },
    { hour: "3 PM", value: null },
    { hour: "4 PM", value: null },
    { hour: "5 PM", value: null }
  ]);

  const [incidents, setIncidents] = useState([
    { id: "INC-721", type: "Power Fluctuation", time: "10:58 AM", status: "In Progress" },
    { id: "INC-720", type: "Voter Assistance Required", time: "09:41 AM", status: "Resolved" }
  ]);

  const [evmStatus, setEvmStatus] = useState({
    id: "EVM-147A",
    status: "Operational",
    battery: 87,
    lastChecked: "11:20 AM"
  });

  const [complaints, setComplaints] = useState([
    { id: "XXX45", type: "Power Outage in Booth", citizen: "Citizen ID: XXX45", time: "11:10 AM" },
    { id: "XXX12", type: "Long Queue Outside Booth", citizen: "Citizen ID: XXX12", time: "11:08 AM" }
  ]);

  const [checklist, setChecklist] = useState([
    { id: 1, label: "Mock Poll Completed", time: "07:15 AM", checked: true },
    { id: 2, label: "EVM Sealed", time: "07:25 AM", checked: true },
    { id: 3, label: "Staff Present", time: "07:30 AM", checked: true },
    { id: 4, label: "Materials Received", time: "07:35 AM", checked: true },
    { id: 5, label: "Poll Opened", time: "07:45 AM", checked: true }
  ]);

  // AI assistant chat messages
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'user', text: 'What should I do if a voter is at the wrong booth?' },
    { sender: 'bot', text: 'As per EC SOP 4.2 - Politely inform the voter and guide them to their correct booth. Do not allow them to vote at the wrong booth.' }
  ]);

  // Advanced Complaint States
  const [complaintTab, setComplaintTab] = useState('pending'); // 'pending', 'operations', 'history'
  const [dispatchSelection, setDispatchSelection] = useState({});
  const [complaintsHistory, setComplaintsHistory] = useState([]);

  // Fetch Dashboard state from backend
  const fetchData = async () => {
    try {
      setSyncLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await axios.get(`${apiUrl}/booth/status?booth_id=${boothId}`);
      if (res.status === 200) {
        const data = res.data;
        setIsOnline(true);
        setBoothId(data.booth.id);
        setBoothData(data.booth);
        setTurnout(data.turnout);
        setQueue(data.queue);
        setTimeState(data.time);
        setHealthScore(data.health.score);
        setHealthChecks(data.health.checks);
        setOfficers(data.officers);
        setHourlyTurnout(data.hourlyTurnout);
        setIncidents(data.incidents);
        setEvmStatus(data.evm);
        setComplaints(data.complaints);
        setComplaintsHistory(data.complaintsHistory || []);
        setChecklist(data.checklist);

        // Update sync time
        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setIsOnline(false);
      }
    } catch (err) {
      console.warn("Backend server offline, running on client mock state");
      setIsOnline(false);
    } finally {
      setSyncLoading(false);
    }
  };

  // Poll backend every 3 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [boothId]);

  // Update clock locally if backend is offline
  useEffect(() => {
    if (!isOnline) {
      const updateClock = () => {
        const now = new Date();
        setTimeState({
          current: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: now.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
        });
      };
      updateClock();
      const interval = setInterval(updateClock, 10000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  // Handle Action requests to backend
  const handleAction = async (actionType, payload = {}) => {
    try {
      if (!isOnline) {
        // Fallback local updates if backend offline
        if (actionType === 'verify_complaint') {
          setComplaints(prev => prev.map(c => c.id === payload.id ? {
            ...c,
            status: 'verified',
            verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            logs: [...(c.logs || []), `Verified by Presiding Officer at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`]
          } : c));
        } else if (actionType === 'reject_complaint') {
          setComplaints(prev => {
            const complaint = prev.find(item => item.id === payload.id);
            if (complaint) {
              const updated = {
                ...complaint,
                status: 'rejected',
                rejectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                logs: [...(complaint.logs || []), `Rejected by Presiding Officer at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`]
              };
              setComplaintsHistory(history => [updated, ...history]);
            }
            return prev.filter(c => c.id !== payload.id);
          });
        } else if (actionType === 'dispatch_personnel') {
          setComplaints(prev => prev.map(c => c.id === payload.complaintId ? {
            ...c,
            dispatches: [...(c.dispatches || []), { personnel: payload.personnel, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
            logs: [...(c.logs || []), `Dispatched ${payload.personnel} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`]
          } : c));
        } else if (actionType === 'escalate_complaint') {
          setComplaints(prev => prev.map(c => c.id === payload.id ? {
            ...c,
            status: 'escalated',
            escalatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            logs: [...(c.logs || []), `Escalated to Sector Officer at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`]
          } : c));
        } else if (actionType === 'resolve_from_above') {
          setComplaints(prev => prev.map(c => c.id === payload.id ? {
            ...c,
            status: 'resolved_above',
            resolvedAboveSummary: payload.summary,
            resolvedAboveAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            logs: [...(c.logs || []), `Resolved from above by CM at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with summary: "${payload.summary}"`]
          } : c));
        } else if (actionType === 'resolve_complaint') {
          setComplaints(prev => {
            const complaint = prev.find(item => item.id === payload.id);
            if (complaint) {
              const updated = {
                ...complaint,
                status: 'resolved',
                resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                logs: [...(complaint.logs || []), `Resolved by Presiding Officer at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`]
              };
              setComplaintsHistory(history => [updated, ...history]);
            }
            return prev.filter(c => c.id !== payload.id);
          });
        } else if (actionType === 'complete_complaint') {
          setComplaints(prev => {
            const complaint = prev.find(item => item.id === payload.id);
            if (complaint) {
              const updated = {
                ...complaint,
                status: 'completed',
                completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                logs: [...(complaint.logs || []), `Completed by Presiding Officer at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`]
              };
              setComplaintsHistory(history => [updated, ...history]);
            }
            return prev.filter(c => c.id !== payload.id);
          });
        } else if (actionType === 'report_queue') {
          setQueue(prev => ({ ...prev, count: prev.count + 5, waitTime: prev.waitTime + 6 }));
        } else if (actionType === 'request_staff') {
          alert("Extra staff requested successfully (Mock State)");
        } else if (actionType === 'report_fault') {
          setEvmStatus(prev => ({ ...prev, status: "Checking Fault" }));
          alert("EVM fault reported successfully (Mock State)");
        } else if (actionType === 'request_replacement') {
          alert("EVM replacement request sent (Mock State)");
        } else if (actionType === 'report_incident') {
          const type = prompt("Enter incident type:", "Power Outage");
          if (type) {
            setIncidents(prev => [
              { id: `INC-${Math.floor(Math.random() * 900) + 100}`, type, time: timeState.current, status: "In Progress" },
              ...prev
            ]);
          }
        } else if (actionType === 'acknowledge_directive') {
          setBoothData(prev => ({
            ...prev,
            sectorDirective: prev.sectorDirective ? { ...prev.sectorDirective, acknowledged: true } : null
          }));
        }
        return;
      }

      // Backend API Call
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await axios.post(`${apiUrl}/actions?booth_id=${boothId}`, { action: actionType, payload });
      if (res.status === 200) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to execute action on backend", err);
    }
  };

  // Handle AI Chat submissions
  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    const question = chatInput;
    setChatInput('');

    try {
      if (!isOnline) {
        // Mock Response
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            sender: 'bot',
            text: `Mock SOP Answer: Regarding "${question}", please refer to General Election SOP Manual Chapter 5 or consult your designated Sector Officer immediately.`
          }]);
        }, 1500);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await axios.post(`${apiUrl}/assistant/ask`, { question });
      if (res.status === 200) {
        setChatMessages(prev => [...prev, { sender: 'bot', text: res.data.answer }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Checklist items locally (sync to backend if online)
  const toggleChecklist = async (id) => {
    const item = checklist.find(c => c.id === id);
    if (!item) return;

    const updated = !item.checked;
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: updated } : c));

    if (isOnline) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        await axios.post(`${apiUrl}/checklist/${id}?booth_id=${boothId}`, { checked: updated });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="dashboard-container" style={{ textAlign: 'left' }}>
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img
            src="https://img.icons8.com/?size=100&id=2969&format=png&color=FFFFFF"
            alt="India Emblem"
            className="sidebar-logo-img"
            style={{ width: '36px', height: '36px' }}
          />
          <div className="sidebar-logo-text">
            <h2>NagarVaani</h2>
            <p>{userRole} Ops</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { name: 'Booth Status', icon: <Activity size={18} /> },
            { name: 'Officers', icon: <Users size={18} /> },
            { name: 'Voter Turnout', icon: <Percent size={18} /> },
            { name: 'Incidents', icon: <ShieldAlert size={18} /> },
            { name: 'EVM Management', icon: <Cpu size={18} /> },
            {
              name: 'Complaints',
              icon: <MessageSquare size={18} />,
              badge: complaints.filter(c => c.status === 'pending').length > 0 ? complaints.filter(c => c.status === 'pending').length : null
            },
            { name: 'Communication', icon: <PhoneCall size={18} /> },
            { name: 'Reports', icon: <FileText size={18} /> },
            { name: 'Checklists', icon: <CheckSquare size={18} /> },
            { name: 'Materials', icon: <Package size={18} /> },
            { name: 'AI Assistant', icon: <MessageSquare size={18} /> },
            { name: 'SOP / Help', icon: <HelpCircle size={18} /> }
          ].map((item) => (
            <div
              key={item.name}
              className={`menu-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.badge && <span className="menu-item-badge">{item.badge}</span>}
            </div>
          ))}
        
          <div
            className={`menu-item ${activeMenu === 'Conference Call' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: activeMenu === 'Conference Call' ? '700' : '500',
              cursor: 'pointer',
              marginBottom: '4px',
              color: activeMenu === 'Conference Call' ? '#fff' : '#94a3b8',
              backgroundColor: activeMenu === 'Conference Call' ? '#2563eb' : 'transparent',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveMenu('Conference Call')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>📞</span>
              <span>Conference Call</span>
            </div>
          </div>
        </nav>


        <div className="sidebar-footer">
          <button className="emergency-btn" onClick={() => alert("🚨 Emergency broadcast triggered! Sector officer and Security personnel notified.")}>
            <ShieldAlert size={18} />
            <span>Emergency</span>
          </button>

          <div className="sync-status">
            <span>Sync Status: Last Sync {lastSyncTime}</span>
            <div className="status-indicator">
              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
              <span>{isOnline ? 'Online' : 'Offline (Mock)'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="main-content">
        {/* Urgent Directive Banner */}
        {boothData?.sectorDirective && !boothData.sectorDirective.acknowledged && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '16px 24px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)',
            borderLeftWidth: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                backgroundColor: '#fca5a5',
                color: '#b91c1c',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(185, 28, 28, 0.1)'
              }}>
                📢
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ color: '#991b1b', fontSize: '15px', fontWeight: '800', letterSpacing: '0.3px' }}>URGENT DIRECTIVE FROM SECTOR OFFICER</strong>
                <p style={{ color: '#b91c1c', fontSize: '13px', margin: '4px 0 0', fontWeight: '500', lineHeight: 1.4 }}>
                  {boothData.sectorDirective.text} <span style={{ fontSize: '11px', color: '#991b1b', opacity: 0.7, marginLeft: '8px' }}>({boothData.sectorDirective.time})</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAction('acknowledge_directive', { boothId })}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Acknowledge Directive
            </button>
          </div>
        )}
        {/* HEADER */}
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {boothIdOverride && onBackToCM && (
              <button 
                onClick={onBackToCM}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <ArrowLeft size={16} /> Back to Oversight
              </button>
            )}
            <div className="header-title">
              <h1>Booth {boothId} Dashboard</h1>
              <p>{boothData.name} • Constituency: {boothData.constituency}</p>
            </div>
          </div>

          <div className="header-actions">
            {/* Booth Select (if not in override mode) */}
            {!boothIdOverride && (
              <select
                value={boothId}
                onChange={(e) => setBoothId(parseInt(e.target.value))}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={147}>Booth 147 (North City)</option>
                <option value={148}>Booth 148 (North City)</option>
                <option value={149}>Booth 149 (South City)</option>
              </select>
            )}

            <div className="notification-bell" onClick={() => alert("Notifications: Mock check completed, EVM Status ok.")}>
              <Bell size={20} />
              {complaints.length > 0 && <span className="bell-badge">{complaints.length}</span>}
            </div>

            <div className="profile-widget" style={{ position: 'relative' }}>
              <div className="profile-avatar">{userRole.slice(0, 2).toUpperCase()}</div>
              <div className="profile-info">
                <span className="profile-name">{userName}</span>
                <span className="profile-role">{userRole}</span>
              </div>
              <button 
                onClick={onLogout} 
                title="Log Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  marginLeft: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD GRID BODY */}
        <div className="dashboard-body">
          {activeMenu === 'Dashboard' && (
            <>
              

              {/* TOP SUMMARY CARDS */}
          <section className="summary-row">
            {/* Booth Info */}
            <div className="summary-card">
              <div className="summary-details">
                <p>Booth Status</p>
                <h3>Booth {boothId}</h3>
                <span className={`status-pill ${boothData.status === 'Operational' ? 'success' : 'danger'}`} style={{ marginTop: '8px' }}>
                  <span className={`status-dot ${boothData.status === 'Operational' ? 'online' : 'offline'}`}></span>
                  {boothData.status}
                </span>
              </div>
              <div className="summary-icon">
                <LayoutDashboard size={22} />
              </div>
            </div>

            {/* Turnout */}
            <div className="summary-card">
              <div className="summary-details">
                <p>Voter Turnout</p>
                <h3>{turnout.percentage}%</h3>
                <div className="summary-subtext">
                  <Users size={14} />
                  <span>{turnout.voted} / {turnout.total} Voters</span>
                </div>
              </div>
              <div className="summary-icon" style={{ color: '#16a34a', backgroundColor: '#f0fdf4' }}>
                <Percent size={22} />
              </div>
            </div>

            {/* Queue Length */}
            <div className="summary-card">
              <div className="summary-details">
                <p>Queue Length</p>
                <h3 style={{ color: queue.length === 'High' ? '#dc2626' : queue.length === 'Medium' ? '#d97706' : '#16a34a' }}>
                  {queue.length}
                </h3>
                <div className="summary-subtext">
                  <Clock size={14} />
                  <span>~ {queue.waitTime} min wait</span>
                </div>
              </div>
              <div className="summary-icon" style={{ color: '#d97706', backgroundColor: '#fffbeb' }}>
                <Clock size={22} />
              </div>
            </div>

            {/* Date & Time */}
            <div className="summary-card">
              <div className="summary-details">
                <p>Time</p>
                <h3>{timeState.current}</h3>
                <div className="summary-subtext">
                  <span>{timeState.date}</span>
                </div>
              </div>
              <div className="summary-icon" style={{ color: '#2563eb', backgroundColor: '#f0f9ff' }}>
                <Clock size={22} />
              </div>
            </div>
          </section>

          {/* GRID ROW 1: HEALTH, OFFICERS, HOURLY GRAPH */}
          <section className="grid-row-3col">
            {/* BOOTH HEALTH SCORE */}
            <div className="card">
              <div className="panel-header">
                <h2>Booth Health Score</h2>
                <span className="panel-link">View Health Details →</span>
              </div>

              <div className="health-score-container">
                <div className="health-circle-wrapper">
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={healthScore > 80 ? "#16a34a" : healthScore > 60 ? "#d97706" : "#dc2626"}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="health-score-text">
                    <div className="health-score-num">{healthScore}</div>
                    <div className="health-score-denom">/100</div>
                  </div>
                </div>

                <div className="health-list">
                  <div className="health-item">
                    <span>EVM Status</span>
                    {healthChecks.evm ? <Check size={16} color="#16a34a" /> : <AlertTriangle size={16} color="#dc2626" />}
                  </div>
                  <div className="health-item">
                    <span>Power Status</span>
                    <Check size={16} color="#16a34a" />
                  </div>
                  <div className="health-item">
                    <span>Queue Management</span>
                    {healthChecks.queue === 'ok' ? <Check size={16} color="#16a34a" /> : <AlertTriangle size={16} color={healthChecks.queue === 'warning' ? "#d97706" : "#dc2626"} />}
                  </div>
                  <div className="health-item">
                    <span>Internet Connectivity</span>
                    <Check size={16} color="#16a34a" />
                  </div>
                  <div className="health-item">
                    <span>Staff Availability</span>
                    <Check size={16} color="#16a34a" />
                  </div>
                </div>
              </div>
            </div>

            {/* POLLING OFFICERS */}
            <div className="card">
              <div className="panel-header">
                <h2>Polling Officers</h2>
                <span className="panel-link" onClick={() => alert("Manage Officers feature")}>Manage Officers →</span>
              </div>

              <div className="officers-list">
                {officers.map(officer => (
                  <div className="officer-item" key={officer.id}>
                    <div className="officer-info">
                      <Users size={16} color="#64748b" />
                      <span>{officer.name}</span>
                    </div>
                    <span className={`officer-status ${officer.status === 'Present' ? 'present' : 'absent'}`}>
                      ● {officer.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* VOTER TURNOUT (HOURLY) */}
            <div className="card">
              <div className="panel-header">
                <h2>Voter Turnout (Hourly)</h2>
                <span className="panel-link">See Full Turnout Report →</span>
              </div>

              <div className="turnout-graph-container">
                <div className="turnout-grid-line" style={{ top: '25%' }} />
                <div className="turnout-grid-line" style={{ top: '50%' }} />
                <div className="turnout-grid-line" style={{ top: '75%' }} />

                <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, bottom: 24 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 20 80 Q 80 70 140 60 T 260 25 L 260 95 L 20 95 Z"
                    fill="url(#chartGrad)"
                  />

                  <path
                    d="M 20 80 Q 80 70 140 60 T 260 25"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                  />

                  <circle cx="20" cy="80" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="95" cy="71" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="170" cy="57" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="245" cy="27" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />

                  <rect x="225" y="2" width="30" height="18" rx="4" fill="#dbeafe" />
                  <text x="230" y="14" fill="#1e3a8a" fontSize="10" fontWeight="bold">{turnout.percentage}%</text>
                </svg>
              </div>

              <div className="hourly-labels">
                <span>8 AM</span>
                <span>9 AM</span>
                <span>10 AM</span>
                <span>11 AM</span>
                <span>12 PM</span>
                <span>1 PM</span>
                <span>2 PM</span>
                <span>3 PM</span>
                <span>4 PM</span>
                <span>5 PM</span>
              </div>
            </div>
          </section>

          {/* GRID ROW 2: QUEUE STATUS, INCIDENTS, EVM, COMPLAINTS VERIFICATION */}
          <section className="grid-row-4col">
            {/* CURRENT QUEUE STATUS */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <h2>Current Queue Status</h2>
              </div>

              <div className="queue-stats">
                <div className="queue-metric">
                  <div className="queue-metric-icon">
                    <Users size={20} />
                  </div>
                  <div className="queue-metric-info">
                    <h3>{queue.count}</h3>
                    <p>People in Queue</p>
                  </div>
                </div>

                <div className="queue-metric">
                  <div className="queue-metric-icon">
                    <Clock size={20} />
                  </div>
                  <div className="queue-metric-info">
                    <h3>~ {queue.waitTime} min</h3>
                    <p>Estimated Wait Time</p>
                  </div>
                </div>
              </div>

              <div className="btn-group" style={{ marginTop: 'auto' }}>
                <button className="btn-secondary" onClick={() => handleAction('report_queue')}>Report Long Queue</button>
                <button className="btn-secondary" onClick={() => handleAction('request_staff')}>Request Extra Staff</button>
              </div>
            </div>

            {/* RECENT INCIDENTS */}
            <div className="card">
              <div className="panel-header">
                <h2>Recent Incidents</h2>
                <span className="panel-link" onClick={() => handleAction('report_incident')}>Report New Incident</span>
              </div>

              <div className="incidents-list" style={{ overflowY: 'auto', maxHeight: '180px' }}>
                {incidents.map((incident, i) => (
                  <div className="incident-item" key={incident.id || i}>
                    <div className={`incident-icon ${incident.status === 'Resolved' ? 'success' : 'warning'}`}>
                      <AlertTriangle size={14} />
                    </div>
                    <div className="incident-details">
                      <div className="incident-title">{incident.type}</div>
                      <div className="incident-time">Reported: {incident.time}</div>
                    </div>
                    <span className={`status-pill ${incident.status === 'Resolved' ? 'success' : 'warning'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* EVM STATUS */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <h2>EVM Status</h2>
              </div>

              <div className="evm-info-container">
                <div className="evm-mock-image">
                  <Cpu size={36} color="#475569" />
                </div>
                <div className="evm-details">
                  <span className="evm-label">Machine ID</span>
                  <div className="evm-id">{evmStatus.id}</div>
                </div>
              </div>

              <div style={{ flexGrow: 1 }}>
                <div className="evm-meta-item">
                  <span>Status</span>
                  <span style={{ color: evmStatus.status === 'Operational' ? '#16a34a' : '#dc2626', fontWeight: '800' }}>● {evmStatus.status}</span>
                </div>
                <div className="evm-meta-item">
                  <span>Battery</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Battery size={14} color={evmStatus.battery > 50 ? "#16a34a" : "#dc2626"} /> {evmStatus.battery}%
                  </span>
                </div>
                <div className="evm-meta-item">
                  <span>Last Checked</span>
                  <span>{evmStatus.lastChecked}</span>
                </div>
                    <div className="btn-group" style={{ marginTop: 'auto' }}>
                      <button className="btn-secondary" onClick={() => handleAction('report_fault')}>Report Fault</button>
                      <button className="btn-secondary" onClick={() => handleAction('request_replacement')}>Request Replacement</button>
                    </div>
                  </div>
                </div>

            {/* COMPLAINTS PREVIEW CARD */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <h2>Complaints Desk</h2>
                <span className="panel-link" onClick={() => setActiveMenu('Complaints')}>Manage All →</span>
              </div>

              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Pending</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>
                      {complaints.filter(c => c.status === 'pending').length}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '12px', border: '1px solid #fca5a5', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Escalated</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>
                      {complaints.filter(c => c.status === 'escalated').length}
                    </div>
                  </div>
                </div>

                {/* Latest pending complaint preview */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left' }}>Latest Tickets</span>
                  {complaints.filter(c => c.status === 'pending' || c.status === 'escalated').slice(0, 2).length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', gap: '6px' }}>
                      <Check size={16} color="#16a34a" />
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>No active complaints</span>
                    </div>
                  ) : (
                    complaints.filter(c => c.status === 'pending' || c.status === 'escalated').slice(0, 2).map(c => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <div style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{c.type}</span>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>EPIC: {c.id} • {c.status}</div>
                        </div>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: c.status === 'escalated' ? '#dc2626' : '#3b82f6'
                        }}></span>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setActiveMenu('Complaints')}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: 'auto'
                  }}
                >
                  Open Operations Center
                </button>
              </div>
            </div>
          </section>

          {/* GRID ROW 3: QUICK COMM, CHECKLIST, AI CHAT ASSISTANT */}
          <section className="grid-row-3col">
            {/* QUICK COMMUNICATION */}
            <div className="card">
              <div className="panel-header">
                <h2>Quick Communication</h2>
                <span className="panel-link">Recent Call Logs →</span>
              </div>

              <div className="comm-grid">
                <div className="comm-item" onClick={() => alert("Calling Sector Officer...")}>
                  <div className="comm-icon">
                    <PhoneCall size={20} />
                  </div>
                  <span className="comm-label">Call</span>
                  <span className="comm-value">Sector Officer</span>
                </div>

                <div className="comm-item" onClick={() => alert("Calling Control Room...")}>
                  <div className="comm-icon">
                    <PhoneCall size={20} />
                  </div>
                  <span className="comm-label">Call</span>
                  <span className="comm-value">Control Room</span>
                </div>

                <div className="comm-item" onClick={() => alert("Calling Police...")}>
                  <div className="comm-icon" style={{ color: '#dc2626' }}>
                    <ShieldAlert size={20} />
                  </div>
                  <span className="comm-label" style={{ color: '#ef4444' }}>Call</span>
                  <span className="comm-value">Police</span>
                </div>

                <div className="comm-item video" onClick={() => alert("Initiating Video Conference...")}>
                  <div className="comm-icon">
                    <Cpu size={20} />
                  </div>
                  <span className="comm-label">Video Call</span>
                  <span className="comm-value">Conference</span>
                </div>
              </div>
            </div>

            {/* POLL START CHECKLIST */}
            <div className="card">
              <div className="panel-header">
                <h2>Poll Start Checklist</h2>
                <span className="panel-link">View Full Checklist →</span>
              </div>

              <div className="checklist-list">
                {checklist.map(item => (
                  <div
                    className={`checklist-item ${item.checked ? 'checked' : ''}`}
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                  >
                    <div className="checkbox-mock">
                      {item.checked && <Check size={12} />}
                    </div>
                    <span>{item.label}</span>
                    <span className="checklist-time">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI ASSISTANT CHAT */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <h2>AI Assistant</h2>
                <span className="panel-link">Ask SOP Question →</span>
              </div>

              <div className="ai-assistant-container" style={{ flexGrow: 1, justifyContent: 'space-between', display: 'flex', flexDirection: 'column', height: '220px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', height: '160px', paddingRight: '4px' }}>
                  {chatMessages.map((msg, i) => (
                    <div className={`ai-chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`} key={i}>
                      {msg.sender === 'bot' && <Cpu size={14} className="ai-bot-icon" />}
                      <span>{msg.text}</span>
                    </div>
                  ))}
                </div>

                <form className="ai-input-group" onSubmit={handleChatSend}>
                  <input
                    type="text"
                    className="ai-input"
                    placeholder="Ask AI Assistant about SOP guidelines..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="ai-send-btn">
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          </section>
          </>
          )}

          {activeMenu === 'Complaints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
              {/* Page Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Advanced Operations & Complaints Center</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Verify citizen tickets, dispatch field officers, and escalate critical issues.</p>
                </div>
                
                {/* Sub tabs */}
                <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
                  <button
                    onClick={() => setComplaintTab('pending')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: complaintTab === 'pending' ? '#ffffff' : 'transparent',
                      color: complaintTab === 'pending' ? '#0f172a' : '#64748b',
                      boxShadow: complaintTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Pending Verification ({complaints.filter(c => c.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setComplaintTab('operations')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: complaintTab === 'operations' ? '#ffffff' : 'transparent',
                      color: complaintTab === 'operations' ? '#0f172a' : '#64748b',
                      boxShadow: complaintTab === 'operations' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Operations Desk ({complaints.filter(c => c.status === 'verified' || c.status === 'escalated' || c.status === 'resolved_above').length})
                  </button>
                  <button
                    onClick={() => setComplaintTab('history')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: complaintTab === 'history' ? '#ffffff' : 'transparent',
                      color: complaintTab === 'history' ? '#0f172a' : '#64748b',
                      boxShadow: complaintTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Complaint History ({complaintsHistory.length})
                  </button>
                </div>
              </div>

              {/* Content Area */}
              {complaintTab === 'pending' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {complaints.filter(c => c.status === 'pending').length === 0 ? (
                    <div className="card" style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '14px', borderRadius: '50%' }}>
                          <Check size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>All Clear!</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>No pending citizen complaints requiring verification.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                      {complaints.filter(c => c.status === 'pending').map(c => (
                        <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '800',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: c.category === 'Security' ? '#fee2e2' : c.category === 'EVM' ? '#ffedd5' : '#f0f9ff',
                                color: c.category === 'Security' ? '#ef4444' : c.category === 'EVM' ? '#f97316' : '#0284c7',
                                textTransform: 'uppercase'
                              }}>
                                {c.category} Issue
                              </span>
                              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '8px 0 4px' }}>{c.type}</h3>
                              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                                EPIC ID: <span style={{ fontWeight: '700', color: '#334155' }}>{c.id}</span> • Time: {c.time}
                              </p>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
                              Status: Pending Verification
                            </span>
                          </div>
                          
                          {c.description && (
                            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', borderLeft: '3px solid #cbd5e1', fontSize: '13px', color: '#475569' }}>
                              {c.description}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                            <button
                              onClick={async () => {
                                await handleAction('verify_complaint', { id: c.id });
                                setComplaintTab('operations');
                              }}
                              style={{
                                backgroundColor: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 20px',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
                              }}
                            >
                              Accept & Verify
                            </button>
                            <button
                              onClick={() => handleAction('reject_complaint', { id: c.id })}
                              style={{
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 20px',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                              }}
                            >
                              Reject & Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : complaintTab === 'operations' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {complaints.filter(c => c.status === 'verified' || c.status === 'escalated' || c.status === 'resolved_above').length === 0 ? (
                    <div className="card" style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '14px', borderRadius: '50%' }}>
                          <Activity size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>No Active Tickets</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>No verified complaints are currently active on the operations panel.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                      {complaints.filter(c => c.status === 'verified' || c.status === 'escalated' || c.status === 'resolved_above').map(c => {
                        const isEscalated = c.status === 'escalated';
                        const isResolvedAbove = c.status === 'resolved_above';
                        return (
                          <div 
                            key={c.id} 
                            className="card" 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '16px', 
                              backgroundColor: isEscalated ? '#fff5f5' : (isResolvedAbove ? '#fefce8' : '#ffffff'), 
                              borderRadius: '20px', 
                              padding: '24px', 
                              border: isEscalated ? '2px solid #f87171' : (isResolvedAbove ? '2px solid #fef08a' : '1px solid #e2e8f0'), 
                              textAlign: 'left',
                              animation: 'none'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: c.category === 'Security' ? '#fee2e2' : c.category === 'EVM' ? '#ffedd5' : '#f0f9ff',
                                  color: c.category === 'Security' ? '#ef4444' : c.category === 'EVM' ? '#f97316' : '#0284c7',
                                  textTransform: 'uppercase'
                                }}>
                                  {c.category} Issue
                                </span>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '8px 0 4px' }}>{c.type}</h3>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                                  EPIC ID: <span style={{ fontWeight: '700', color: '#334155' }}>{c.id}</span> • Time: {c.time}
                                </p>
                              </div>
                              
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                backgroundColor: isEscalated ? '#fee2e2' : (isResolvedAbove ? '#fef9c3' : '#e0f2fe'),
                                color: isEscalated ? '#dc2626' : (isResolvedAbove ? '#a16207' : '#0369a1'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: isEscalated ? '#dc2626' : (isResolvedAbove ? '#ca8a04' : '#0284c7')
                                }}></span>
                                {isEscalated ? 'ESCALATED' : (isResolvedAbove ? 'RESOLVED FROM ABOVE' : 'VERIFIED ACTIVE')}
                              </span>
                            </div>

                            {c.description && (
                              <div style={{ backgroundColor: isEscalated ? '#fee2e2' : (isResolvedAbove ? '#fefce8' : '#f8fafc'), padding: '12px 16px', borderRadius: '10px', borderLeft: '3px solid #cbd5e1', fontSize: '13px', color: '#475569' }}>
                                {c.description}
                              </div>
                            )}

                            {isResolvedAbove && c.resolvedAboveSummary && (
                              <div style={{ 
                                backgroundColor: '#fef9c3', 
                                border: '1px solid #fef08a', 
                                padding: '12px 16px', 
                                borderRadius: '10px', 
                                fontSize: '13px', 
                                color: '#854d0e',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                <span style={{ fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: '#a16207' }}>
                                  Above Resolution Summary (CM)
                                </span>
                                <span>{c.resolvedAboveSummary}</span>
                              </div>
                            )}

                            {/* Dispatching desk */}
                            {!isResolvedAbove && (
                              <div style={{ 
                                backgroundColor: isEscalated ? 'rgba(254, 226, 226, 0.5)' : '#f8fafc', 
                                padding: '16px', 
                                borderRadius: '16px', 
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                              }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Personnel Dispatch Desk
                                </span>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <select
                                    value={dispatchSelection[c.id] || 'Security Personnel'}
                                    onChange={(e) => setDispatchSelection(prev => ({ ...prev, [c.id]: e.target.value }))}
                                    style={{
                                      backgroundColor: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '8px',
                                      padding: '8px 12px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      outline: 'none',
                                      cursor: 'pointer',
                                      flexGrow: 1
                                    }}
                                  >
                                    <option>Polling Officer 1</option>
                                    <option>Polling Officer 2</option>
                                    <option>Polling Officer 3</option>
                                    <option>Security Personnel</option>
                                    <option>Sector Control</option>
                                  </select>
                                  <button
                                    onClick={() => handleAction('dispatch_personnel', { 
                                      complaintId: c.id, 
                                      personnel: dispatchSelection[c.id] || 'Security Personnel' 
                                    })}
                                    style={{
                                      backgroundColor: '#0f172a',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '8px 16px',
                                      fontSize: '13px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s'
                                    }}
                                  >
                                    Dispatch
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Action logs history inside the ticket */}
                            {c.logs && c.logs.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Timeline & Action Logs</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                                  {c.logs.map((log, i) => (
                                    <div key={i} style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                                      {log}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                              {isResolvedAbove ? (
                                <button
                                  onClick={() => handleAction('complete_complaint', { id: c.id })}
                                  style={{
                                    backgroundColor: '#16a34a',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px 20px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
                                  }}
                                >
                                  Complete Complaint
                                </button>
                              ) : isEscalated ? (
                                <>
                                  {userRole === 'CM' ? (
                                    <button
                                      onClick={() => {
                                        const summary = prompt("Enter a short resolution summary for this complaint:");
                                        if (summary) {
                                          handleAction('resolve_from_above', { id: c.id, summary });
                                        }
                                      }}
                                      style={{
                                        backgroundColor: '#2563eb',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '10px 20px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                                      }}
                                    >
                                      Resolve Escalation (CM)
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', alignSelf: 'center' }}>
                                      ⏳ Awaiting response from Sector Officer / CM
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleAction('resolve_complaint', { id: c.id })}
                                    style={{
                                      backgroundColor: '#16a34a',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '10px',
                                      padding: '10px 20px',
                                      fontSize: '13px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
                                    }}
                                  >
                                    Resolve ticket
                                  </button>

                                  <button
                                    onClick={() => handleAction('escalate_complaint', { id: c.id })}
                                    style={{
                                      backgroundColor: '#eab308',
                                      color: '#0f172a',
                                      border: 'none',
                                      borderRadius: '10px',
                                      padding: '10px 20px',
                                      fontSize: '13px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      boxShadow: '0 4px 6px -1px rgba(234, 179, 8, 0.2)'
                                    }}
                                  >
                                    Escalate to Sector Officer
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {complaintsHistory.length === 0 ? (
                    <div className="card" style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '14px', borderRadius: '50%' }}>
                          <Check size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>No History Logged</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>No resolved, completed, or rejected tickets exist in the log.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                      {complaintsHistory.map(c => {
                        const isResolved = c.status === 'resolved' || c.status === 'completed';
                        const isRejected = c.status === 'rejected';
                        return (
                          <div 
                            key={c.id} 
                            className="card" 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '16px', 
                              backgroundColor: '#ffffff', 
                              borderRadius: '20px', 
                              padding: '24px', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: c.category === 'Security' ? '#fee2e2' : c.category === 'EVM' ? '#ffedd5' : '#f0f9ff',
                                  color: c.category === 'Security' ? '#ef4444' : c.category === 'EVM' ? '#f97316' : '#0284c7',
                                  textTransform: 'uppercase'
                                }}>
                                  {c.category} Issue
                                </span>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '8px 0 4px' }}>{c.type}</h3>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                                  EPIC ID: <span style={{ fontWeight: '700', color: '#334155' }}>{c.id}</span>
                                </p>
                              </div>
                              
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                backgroundColor: isResolved ? '#dcfce7' : (isRejected ? '#fee2e2' : '#f1f5f9'),
                                color: isResolved ? '#15803d' : (isRejected ? '#b91c1c' : '#475569'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: isResolved ? '#16a34a' : (isRejected ? '#ef4444' : '#64748b')
                                }}></span>
                                {c.status.toUpperCase()}
                              </span>
                            </div>

                            {c.description && (
                              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', borderLeft: '3px solid #cbd5e1', fontSize: '13px', color: '#475569' }}>
                                {c.description}
                              </div>
                            )}

                            {/* Detailed Time and Personnel Info */}
                            <div style={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Detailed Lifecycle Timestamps
                              </span>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: '13px', color: '#334155' }}>
                                <div>⏱️ <strong>Reported At:</strong> {c.time}</div>
                                {c.verifiedAt && <div>✅ <strong>Verified At:</strong> {c.verifiedAt}</div>}
                                {c.escalatedAt && <div>⚠️ <strong>Escalated At:</strong> {c.escalatedAt}</div>}
                                {c.resolvedAboveAt && <div>🏛️ <strong>Resolved Above:</strong> {c.resolvedAboveAt}</div>}
                                {c.resolvedAt && <div>🎉 <strong>Resolved At:</strong> {c.resolvedAt}</div>}
                                {c.completedAt && <div>📦 <strong>Completed At:</strong> {c.completedAt}</div>}
                                {c.rejectedAt && <div>❌ <strong>Rejected At:</strong> {c.rejectedAt}</div>}
                              </div>

                              {c.dispatches && c.dispatches.length > 0 && (
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Personnel Dispatch Log
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {c.dispatches.map((disp, i) => (
                                      <div key={i} style={{ fontSize: '12px', color: '#475569' }}>
                                        🏃 Dispatched <strong>{disp.personnel}</strong> at {disp.time}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {c.resolvedAboveSummary && (
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#ca8a04', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    Above Resolution Summary (CM)
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#854d0e', fontStyle: 'italic' }}>
                                    "{c.resolvedAboveSummary}"
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Full timeline log list for verification */}
                            {c.logs && c.logs.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Full Audit Trail</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                  {c.logs.map((log, i) => (
                                    <div key={i} style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
                                      {log}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeMenu !== 'Dashboard' && activeMenu !== 'Complaints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', textAlign: 'left' }}>
              
              {activeMenu === 'Booth Status' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Booth Telemetry & Status Monitor</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Real-time hardware status, connectivity, and environmental logging for Booth {boothId}.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Component Diagnostics</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { name: "Internet Connection Status", val: "Active (High-Speed)", status: "success" },
                          { name: "Mains Power Grid", val: "Operational", status: "success" },
                          { name: "Backup Battery Level", val: "87% (Good)", status: "success" },
                          { name: "CCTV Stream Status", val: "Broadcasting", status: "success" },
                          { name: "EVM Control Unit Link", val: "Connected", status: "success" }
                        ].map((comp, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                            <span style={{ color: '#475569', fontWeight: '500' }}>{comp.name}</span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: comp.status === 'success' ? '#dcfce7' : '#fee2e2',
                              color: comp.status === 'success' ? '#16a34a' : '#ef4444'
                            }}>{comp.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Location Diagnostics</h3>
                      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155' }}>
                        <div>📍 <strong>Polling Station:</strong> {boothData.name}</div>
                        <div>Constituency: <strong>{boothData.constituency}</strong></div>
                        <div>Lattitude / Longitude: <strong>21.1458° N, 79.0882° E</strong></div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 'bold' }}>● GPS Location Verified & Locked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Officers' && (
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Staff & Officers Management</h2>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Assign, check-in, and review roles of election staff at the polling station.</p>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Officer</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Assigned Counter Role</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Check-in Status</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {officers.map(officer => (
                          <tr key={officer.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{officer.name}</td>
                            <td style={{ padding: '12px' }}>
                              <select
                                defaultValue={officer.id === 1 ? "PO-1 (Verification)" : officer.id === 2 ? "PO-2 (Ink & Entry)" : officer.id === 3 ? "PO-3 (EVM Operator)" : "Auxiliary Staff"}
                                onChange={(e) => {
                                  alert(`Role updated for ${officer.name} to ${e.target.value}`);
                                }}
                                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '600' }}
                              >
                                <option>PO-1 (Verification)</option>
                                <option>PO-2 (Ink & Entry)</option>
                                <option>PO-3 (EVM Operator)</option>
                                <option>Auxiliary Staff</option>
                              </select>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: '700',
                                backgroundColor: officer.status === 'Present' ? '#dcfce7' : '#fee2e2',
                                color: officer.status === 'Present' ? '#16a34a' : '#ef4444'
                              }}>
                                {officer.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button
                                onClick={() => alert(`Broadcasting alert notification to ${officer.name}...`)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                              >
                                Send Alert
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'Voter Turnout' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Detailed Voter Turnout Report</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Review elector demographics and turnout percentages for Booth 147.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Demographic Turnout Split</h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                            <th style={{ padding: '8px 0', fontWeight: '700', color: '#475569' }}>Gender Category</th>
                            <th style={{ padding: '8px 0', fontWeight: '700', color: '#475569' }}>Total Enrolled</th>
                            <th style={{ padding: '8px 0', fontWeight: '700', color: '#475569' }}>Votes Cast</th>
                            <th style={{ padding: '8px 0', fontWeight: '700', color: '#475569' }}>Turnout %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { g: "Male", total: 680, voted: 298, pct: "43.8%" },
                            { g: "Female", total: 604, voted: 242, pct: "40.0%" },
                            { g: "Third Gender", total: 3, voted: 3, pct: "100.0%" }
                          ].map((dem, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 0', fontWeight: '600' }}>{dem.g}</td>
                              <td style={{ padding: '10px 0' }}>{dem.total}</td>
                              <td style={{ padding: '10px 0', fontWeight: '600', color: '#16a34a' }}>{dem.voted}</td>
                              <td style={{ padding: '10px 0', fontWeight: '700', color: '#1e3a8a' }}>{dem.pct}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Hourly Target Calculator</h3>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Input target turnout forecast to estimate processing rates required.</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Target Turnout Goal (%)</label>
                          <input
                            type="number"
                            defaultValue={75}
                            min="1"
                            max="100"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                            onChange={(e) => {
                              const pct = parseFloat(e.target.value);
                              if (pct > 0) {
                                const needed = Math.round((pct / 100) * turnout.total) - turnout.voted;
                                alert(`To reach ${pct}%, you need ${needed} more electors to cast their votes.`);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Incidents' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Polling Station Incident Logs</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Log and track security, EVM faults, or medical incidents at the polling booth.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Active Incident Logs</h3>
                      {incidents.map((inc, idx) => (
                        <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ef4444', backgroundColor: '#fef2f2', padding: '3px 8px', borderRadius: '8px' }}>
                              {inc.id}
                            </span>
                            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: '8px 0 2px' }}>{inc.type}</h4>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Reported: {inc.time}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: i.status === 'Resolved' ? 'In Progress' : 'Resolved' } : i));
                              alert("Incident status updated.");
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: inc.status === 'Resolved' ? '#dcfce7' : '#ffedd5',
                              color: inc.status === 'Resolved' ? '#16a34a' : '#ea580c',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {inc.status}
                          </button>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const type = e.target.type.value;
                        const desc = e.target.desc.value;
                        const severity = e.target.severity.value;
                        if (!type || !desc) {
                          alert("Please fill in type and description.");
                          return;
                        }
                        const newInc = {
                          id: `INC-${Math.floor(Math.random() * 900) + 100}`,
                          type: `${severity}: ${type}`,
                          time: timeState.current,
                          status: "In Progress"
                        };
                        setIncidents(prev => [newInc, ...prev]);
                        e.target.reset();
                        alert("Incident reported successfully.");
                      }}
                      style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Log New Incident</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Incident Classification</label>
                        <select name="type" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}>
                          <option>EVM Unit Failure</option>
                          <option>Security / Crowd Disruption</option>
                          <option>Power Outage</option>
                          <option>Medical Emergency</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Severity</label>
                        <select name="severity" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}>
                          <option>High Severity</option>
                          <option>Medium Severity</option>
                          <option>Low Severity</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Incident Details</label>
                        <textarea name="desc" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', height: '80px', outline: 'none' }} placeholder="Provide brief description..."></textarea>
                      </div>

                      <button type="submit" style={{ padding: '10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                        Report Incident
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeMenu === 'EVM Management' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>EVM & VVPAT Management Desk</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Verify components serial numbers, check battery status, and log mock poll certifications.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>EVM Hardware Components</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>Control Unit (CU) ID</span>
                          <strong style={{ color: '#1e293b' }}>CU-90123A</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>Balloting Unit (BU) ID</span>
                          <strong style={{ color: '#1e293b' }}>BU-45678B</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>VVPAT Machine ID</span>
                          <strong style={{ color: '#1e293b' }}>VP-14789C</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>Power/Battery Level</span>
                          <strong style={{ color: '#16a34a' }}>{evmStatus.battery}%</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Mock Poll Certification</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>All polling stations must conduct a mock poll of at least 50 votes before opening the actual poll.</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          alert("Mock Poll Certificate generated successfully and synchronized with Sector Command Network.");
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#16a34a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Generate Mock Poll Certificate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Communication' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Booth Operations Secure Messenger</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Broadcast announcements or direct critical instructions to counter staff.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '350px', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', backgroundColor: '#f8fafc' }}>
                      <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ alignSelf: 'flex-start', backgroundColor: '#fff', padding: '10px 14px', borderRadius: '12px', maxWidth: '70%', fontSize: '13px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ fontSize: '10px', display: 'block', color: '#2563eb', marginBottom: '2px' }}>Polling Officer 2</strong>
                          Ink supply is running low. Please check storage.
                          <span style={{ fontSize: '9px', display: 'block', textAlign: 'right', opacity: 0.6, marginTop: '4px' }}>11:08 AM</span>
                        </div>
                        
                        <div style={{ alignSelf: 'flex-end', backgroundColor: '#2563eb', color: '#fff', padding: '10px 14px', borderRadius: '12px', maxWidth: '70%', fontSize: '13px' }}>
                          <strong style={{ fontSize: '10px', display: 'block', opacity: 0.8, marginBottom: '2px' }}>You</strong>
                          Auxiliary ink kit dispatched via helper.
                          <span style={{ fontSize: '9px', display: 'block', textAlign: 'right', opacity: 0.6, marginTop: '4px' }}>11:10 AM</span>
                        </div>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const txt = e.target.msg.value;
                          if (!txt.trim()) return;
                          alert(`Broadcast sent to all Polling Officers: "${txt}"`);
                          e.target.reset();
                        }}
                        style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}
                      >
                        <input
                          name="msg"
                          type="text"
                          style={{ flexGrow: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                          placeholder="Broadcast instruction to all PO counters..."
                        />
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Broadcast
                        </button>
                      </form>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Quick Broadcast Templates</h3>
                      {[
                        "We are starting the next hourly count. Report values.",
                        "Queue size outside is high. Speed up processing.",
                        "Ensure priority entrance for senior citizens.",
                        "Poll closes in 30 minutes. Secure registers."
                      ].map((tmpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            alert(`Broadcast sent: "${tmpl}"`);
                          }}
                          style={{
                            padding: '12px',
                            backgroundColor: '#fff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            fontSize: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            cursor: 'pointer',
                            color: '#475569',
                            transition: 'all 0.2s'
                          }}
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Reports' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Official Election Reports & Form 17C</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Fill, verify, and submit Form 17C Part I and Presiding Officer Diary logs.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        alert("Form 17C submitted successfully. Safe-key generated.");
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Form 17C (Part I) Account of Votes</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', alignSelf: 'center' }}>Total Electors Assigned to Booth</label>
                        <input type="number" defaultValue={1287} readOnly style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f1f5f9' }} />

                        <label style={{ fontSize: '12px', fontWeight: '600', alignSelf: 'center' }}>Voters entered in Register (17A)</label>
                        <input type="number" defaultValue={543} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />

                        <label style={{ fontSize: '12px', fontWeight: '600', alignSelf: 'center' }}>Voters deciding not to vote</label>
                        <input type="number" defaultValue={0} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />

                        <label style={{ fontSize: '12px', fontWeight: '600', alignSelf: 'center' }}>Voters not allowed to vote</label>
                        <input type="number" defaultValue={0} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />

                        <label style={{ fontSize: '12px', fontWeight: '600', alignSelf: 'center' }}>Votes recorded in EVM</label>
                        <input type="number" defaultValue={543} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                      </div>

                      <button type="submit" style={{ padding: '12px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                        Submit Form 17C
                      </button>
                    </form>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Verification Status</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                        <div>📋 <strong>Mock Poll Certificate:</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Submitted</span></div>
                        <div>📕 <strong>Presiding Officer Diary:</strong> <span style={{ color: '#ea580c', fontWeight: 'bold' }}>Pending Close</span></div>
                        <div>🗳️ <strong>Form 17C Submission:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Pending Close</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Checklists' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Presiding Officer Operational Checklists</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Verify pre-poll, during-poll, and close-of-poll procedural checks.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          backgroundColor: item.checked ? '#f0fdf4' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            border: '2px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: item.checked ? '#16a34a' : 'transparent',
                            borderColor: item.checked ? '#16a34a' : '#cbd5e1'
                          }}>
                            {item.checked && <Check size={14} color="#fff" />}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', textDecoration: item.checked ? 'line-through' : 'none' }}>
                            {item.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'Materials' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Booth Inventory & Materials Receipt Checklist</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Verify that all election materials, security seals, and stationery kits are received and logged.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                    {[
                      { name: "EVM Control Unit & Balloting Unit", status: "Verified & Sealed" },
                      { name: "VVPAT Printing Unit", status: "Verified & Sealed" },
                      { name: "Marked Copy of Electoral Roll", status: "Received" },
                      { name: "Register of Voters (Form 17A)", status: "Received" },
                      { name: "Indelible Ink Phials (2 Nos)", status: "Received" },
                      { name: "Security Seals & Paper Seals", status: "Verified & Signed" }
                    ].map((mat, idx) => (
                      <div key={idx} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{mat.name}</span>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '8px' }}>
                          {mat.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'AI Assistant' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>AI SOP Advisor</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Ask questions directly to the offline SOP bot regarding election guidelines and procedures.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '350px', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', backgroundColor: '#f8fafc' }}>
                    <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {chatMessages.map((msg, i) => (
                        <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'user' ? '#2563eb' : '#fff', color: msg.sender === 'user' ? '#fff' : '#0f172a', padding: '10px 14px', borderRadius: '12px', maxWidth: '70%', fontSize: '13px', border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0' }}>
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    <form className="ai-input-group" onSubmit={handleChatSend} style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="Ask AI Assistant about SOP guidelines..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        style={{ flexGrow: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                      />
                      <button type="submit" className="ai-send-btn" style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Ask
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeMenu === 'SOP / Help' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>SOP & Guidelines Knowledgebase</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Searchable offline repository of Election Commission handbook guidelines for Presiding Officers.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { q: "Duties of Presiding Officer under Rule 35", a: "The Presiding Officer is in overall charge of the polling station. Duties include setting up the booth, verifying EVM serials, conducting mock poll, issuing tendered ballot papers, checking identity documents, maintaining order, and sealing EVMs at poll close." },
                      { q: "SOP for voting compartment visibility", a: "Ensure the voting compartment is set up in a way that elector's privacy is maintained while being visible to the staff to ensure no photography or vandalism is taking place." },
                      { q: "Guidelines for closing of poll", a: "At the designated hour, the PO declares poll closed. Any voter standing in the queue at the closing hour must be allowed to vote. Distribute slips from the end of the queue. Press the 'CLOSE' button on the Control Unit, seal the machine, and fill Form 17C." }
                    ].map((sop, idx) => (
                      <div key={idx} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                        <strong style={{ fontSize: '14px', color: '#1e3a8a', display: 'block', marginBottom: '8px' }}>❓ {sop.q}</strong>
                        <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4 }}>{sop.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* FOOTER METRICS */}
        <footer style={{
          textAlign: 'center',
          padding: '20px 0',
          fontSize: '11px',
          color: '#64748b',
          borderTop: '1px solid #e2e8f0',
          marginTop: 'auto',
          backgroundColor: '#ffffff'
        }}>
          © 2026 NagarVaani Election System. All rights reserved. • Version 1.0.0
        </footer>
      
        {activeMenu === 'Conference Call' && (
          <div style={{ padding: '24px' }}>
            <div className="card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
              <VideoCall />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
