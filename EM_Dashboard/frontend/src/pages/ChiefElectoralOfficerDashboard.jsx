import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Users, Award, ShieldAlert, Cpu, 
  HelpCircle, Settings, PhoneCall, Video, Send, AlertTriangle, 
  Building, CheckCircle, Percent, Trophy, RefreshCw, BarChart2,
  Clock, MapPin, Volume2, UserCheck, Check, LogOut, ArrowRight,
  Truck, AlertCircle, BookOpen, ChevronRight, Plus
} from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

export default function ChiefElectoralOfficerDashboard({ user, onLogout }) {
  const userName = user?.name || 'CEO Admin';
  const userRole = user?.role || 'Chief Electoral Officer';

  // State Management
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Forms and Interactivity
  const [broadcastText, setBroadcastText] = useState('');
  const [callModal, setCallModal] = useState({ open: false, recipient: '', number: '', isVideo: false });
  
  // AI assistant chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your NagarVaani CEO State Command Assistant. I monitor state-wide turnout trends, force deployment, expenditure risk, and MCC violations.' },
    { sender: 'user', text: 'Show MCC violations summary.' },
    { sender: 'bot', text: 'Active state MCC cases: 12 Model Code Violations, 5 Cash distribution complaints, and 3 Hate Speech alerts.' }
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
    alert(`State Broadcast sent to all 75 Districts and 1,50,425 booths: "${broadcastText}"`);
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
      if (query.includes("mcc") || query.includes("violation") || query.includes("complaint")) {
        replyText = "State Alert: 23 total MCC complaints reported today. 12 Model Code Violations are pending verification by respective District Election Officers.";
      } else if (query.includes("force") || query.includes("deploy")) {
        replyText = "Forces overview: 85% deployed state-wide (2,45,678 personnel). 32,145 currently in transit. 11,267 awaiting dispatch.";
      } else if (query.includes("turnout") || query.includes("voted")) {
        replyText = "Live state turnout: 52.34% till 10:00 AM. Estimated final turnout is projected at 66.8%.";
      } else {
        replyText = `Regarding "${question}": Check the CEO State Command guidelines. You can trigger training orders or call the DEO network for real-time monitoring.`;
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
            <h2 style={{ fontSize: '18px', margin: 0, color: '#fff', fontWeight: 800 }}>NagarVaani</h2>
            <p style={{ fontSize: '9px', margin: 0, color: '#38bdf8', letterSpacing: '1px', fontWeight: 700 }}>Election Day Operations</p>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="sidebar-menu" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '16px', paddingRight: '4px' }}>
          {[
            { id: 'Dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
            { id: 'State Overview', name: 'State Overview', icon: <Building size={16} /> },
            { id: 'District Performance', name: 'District Performance', icon: <BarChart2 size={16} /> },
            { id: 'Electoral Roll Management', name: 'Electoral Roll Management', icon: <UserCheck size={16} /> },
            { id: 'SVEEP & Voter Awareness', name: 'SVEEP & Voter Awareness', icon: <Percent size={16} /> },
            { id: 'Training Management', name: 'Training Management', icon: <BookOpen size={16} /> },
            { id: 'EVM & Logistics', name: 'EVM & Logistics', icon: <Cpu size={16} /> },
            { id: 'Candidate Expenditure', name: 'Candidate Expenditure', icon: <FileText size={16} /> },
            { id: 'Force Deployment', name: 'Force Deployment', icon: <ShieldAlert size={16} /> },
            { id: 'MCC & Complaint Monitor', name: 'MCC & Complaint Monitor', icon: <AlertTriangle size={16} />, badge: 23 },
            { id: 'Reports & Analytics', name: 'Reports & Analytics', icon: <BarChart2 size={16} /> },
            { id: 'Election Readiness', name: 'Election Readiness', icon: <CheckCircle size={16} /> },
            { id: 'Communication Hub', name: 'Communication Hub', icon: <Volume2 size={16} /> },
            { id: 'Turnout Analytics', name: 'Turnout Analytics', icon: <Percent size={16} /> },
            { id: 'System Settings', name: 'System Settings', icon: <Settings size={16} /> }
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

        {/* BOTTOM FIXED SECTION (State Summary & Emergency) */}
        <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            color: '#94a3b8'
          }}>
            <div style={{ fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '2px' }}>State Summary</div>
            <div>Districts: <span style={{ color: '#fff', fontWeight: '600' }}>75</span></div>
            <div>Assembly Constituencies: <span style={{ color: '#fff', fontWeight: '600' }}>403</span></div>
            <div>Total Booths: <span style={{ color: '#fff', fontWeight: '600' }}>1,50,425</span></div>
            <div>Total Voters: <span style={{ color: '#fff', fontWeight: '600' }}>15,02,34,567</span></div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0', padding: '4px 0' }}>
              <div>Male: <span style={{ color: '#fff' }}>7,88,64,532</span></div>
              <div>Female: <span style={{ color: '#fff' }}>7,13,42,198</span></div>
              <div>Third Gender: <span style={{ color: '#fff' }}>27,837</span></div>
            </div>
            
            <button
              onClick={() => alert("Loading State Profile details...")}
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
                marginTop: '2px',
                transition: 'background 0.2s'
              }}
            >
              <span>View State Profile</span>
              <ArrowRight size={10} />
            </button>
          </div>

          <button
            onClick={() => {
              const confirmAlert = window.confirm("🚨 WARNING: Initiate state-wide emergency warning system?");
              if (confirmAlert) {
                alert("Emergency alerts broadcasted to all 75 District control rooms.");
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
            <span>STATE EMERGENCY ALARM</span>
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
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>CEO Command Center (State)</h1>
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
              State: Uttar Pradesh &bull; 75 Districts &bull; 403 ACs &bull; 1,50,425 Booths &bull; 15,02,34,567 Voters
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
              onClick={() => alert("Notification panel: 23 active MCC complaints are unresolved state-wide.")}
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
              }}>23</span>
            </div>

            {/* Profile Widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                CEO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{userName}</span>
                <span style={{ color: '#64748b', fontWeight: '500' }}>State Chief Officer</span>
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
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>1,50,425</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>&bull; All Booths Ready</span>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb' }}>
                    <Building size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #2563eb', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Voters</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>15.02 Cr</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>&bull; 100% Verified</span>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb' }}>
                    <Users size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #16a34a', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Voter Turnout %</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>52.34%</h3>
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
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', margin: '4px 0 0' }}>23</h3>
                    <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: '700' }}>&bull; State Unresolved</span>
                  </div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '8px', color: '#dc2626' }}>
                    <ShieldAlert size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ea580c', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Staff Deployed</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>12.56 L</h3>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>96.58% Assigned</span>
                  </div>
                  <div style={{ backgroundColor: '#fff7ed', padding: '6px', borderRadius: '8px', color: '#ea580c' }}>
                    <UserCheck size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ca8a04', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Vehicles on Move</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ca8a04', margin: '4px 0 0' }}>4,512 / 5,248</h3>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>85.96% State logistics</span>
                  </div>
                  <div style={{ backgroundColor: '#fef9c3', padding: '6px', borderRadius: '8px', color: '#ca8a04' }}>
                    <Truck size={16} />
                  </div>
                </div>
              </div>

            </section>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr 1.5fr', gap: '24px' }}>
              
              {/* Section 1: State Readiness Heatmap */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>District Readiness Overview</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View District Readiness &rarr;</span>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', margin: '16px 0', alignItems: 'center' }}>
                  {/* Stylized State Outline Heatmap */}
                  <svg width="140" height="140" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
                    {/* State grid layout nodes representing districts */}
                    <rect x="10" y="10" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="35" y="10" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="60" y="10" width="20" height="20" rx="4" fill="#eab308" stroke="#fff" strokeWidth="1" />
                    <rect x="85" y="10" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="10" y="35" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="35" y="35" width="20" height="20" rx="4" fill="#f97316" stroke="#fff" strokeWidth="1" />
                    <rect x="60" y="35" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="85" y="35" width="20" height="20" rx="4" fill="#eab308" stroke="#fff" strokeWidth="1" />
                    <rect x="10" y="60" width="20" height="20" rx="4" fill="#ef4444" stroke="#fff" strokeWidth="1" />
                    <rect x="35" y="60" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="60" y="60" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="85" y="60" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="35" y="85" width="20" height="20" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="1" />
                    <rect x="60" y="85" width="20" height="20" rx="4" fill="#eab308" stroke="#fff" strokeWidth="1" />
                  </svg>

                  <div style={{ flexGrow: 1, fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>🟢 Ready (80-100%)</span>
                      <strong style={{ color: '#22c55e' }}>58 Districts</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>🟡 Moderate (40-80%)</span>
                      <strong style={{ color: '#eab308' }}>12 Districts</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>🟠 Low (20-40%)</span>
                      <strong style={{ color: '#f97316' }}>4 Districts</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>🔴 Critical (0-20%)</span>
                      <strong style={{ color: '#ef4444' }}>1 District</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '12px' }}>
                  <span>Average State Readiness</span>
                  <strong style={{ fontSize: '14px', color: '#1e3a8a' }}>82.65%</strong>
                </div>
              </div>

              {/* Section 2: District Performance Ranking */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>District Performance Ranking</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All Districts &rarr;</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { rank: 1, name: "Gautam Buddha Nagar", val: "98.76%", status: "Excellent", color: "#22c55e" },
                    { rank: 2, name: "Varanasi", val: "96.21%", status: "Excellent", color: "#22c55e" },
                    { rank: 3, name: "Lucknow", val: "93.45%", status: "Excellent", color: "#22c55e" },
                    { rank: "...", name: "...", val: "...", status: "...", color: "#94a3b8" },
                    { rank: 73, name: "Bahraich", val: "41.32%", status: "Low", color: "#f97316" },
                    { rank: 74, name: "Shrawasti", val: "32.18%", status: "Low", color: "#f97316" },
                    { rank: 75, name: "Siddharthnagar", val: "18.76%", status: "Critical", color: "#ef4444" }
                  ].map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ display: 'flex', gap: '8px', fontWeight: 'bold' }}>
                        <span style={{ width: '16px', display: 'inline-block', color: '#64748b' }}>{d.rank}</span>
                        <span style={{ color: '#1e293b' }}>{d.name}</span>
                      </span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <strong style={{ color: '#0f172a' }}>{d.val}</strong>
                        <span style={{ color: d.color, fontWeight: 'bold', width: '60px', textAlign: 'right' }}>{d.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Voter Registration & EPIC Coverage */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Voter Registration Overview</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', margin: '10px 0', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>New Voters</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>12,34,567</strong>
                    <span style={{ color: '#16a34a', display: 'block', fontSize: '9px' }}>&uarr; 8.45%</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Deleted Voters</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>2,45,678</strong>
                    <span style={{ color: '#ef4444', display: 'block', fontSize: '9px' }}>&uarr; 3.21%</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Corrections</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>8,76,543</strong>
                    <span style={{ color: '#16a34a', display: 'block', fontSize: '9px' }}>&uarr; 5.67%</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>EPIC Coverage</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>98.35%</strong>
                    <span style={{ color: '#16a34a', display: 'block', fontSize: '9px' }}>&uarr; 2.34%</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>EPIC Coverage Trend</span>
                  <div style={{ height: '35px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 200 40">
                      <path d="M10,35 Q60,30 110,20 T190,5" fill="none" stroke="#2563eb" strokeWidth="2" />
                      <circle cx="10" cy="35" r="2" fill="#2563eb" />
                      <circle cx="190" cy="5" r="2.5" fill="#2563eb" />
                      <text x="190" y="15" fill="#2563eb" fontSize="8" fontWeight="bold" textAnchor="end">98.35%</text>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', fontWeight: 'bold' }}>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                  </div>
                </div>
              </div>

            </div>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 1.2fr', gap: '24px' }}>
              
              {/* Section 4: Training Completion Status */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Training Completion Status</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Training Dashboard &rarr;</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
                  <div style={{ position: 'relative', width: '85px', height: '85px', flexShrink: 0 }}>
                    <svg width="85" height="85" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Completed: 92.48% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="92.48 100" strokeDashoffset="0" />
                      {/* In Progress: 6.01% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3.5" 
                              strokeDasharray="6.01 100" strokeDashoffset="-92.48" />
                      {/* Pending: 1.51% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ea580c" strokeWidth="3.5" 
                              strokeDasharray="1.51 100" strokeDashoffset="-98.49" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold' }}>Overall</span>
                      <strong style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>92.48%</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Completed
                      </span>
                      <strong style={{ color: '#0f172a' }}>12,03,456 (92.48%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> In Progress
                      </span>
                      <strong style={{ color: '#0f172a' }}>78,234 (6.01%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} /> Pending
                      </span>
                      <strong style={{ color: '#0f172a' }}>20,112 (1.51%)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Candidate Expenditure Monitoring */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Candidate Expenditure Monitoring</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Expenditure Dashboard &rarr;</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px', textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Total Candidates</div>
                    <strong style={{ fontSize: '12px', color: '#0f172a' }}>1,162</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Total Spent</div>
                    <strong style={{ fontSize: '12px', color: '#0f172a' }}>₹ 93.42 Cr</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Average Spent</div>
                    <strong style={{ fontSize: '12px', color: '#0f172a' }}>₹ 80.36 L</strong>
                  </div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                    <div style={{ fontSize: '9px', color: '#b91c1c' }}>High Risk</div>
                    <strong style={{ fontSize: '12px', color: '#b91c1c' }}>27</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '90px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { name: "Amit Kumar", ac: "Lucknow East", spent: "₹ 92.15 L", limit: "₹ 95.00 L", risk: "High", color: "#dc2626" },
                    { name: "Rajendra Singh", ac: "Meerut", spent: "₹ 88.70 L", limit: "₹ 95.00 L", risk: "High", color: "#dc2626" },
                    { name: "Vikram Pratap", ac: "Kanpur South", spent: "₹ 81.30 L", limit: "₹ 95.00 L", risk: "Medium", color: "#ea580c" }
                  ].map((cand, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{cand.name}</span>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>{cand.ac}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>{cand.spent}</strong>
                        <div style={{ fontSize: '9px', color: cand.color, fontWeight: 'bold' }}>Risk: {cand.risk}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Force Deployment Overview */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Force Deployment Overview</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Force Deployment &rarr;</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                  <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                    <svg width="70" height="70" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Deployed: 85% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="85 100" strokeDashoffset="0" />
                      {/* In Transit: 11% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3.5" 
                              strokeDasharray="11 100" strokeDashoffset="-85" />
                      {/* Yet to Deploy: 4% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ea580c" strokeWidth="3.5" 
                              strokeDasharray="4 100" strokeDashoffset="-96" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold' }}>State</span>
                      <strong style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>85%</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Deployed</span>
                      <strong style={{ color: '#0f172a' }}>2,45,678 (85%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>In Transit</span>
                      <strong style={{ color: '#0f172a' }}>32,145 (11%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Yet to Deploy</span>
                      <strong style={{ color: '#0f172a' }}>11,267 (4%)</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px', fontSize: '11px' }}>
                  <div>Requested: <strong>3,10,000</strong></div>
                  <div>Allocated: <strong>2,88,090</strong></div>
                  <div style={{ color: '#16a34a', fontWeight: 'bold' }}>Utilized: 92.93%</div>
                </div>
              </div>

            </div>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '24px' }}>
              
              {/* Section 8: Active Incidents Summary */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Active Incidents Summary</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Incident Dashboard &rarr;</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { label: "Model Code Violations", val: "12", color: "#dc2626" },
                    { label: "Cash/Freebies Distribution", val: "05", color: "#ea580c" },
                    { label: "Liquor Distribution", val: "03", color: "#ea580c" },
                    { label: "Hate Speech", val: "02", color: "#eab308" },
                    { label: "Other Incidents", val: "01", color: "#3b82f6" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }} />
                        {item.label}
                      </span>
                      <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 9: Sensitive Booths Overview */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Sensitive Booths Overview</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Sensitive Booth Map &rarr;</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                  <div style={{ position: 'relative', width: '75px', height: '75px', flexShrink: 0 }}>
                    <svg width="75" height="75" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Normal: 82.83% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="82.83 100" strokeDashoffset="0" />
                      {/* Sensitive: 12.47% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ea580c" strokeWidth="3.5" 
                              strokeDasharray="12.47 100" strokeDashoffset="-82.83" />
                      {/* Hyper: 4.70% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#dc2626" strokeWidth="3.5" 
                              strokeDasharray="4.70 100" strokeDashoffset="-95.30" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                      <strong style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>25,763</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Normal
                      </span>
                      <strong style={{ color: '#0f172a' }}>1,24,662 (82.83%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} /> Sensitive
                      </span>
                      <strong style={{ color: '#0f172a' }}>18,762 (12.47%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }} /> Hyper Sensitive
                      </span>
                      <strong style={{ color: '#0f172a' }}>7,001 (4.70%)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 10: Election Readiness Scorecard */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Election Readiness Overview</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { label: "District Readiness", val: "82.65%", color: "#22c55e" },
                    { label: "Training Completion", val: "92.48%", color: "#22c55e" },
                    { label: "EVM Readiness", val: "97.12%", color: "#22c55e" },
                    { label: "Booth Readiness", val: "99.21%", color: "#22c55e" },
                    { label: "Logistics Readiness", val: "88.34%", color: "#22c55e" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span style={{ color: '#475569' }}>{item.label}</span>
                        <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}>
                        <div style={{ width: item.val, height: '100%', backgroundColor: item.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 11 & 12: Quick Actions */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header">
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Quick Actions</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button onClick={() => alert("Send state-wide alert/message...")} style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Send Alert</button>
                    <button onClick={() => alert("Requesting supplementary force deployment...")} style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Request Forces</button>
                    <button onClick={() => alert("Issuing new training directives...")} style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Training Order</button>
                    <button onClick={() => alert("MCC action report dispatching...")} style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>MCC Report</button>
                  </div>
                  <button
                    onClick={() => alert("Generating state consolidated report PDF...")}
                    style={{
                      padding: '8px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Generate State Report &rarr;
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
                  <h2 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>CEO AI Command Support & State Insights</h2>
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
                    placeholder="Ask AI about force distribution, SVEEP guidelines, or state-wide compliance..."
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
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>State Logistics & Metrics Center</h2>
                </div>
                <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
                  <div>&bull; <strong>Expenditure Tracking:</strong> ₹ 93.42 Cr monitored.</div>
                  <div>&bull; <strong>SVEEP Campaign:</strong> 12 major awareness drives active.</div>
                  <div>&bull; <strong>Forces Deployment:</strong> 2,88,090 personnel allocated.</div>
                  <div>&bull; <strong>Electoral Roll:</strong> 12.34L new voters added.</div>
                </div>
                <button
                  onClick={() => alert("Loading state-wide compliance records...")}
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
                  Open State Compliance Console
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
          &copy; 2026 NagarVaani Election System. All rights reserved. &bull; State Chief Electoral Officer Command Dashboard &bull; Version 2.0
        </footer>
      </main>
    </div>
  );
}
