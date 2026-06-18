import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Users, Award, ShieldAlert, Cpu, 
  HelpCircle, Settings, PhoneCall, Video, Send, AlertTriangle, 
  Building, CheckCircle, Percent, Trophy, RefreshCw, BarChart2,
  Clock, MapPin, Volume2, UserCheck, Check, LogOut, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

export default function ReturningOfficerDashboard({ user, onLogout }) {
  const userName = user?.name || 'RO Admin';
  const userRole = user?.role || 'Returning Officer';

  // State Management
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Forms and Interactivity
  const [broadcastText, setBroadcastText] = useState('');
  const [callModal, setCallModal] = useState({ open: false, recipient: '', number: '', isVideo: false });
  
  // AI assistant chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your NagarVaani RO Command Assistant. I monitor constituency-wide telemetries and DEO instructions.' },
    { sender: 'user', text: 'Which sector requires immediate attention?' },
    { sender: 'bot', text: 'Sector 3 requires attention. Booth 104 is reporting an EVM fault.' }
  ]);

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

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    alert(`Broadcast sent to all 328 polling stations: "${broadcastText}"`);
    setBroadcastText('');
  };

  const handleTriggerCall = (name, number, isVideo = false) => {
    setCallModal({ open: true, recipient: name, number: number, isVideo });
  };

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: question }]);
    setChatInput('');

    setTimeout(() => {
      let replyText = "";
      const query = question.toLowerCase();
      if (query.includes("booth 104") || query.includes("evm")) {
        replyText = "Booth 104 is reporting a frozen Control Unit. Sector 3 officer is dispatched with a reserve EVM. Expected resolution: 10 mins.";
      } else if (query.includes("incident") || query.includes("crowd")) {
        replyText = "Incident at Booth 145 (Crowd Gathering) is under patrol. Additional force is currently deploying to Sector 1.";
      } else if (query.includes("ballot") || query.includes("postal")) {
        replyText = "Postal Ballot Summary: 1,256 applied, 1,085 received. 1,032 have been verified and accepted.";
      } else {
        replyText = `Regarding "${question}": Check the DEO Command Guidelines. You can broadcast notices or call the DEO desk for direct updates.`;
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
    }, 600);
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
          {[
            { id: 'Dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
            { id: 'Nomination Management', name: 'Nomination Management', icon: <FileText size={16} /> },
            { id: 'Candidate Details', name: 'Candidate Details', icon: <Users size={16} /> },
            { id: 'Symbol Allocation', name: 'Symbol Allocation', icon: <Award size={16} /> },
            { id: 'Polling Day Monitoring', name: 'Polling Day Monitoring', icon: <Clock size={16} /> },
            { id: 'Turnout Analytics', name: 'Turnout Analytics', icon: <Percent size={16} /> },
            { id: 'Incident Management', name: 'Incident Management', icon: <ShieldAlert size={16} />, badge: 5 },
            { id: 'EVM & Strong Room', name: 'EVM & Strong Room', icon: <Cpu size={16} /> },
            { id: 'Counting Management', name: 'Counting Management', icon: <BarChart2 size={16} /> },
            { id: 'Result Dashboard', name: 'Result Dashboard', icon: <Trophy size={16} /> },
            { id: 'Agent Management', name: 'Agent Management', icon: <UserCheck size={16} /> },
            { id: 'Postal Ballot Tracking', name: 'Postal Ballot Tracking', icon: <FileText size={16} /> },
            { id: 'RO Orders & Approvals', name: 'RO Orders & Approvals', icon: <CheckCircle size={16} /> },
            { id: 'Reports & Forms', name: 'Reports & Forms', icon: <FileText size={16} /> },
            { id: 'Communication Hub', name: 'Communication Hub', icon: <Volume2 size={16} /> },
            { id: 'AI Assistant', name: 'AI Assistant', icon: <Cpu size={16} />, isBeta: true },
            { id: 'Settings', name: 'Settings', icon: <Settings size={16} /> }
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
              {item.isBeta && (
                <span style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  color: '#38bdf8',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}>Beta</span>
              )}
            </div>
          ))}
        </nav>

        {/* BOTTOM FIXED SECTION (Constituency Info & Emergency) */}
        <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            color: '#94a3b8'
          }}>
            <div style={{ fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>Constituency Info</div>
            <div>AC Name: <span style={{ color: '#fff', fontWeight: '600' }}>AC-123</span></div>
            <div>Total Booths: <span style={{ color: '#fff', fontWeight: '600' }}>328</span></div>
            <div>Total Voters: <span style={{ color: '#fff', fontWeight: '600' }}>2,45,678</span></div>
            <div>District: <span style={{ color: '#fff', fontWeight: '600' }}>Central District</span></div>
            
            <button
              onClick={() => alert("Loading Constituency Profile details...")}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginTop: '4px',
                transition: 'background 0.2s'
              }}
            >
              <span>View Constituency Profile</span>
              <ArrowRight size={10} />
            </button>
          </div>

          <button
            onClick={() => {
              const confirmAlert = window.confirm("🚨 WARNING: Initiate Assembly-wide emergency warning system?");
              if (confirmAlert) {
                alert("Emergency alerts broadcasted to all Sectors and DEO Operations control room.");
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
            <span>CONSTITUENCY EMERGENCY</span>
          </button>

        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="main-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <header className="main-header" style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>RO AC-123 Command Center</h1>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: '#dcfce7',
                color: '#15803d'
              }}>Operational</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: '500' }}>
              Assembly Constituency &bull; AC 123 &bull; 328 Booths &bull; 2,45,678 Voters
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={13} className={loading ? 'animating' : ''} style={{ transform: loading ? 'rotate(360deg)' : 'none', transition: 'transform 0.8s ease' }} />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '11px', color: '#64748b' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{timeString || '11:34 AM'}</span>
              <span>{dateString || '25 Apr 2024'}</span>
            </div>

            {/* Notification Bell */}
            <div
              onClick={() => alert("Notification panel: 5 critical incident alerts are unresolved.")}
              style={{
                position: 'relative',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <ShieldAlert size={18} color="#dc2626" />
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#dc2626',
                color: '#fff',
                fontSize: '8px',
                fontWeight: 'bold',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>5</span>
            </div>

            {/* Profile Widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                RO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{userName}</span>
                <span style={{ color: '#64748b', fontWeight: '500' }}>AC-123</span>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* WORKSPACE DETAILED VIEWS */}
        {activeMenu === 'Dashboard' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
            
            {/* KPI CARDS ROW */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
              
              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #2563eb', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Booths</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>328 / 328</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>&bull; All Booths Active</span>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb' }}>
                    <Building size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #16a34a', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Voter Turnout</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>52.34%</h3>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Till 10:00 AM</span>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '6px', borderRadius: '8px', color: '#16a34a' }}>
                    <Percent size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #dc2626', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Incidents</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', margin: '4px 0 0' }}>5</h3>
                    <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: '700' }}>&bull; Requires Attention</span>
                  </div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '8px', color: '#dc2626' }}>
                    <ShieldAlert size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #2563eb', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>EVMs Deployed</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>328 / 328</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>&bull; 100% Operational</span>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb' }}>
                    <Cpu size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ea580c', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Counting Tables</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>14</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>&bull; Live Monitoring</span>
                  </div>
                  <div style={{ backgroundColor: '#fff7ed', padding: '6px', borderRadius: '8px', color: '#ea580c' }}>
                    <BarChart2 size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ca8a04', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Result Status</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ca8a04', margin: '4px 0 0' }}>Not Started</h3>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Counting Yet to Begin</span>
                  </div>
                  <div style={{ backgroundColor: '#fef9c3', padding: '6px', borderRadius: '8px', color: '#ca8a04' }}>
                    <Trophy size={16} />
                  </div>
                </div>
              </div>

            </section>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr 1.5fr', gap: '24px' }}>
              
              {/* Section 1: Constituency Overview */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Constituency Overview</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Full Map &rarr;</span>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', margin: '16px 0', alignItems: 'center' }}>
                  {/* SVG Sector Heatmap */}
                  <svg width="150" height="150" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
                    {/* Sector 6 (Top Middle) */}
                    <path d="M40,5 L80,5 L85,40 L35,40 Z" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    <text x="60" y="25" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">6</text>
                    
                    {/* Sector 5 (Top Right) */}
                    <path d="M80,5 L115,10 L110,65 L85,40 Z" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    <text x="96" y="32" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">5</text>
                    
                    {/* Sector 4 (Middle Left) */}
                    <path d="M5,40 L35,40 L45,80 L5,80 Z" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    <text x="22" y="65" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">4</text>
                    
                    {/* Sector 3 (Middle Right) */}
                    <path d="M85,40 L110,65 L90,110 L65,75 Z" fill="#eab308" stroke="#fff" strokeWidth="1.5" />
                    <text x="88" y="72" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">3</text>
                    
                    {/* Sector 2 (Bottom Middle) */}
                    <path d="M35,40 L65,75 L90,110 L45,115 L45,80 Z" fill="#f97316" stroke="#fff" strokeWidth="1.5" />
                    <text x="56" y="80" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
                    
                    {/* Sector 1 (Bottom Left) */}
                    <path d="M5,80 L45,80 L45,115 L5,115 Z" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                    <text x="25" y="102" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>
                  </svg>

                  {/* Sector turnout list */}
                  <div style={{ flexGrow: 1, fontSize: '12px' }}>
                    {[
                      { name: "Sector 1", turnout: "47.32%", color: "#ef4444" },
                      { name: "Sector 2", turnout: "48.11%", color: "#f97316" },
                      { name: "Sector 3", turnout: "53.76%", color: "#eab308" },
                      { name: "Sector 4", turnout: "56.21%", color: "#22c55e" },
                      { name: "Sector 5", turnout: "62.08%", color: "#22c55e" },
                      { name: "Sector 6", turnout: "50.44%", color: "#22c55e" }
                    ].map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }}></span>
                          {s.name}
                        </span>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{s.turnout}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>
                  <span>🟢 Normal</span>
                  <span>🟡 Warning</span>
                  <span>🔴 Critical</span>
                </div>
              </div>

              {/* Section 2: Live Voter Turnout */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Live Voter Turnout</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All &rarr;</span>
                </div>

                <div style={{ height: '120px', position: 'relative', margin: '12px 0' }}>
                  {/* High fidelity turnout chart line representation */}
                  <svg width="100%" height="100%" viewBox="0 0 300 100" style={{ overflow: 'visible' }}>
                    {/* Gridlines */}
                    <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" />

                    <defs>
                      <linearGradient id="turnoutGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient Fill under curve */}
                    <path
                      d="M 10 90 L 10 82 M 10 82 Q 70 70 130 50 T 250 25 L 250 90 Z"
                      fill="url(#turnoutGrad)"
                    />

                    {/* Actual curve path */}
                    <path
                      d="M 10 82 Q 70 70 130 50 T 250 25"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />

                    {/* Dotted projection */}
                    <path
                      d="M 250 25 L 290 15"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />

                    {/* Plot points */}
                    <circle cx="10" cy="82" r="3" fill="#2563eb" />
                    <circle cx="90" cy="65" r="3" fill="#2563eb" />
                    <circle cx="170" cy="45" r="3" fill="#2563eb" />
                    <circle cx="250" cy="25" r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                    
                    {/* Floating turnout tooltip */}
                    <rect x="235" y="0" width="36" height="15" rx="3" fill="#1e3a8a" />
                    <text x="253" y="10" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">52.34%</text>
                  </svg>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>
                  <span>7 AM</span>
                  <span>9 AM</span>
                  <span>11 AM</span>
                  <span>1 PM</span>
                  <span>3 PM</span>
                  <span>5 PM</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Estimated Turnout</span>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>66.8%</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Last Updated</span>
                    <strong style={{ fontSize: '12px', color: '#16a34a' }}>11:34 AM Live</strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Active Incidents */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Active Incidents</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All &rarr;</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '180px', marginTop: '10px' }}>
                  {[
                    { id: "ALT-1", text: "EVM Fault – Booth 104", detail: "Sector 3", priority: "Critical", time: "11:28 AM", color: "#dc2626", bg: "#fee2e2" },
                    { id: "ALT-2", text: "Crowd Gathering – Booth 145", detail: "Sector 1", priority: "High", time: "11:20 AM", color: "#ea580c", bg: "#ffedd5" },
                    { id: "ALT-3", text: "VVPAT Not Responding – Booth 212", detail: "Sector 4", priority: "Medium", time: "11:15 AM", color: "#ca8a04", bg: "#fef9c3" },
                    { id: "ALT-4", text: "Polling Officer Unwell – Booth 301", detail: "Sector 5", priority: "Medium", time: "11:10 AM", color: "#ca8a04", bg: "#fef9c3" },
                    { id: "ALT-5", text: "Minor Dispute – Booth 64", detail: "Sector 2", priority: "Low", time: "11:05 AM", color: "#3b82f6", bg: "#eff6ff" }
                  ].map(inc => (
                    <div key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: inc.color }} />
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', display: 'block' }}>{inc.text}</span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{inc.detail} &bull; {inc.time}</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: inc.bg,
                        color: inc.color,
                        textTransform: 'uppercase'
                      }}>{inc.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr', gap: '24px' }}>
              
              {/* Section 4: Nomination Summary */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Nomination Summary</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    {/* SVG representation of Donut chart */}
                    <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      
                      {/* Accepted: 24/32 (75%) */}
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="75 100" strokeDashoffset="0" />
                              
                      {/* Rejected: 5/32 (15.6%) */}
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#ef4444" strokeWidth="3.5" 
                              strokeDasharray="15.6 100" strokeDashoffset="-75" />
                              
                      {/* Withdrawn: 3/32 (9.4%) */}
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#ea580c" strokeWidth="3.5" 
                              strokeDasharray="9.4 100" strokeDashoffset="-90.6" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                      <strong style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>32</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> Filed
                      </span>
                      <strong style={{ color: '#0f172a' }}>32</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Accepted
                      </span>
                      <strong style={{ color: '#0f172a' }}>24</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Rejected
                      </span>
                      <strong style={{ color: '#0f172a' }}>5</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} /> Withdrawn
                      </span>
                      <strong style={{ color: '#0f172a' }}>3</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Candidate Summary */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Candidate Summary</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '115px', marginTop: '10px' }}>
                  {[
                    { id: 1, name: "Arun Pratap Singh", party: "Party A", status: "Accepted" },
                    { id: 2, name: "Sunita Devi", party: "Party B", status: "Accepted" },
                    { id: 3, name: "Imran Khan", party: "Independent", status: "Accepted" },
                    { id: 4, name: "Rajesh Kumar", party: "Party C", status: "Accepted" }
                  ].map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.name}</span>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>{c.party}</div>
                      </div>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: '800',
                        color: '#16a34a',
                        backgroundColor: '#dcfce7',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Postal Ballot Tracking */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Postal Ballot Tracking</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { label: "Applied", val: "1,256", icon: <CheckCircle size={12} color="#2563eb" /> },
                    { label: "Dispatched", val: "1,100", icon: <CheckCircle size={12} color="#2563eb" /> },
                    { label: "Received", val: "1,085", icon: <CheckCircle size={12} color="#2563eb" /> },
                    { label: "Accepted", val: "1,032", icon: <CheckCircle size={12} color="#16a34a" /> },
                    { label: "Rejected", val: "53", icon: <CheckCircle size={12} color="#dc2626" /> }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                        {item.icon}
                        {item.label}
                      </span>
                      <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 7: RO Orders / Notifications */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>RO Orders / Notifications</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '115px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { text: "Ensure smooth polling in sensitive booths.", time: "10:30 AM" },
                    { text: "Check incident at Booth 145 immediately.", time: "10:35 AM" },
                    { text: "Submit turnout report by 11:00 AM.", time: "10:40 AM" },
                    { text: "Deploy additional force in Sector 3.", time: "10:45 AM" }
                  ].map((task, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#2563eb', marginTop: '6px', flexShrink: 0 }} />
                      <div style={{ textAlign: 'left', flexGrow: 1 }}>
                        <span style={{ color: '#334155', display: 'block', fontWeight: '600' }}>{task.text}</span>
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>Sent: {task.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '24px' }}>
              
              {/* Section 8: Counting Management Overview */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header">
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Counting Management Overview</h2>
                </div>

                <div style={{ display: 'flex', gap: '8px', margin: '14px 0', alignItems: 'center' }}>
                  {[
                    { step: 1, label: "Postal Ballot Counting", time: "Yet to Start" },
                    { step: 2, label: "EVM Counting", time: "Yet to Start" },
                    { step: 3, label: "VVPAT Verification", time: "Yet to Start" },
                    { step: 4, label: "Result Declaration", time: "Yet to Start" }
                  ].map((st, idx) => (
                    <React.Fragment key={idx}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '12px',
                          margin: '0 auto 6px',
                          border: '1.5px solid #bfdbfe'
                        }}>{st.step}</div>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#1e293b', display: 'block', lineHeight: 1.2 }}>{st.label}</span>
                        <span style={{ fontSize: '8px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{st.time}</span>
                      </div>
                      {idx < 3 && <div style={{ width: '12px', height: '1.5px', backgroundColor: '#cbd5e1', alignSelf: 'center', marginTop: '-12px' }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Section 9: Counting Table Status */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Counting Table Status</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <div key={num} style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#475569' }}>Table {num}</div>
                      <span style={{ fontSize: '8px', color: '#64748b', fontWeight: '600' }}>Not Started</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 'bold', marginTop: '8px', textAlign: 'center', cursor: 'pointer' }}>
                  +8 More Tables
                </div>
              </div>

              {/* Section: Previous Result (2019) */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Previous Result (2019)</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px', flexGrow: 1 }}>
                  <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '50%', color: '#ea580c' }}>
                    <Trophy size={24} />
                  </div>
                  <div style={{ textAlign: 'left', fontSize: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Winning Candidate</span>
                    <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block', margin: '2px 0' }}>Arun Pratap Singh</strong>
                    <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 'bold' }}>Party A</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', color: '#475569' }}>
                  <div>Votes: <strong>68,742</strong></div>
                  <div>Margin: <strong>15,420</strong></div>
                </div>
              </div>

              {/* Section 10: Communication Hub */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header">
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Communication Hub</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '8px 0' }}>
                  <button
                    onClick={() => handleTriggerCall("Sector Officers Network", "+91 99999 12345")}
                    style={{
                      padding: '8px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <PhoneCall size={12} />
                    <span>Call SOs</span>
                  </button>

                  <button
                    onClick={() => handleTriggerCall("DEO Headquarters", "+91 99999 00000")}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <PhoneCall size={12} />
                    <span>Call DEO</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Broadcast to all booths..."
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    style={{
                      flexGrow: 1,
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleBroadcast}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  >
                    <Send size={11} />
                  </button>
                </div>
              </div>

            </div>

            {/* LOWER RO WIDGETS: AI ASSISTANT CHAT & SUMMARY */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              
              {/* SOP AI Assistant Chat */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} color="#2563eb" />
                  <h2 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>RO AI Election Insights & SOP Assistant</h2>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  height: '140px',
                  overflowY: 'auto',
                  backgroundColor: '#f8fafc',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender === 'user' ? '#2563eb' : '#fff',
                      color: msg.sender === 'user' ? '#fff' : '#334155',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      maxWidth: '80%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {msg.sender === 'bot' && <Cpu size={12} color="#2563eb" style={{ flexShrink: 0 }} />}
                      <span>{msg.text}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChatSend} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="ai-input"
                    placeholder="Ask AI about counting rules, VVPAT matching, or incident resolution..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ flexGrow: 1, padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    <Send size={12} />
                  </button>
                </form>
              </div>

              {/* Extra Features Info Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                <div className="panel-header">
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Election Insights Dashboard</h2>
                </div>
                <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
                  <div>&bull; <strong>Round Tracker:</strong> EVM Counting Round 0 / 18.</div>
                  <div>&bull; <strong>Strong Room:</strong> CCTV Feeds Normal &bull; Locked & Sealed.</div>
                  <div>&bull; <strong>Form 17C Check:</strong> 0 / 328 booths verified.</div>
                  <div>&bull; <strong>Agent Validation:</strong> 328/328 Polling Agents registered.</div>
                </div>
                <button
                  onClick={() => alert("Loading advanced analytical reports...")}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Open Advanced Reports Console
                </button>
              </div>

            </div>

          </div>
        )}

        {/* DIALOG PHONE OVERLAY */}
        {callModal.open && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderRadius: '24px',
              padding: '40px',
              width: '320px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'pulse 1.8s infinite'
              }}>
                <PhoneCall size={28} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
                {callModal.isVideo ? 'Video Feed' : 'Radio Call'} &bull; {callModal.recipient}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0 24px' }}>{callModal.number}</p>
              
              <button 
                onClick={() => setCallModal({ open: false, recipient: '', number: '', isVideo: false })}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Disconnect Call
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer style={{
          textAlign: 'center',
          padding: '16px 0',
          fontSize: '11px',
          color: '#64748b',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          marginTop: 'auto',
          fontWeight: '500'
        }}>
          &copy; 2026 NagarVaani Election System. All rights reserved. &bull; Returning Officer Command Dashboard &bull; Version 2.0
        </footer>
      </main>
    </div>
  );
}
