import React from 'react';
import { useEffect, useState } from 'react';
import { VideoCall } from '../components/VideoCall';
import {
  LayoutDashboard, FileText, Users, Award, ShieldAlert, Cpu, 
  HelpCircle, Settings, PhoneCall, Video, Send, AlertTriangle, 
  Building, CheckCircle, Percent, Trophy, RefreshCw, BarChart2,
  Clock, MapPin, Volume2, UserCheck, Check, LogOut, ArrowRight
} from 'lucide-react';
import api from '../utils/api';
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
  
  // RO Dashboard states
  const [nominations, setNominations] = useState([
    { id: "NOM001", candidate: "Rajesh Kumar", party: "National Congress Party", age: 48, status: "Accepted" },
    { id: "NOM002", candidate: "Sunita Devi", party: "Lok Kalyan Party", age: 52, status: "Accepted" },
    { id: "NOM003", candidate: "Vijay Malhotra", party: "Independent", age: 39, status: "Pending" },
    { id: "NOM004", candidate: "Anita Sen", party: "Progressive Front", age: 44, status: "Rejected" }
  ]);
  const [symbols, setSymbols] = useState([
    { candidate: "Rajesh Kumar", party: "National Congress Party", symbol: "Hand" },
    { candidate: "Sunita Devi", party: "Lok Kalyan Party", symbol: "Lotus" },
    { candidate: "Vijay Malhotra", party: "Independent", symbol: "Kite" }
  ]);
  const [countingRound, setCountingRound] = useState(() => Math.floor(Math.random() * 1) + 1);
  const [candidateVotes, setCandidateVotes] = useState([
    { name: "Rajesh Kumar", party: "National Congress Party", votes: 45201, leading: true },
    { name: "Sunita Devi", party: "Lok Kalyan Party", votes: 41850, leading: false },
    { name: "Vijay Malhotra", party: "Independent", votes: 1205, leading: false }
  ]);
  const [sectorRequests, setSectorRequests] = useState([
    { id: "REQ-301", sector: "Sector 3", boothId: 104, type: "EVM Replacement Approval", status: "Pending", time: "11:30 AM" },
    { id: "REQ-302", sector: "Sector 1", boothId: 103, type: "Additional Security Dispatch", status: "Approved", time: "11:15 AM" }
  ]);
  
  // AI assistant chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your NagarVaani RO Command Assistant. I monitor constituency-wide telemetries and DEO instructions.' }
  ]);

  // Real-time API state
  const [kpi, setKpi] = useState({ totalBooths: 0, activeBooths: 0, sectorTurnout: 0, openAlerts: 0, evmFaults: 0 });
  const [alerts, setAlerts] = useState([]);
  const [liveBooths, setLiveBooths] = useState([]);


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

  const fetchData = async () => {
    try {
      const res = await api.get('/booth/status');
      if (res.status === 200) {
        setIsOnline(true);
        setKpi(res.data.kpi);
        setAlerts(res.data.alerts);
        setLiveBooths(res.data.booths);
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setIsOnline(false);
      }
    } catch (err) {
      console.error(err);
      setIsOnline(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);


  const handleRefresh = () => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
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
            <h2 style={{ fontSize: '18px', margin: 0, color: '#fff', fontWeight: 800 }}>NagarVaani</h2>
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
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>{kpi.activeBooths} / {kpi.totalBooths}</h3>
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
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>{kpi.sectorTurnout}%</h3>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Live Up-to-Date</span>
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
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', margin: '4px 0 0' }}>{kpi.openAlerts}</h3>
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
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>EVM Faults</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>{kpi.evmFaults}</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>&bull; Active Replacements</span>
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
                  {alerts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' }}>No active incidents at the moment.</div>
                  ) : alerts.map((inc, i) => (
                    <div key={inc.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: inc.priority === 'Critical' ? '#dc2626' : '#ea580c' }} />
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', display: 'block' }}>{inc.type} – Booth {inc.boothId}</span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{inc.detail} &bull; {inc.time}</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: inc.priority === 'Critical' ? '#fee2e2' : '#ffedd5',
                        color: inc.priority === 'Critical' ? '#dc2626' : '#ea580c',
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

        {activeMenu === 'Nomination Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Nomination Vetting Console</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Review, accept, or reject candidate nomination papers filed for AC-123.</p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Nomination ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Candidate Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Affiliated Party</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Age</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nominations.map(nom => (
                      <tr key={nom.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#1e3a8a' }}>{nom.id}</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{nom.candidate}</td>
                        <td style={{ padding: '12px' }}>{nom.party}</td>
                        <td style={{ padding: '12px' }}>{nom.age}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: nom.status === 'Accepted' ? '#dcfce7' : nom.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                            color: nom.status === 'Accepted' ? '#16a34a' : nom.status === 'Rejected' ? '#ef4444' : '#b45309'
                          }}>{nom.status}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {nom.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  setNominations(prev => prev.map(n => n.id === nom.id ? { ...n, status: 'Accepted' } : n));
                                  alert("Nomination Paper Accepted.");
                                }}
                                style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  setNominations(prev => prev.map(n => n.id === nom.id ? { ...n, status: 'Rejected' } : n));
                                  alert("Nomination Paper Rejected.");
                                }}
                                style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Decided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Candidate Details' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Candidate Profiles</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Electoral profiles and affidavit tracking for validated candidates.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {nominations.filter(n => n.status === 'Accepted').map((cand, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px' }}>{cand.candidate}</h3>
                    <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase' }}>{cand.party}</span>
                    <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '10px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📄 <strong>Affidavit:</strong> Verified & Clear</div>
                      <div>⚖️ <strong>Criminal Records:</strong> Nil Declared</div>
                      <div>💰 <strong>Assets:</strong> Declared & Audited</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Symbol Allocation' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Symbol Allocation Matrix</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Allocate and review approved party and free symbols for contesting candidates.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Allocated Symbols</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {symbols.map((sym, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{sym.candidate}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{sym.party}</span>
                        </div>
                        <span style={{ padding: '4px 10px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontWeight: 'bold' }}>
                          🏷️ {sym.symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = e.target.candName.value;
                    const sym = e.target.candSymbol.value;
                    setSymbols(prev => prev.map(s => s.candidate === name ? { ...s, symbol: sym } : s));
                    alert(`Symbol "${sym}" allocated to ${name}.`);
                  }}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Allocate Symbol</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Candidate</label>
                    <select name="candName" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}>
                      {symbols.map(s => <option key={s.candidate}>{s.candidate}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Free / Reserved Symbol</label>
                    <select name="candSymbol" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}>
                      <option>Hand</option>
                      <option>Lotus</option>
                      <option>Kite</option>
                      <option>Bicycle</option>
                      <option>Elephant</option>
                      <option>Car</option>
                    </select>
                  </div>

                  <button type="submit" style={{ padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                    Allocate Symbol
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Polling Day Monitoring' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Assembly Polling Station Telemetries</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Real-time statistics aggregating all 328 polling stations in AC-123.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { name: "Mock Poll Conducted", val: "328 / 328", color: '#16a34a' },
                  { name: "Poll Commencement", val: "328 / 328", color: '#16a34a' },
                  { name: "Critical Booths Monitor", val: "14 Booths", color: '#ef4444' },
                  { name: "GPS Escorts Active", val: "22 Vehicles", color: '#2563eb' }
                ].map((stat, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{stat.name}</span>
                    <h4 style={{ fontSize: '20px', fontWeight: '900', color: stat.color, margin: '6px 0 0' }}>{stat.val}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Turnout Analytics' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Constituency Voter Turnout Summary</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Consolidated gender-wise and hour-wise elector turnout records.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Assembly Turnout Split</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '8px 0', fontWeight: '700', color: '#475569' }}>Gender</th>
                        <th style={{ padding: '8px 0', fontWeight: '700', color: '#475569' }}>Total Enrolled</th>
                        <th style={{ padding: '8px 0', fontWeight: '700', color: '#475569' }}>Votes Polled</th>
                        <th style={{ padding: '8px 0', fontWeight: '700', color: '#475569' }}>Turnout %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { g: "Male", total: "1,28,452", voted: "68,142", pct: "53.05%" },
                        { g: "Female", total: "1,17,212", voted: "60,422", pct: "51.55%" },
                        { g: "Third Gender", total: "14", voted: "12", pct: "85.71%" }
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

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Aggregate Turnout</h3>
                  <h4 style={{ fontSize: '36px', fontWeight: '900', color: '#2563eb', margin: '10px 0' }}>52.34%</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Last updated: 11:34 AM (Next hour count due)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Incident Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Constituency Incident Control Desk</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Review and manage incident reports escalated by Sector Officers.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: "INC-901", boothId: 104, type: "EVM Control Unit Fault", priority: "Critical", sector: "Sector 3", time: "11:28 AM", status: "In Progress" },
                  { id: "INC-902", boothId: 103, type: "Crowd Gathering outside PS", priority: "High", sector: "Sector 1", time: "11:20 AM", status: "Resolved" }
                ].map(inc => (
                  <div key={inc.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: inc.priority === 'Critical' ? '#ef4444' : '#ea580c', backgroundColor: inc.priority === 'Critical' ? '#fee2e2' : '#ffedd5', padding: '3px 8px', borderRadius: '8px' }}>
                        {inc.id} &bull; {inc.priority}
                      </span>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: '8px 0 2px' }}>{inc.type} at Booth {inc.boothId} ({inc.sector})</h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Escalated: {inc.time}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => alert(`Police force dispatched to ${inc.sector} Booth ${inc.boothId}.`)}
                        style={{ padding: '6px 12px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Dispatch Force
                      </button>
                      <button
                        onClick={() => alert(`Incident ${inc.id} marked resolved.`)}
                        style={{ padding: '6px 12px', backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {inc.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'EVM & Strong Room' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Strong Room Diagnostics</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Security feeds, double-lock logs, and temperature sensors monitoring for the Main Strong Room.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>CCTV Streams Diagnostics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {["Camera 1 (Outer Gate)", "Camera 2 (Corridor)", "Camera 3 (Inner Safe)", "Camera 4 (Ventilation)"].map((cam, idx) => (
                      <div key={idx} style={{ padding: '16px', backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', textAlign: 'center', fontSize: '12px' }}>
                        🎥 {cam} <br />
                        <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 'bold' }}>Online (Broadcasting)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Lock & Seals Log</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div>🔐 <strong>Double Lock State:</strong> Locked & Sealed</div>
                    <div>🏷️ <strong>Outer Door Seal ID:</strong> SL-9012A</div>
                    <div>👮 <strong>Armed Security Guard:</strong> CAPF Platoon A (Present)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Counting Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>EVM Counting Round Dashboard</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Record and tally EVM votes round-by-round across 14 counting tables.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Round {countingRound} Vote Tally</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {candidateVotes.map((cand, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{cand.name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{cand.party}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <strong style={{ fontSize: '15px' }}>{cand.votes.toLocaleString()}</strong>
                          {cand.leading && <span style={{ padding: '2px 6px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' }}>LEADING</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = e.target.cname.value;
                    const vts = parseInt(e.target.cvotes.value);
                    if (!vts) return;
                    setCandidateVotes(prev => {
                      const updated = prev.map(c => c.name === name ? { ...c, votes: c.votes + vts } : c);
                      const max = Math.max(...updated.map(c => c.votes));
                      return updated.map(c => ({ ...c, leading: c.votes === max }));
                    });
                    setCountingRound(prev => prev + 1);
                    e.target.reset();
                    alert("Votes added. Counting Round incremented.");
                  }}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Add Round Votes</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Candidate</label>
                    <select name="cname" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}>
                      {candidateVotes.map(c => <option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Votes Polled in Round</label>
                    <input type="number" name="cvotes" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} placeholder="Enter round vote share..."/>
                  </div>

                  <button type="submit" style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                     Tally Round Votes
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Result Dashboard' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Official Election Leaderboard</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Real-time result status and margins for AC-123.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f0fdf4' }}>
                  <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase' }}>Leading Candidate</span>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#14532d', margin: '6px 0' }}>Rajesh Kumar</h4>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>National Congress Party</span>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Margin of Lead</span>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '6px 0' }}>3,351 Votes</h4>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ahead of Sunita Devi</span>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <button
                    onClick={() => alert("victory certificate generated successfully.")}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#ca8a04',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🏆 Generate Victory Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Agent Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Polling Agents Registry</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Verify, approve, and allocate badges to polling/counting agents assigned by candidates.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: "Vikram Malhotra", party: "Party A", boothId: 104, status: "Approved" },
                  { name: "Poonam Sen", party: "Party B", boothId: 104, status: "Approved" },
                  { name: "Dilip Kumar", party: "Independent", boothId: 103, status: "Approved" }
                ].map((agent, idx) => (
                  <div key={idx} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <div>
                      <strong style={{ fontSize: '13px', display: 'block', color: '#1e293b' }}>{agent.name}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Party: {agent.party} &bull; Assigned to Booth {agent.boothId}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '8px' }}>
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Postal Ballot Tracking' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Postal Ballot Database</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Track postal ballot applications, dispatches, receipts, and verification stats.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {[
                  { label: "Applied", count: "1,256", color: '#3b82f6' },
                  { label: "Dispatched", count: "1,100", color: '#2563eb' },
                  { label: "Received", count: "1,085", color: '#ea580c' },
                  { label: "Accepted", count: "1,032", color: '#16a34a' },
                  { label: "Rejected", count: "53", color: '#dc2626' }
                ].map((ballot, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{ballot.label}</span>
                    <h4 style={{ fontSize: '20px', fontWeight: '900', color: ballot.color, margin: '6px 0 0' }}>{ballot.count}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'RO Orders & Approvals' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Pending Approvals Desk</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Vet and sign approval requests sent by Sector Officers (e.g. EVM replacements, extra security).</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sectorRequests.map(req => (
                  <div key={req.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '8px' }}>
                        REQUEST ID: {req.id}
                      </span>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: '8px 0 2px' }}>{req.type} &bull; Booth {req.boothId} ({req.sector})</h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Time: {req.time}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => {
                              setSectorRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
                              alert("Request approved.");
                            }}
                            style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSectorRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Denied' } : r));
                              alert("Request denied.");
                            }}
                            style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            Deny
                          </button>
                        </>
                      ) : (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: req.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                          color: req.status === 'Approved' ? '#16a34a' : '#ef4444'
                        }}>{req.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Reports & Forms' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Reports & Forms Library</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Access official electoral documentation forms (Form 17C, Form 21E, and PO Diaries).</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { name: "Form 17C (Votes Account)", status: "Pending Closing", desc: "Detailed votes account from all booths." },
                  { name: "Form 21E (Return of Election)", status: "Draft Ready", desc: "Official declaration certificate copy." },
                  { name: "PO Diary Consolidated Report", status: "Tallying", desc: "Aggregated dairies of all 328 polling stations." }
                ].map((rep, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#1e293b' }}>{rep.name}</strong>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>{rep.desc}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb' }}>{rep.status} &rarr;</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Communication Hub' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Assembly Radio Broadcast Center</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Broadcast notices to all 328 Presiding Officers or Sector Officers immediately.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const txt = e.target.broad.value;
                  if (!txt.trim()) return;
                  alert(`Broadcast notice sent to all Sector & Presiding Officers: "${txt}"`);
                  e.target.reset();
                }}
                style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Create Assembly Notice</h3>
                <textarea name="broad" style={{ height: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }} placeholder="Type message to broadcast..."></textarea>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}>Send Broadcast Notice</button>
              </form>
            </div>
          </div>
        )}

        {activeMenu === 'AI Assistant' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>RO ECI Handbook Assistant</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Offline AI advisor trained on Election Commission guidelines for Returning Officers.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '350px', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', backgroundColor: '#f8fafc' }}>
                <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'user' ? '#2563eb' : '#fff', color: msg.sender === 'user' ? '#fff' : '#0f172a', padding: '10px 14px', borderRadius: '12px', maxWidth: '70%', fontSize: '12px', border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0' }}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChatSend} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Ask SOP or guideline question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ flexGrow: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '12px' }}
                  />
                  <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Ask</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Settings' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>RO Command Center Settings</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Configure notification alerts, dashboard refreshing, and counting status.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span>Direct SMS Alerts to DEO</span>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span>Sound Alarm on Critical Incidents</span>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span>Telemetry Sync Rate</span>
                  <select style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }} defaultValue="10s">
                    <option>5s</option>
                    <option>10s</option>
                    <option>30s</option>
                  </select>
                </label>
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

        
        {activeMenu === 'Conference Call' && (
          <div style={{ padding: '24px' }}>
            <div className="card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
              <VideoCall />
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
