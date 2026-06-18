import React, { useState, useEffect } from 'react';
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

  const [healthScore, setHealthScore] = useState(87);
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
            <div className="card" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px', margin: '20px 0', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: '#f0f9ff', color: '#0284c7', padding: '16px', borderRadius: '50%' }}>
                  <LayoutDashboard size={48} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{activeMenu} Panel</h2>
                <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px' }}>
                  This module is currently running in automated synchronization mode. Live feeds and controls are active via the main command oversight network.
                </p>
                <button 
                  className="btn-secondary" 
                  onClick={() => setActiveMenu('Dashboard')}
                  style={{ marginTop: '12px', padding: '10px 20px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Return to Dashboard
                </button>
              </div>
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
      </main>
    </div>
  );
}
