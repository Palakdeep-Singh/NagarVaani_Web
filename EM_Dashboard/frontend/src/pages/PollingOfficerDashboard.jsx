import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Search, UserCheck, Droplets, CheckSquare, 
  Accessibility, AlertTriangle, PhoneCall, List, Check,
  Clock, ShieldAlert, LogOut, ArrowRight, Bell, ChevronDown, 
  User, Users, RefreshCw, MessageSquare, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

export default function PollingOfficerDashboard({ user, onLogout }) {
  const userName = user?.name || 'Polling Officer 2';
  const userRole = user?.role || 'Polling Officer';

  // State Management
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [voterProcessingOpen, setVoterProcessingOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState('11:33 AM');
  
  // Interactive Telemetry & Actions
  const [votersProcessed, setVotersProcessed] = useState(268);
  const [queueCount, setQueueCount] = useState(18);
  const [avgProcessTime, setAvgProcessTime] = useState(45);
  const [breakStatus, setBreakStatus] = useState(false);
  
  // Interactive Checklist
  const [checklist, setChecklist] = useState([
    { id: 1, label: "Mock Poll Completed", time: "07:15 AM", checked: true },
    { id: 2, label: "EVM Sealed", time: "07:25 AM", checked: true },
    { id: 3, label: "Voter Verification Started", time: "07:30 AM", checked: true },
    { id: 4, label: "Ink & Entry Control", time: "07:35 AM", checked: true },
    { id: 5, label: "Voting Enabled (PO-3)", time: "07:45 AM", checked: true }
  ]);

  // Interactive Complaints
  const [complaintTab, setComplaintTab] = useState('All');
  const [complaints, setComplaints] = useState([
    { id: "XXX12", type: "Long Queue Outside Booth", citizen: "Citizen ID: XXX12", time: "11:08 AM", status: "In Progress" },
    { id: "XXX45", type: "VVPAT Display Issue", citizen: "Citizen ID: XXX45", time: "10:45 AM", status: "Resolved" }
  ]);

  // Presiding Officer Messages & Actions
  const [poMessage, setPoMessage] = useState({
    sender: "Presiding Officer",
    time: "11:20 AM",
    status: "New",
    text: "Please check the drinking water arrangement outside the booth. Report once verified."
  });

  // Setup Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateString(now.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleChecklist = (id) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : item
    ));
  };

  const handleAcknowledgePoMessage = () => {
    if (poMessage.status === 'New') {
      setPoMessage(prev => ({ ...prev, status: 'Acknowledged' }));
      alert("Task acknowledged. Confirmation sent to Presiding Officer.");
    }
  };

  const handleCompletePoMessage = () => {
    setPoMessage(prev => ({ ...prev, status: 'Completed', text: "No pending tasks from Presiding Officer." }));
    alert("Task marked as completed. Status updated in PO portal.");
  };

  const handleQuickAction = (actionName) => {
    if (actionName === 'Verify Voter') {
      const citizen = prompt("Enter Voter ID or Name to verify:");
      if (citizen) {
        setVotersProcessed(prev => prev + 1);
        setQueueCount(prev => Math.max(0, prev - 1));
        alert(`Voter "${citizen}" verified and registered. Turnout updated.`);
      }
    } else if (actionName === 'Search Voter') {
      alert("Redirecting to Voter Search panel...");
    } else if (actionName === 'Mark Inked') {
      alert("Ink marking verified for current voter.");
    } else if (actionName === 'Enable Vote') {
      alert("EVM ballot activated for current booth voter.");
    } else if (actionName === 'Report Issue') {
      const issue = prompt("Describe the issue to report to the Presiding Officer:");
      if (issue) {
        alert(`Issue reported: "${issue}". Sent to Presiding Officer.`);
      }
    } else if (actionName === 'Call Presiding Officer') {
      alert("Dialing Presiding Officer (Booth 147 Control)...");
    } else {
      alert(`${actionName} action triggered.`);
    }
  };

  return (
    <div className="dashboard-container" style={{ textAlign: 'left', minHeight: '100vh', display: 'flex', backgroundColor: '#f8fafc' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar" style={{ width: '270px', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        
        {/* Sidebar Logo Header */}
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <img
            src="https://img.icons8.com/?size=100&id=2969&format=png&color=FFFFFF"
            alt="India Emblem"
            style={{ width: '30px', height: '30px' }}
          />
          <div className="sidebar-logo-text">
            <h2 style={{ fontSize: '18px', margin: 0, color: '#fff', fontWeight: 800 }}>AAKAR</h2>
            <p style={{ fontSize: '9px', margin: 0, color: '#38bdf8', letterSpacing: '1px', fontWeight: 700 }}>Election Day Operations</p>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="sidebar-menu" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '16px', paddingRight: '4px' }}>
          
          <div
            className={`menu-item ${activeMenu === 'Dashboard' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: activeMenu === 'Dashboard' ? '700' : '500',
              cursor: 'pointer',
              marginBottom: '4px',
              color: activeMenu === 'Dashboard' ? '#fff' : '#94a3b8',
              backgroundColor: activeMenu === 'Dashboard' ? '#2563eb' : 'transparent',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveMenu('Dashboard')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
          </div>

          <div
            className={`menu-item ${activeMenu === 'Voter Search' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: activeMenu === 'Voter Search' ? '700' : '500',
              cursor: 'pointer',
              marginBottom: '4px',
              color: activeMenu === 'Voter Search' ? '#fff' : '#94a3b8',
              backgroundColor: activeMenu === 'Voter Search' ? '#2563eb' : 'transparent'
            }}
            onClick={() => setActiveMenu('Voter Search')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={16} />
              <span>Voter Search</span>
            </div>
          </div>

          {/* Collapsible Dropdown for Voter Processing */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                marginBottom: '4px',
                color: '#94a3b8'
              }}
              onClick={() => setVoterProcessingOpen(!voterProcessingOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserCheck size={16} />
                <span>Voter Processing</span>
              </div>
              <ChevronDown size={14} style={{ transform: voterProcessingOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </div>

            {voterProcessingOpen && (
              <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                {['PO-1 (Verification)', 'PO-2 (Ink & Entry)', 'PO-3 (EVM Operator)'].map(sub => (
                  <div
                    key={sub}
                    style={{
                      padding: '8px 12px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      color: activeMenu === sub ? '#fff' : '#64748b',
                      backgroundColor: activeMenu === sub ? '#1e3a8a' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveMenu(sub)}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>

          {[
            { id: 'Assigned Complaints', name: 'Assigned Complaints', icon: <AlertTriangle size={16} />, badge: 2 },
            { id: 'Accessibility Support', name: 'Accessibility Support', icon: <Accessibility size={16} /> },
            { id: 'Queue Monitor', name: 'Queue Monitor', icon: <Clock size={16} /> },
            { id: 'Performance', name: 'Performance', icon: <List size={16} /> },
            { id: 'Notifications', name: 'Notifications', icon: <Bell size={16} />, badge: 3 },
            { id: 'Messages from PO', name: 'Messages from PO', icon: <MessageSquare size={16} /> },
            { id: 'Resources', name: 'Resources', icon: <List size={16} /> },
            { id: 'SOP / Help', name: 'SOP / Help', icon: <HelpCircle size={16} /> }
          ].map((item) => (
            <div
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: activeMenu === item.id ? '700' : '500',
                cursor: 'pointer',
                marginBottom: '4px',
                color: activeMenu === item.id ? '#fff' : '#94a3b8',
                backgroundColor: activeMenu === item.id ? '#2563eb' : 'transparent',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveMenu(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span style={{
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>{item.badge}</span>
              )}
            </div>
          ))}
        </nav>

        {/* BOTTOM FIXED SECTION (Emergency & Sync) */}
        <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <button
            onClick={() => {
              const confirmAlert = window.confirm("🚨 WARNING: Signal emergency status to Presiding Officer?");
              if (confirmAlert) {
                alert("Emergency alert sent. Central support dispatched.");
              }
            }}
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
              marginBottom: '10px',
              transition: 'background 0.2s'
            }}
          >
            <ShieldAlert size={14} />
            <span>Emergency</span>
          </button>

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '11px',
            color: '#94a3b8',
            marginBottom: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Sync Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span>Online (Sync: {lastSyncTime})</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="main-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <header className="main-header" style={{
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Welcome, Polling Officer 2</h1>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: '#22c55e',
                color: '#fff'
              }}>Operational</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0', fontWeight: '500' }}>
              Booth 147 &bull; Government School, Ward 12 &bull; Constituency: 56 - North City
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Top KPI row inside header */}
            <div style={{ display: 'flex', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <User size={16} color="#60a5fa" />
                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase' }}>Voters Processed</span>
                  <strong style={{ color: '#fff' }}>{votersProcessed} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>/ 1287</span></strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <Users size={16} color="#fbbf24" />
                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase' }}>Current Queue</span>
                  <strong style={{ color: '#fff' }}>{queueCount} People</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <Clock size={16} color="#a78bfa" />
                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase' }}>Avg. Processing Time</span>
                  <strong style={{ color: '#fff' }}>{avgProcessTime} sec <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>/ Voter</span></strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <Clock size={16} color="#34d399" />
                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase' }}>Shift Time</span>
                  <strong style={{ color: '#fff' }}>07:00 AM - 06:00 PM</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #1e293b', paddingLeft: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '11px', color: '#94a3b8' }}>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{timeString || '11:34 AM'}</span>
                <span>{dateString || '25 Apr 2024'}</span>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Grid Layout: Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.3fr', gap: '24px' }}>
            
            {/* Section 1: Your Role & Status */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="panel-header">
                <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Your Role & Status</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '16px 0' }}>
                
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <strong style={{ fontSize: '12px', display: 'block', color: '#1e3a8a' }}>PO-1</strong>
                  <span style={{ fontSize: '10px', color: '#475569', display: 'block', margin: '4px 0 8px' }}>Verification</span>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '8px' }}>Active</span>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <strong style={{ fontSize: '12px', display: 'block', color: '#14532d' }}>PO-2</strong>
                  <span style={{ fontSize: '10px', color: '#475569', display: 'block', margin: '4px 0 8px' }}>Ink & Entry</span>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '8px' }}>Completed</span>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <strong style={{ fontSize: '12px', display: 'block', color: '#475569' }}>PO-3</strong>
                  <span style={{ fontSize: '10px', color: '#475569', display: 'block', margin: '4px 0 8px' }}>EVM Operator</span>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '8px' }}>Upcoming</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  <span>Status: <strong>Present</strong> (Since 07:00 AM)</span>
                </div>
                <button
                  onClick={() => setBreakStatus(!breakStatus)}
                  style={{
                    backgroundColor: breakStatus ? '#ea580c' : '#f1f5f9',
                    color: breakStatus ? '#fff' : '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {breakStatus ? 'End Break' : 'Mark Break'}
                </button>
              </div>
            </div>

            {/* Section 2: Progress Overview */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Today's Progress</h2>
                <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }} onClick={() => alert("Loading full report...")}>View Full Turnout Report &rarr;</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
                {/* 42% progress ring */}
                <div style={{ position: 'relative', width: '85px', height: '85px', flexShrink: 0 }}>
                  <svg width="85" height="85" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                            strokeDasharray="42 100" strokeDashoffset="0" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <strong style={{ fontSize: '16px', color: '#0f172a', lineHeight: 1 }}>42%</strong>
                    <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold' }}>Turnout</span>
                  </div>
                </div>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Processed
                    </span>
                    <strong style={{ color: '#0f172a' }}>{votersProcessed}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> Yet to Process
                    </span>
                    <strong style={{ color: '#0f172a' }}>{1287 - votersProcessed}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#475569' }}>Total Electors</span>
                    <strong style={{ color: '#0f172a' }}>1,287</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Hourly Processing */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Hourly Processing Rate</h2>
                <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }} onClick={() => alert("Loading analytics...")}>View Analytics</span>
              </div>

              <div style={{ height: '100px', position: 'relative', margin: '12px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 100" style={{ overflow: 'visible' }}>
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Voters Processed hourly path */}
                  <path d="M 10 90 L 50 82 L 90 70 L 130 50 L 170 30" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                  <circle cx="10" cy="90" r="3" fill="#2563eb" />
                  <circle cx="50" cy="82" r="3" fill="#2563eb" />
                  <circle cx="90" cy="70" r="3" fill="#2563eb" />
                  <circle cx="130" cy="50" r="3" fill="#2563eb" />
                  <circle cx="170" cy="30" r="4.5" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />

                  <path d="M 170 30 L 210 30 L 250 30 L 290 30" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />

                  <rect x="155" y="5" width="30" height="15" rx="3" fill="#1e3a8a" />
                  <text x="170" y="15" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">82</text>
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', fontWeight: 'bold' }}>
                <span>8 AM (12)</span>
                <span>9 AM (28)</span>
                <span>10 AM (55)</span>
                <span>11 AM (82)</span>
                <span>12 PM</span>
                <span>1 PM</span>
                <span>2 PM</span>
                <span>3 PM</span>
                <span>4 PM</span>
                <span>5 PM</span>
              </div>
            </div>

          </div>

          {/* Main Grid Layout: Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.3fr', gap: '24px' }}>
            
            {/* Section 4: Assigned Complaints */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Assigned Complaints</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }} onClick={() => alert("Loading all complaints...")}>View All</span>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {['All', 'In Progress', 'Resolved'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setComplaintTab(tab)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '10px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: complaintTab === tab ? '#eff6ff' : 'transparent',
                        color: complaintTab === tab ? '#2563eb' : '#64748b'
                      }}
                    >
                      {tab} {tab === 'All' ? '(2)' : tab === 'In Progress' ? '(1)' : '(5)'}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {complaints
                    .filter(c => complaintTab === 'All' || c.status === complaintTab)
                    .map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '12px', display: 'block', color: '#0f172a' }}>{item.type}</strong>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{item.citizen} &bull; {item.time}</span>
                        </div>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          backgroundColor: item.status === 'Resolved' ? '#dcfce7' : '#ffedd5',
                          color: item.status === 'Resolved' ? '#15803d' : '#ea580c'
                        }}>{item.status}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px' }}>
                <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => alert("Loading complaints module...")}>Go to Complaints &rarr;</span>
              </div>
            </div>

            {/* Section 5: Presiding Officer Communication */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Message from Presiding Officer</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }} onClick={() => alert("Loading message center...")}>View All</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                    PO
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>{poMessage.sender}</span>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>{poMessage.time}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0' }}>{poMessage.text}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {poMessage.status === 'New' && (
                  <button
                    onClick={handleAcknowledgePoMessage}
                    style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Acknowledge & Accept
                  </button>
                )}
                {poMessage.status !== 'Completed' && (
                  <button
                    onClick={handleCompletePoMessage}
                    style={{
                      width: '100%',
                      backgroundColor: '#fff',
                      border: '1px solid #22c55e',
                      color: '#22c55e',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Completed
                  </button>
                )}
                {poMessage.status === 'Completed' && (
                  <span style={{ textAlign: 'center', fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>✓ Task Completed</span>
                )}
              </div>
            </div>

            {/* Section 6: Quick Actions */}
            <div className="card">
              <div className="panel-header" style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Quick Actions</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { name: 'Search Voter', icon: <Search size={18} />, color: '#3b82f6', bg: '#eff6ff' },
                  { name: 'Verify Voter', icon: <UserCheck size={18} />, color: '#3b82f6', bg: '#eff6ff' },
                  { name: 'Mark Inked', icon: <Droplets size={18} />, color: '#f97316', bg: '#fff7ed' },
                  { name: 'Enable Vote', icon: <CheckSquare size={18} />, color: '#3b82f6', bg: '#eff6ff' },
                  { name: 'Accessibility Assistance', icon: <Accessibility size={18} />, color: '#3b82f6', bg: '#eff6ff' },
                  { name: 'Report Issue', icon: <AlertTriangle size={18} />, color: '#ef4444', bg: '#fef2f2' },
                  { name: 'Call Presiding Officer', icon: <PhoneCall size={18} />, color: '#10b981', bg: '#ecfdf5' },
                  { name: 'View Checklist', icon: <List size={18} />, color: '#3b82f6', bg: '#eff6ff' }
                ].map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(act.name)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 4px',
                      borderRadius: '10px',
                      border: '1px solid transparent',
                      backgroundColor: act.bg,
                      color: act.color,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {act.icon}
                    <span style={{ fontSize: '9px', fontWeight: '700', lineHeight: 1.1, color: '#1e293b' }}>{act.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Main Grid Layout: Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.3fr', gap: '24px' }}>
            
            {/* Section 7: Performance Summary */}
            <div className="card">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Performance Summary</h2>
                <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }} onClick={() => alert("Loading performance metrics...")}>View Details</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { label: "Voters Processed", pct: 91, color: "#22c55e" },
                  { label: "Verification Speed", pct: 85, color: "#22c55e" },
                  { label: "Accuracy Rate", pct: 90, color: "#22c55e" },
                  { label: "Task Completion", pct: 88, color: "#22c55e" }
                ].map((perf, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                      <svg width="50" height="50" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={perf.color} strokeWidth="3" 
                                strokeDasharray={`${perf.pct} 100`} strokeDashoffset="0" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <strong style={{ fontSize: '10px', color: '#0f172a' }}>{perf.pct}%</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '8px', color: '#64748b', textAlign: 'center', marginTop: '6px', fontWeight: 'bold', lineHeight: 1.1 }}>{perf.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 8: Task Checklist */}
            <div className="card">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Task Checklist</h2>
                <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }} onClick={() => alert("Loading full checklist...")}>View All</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                {checklist.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleChecklist(item.id)}
                        style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                      />
                      <span style={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#94a3b8' : '#0f172a', fontWeight: '500' }}>{item.label}</span>
                    </label>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 9: Notifications */}
            <div className="card">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Notifications</h2>
                <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }} onClick={() => alert("Loading notification feed...")}>View All</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                {[
                  { text: "Complaint assigned to you", time: "11:20 AM", isNew: true },
                  { text: "EVM Battery Status Normal", time: "11:00 AM", isNew: false },
                  { text: "Break time 12:30 PM - 12:45 PM", time: "10:30 AM", isNew: false }
                ].map((note, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: note.isNew ? '#dc2626' : '#94a3b8' }} />
                      <span style={{ color: '#475569', fontWeight: note.isNew ? 'bold' : 'normal' }}>{note.text}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>{note.time}</span>
                      {note.isNew && <span style={{ fontSize: '8px', color: '#fff', backgroundColor: '#dc2626', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>New</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
