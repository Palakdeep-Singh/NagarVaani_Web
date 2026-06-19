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

export default function ECIDashboard({ user, onLogout }) {
  const userName = user?.name || 'ECI Admin';
  const userRole = user?.role || 'Chief Election Commissioner';

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
    { sender: 'bot', text: 'Hello! I am your NagarVaani ECI Command Assistant. I monitor national voter turnout, phase transitions, repoll statuses, and CAPF force allocation.' },
    { sender: 'user', text: 'Show active repolls.' },
    { sender: 'bot', text: 'Current repoll status: 23 requests (7 Approved, 16 Pending, 0 Rejected).' }
  ]);

  // ECI State Management
  const [repolls, setRepolls] = useState([
    { id: "REP-01", state: "Uttar Pradesh", constituency: "Varanasi North", boothId: 104, reason: "EVM Tampering Allegations", status: "Pending", requestedBy: "CEO UP", time: "11:28 AM" },
    { id: "REP-02", state: "West Bengal", constituency: "Diamond Harbour", boothId: 45, reason: "Booth Capture Dispute", status: "Approved", requestedBy: "CEO WB", time: "10:15 AM" },
    { id: "REP-03", state: "Bihar", constituency: "Patna Sahib", boothId: 12, reason: "VVPAT Mismatch Count", status: "Pending", requestedBy: "CEO Bihar", time: "09:40 AM" },
    { id: "REP-04", state: "Maharashtra", constituency: "Baramati", boothId: 88, reason: "Unauthorized Crowd Gathering", status: "Rejected", requestedBy: "CEO Maharashtra", time: "08:30 AM" }
  ]);
  const [mccViolations, setMccViolations] = useState([
    { id: "MCC-01", candidate: "Ramesh Sharma", party: "Independent", state: "Uttar Pradesh", violationType: "Hate Speech", detail: "Provocative speech during rally in Varanasi North.", status: "Notice Issued", time: "10:30 AM" },
    { id: "MCC-02", candidate: "Sunita Verma", party: "Party B", state: "Bihar", violationType: "Cash Distribution", detail: "Accused of distributing cash tokens near Patna polling booth.", status: "Pending Investigation", time: "11:00 AM" },
    { id: "MCC-03", candidate: "Alok Kumar", party: "Party A", state: "Delhi", violationType: "Illegal Campaigning", detail: "Campaign posters pasted within 100 meters of polling station.", status: "Resolved", time: "09:15 AM" }
  ]);
  const [selectedState, setSelectedState] = useState("Uttar Pradesh");
  const [circulars, setCirculars] = useState([
    { id: "CIRC-01", title: "Strict Compliance of 100-meter Campaign Restriction", target: "All State CEOs", status: "Published", date: "2026-06-18" },
    { id: "CIRC-02", title: "VVPAT Slip Matching Protocol Post-Polling", target: "All DEOs / ROs", status: "Published", date: "2026-06-15" }
  ]);
  const [newCircularTitle, setNewCircularTitle] = useState("");
  const [newCircularTarget, setNewCircularTarget] = useState("All State CEOs");
  const [nationalSettings, setNationalSettings] = useState({
    mccActive: true,
    cctvMonitoring: true,
    postalVotingAllowed: true,
    repollApprovalRequired: true,
    alertThreshold: "High"
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
    alert(`National ECI Circular sent to all 28 State CEOs and 10,50,072 booths: "${broadcastText}"`);
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
      if (query.includes("repoll") || query.includes("approve")) {
        replyText = "National Repoll Status: 23 requests submitted. 7 Approved (pending rescheduling), 16 under verification by State CEOs.";
      } else if (query.includes("force") || query.includes("capf")) {
        replyText = "Security Forces: 24,24,276 total personnel deployed. Includes 8,56,214 CAPF, 12,45,672 State Police, and 3,21,145 Home Guards.";
      } else if (query.includes("turnout") || query.includes("kerala")) {
        replyText = "Turnout rankings (Till 10 AM): 1. Kerala: 67.21%, 2. Tamil Nadu: 61.35%, 3. Himachal Pradesh: 59.08%, 4. West Bengal: 56.72%, 5. Karnataka: 55.61%.";
      } else {
        replyText = `Regarding "${question}": Check the ECI National Guidelines. You can issue directives, view CCTV feeds, or check officer performance via the dashboard panels.`;
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
            <p style={{ fontSize: '9px', margin: 0, color: '#38bdf8', letterSpacing: '1px', fontWeight: 700 }}>National Command Center</p>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="sidebar-menu" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '16px', paddingRight: '4px' }}>
          {[
            { id: 'Dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
            { id: 'National Overview', name: 'National Overview', icon: <Building size={16} /> },
            { id: 'Live Turnout', name: 'Live Turnout', icon: <Percent size={16} /> },
            { id: 'State / UT Dashboard', name: 'State / UT Dashboard', icon: <BarChart2 size={16} /> },
            { id: 'Incident Command Center', name: 'Incident Command Center', icon: <ShieldAlert size={16} />, badge: 18 },
            { id: 'MCC Violation Monitor', name: 'MCC Violation Monitor', icon: <AlertTriangle size={16} /> },
            { id: 'EVM Tracking', name: 'EVM Tracking', icon: <Cpu size={16} /> },
            { id: 'Repoll Management', name: 'Repoll Management', icon: <RefreshCw size={16} /> },
            { id: 'Security & Force Deployment', name: 'Security & Force Deployment', icon: <ShieldAlert size={16} /> },
            { id: 'Sensitive Booths', name: 'Sensitive Booths', icon: <AlertCircle size={16} /> },
            { id: 'Officer Performance', name: 'Officer Performance', icon: <UserCheck size={16} /> },
            { id: 'Reports & Analytics', name: 'Reports & Analytics', icon: <BarChart2 size={16} /> },
            { id: 'AI Risk Analytics', name: 'AI Risk Analytics', icon: <Cpu size={16} /> },
            { id: 'Media & Public Portal', name: 'Media & Public Portal', icon: <BookOpen size={16} /> },
            { id: 'Audit Trail', name: 'Audit Trail', icon: <FileText size={16} /> },
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

        {/* BOTTOM FIXED SECTION (Election Summary & Emergency) */}
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
            <div style={{ fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '2px' }}>Election Summary</div>
            <div>Total States / UTs: <span style={{ color: '#fff', fontWeight: '600' }}>28</span></div>
            <div>Total Constituencies: <span style={{ color: '#fff', fontWeight: '600' }}>543</span></div>
            <div>Total Polling Stations: <span style={{ color: '#fff', fontWeight: '600' }}>10,50,072</span></div>
            <div>Total Voters: <span style={{ color: '#fff', fontWeight: '600' }}>96,80,45,234</span></div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0', padding: '4px 0' }}>
              <div>Male: <span style={{ color: '#fff' }}>49,21,26,134</span></div>
              <div>Female: <span style={{ color: '#fff' }}>47,59,14,389</span></div>
              <div>Third Gender: <span style={{ color: '#fff' }}>59,711</span></div>
            </div>
            
            <button
              onClick={() => alert("Loading all State CEO reports...")}
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
              <span>View All Reports</span>
              <ArrowRight size={10} />
            </button>
          </div>

          <button
            onClick={() => {
              const confirmAlert = window.confirm("🚨 WARNING: Initiate National Emergency Directive System?");
              if (confirmAlert) {
                alert("Emergency notices dispatched to all State CEOs and Security Coordinators.");
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
            <span>NATIONAL EMERGENCY ALARM</span>
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
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>ECI Command Center</h1>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: '#dcfce7',
                color: '#15803d'
              }}>Live</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: '500' }}>
              General Elections 2026 &bull; Real-time National Overview &bull; Election Commission of India
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
              onClick={() => alert("Notification panel: 18 active incident alerts are unresolved national-wide.")}
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
              }}>18</span>
            </div>

            {/* Profile Widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                ECI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{userName}</span>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Chief Commissioner</span>
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
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Polling Stations</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>10,50,072</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>&bull; 100% Ready</span>
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
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>96.80 Cr</h3>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>M: 49.21Cr &bull; F: 47.59Cr</span>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb' }}>
                    <Users size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Current Phase</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>Phase 3 of 7</h3>
                    <span style={{ fontSize: '9px', color: '#8b5cf6', fontWeight: 'bold' }}>Next: 29 Apr 2026</span>
                  </div>
                  <div style={{ backgroundColor: '#f5f3ff', padding: '6px', borderRadius: '8px', color: '#8b5cf6' }}>
                    <BarChart2 size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #16a34a', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>National Turnout %</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>52.34%</h3>
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
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626', margin: '4px 0 0' }}>18</h3>
                    <span style={{ fontSize: '9px', color: '#dc2626', fontWeight: 'bold' }}>C: 6 &bull; H: 12</span>
                  </div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '8px', color: '#dc2626' }}>
                    <ShieldAlert size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ca8a04', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Repoll Requests</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>23</h3>
                    <span style={{ fontSize: '9px', color: '#ca8a04', fontWeight: 'bold' }}>A: 7 &bull; P: 16</span>
                  </div>
                  <div style={{ backgroundColor: '#fef9c3', padding: '6px', borderRadius: '8px', color: '#ca8a04' }}>
                    <RefreshCw size={16} />
                  </div>
                </div>
              </div>

            </section>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.3fr 1fr 1fr', gap: '24px' }}>
              
              {/* Section 1: National Election Map */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>National Election Map</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>State Drilldown &rarr;</span>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', margin: '12px 0', alignItems: 'center' }}>
                  {/* High fidelity stylized India Map representation */}
                  <svg width="130" height="150" viewBox="0 0 100 120" style={{ flexShrink: 0 }}>
                    {/* India Map outline path groups (stylized sectors colored by state status) */}
                    <path d="M40,5 Q50,0 55,20 L60,40 Q75,30 85,50 L95,65 Q80,75 75,90 L60,110 L50,115 L35,80 L20,70 L15,40 L30,25 Z" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                    
                    {/* Top States (Northern - Green) */}
                    <path d="M40,5 L55,20 L45,35 L30,25 Z" fill="#22c55e" stroke="#fff" strokeWidth="0.8" />
                    <path d="M55,20 L65,30 L60,45 L45,35 Z" fill="#22c55e" stroke="#fff" strokeWidth="0.8" />
                    
                    {/* Central States (Yellow/Orange) */}
                    <path d="M30,25 L45,35 L40,65 L20,55 Z" fill="#eab308" stroke="#fff" strokeWidth="0.8" />
                    <path d="M45,35 L60,45 L65,70 L40,65 Z" fill="#ea580c" stroke="#fff" strokeWidth="0.8" />
                    
                    {/* Eastern States (Light Green) */}
                    <path d="M60,45 L85,50 L80,68 L65,70 Z" fill="#86efac" stroke="#fff" strokeWidth="0.8" />
                    
                    {/* Southern States (Red/Orange) */}
                    <path d="M40,65 L65,70 L55,95 L45,90 Z" fill="#ef4444" stroke="#fff" strokeWidth="0.8" />
                    <path d="M45,90 L55,95 L50,112 L40,105 Z" fill="#f97316" stroke="#fff" strokeWidth="0.8" />
                  </svg>

                  <div style={{ flexGrow: 1, fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>🟢 75% and above</span>
                      <strong style={{ color: '#22c55e' }}>12 States</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>🟢 50% - 75%</span>
                      <strong style={{ color: '#86efac' }}>8 States</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>🟡 25% - 50%</span>
                      <strong style={{ color: '#eab308' }}>5 States</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>🔴 Below 25%</span>
                      <strong style={{ color: '#ef4444' }}>3 States</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>⚪ Yet to Start</span>
                      <strong style={{ color: '#94a3b8' }}>0 States</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <select style={{ flex: 1, padding: '4px', fontSize: '9px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}>
                    <option>View By: Turnout %</option>
                  </select>
                  <select style={{ flex: 1, padding: '4px', fontSize: '9px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}>
                    <option>Select Phase: All Phases</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Live Turnout Analytics */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Live Turnout (Today)</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All &rarr;</span>
                </div>

                <div style={{ height: '120px', position: 'relative', margin: '12px 0' }}>
                  <svg width="100%" height="100%" viewBox="0 0 300 100" style={{ overflow: 'visible' }}>
                    <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Current Election line */}
                    <path d="M 10 82 Q 70 70 130 50 T 250 25" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                    <circle cx="10" cy="82" r="3" fill="#2563eb" />
                    <circle cx="90" cy="65" r="3" fill="#2563eb" />
                    <circle cx="170" cy="45" r="3" fill="#2563eb" />
                    <circle cx="250" cy="25" r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />

                    {/* Previous Election line */}
                    <path d="M 10 90 L 90 75 L 170 55 L 250 35 L 290 20" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                    <circle cx="250" cy="35" r="2.5" fill="#94a3b8" />
                    
                    <rect x="235" y="0" width="36" height="15" rx="3" fill="#1e3a8a" />
                    <text x="253" y="10" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">52.34%</text>
                  </svg>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', fontWeight: 'bold' }}>
                  <span>7 AM</span>
                  <span>9 AM</span>
                  <span>11 AM</span>
                  <span>1 PM</span>
                  <span>3 PM</span>
                  <span>5 PM</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }}>Est. Final Turnout</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>67.12% <span style={{ color: '#16a34a', fontSize: '10px' }}>(+4.32%)</span></strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }}>Last Updated</span>
                    <strong style={{ fontSize: '11px', color: '#16a34a' }}>11:34 AM Live</strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Incident Command Center */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Incident Center</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All &rarr;</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
                  {[
                    { label: "Violence / Clash", val: 6, color: "#dc2626" },
                    { label: "Booth Capture / Disruption", val: 2, color: "#dc2626" },
                    { label: "EVM Malfunction", val: 4, color: "#ea580c" },
                    { label: "Power Failure", val: 3, color: "#eab308" },
                    { label: "Connectivity Issues", val: 2, color: "#3b82f6" },
                    { label: "Natural Calamity", val: 1, color: "#94a3b8" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#475569' }}>&bull; {item.label}</span>
                      <strong style={{ color: item.color }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: MCC Violation Monitor */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>MCC Monitor</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All &rarr;</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
                  {[
                    { label: "Hate Speech", val: 86, color: "#dc2626" },
                    { label: "Cash Distribution", val: 72, color: "#ea580c" },
                    { label: "Liquor Distribution", val: 45, color: "#ea580c" },
                    { label: "Illegal Campaigning", val: 62, color: "#eab308" },
                    { label: "Govt. Resource Misuse", val: 38, color: "#3b82f6" },
                    { label: "Others", val: 29, color: "#94a3b8" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#475569' }}>&bull; {item.label}</span>
                      <strong style={{ color: '#1e293b' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr', gap: '24px' }}>
              
              {/* Section 5: EVM Tracking Status */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>EVM Tracking Status</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Polling Station: 50.3% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="50.3 100" strokeDashoffset="0" />
                      {/* Warehouse: 18.7% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3.5" 
                              strokeDasharray="18.7 100" strokeDashoffset="-50.3" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                      <strong style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>11.23L</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Warehouse</span><strong>2.10L (18.7%)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>In Transit</span><strong>1.45L (12.9%)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RO Office</span><strong>1.80L (16.1%)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Polling Booth</span><strong>5.65L (50.3%)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Counting Center</span><strong>21K (1.9%)</strong></div>
                  </div>
                </div>
              </div>

              {/* Section 6: Repoll Management */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Repoll Management</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Approved: 30.43% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="30.43 100" strokeDashoffset="0" />
                      {/* Pending: 69.57% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#eab308" strokeWidth="3.5" 
                              strokeDasharray="69.57 100" strokeDashoffset="-30.43" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                      <strong style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>23</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Approved
                      </span>
                      <strong style={{ color: '#0f172a' }}>7 (30.43%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#eab308' }} /> Pending
                      </span>
                      <strong style={{ color: '#0f172a' }}>16 (69.57%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Rejected
                      </span>
                      <strong style={{ color: '#0f172a' }}>0 (0%)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7: Security Deployment */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Security Deployment</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { label: "CAPF Deployed", val: "8,56,214" },
                    { label: "State Police", val: "12,45,672" },
                    { label: "Home Guards", val: "3,21,145" },
                    { label: "QRT Teams", val: "1,245" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#475569' }}>{item.label}</span>
                      <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '4px', fontWeight: 'bold' }}>
                    <span>Total Deployment</span>
                    <span style={{ color: '#2563eb' }}>24,24,276</span>
                  </div>
                </div>
              </div>

              {/* Section 8: Sensitive Booths Summary */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Sensitive Booths</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Map</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                  <div style={{ position: 'relative', width: '75px', height: '75px', flexShrink: 0 }}>
                    <svg width="75" height="75" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Normal: 70.8% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="70.8 100" strokeDashoffset="0" />
                      {/* Sensitive: 20.5% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ea580c" strokeWidth="3.5" 
                              strokeDasharray="20.5 100" strokeDashoffset="-70.8" />
                      {/* Hyper: 6.6% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#dc2626" strokeWidth="3.5" 
                              strokeDasharray="6.6 100" strokeDashoffset="-91.3" />
                      {/* Critical: 2.1% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#7f1d1d" strokeWidth="3.5" 
                              strokeDasharray="2.1 100" strokeDashoffset="-97.9" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '7px', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                      <strong style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>1.25L</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Normal</span><strong>88,500 (70.8%)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sensitive</span><strong>25,600 (20.5%)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Hyper</span><strong>8,200 (6.6%)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Critical</span><strong>2,700 (2.1%)</strong></div>
                  </div>
                </div>
              </div>

            </div>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr', gap: '24px' }}>
              
              {/* Top 5 States Turnout */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: '800' }}>Top 5 States by Turnout</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { name: "Kerala", val: "67.21%", color: "#22c55e" },
                    { name: "Tamil Nadu", val: "61.35%", color: "#22c55e" },
                    { name: "Himachal Pradesh", val: "59.08%", color: "#22c55e" },
                    { name: "West Bengal", val: "56.72%", color: "#22c55e" },
                    { name: "Karnataka", val: "55.61%", color: "#86efac" }
                  ].map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 'bold' }}>{idx + 1}. {s.name}</span>
                      <strong style={{ color: s.color }}>{s.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 States Incidents */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: '800' }}>Top 5 States by Incidents</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { name: "Uttar Pradesh", val: 7, color: "#dc2626" },
                    { name: "West Bengal", val: 4, color: "#ea580c" },
                    { name: "Bihar", val: 3, color: "#ca8a04" },
                    { name: "Maharashtra", val: 2, color: "#3b82f6" },
                    { name: "Rajasthan", val: 2, color: "#3b82f6" }
                  ].map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 'bold' }}>{idx + 1}. {s.name}</span>
                      <strong style={{ color: s.color }}>{s.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Performance responsive table */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: '800' }}>Officer Performance Summary</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                      <th style={{ padding: '6px' }}>Level</th>
                      <th style={{ padding: '6px', textAlign: 'center' }}>Total</th>
                      <th style={{ padding: '6px', textAlign: 'center' }}>Responsive</th>
                      <th style={{ padding: '6px', textAlign: 'center' }}>On Time</th>
                      <th style={{ padding: '6px', textAlign: 'center' }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { level: "CEO/State", total: "28", responsive: "28 (100%)", ontime: "27 (96%)", rating: "4.8 ★" },
                      { level: "DEO/District", total: "768", responsive: "741 (96%)", ontime: "701 (91%)", rating: "4.6 ★" },
                      { level: "RO", total: "4,123", responsive: "3,812 (92%)", ontime: "3,510 (85%)", rating: "4.3 ★" },
                      { level: "Sector Officers", total: "52,218", responsive: "48,765 (93%)", ontime: "44,210 (85%)", rating: "4.2 ★" },
                      { level: "Presiding Officers", total: "10.50L", responsive: "9.21L (87%)", ontime: "8.45L (81%)", rating: "4.1 ★" }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                        <td style={{ padding: '6px', fontWeight: 'bold' }}>{row.level}</td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>{row.total}</td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>{row.responsive}</td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>{row.ontime}</td>
                        <td style={{ padding: '6px', textAlign: 'center', color: '#ca8a04', fontWeight: 'bold' }}>{row.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Actions */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header">
                  <h2 style={{ fontSize: '13px', fontWeight: '800' }}>Quick Actions</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
                  <button onClick={() => alert("Issue Circular Directive state-wide...")} style={{ padding: '7px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Issue Circular</button>
                  <button onClick={() => alert("Send National alert to all CEOs...")} style={{ padding: '7px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Alert CEOs</button>
                  <button onClick={() => alert("Connecting live CCTV feeds...")} style={{ padding: '7px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>View CCTV Feeds</button>
                  <button onClick={() => alert("Generate Consolidated National Report...")} style={{ padding: '7px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>National Report</button>
                  <button onClick={() => alert("Opening Public Dashboard portal...")} style={{ padding: '7px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Public Portal</button>
                </div>
              </div>

            </div>

            {/* LOWER RO WIDGETS: AI ASSISTANT CHAT & SUMMARY */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              
              {/* ECI SOP AI Assistant Chat */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} color="#2563eb" />
                  <h2 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>ECI National AI Operations & SOP Assistant</h2>
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
                    placeholder="Ask ECI AI about model code rules, repoll thresholds, or force coordination..."
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
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>National Command Center Status</h2>
                </div>
                <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
                  <div>&bull; <strong>EVM Status:</strong> 11,23,500 units deployed &bull; 100% Ok.</div>
                  <div>&bull; <strong>Forces Status:</strong> 24.24 Lakh CAPF/Police active state-wide.</div>
                  <div>&bull; <strong>Sensitive Stations:</strong> 1.25 Lakh sensitive booths identified.</div>
                  <div>&bull; <strong>Response Rate:</strong> 10.50L officers tracked &bull; 87% Responsive.</div>
                </div>
                <button
                  onClick={() => alert("Loading National election audit logs...")}
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
                  Open National Compliance Audit Console
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ECI WORKSPACE DETAILED VIEWS */}
        {activeMenu === 'National Overview' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State-wise National Election Overview</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>State / UT</th>
                    <th style={{ padding: '10px' }}>Total ACs</th>
                    <th style={{ padding: '10px' }}>Polling Stations</th>
                    <th style={{ padding: '10px' }}>Voter Turnout</th>
                    <th style={{ padding: '10px' }}>Incidents</th>
                    <th style={{ padding: '10px' }}>EVM Status</th>
                    <th style={{ padding: '10px' }}>CAPF Coys</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { state: "Uttar Pradesh", acs: 403, booths: "1,50,425", turnout: "52.34%", incidents: 7, evm: "99.23% OK", capf: 850 },
                    { state: "West Bengal", acs: 294, booths: "78,903", turnout: "56.72%", incidents: 4, evm: "98.95% OK", capf: 920 },
                    { state: "Bihar", acs: 243, booths: "72,723", turnout: "49.12%", incidents: 3, evm: "99.12% OK", capf: 740 },
                    { state: "Maharashtra", acs: 288, booths: "97,247", turnout: "51.05%", incidents: 2, evm: "99.50% OK", capf: 680 },
                    { state: "Tamil Nadu", acs: 234, booths: "68,125", turnout: "61.35%", incidents: 0, evm: "99.85% OK", capf: 410 },
                    { state: "Kerala", acs: 140, booths: "25,120", turnout: "67.21%", incidents: 0, evm: "99.90% OK", capf: 300 }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.state}</td>
                      <td style={{ padding: '10px' }}>{row.acs}</td>
                      <td style={{ padding: '10px' }}>{row.booths}</td>
                      <td style={{ padding: '10px', color: '#2563eb', fontWeight: 'bold' }}>{row.turnout}</td>
                      <td style={{ padding: '10px', color: row.incidents > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{row.incidents}</td>
                      <td style={{ padding: '10px', color: '#16a34a' }}>{row.evm}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.capf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Live Turnout' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Phase-wise National Voter Turnout</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { phase: "Phase 1 (19 Apr 2026)", booths: "1.20 Lakh", turnout: "66.12%", status: "Completed" },
                  { phase: "Phase 2 (26 Apr 2026)", booths: "1.45 Lakh", turnout: "64.85%", status: "Completed" },
                  { phase: "Phase 3 (Today)", booths: "1.58 Lakh", turnout: "52.34%", status: "Active (Till 10:00 AM)" },
                  { phase: "Phase 4 (07 May 2026)", booths: "1.80 Lakh", turnout: "0.00%", status: "Scheduled" },
                  { phase: "Phase 5 (13 May 2026)", booths: "1.25 Lakh", turnout: "0.00%", status: "Scheduled" },
                  { phase: "Phase 6 (20 May 2026)", booths: "1.30 Lakh", turnout: "0.00%", status: "Scheduled" },
                  { phase: "Phase 7 (26 May 2026)", booths: "1.92 Lakh", turnout: "0.00%", status: "Scheduled" }
                ].map((ph, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>{ph.phase} &bull; <span style={{ color: '#64748b' }}>{ph.booths} Booths</span></span>
                      <span style={{ color: ph.status.includes("Active") ? '#2563eb' : ph.status === "Completed" ? '#16a34a' : '#64748b', fontWeight: 'bold' }}>
                        {ph.status} ({ph.turnout})
                      </span>
                    </div>
                    <div style={{ height: '8px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: ph.turnout,
                        backgroundColor: ph.status === "Completed" ? '#16a34a' : '#2563eb',
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'State / UT Dashboard' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>State/UT Command Inspector</h2>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }}
                >
                  {["Uttar Pradesh", "West Bengal", "Bihar", "Maharashtra", "Tamil Nadu", "Kerala"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #2563eb' }}>
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase' }}>State Turnout</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0' }}>
                    {selectedState === "Uttar Pradesh" ? "52.34%" : selectedState === "West Bengal" ? "56.72%" : selectedState === "Bihar" ? "49.12%" : "55.20%"}
                  </h3>
                </div>
                <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #dc2626' }}>
                  <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Incidents</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0' }}>
                    {selectedState === "Uttar Pradesh" ? "7" : selectedState === "West Bengal" ? "4" : selectedState === "Bihar" ? "3" : "1"}
                  </h3>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #16a34a' }}>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', textTransform: 'uppercase' }}>Booths Active</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0' }}>100.00%</h3>
                </div>
                <div style={{ backgroundColor: '#f5f3ff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                  <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 'bold', textTransform: 'uppercase' }}>CAPF Personnel</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0' }}>
                    {selectedState === "Uttar Pradesh" ? "85,000" : selectedState === "West Bengal" ? "92,000" : selectedState === "Bihar" ? "74,000" : "50,000"}
                  </h3>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>CEO Compliance checklist &bull; {selectedState}</strong>
                <div>&bull; Security Certificates: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>All Received</span></div>
                <div style={{ marginTop: '4px' }}>&bull; Mock Poll Logs: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Verified (100% OK)</span></div>
                <div style={{ marginTop: '4px' }}>&bull; GPS Vehicle Sync: <span style={{ color: '#ca8a04', fontWeight: 'bold' }}>98% Connected</span></div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Incident Command Center' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>National Incident Command Center</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>State</th>
                    <th style={{ padding: '10px' }}>Location / Booth</th>
                    <th style={{ padding: '10px' }}>Dispute / Issue</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Priority</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "INC-N01", state: "Uttar Pradesh", loc: "Varanasi North - Booth 104", issue: "CU Screen Frozen", status: "Investigating", priority: "Critical" },
                    { id: "INC-N02", state: "West Bengal", loc: "Diamond Harbour - Booth 45", issue: "Clash near Polling Center", status: "Force Dispatched", priority: "Critical" },
                    { id: "INC-N03", state: "Bihar", loc: "Patna Sahib - Booth 12", issue: "VVPAT Jammed", status: "Resolved", priority: "High" },
                    { id: "INC-N04", state: "Maharashtra", loc: "Baramati - Booth 88", issue: "Minor Queue Dispute", status: "Resolved", priority: "Low" }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.id}</td>
                      <td style={{ padding: '10px' }}>{row.state}</td>
                      <td style={{ padding: '10px' }}>{row.loc}</td>
                      <td style={{ padding: '10px' }}>{row.issue}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: row.status === "Resolved" ? '#dcfce7' : '#fef9c3',
                          color: row.status === "Resolved" ? '#15803d' : '#854d0e'
                        }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '10px', color: row.priority === "Critical" ? '#dc2626' : '#2563eb', fontWeight: 'bold' }}>{row.priority}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => alert(`Direct Dispatch initiated for observers to ${row.loc}`)}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginRight: '4px' }}
                        >Dispatch Observer</button>
                        <button
                          onClick={() => alert(`${row.id} status updated to Resolved`)}
                          style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Resolve</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'MCC Violation Monitor' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Model Code of Conduct Violation Dashboard</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Candidate / Party</th>
                    <th style={{ padding: '10px' }}>State</th>
                    <th style={{ padding: '10px' }}>Violation Type</th>
                    <th style={{ padding: '10px' }}>Details</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mccViolations.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.id}</td>
                      <td style={{ padding: '10px', fontWeight: '700' }}>{row.candidate} <span style={{ fontSize: '10px', color: '#64748b' }}>({row.party})</span></td>
                      <td style={{ padding: '10px' }}>{row.state}</td>
                      <td style={{ padding: '10px', color: '#b91c1c', fontWeight: 'bold' }}>{row.violationType}</td>
                      <td style={{ padding: '10px' }}>{row.detail}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: row.status === 'Resolved' ? '#dcfce7' : '#fee2e2',
                          color: row.status === 'Resolved' ? '#15803d' : '#b91c1c'
                        }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setMccViolations(prev => prev.map(v => v.id === row.id ? { ...v, status: "Notice Issued" } : v));
                            alert(`Official ECI Notice served to ${row.candidate}. Response required in 48 hours.`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginRight: '4px' }}
                        >Issue Notice</button>
                        <button
                          onClick={() => {
                            setMccViolations(prev => prev.map(v => v.id === row.id ? { ...v, status: "Resolved" } : v));
                            alert(`MCC complaint ${row.id} marked as Resolved.`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Mark Resolved</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'EVM Tracking' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>National EVM Inventory & Transit Registry</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: "Total Deployed", count: "11.23 Lakh", color: "#22c55e" },
                  { label: "Reserve in Transit", count: "1.45 Lakh", color: "#3b82f6" },
                  { label: "Warehouse Inventory", count: "2.10 Lakh", color: "#64748b" },
                  { label: "RO District Vaults", count: "1.80 Lakh", color: "#8b5cf6" },
                  { label: "Under Repair / Review", count: "21,000", color: "#ef4444" }
                ].map((card, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>{card.label}</div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: card.color, margin: '6px 0 0' }}>{card.count}</h3>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <strong>ECI Double Randomization Protocol Check:</strong>
                <div style={{ marginTop: '8px' }}>&bull; 1st Randomization: Completed across all 543 Parliamentary Constituencies.</div>
                <div style={{ marginTop: '4px' }}>&bull; 2nd Randomization: Verified by independent Observers. Certificates uploaded.</div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Repoll Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>ECI National Repoll Authority Console</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>Request ID</th>
                    <th style={{ padding: '10px' }}>State</th>
                    <th style={{ padding: '10px' }}>Constituency</th>
                    <th style={{ padding: '10px' }}>Booth ID</th>
                    <th style={{ padding: '10px' }}>Reason</th>
                    <th style={{ padding: '10px' }}>Requested By</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {repolls.map((rep) => (
                    <tr key={rep.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{rep.id}</td>
                      <td style={{ padding: '10px' }}>{rep.state}</td>
                      <td style={{ padding: '10px' }}>{rep.constituency}</td>
                      <td style={{ padding: '10px' }}>Booth {rep.boothId}</td>
                      <td style={{ padding: '10px', color: '#b91c1c' }}>{rep.reason}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{rep.requestedBy}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: rep.status === 'Approved' ? '#dcfce7' : rep.status === 'Pending' ? '#fef9c3' : '#fee2e2',
                          color: rep.status === 'Approved' ? '#15803d' : rep.status === 'Pending' ? '#854d0e' : '#b91c1c'
                        }}>{rep.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setRepolls(prev => prev.map(r => r.id === rep.id ? { ...r, status: "Approved" } : r));
                            alert(`Repoll request ${rep.id} officially APPROVED. Notifying CEO ${rep.state} and DEO to arrange fresh polling.`);
                          }}
                          disabled={rep.status !== 'Pending'}
                          style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: rep.status === 'Pending' ? 'pointer' : 'not-allowed', opacity: rep.status === 'Pending' ? 1 : 0.5, marginRight: '4px' }}
                        >Approve</button>
                        <button
                          onClick={() => {
                            setRepolls(prev => prev.map(r => r.id === rep.id ? { ...r, status: "Rejected" } : r));
                            alert(`Repoll request ${rep.id} REJECTED.`);
                          }}
                          disabled={rep.status !== 'Pending'}
                          style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: rep.status === 'Pending' ? 'pointer' : 'not-allowed', opacity: rep.status === 'Pending' ? 1 : 0.5 }}
                        >Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Security & Force Deployment' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>CAPF & Security Force Coordination</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>Active CAPF Deployments</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '8px' }}>Force Name</th>
                        <th style={{ padding: '8px' }}>Companies Deployed</th>
                        <th style={{ padding: '8px' }}>Primary State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { force: "CRPF (Central Reserve Police Force)", coys: 1200, state: "West Bengal & Bihar" },
                        { force: "BSF (Border Security Force)", coys: 800, state: "Uttar Pradesh & WB" },
                        { force: "CISF (Central Industrial Security)", coys: 650, state: "Maharashtra" },
                        { force: "ITBP (Indo-Tibetan Border Police)", coys: 400, state: "Himachal Pradesh" }
                      ].map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontWeight: '600' }}>{item.force}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.coys} Coys</td>
                          <td style={{ padding: '8px' }}>{item.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Simulate Force Dispatch / Deployment</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    alert("Force mobilization order signed and dispatched to Ministry of Home Affairs Liaison.");
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Select Force type</label>
                      <select style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                        <option>CRPF Reserve Division</option>
                        <option>BSF Tactical Division</option>
                        <option>State Armed Reserve</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Destination State</label>
                      <select style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                        <option>West Bengal</option>
                        <option>Uttar Pradesh</option>
                        <option>Bihar</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Companies Count</label>
                      <input type="number" defaultValue="10" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Mobilize Forces ⚡
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Sensitive Booths' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Sensitive & Critical Booths Map</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: "Normal Stations", count: "7,42,800", pct: "70.8%" },
                  { label: "Sensitive Stations", count: "2,15,600", pct: "20.5%" },
                  { label: "Hyper-Sensitive", count: "69,300", pct: "6.6%" },
                  { label: "Critical (CCTV Required)", count: "22,372", pct: "2.1%" }
                ].map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>{item.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', margin: '4px 0 2px' }}>{item.count}</div>
                    <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: '700' }}>{item.pct} of National Total</span>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', border: '1px solid #fed7aa', fontSize: '12px', color: '#c2410c' }}>
                <strong>ECI Guideline Circular 44B:</strong> All Critical and Hyper-Sensitive polling booths must be backed by live webcasting streams visible directly in district and state command panels.
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Officer Performance' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State CEO & District DEO Performance Metrics</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>State / Officer</th>
                    <th style={{ padding: '10px' }}>Roster Verification %</th>
                    <th style={{ padding: '10px' }}>Incident Close Time (Avg)</th>
                    <th style={{ padding: '10px' }}>Hourly Turnout Sync Rate</th>
                    <th style={{ padding: '10px' }}>Training Certification</th>
                    <th style={{ padding: '10px' }}>Compliance Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { officer: "CEO Uttar Pradesh", roster: "99.12%", close: "8.2 mins", sync: "98.45%", train: "97.48%", rating: "4.8 ★" },
                    { officer: "CEO Kerala", roster: "100.00%", close: "4.1 mins", sync: "99.80%", train: "99.12%", rating: "4.9 ★" },
                    { officer: "CEO Bihar", roster: "96.50%", close: "14.5 mins", sync: "91.20%", train: "92.05%", rating: "4.2 ★" },
                    { officer: "CEO West Bengal", roster: "98.20%", close: "11.2 mins", sync: "95.10%", train: "95.60%", rating: "4.5 ★" },
                    { officer: "CEO Maharashtra", roster: "99.00%", close: "7.8 mins", sync: "97.60%", train: "96.80%", rating: "4.6 ★" }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.officer}</td>
                      <td style={{ padding: '10px' }}>{row.roster}</td>
                      <td style={{ padding: '10px' }}>{row.close}</td>
                      <td style={{ padding: '10px' }}>{row.sync}</td>
                      <td style={{ padding: '10px' }}>{row.train}</td>
                      <td style={{ padding: '10px', color: '#ca8a04', fontWeight: 'bold' }}>{row.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Reports & Analytics' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>ECI National Reports & Statutory Library</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { title: "National Turnout Summary", desc: "Phase-wise consolidated statistics", form: "ECI-Form 20A" },
                  { title: "MCC Violations audit", desc: "Consolidated list of violations & action taken", form: "ECI-Form MCC" },
                  { title: "Repoll and Reschedule logs", desc: "All approved repoll orders and status updates", form: "ECI-Form 12R" },
                  { title: "Security Force Deployment Map", desc: "CAPF allocation matrices state-wide", form: "ECI-Form SF" },
                  { title: "EVM Verification audit", desc: "Double Randomization certificates by ROs", form: "ECI-Form EVM" },
                  { title: "Officer Performance Scorecard", desc: "CEO, DEO response rates & rating report", form: "ECI-Form OPS" }
                ].map((rep, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '120px' }}>
                    <div>
                      <span style={{ fontSize: '9px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>{rep.form}</span>
                      <strong style={{ display: 'block', fontSize: '13px', marginTop: '6px', color: '#0f172a' }}>{rep.title}</strong>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0' }}>{rep.desc}</p>
                    </div>
                    <button
                      onClick={() => alert(`Generating PDF for ${rep.title}... Downloader initialized.`)}
                      style={{ border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', padding: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', color: '#2563eb' }}
                    >
                      Export PDF / Excel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'AI Risk Analytics' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>ECI AI Risk Engine & Turnout Projections</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold' }}>Active AI Risk Bulletins</h3>
                  {[
                    { title: "Uttar Pradesh (Varanasi North) - Turnout Stagnation", desc: "Turnout has lagged by 4.2% behind Phase 2 historical baseline due to EVM replacement delays. Projected final: 61.2% (Target: 66%).", risk: "Medium Risk", color: "#ca8a04" },
                    { title: "West Bengal (Diamond Harbour) - Security Conflict Profile", desc: "AI models flag 6 polling locations exhibiting high community tension risk based on social sentiment telemetry. CAPF reinforcement advised.", risk: "High Risk", color: "#dc2626" },
                    { title: "Kerala (All ACs) - Optimal Turnout Growth", desc: "Turnout trajectory exceeds baseline by 2.8%. Lower queue wait times predicted (Average 8 minutes per elector).", risk: "Low Risk", color: "#16a34a" }
                  ].map((bul, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${bul.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 'bold' }}>{bul.title}</span>
                        <span style={{ color: bul.color, fontWeight: 'bold' }}>{bul.risk}</span>
                      </div>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{bul.desc}</p>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Run Predictive Scenario Mock</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                    <div>
                      <strong>Turnout Target Optimizer:</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span>Projected National Turnout:</span>
                        <strong>67.12%</strong>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <strong>Weather Interference:</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span>Heatwave Impact Warning:</span>
                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Active (3 States)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert("Re-running AI forecasting models... Telemetries synchronized.")}
                      style={{ padding: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
                    >
                      Recalculate Projections
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Media & Public Portal' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Media & Citizen Portal Control Console</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Published ECI Circulars</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {circulars.map((circ) => (
                      <div key={circ.id} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>{circ.title}</span>
                          <span style={{ color: '#16a34a' }}>{circ.status}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Target: {circ.target} &bull; Date: {circ.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Publish New Circular / Press Release</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCircularTitle.trim()) return;
                    const newCirc = {
                      id: `CIRC-0${circulars.length + 1}`,
                      title: newCircularTitle,
                      target: newCircularTarget,
                      status: "Published",
                      date: new Date().toISOString().split('T')[0]
                    };
                    setCirculars(prev => [newCirc, ...prev]);
                    setNewCircularTitle("");
                    alert("ECI Circular successfully published to Media and Voter portals.");
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Circular Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Directive on Webcasting Standards"
                        value={newCircularTitle}
                        onChange={(e) => setNewCircularTitle(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Target Audience</label>
                      <select
                        value={newCircularTarget}
                        onChange={(e) => setNewCircularTarget(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      >
                        <option>All State CEOs</option>
                        <option>All DEOs / ROs</option>
                        <option>General Public & Media</option>
                      </select>
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Publish Directive
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Audit Trail' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>ECI National System Audit Trail</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                    <th style={{ padding: '10px' }}>User</th>
                    <th style={{ padding: '10px' }}>Level</th>
                    <th style={{ padding: '10px' }}>Action Performed</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: "2026-06-19 11:34:12", user: "DEO Varanasi", level: "District", action: "Approved EVM swap at Booth 104", status: "Success" },
                    { time: "2026-06-19 11:15:30", user: "CEO West Bengal", level: "State", action: "Submitted Phase 3 readiness verification", status: "Success" },
                    { time: "2026-06-19 10:45:18", user: "ECI Admin", level: "National", action: "Published circular on 100m restrictions", status: "Success" },
                    { time: "2026-06-19 10:12:00", user: "DEO Lucknow", level: "District", action: "1st Randomization matrix commit", status: "Success" }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', color: '#64748b' }}>{row.time}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.user}</td>
                      <td style={{ padding: '10px' }}>{row.level}</td>
                      <td style={{ padding: '10px' }}>{row.action}</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'System Settings' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>ECI National Command Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Model Code of Conduct Mode</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Toggles MCC enforcement rules system-wide</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nationalSettings.mccActive}
                      onChange={(e) => setNationalSettings(prev => ({ ...prev, mccActive: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Live Polling Webcast Streaming</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Enables CCTV streams from sensitive booths</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nationalSettings.cctvMonitoring}
                      onChange={(e) => setNationalSettings(prev => ({ ...prev, cctvMonitoring: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Postal Ballot Applications</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Allow citizens to submit postal applications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nationalSettings.postalVotingAllowed}
                      onChange={(e) => setNationalSettings(prev => ({ ...prev, postalVotingAllowed: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>National Alert Sensitivity Threshold</label>
                    <select
                      value={nationalSettings.alertThreshold}
                      onChange={(e) => setNationalSettings(prev => ({ ...prev, alertThreshold: e.target.value }))}
                      style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="High">High (Notify ECI on all incidents)</option>
                      <option value="Medium">Medium (Notify ECI on Critical/High only)</option>
                      <option value="Low">Low (Notify ECI on Critical only)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => alert("Settings successfully committed system-wide. Dispatched notification to State CEOs.")}
                    style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
                  >
                    Commit Settings System-Wide
                  </button>
                </div>
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
          &copy; 2026 NagarVaani Election System. All rights reserved. &bull; ECI National Command Center Dashboard &bull; Version 2.0
        </footer>
      </main>
    </div>
  );
}
