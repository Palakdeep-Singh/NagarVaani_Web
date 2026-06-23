import React from 'react';
import { useEffect, useState } from 'react';
import { VideoCall } from '../components/VideoCall';
import {
  LayoutDashboard, FileText, Users, Award, ShieldAlert, Cpu, 
  HelpCircle, Settings, PhoneCall, Video, Send, AlertTriangle, 
  Building, CheckCircle, Percent, Trophy, RefreshCw, BarChart2,
  Clock, MapPin, Volume2, UserCheck, Check, LogOut, ArrowRight,
  Truck, AlertCircle, BookOpen, ChevronRight, Plus
} from 'lucide-react';
import api from '../utils/api';
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
    { sender: 'bot', text: 'Hello! I am your NagarVaani CEO State Command Assistant. I monitor state-wide turnout trends, force deployment, expenditure risk, and MCC violations.' }
  ]);

  // Real-time API state
  const [kpi, setKpi] = useState({ totalBooths: 0, activeBooths: 0, sectorTurnout: 0, openAlerts: 0, evmFaults: 0 });
  const [alerts, setAlerts] = useState([]);
  const [liveBooths, setLiveBooths] = useState([]);

  // CEO State Management
  const [ceoDistricts, setCeoDistricts] = useState([
    { id: 1, name: "Varanasi", turnout: "52.34%", readiness: "96.21%", incidents: 7, status: "Healthy" },
    { id: 2, name: "Lucknow", turnout: "50.15%", readiness: "93.45%", incidents: 2, status: "Healthy" },
    { id: 3, name: "Gautam Buddha Nagar", turnout: "55.80%", readiness: "98.76%", incidents: 0, status: "Healthy" },
    { id: 4, name: "Kanpur Nagar", turnout: "48.90%", readiness: "91.30%", incidents: 5, status: "Warning" },
    { id: 5, name: "Siddharthnagar", turnout: "42.08%", readiness: "18.76%", incidents: 9, status: "Critical" }
  ]);
  const [electoralRollStats, setElectoralRollStats] = useState({
    additions: "12,34,567",
    deletions: "2,45,678",
    corrections: "8,76,543",
    epicCoverage: "98.35%"
  });
  const [sveepEvents, setSveepEvents] = useState([
    { id: "SV-01", name: "Youth Voter Fest Lucknow", reach: "2.5 Lakhs", budget: "₹ 15 Lakhs", status: "Completed" },
    { id: "SV-02", name: "Gram Panchayat Awareness Varanasi", reach: "4.8 Lakhs", budget: "₹ 25 Lakhs", status: "Active" },
    { id: "SV-03", name: "Nukkad Natak Campaign Kanpur", reach: "1.2 Lakhs", budget: "₹ 8 Lakhs", status: "Scheduled" }
  ]);
  const [trainingRoster, setTrainingRoster] = useState([
    { district: "Varanasi", PO: "100%", pollingStaff: "98.5%", security: "100%" },
    { district: "Lucknow", PO: "99.2%", pollingStaff: "97.8%", security: "100%" },
    { district: "Kanpur Nagar", PO: "98.5%", pollingStaff: "95.6%", security: "99.1%" },
    { district: "Siddharthnagar", PO: "88.4%", pollingStaff: "81.2%", security: "92.0%" }
  ]);
  const [expenditures, setExpenditures] = useState([
    { id: "EXP-01", candidate: "Amit Kumar", constituency: "Lucknow East", spent: "₹ 92.15 Lakhs", limit: "₹ 95.00 Lakhs", status: "High Risk" },
    { id: "EXP-02", candidate: "Rajendra Singh", constituency: "Meerut", spent: "₹ 88.70 Lakhs", limit: "₹ 95.00 Lakhs", status: "High Risk" },
    { id: "EXP-03", candidate: "Vikram Pratap", constituency: "Kanpur South", spent: "₹ 81.30 Lakhs", limit: "₹ 95.00 Lakhs", status: "Moderate Risk" }
  ]);
  const [mccComplaints, setMccComplaints] = useState([
    { id: "CEO-MCC-01", candidate: "Ramesh Sharma", district: "Varanasi", type: "Hate Speech", detail: "Provocative rally comments.", status: "Pending CEO Review", time: "10:30 AM" },
    { id: "CEO-MCC-02", candidate: "Sunita Verma", district: "Siddharthnagar", type: "Cash Distribution", detail: "Tokens distribution near polling station.", status: "DEO Dispatched", time: "11:00 AM" },
    { id: "CEO-MCC-03", candidate: "Alok Kumar", district: "Lucknow", type: "Illegal Posters", detail: "Posters on government buildings.", status: "Resolved", time: "09:15 AM" }
  ]);
  const [ceoSettings, setCeoSettings] = useState({
    allowMobileInBooth: false,
    webcastActiveState: true,
    mccAdvisoryLevel: "Strict"
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

  const fetchData = async () => {
    try {
      const res = await api.get('/booth/status');
      if (res.status === 200) {
        setKpi(res.data.kpi);
        setAlerts(res.data.alerts);
        setLiveBooths(res.data.booths);
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error(err);
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
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>{kpi.activeBooths} / {kpi.totalBooths}</h3>
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
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>{kpi.sectorTurnout}%</h3>
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
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', margin: '4px 0 0' }}>{kpi.openAlerts}</h3>
                    <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: '700' }}>&bull; Requires Attention</span>
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

        {/* CEO WORKSPACE DETAILED VIEWS */}
        {activeMenu === 'State Overview' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State Districts Roster & Operational Readiness</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>District Name</th>
                    <th style={{ padding: '10px' }}>Voter Turnout</th>
                    <th style={{ padding: '10px' }}>Readiness Level</th>
                    <th style={{ padding: '10px' }}>Active Incidents</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ceoDistricts.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{d.name}</td>
                      <td style={{ padding: '10px', color: '#2563eb', fontWeight: 'bold' }}>{d.turnout}</td>
                      <td style={{ padding: '10px' }}>{d.readiness}</td>
                      <td style={{ padding: '10px', color: d.incidents > 3 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{d.incidents}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: d.status === 'Healthy' ? '#dcfce7' : d.status === 'Warning' ? '#fef9c3' : '#fee2e2',
                          color: d.status === 'Healthy' ? '#15803d' : d.status === 'Warning' ? '#854d0e' : '#b91c1c'
                        }}>{d.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleTriggerCall(`${d.name} DEO Desk`, "+91 94500-XXXXX", false)}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginRight: '4px' }}
                        >Call DEO</button>
                        <button
                          onClick={() => alert(`Opening district drilldown for ${d.name}...`)}
                          style={{ padding: '4px 8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Inspect</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'District Performance' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Compliance & Performance Scoreboard</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>Rank</th>
                    <th style={{ padding: '10px' }}>District</th>
                    <th style={{ padding: '10px' }}>Readiness Score</th>
                    <th style={{ padding: '10px' }}>Incident Close Time (Avg)</th>
                    <th style={{ padding: '10px' }}>Turnout Update Sync rate</th>
                    <th style={{ padding: '10px' }}>Overall Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, name: "Gautam Buddha Nagar", score: "98.76%", close: "5.4 mins", sync: "99.12%", grade: "A+" },
                    { rank: 2, name: "Varanasi", score: "96.21%", close: "8.2 mins", sync: "98.45%", grade: "A" },
                    { rank: 3, name: "Lucknow", score: "93.45%", close: "9.5 mins", sync: "97.60%", grade: "A" },
                    { rank: 4, name: "Kanpur Nagar", score: "91.30%", close: "12.0 mins", sync: "95.10%", grade: "B" },
                    { rank: 5, name: "Siddharthnagar", score: "18.76%", close: "45.0 mins", sync: "78.20%", grade: "F" }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#64748b' }}>{row.rank}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.name}</td>
                      <td style={{ padding: '10px' }}>{row.score}</td>
                      <td style={{ padding: '10px' }}>{row.close}</td>
                      <td style={{ padding: '10px' }}>{row.sync}</td>
                      <td style={{ padding: '10px', color: row.grade === 'F' ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{row.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Electoral Roll Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State Electoral Roll Registry</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Additions (Form 6)</span>
                  <strong style={{ fontSize: '20px', display: 'block', margin: '4px 0' }}>{electoralRollStats.additions}</strong>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>Approved & Sync'd</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Deletions (Form 7)</span>
                  <strong style={{ fontSize: '20px', display: 'block', margin: '4px 0' }}>{electoralRollStats.deletions}</strong>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>Removals committed</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Corrections (Form 8)</span>
                  <strong style={{ fontSize: '20px', display: 'block', margin: '4px 0' }}>{electoralRollStats.corrections}</strong>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>Updates published</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>EPIC Coverage</span>
                  <strong style={{ fontSize: '20px', display: 'block', margin: '4px 0' }}>{electoralRollStats.epicCoverage}</strong>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>National Lead</span>
                </div>
              </div>
              <button
                onClick={() => alert("Re-publishing official Electoral Roll metadata to National ECI Servers...")}
                style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '220px' }}
              >
                Publish State Electoral Roll
              </button>
            </div>
          </div>
        )}

        {activeMenu === 'SVEEP & Voter Awareness' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State SVEEP (Voter Awareness Campaign) Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Active Campaigns</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '8px' }}>Campaign Name</th>
                        <th style={{ padding: '8px' }}>Est. Reach</th>
                        <th style={{ padding: '8px' }}>Budget</th>
                        <th style={{ padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sveepEvents.map((ev) => (
                        <tr key={ev.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontWeight: '600' }}>{ev.name}</td>
                          <td style={{ padding: '8px' }}>{ev.reach}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>{ev.budget}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                              backgroundColor: ev.status === 'Completed' ? '#dcfce7' : ev.status === 'Active' ? '#eff6ff' : '#cbd5e1',
                              color: ev.status === 'Completed' ? '#15803d' : ev.status === 'Active' ? '#1e40af' : '#475569'
                            }}>{ev.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Add SVEEP Campaign</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target;
                    const name = form.elements.name.value;
                    const reach = form.elements.reach.value;
                    const budget = form.elements.budget.value;
                    if (!name || !reach) return;
                    const newEv = {
                      id: `SV-0${sveepEvents.length + 1}`,
                      name, reach, budget, status: "Active"
                    };
                    setSveepEvents(prev => [...prev, newEv]);
                    form.reset();
                    alert("New SVEEP Campaign registered successfully.");
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Campaign Name</label>
                      <input name="name" type="text" placeholder="e.g. Metro Station Voter Booths" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Estimated Reach</label>
                      <input name="reach" type="text" placeholder="e.g. 5 Lakh Citizens" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Budget Allocated</label>
                      <input name="budget" type="text" placeholder="e.g. ₹ 10 Lakhs" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Submit Campaign
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Training Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District-wise Polling Personnel Training Progress</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>District</th>
                    <th style={{ padding: '10px' }}>Presiding Officers (PO)</th>
                    <th style={{ padding: '10px' }}>Polling Officers (PO1/PO2/PO3)</th>
                    <th style={{ padding: '10px' }}>Security Personnel</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingRoster.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.district}</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>{row.PO}</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>{row.pollingStaff}</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>{row.security}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => alert(`Certifying all trained polling staff in ${row.district}... Roster verified.`)}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Certify District</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'EVM & Logistics' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State EVM Logistics & Inter-District Allocations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: "State Deployed EVMs", count: "11.23 Lakh", color: "#22c55e" },
                  { label: "Reserve Pool", count: "1.20 Lakh", color: "#3b82f6" },
                  { label: "Under Randomisation", count: "80,000", color: "#eab308" },
                  { label: "Repair Centers", count: "4,500", color: "#ef4444" },
                  { label: "State Lockers", count: "15,000", color: "#8b5cf6" }
                ].map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>{item.label}</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: item.color, margin: '6px 0 0' }}>{item.count}</h3>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <strong>State-wide EVM Randomisation Compliance Check:</strong>
                <div style={{ marginTop: '8px' }}>&bull; All 75 Districts have completed 1st Stage Randomization.</div>
                <div style={{ marginTop: '4px' }}>&bull; 2nd Stage Randomization checks verified for Varanasi, Lucknow, Kanpur, and Meerut divisions.</div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Candidate Expenditure' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Candidate Campaign Expenditure Auditing (State-wide)</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Candidate Name</th>
                    <th style={{ padding: '10px' }}>Constituency Division</th>
                    <th style={{ padding: '10px' }}>Total Spent</th>
                    <th style={{ padding: '10px' }}>Constituency Limit</th>
                    <th style={{ padding: '10px' }}>Risk Assessment</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.id}</td>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{row.candidate}</td>
                      <td style={{ padding: '10px' }}>{row.constituency}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.spent}</td>
                      <td style={{ padding: '10px' }}>{row.limit}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: row.status === 'High Risk' ? '#fee2e2' : '#fff7ed',
                          color: row.status === 'High Risk' ? '#b91c1c' : '#c2410c'
                        }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => alert(`Exp audit observer dispatched to inspect affidavits and accounts for ${row.candidate}`)}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Audit Accounts</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Force Deployment' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State Police & CAPF Mobilisation Console</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: "CAPF Companies", count: "1,250 Coys", pct: "Deployed" },
                  { label: "State Police Forces", count: "3.2 Lakhs", pct: "Deployed" },
                  { label: "Home Guards", count: "1.1 Lakhs", pct: "Deployed" },
                  { label: "Quick Response Teams (QRT)", count: "450 Teams", pct: "Standby" }
                ].map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>{item.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', margin: '4px 0 2px' }}>{item.count}</div>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>{item.pct}</span>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <strong>State Security Liaison Alert:</strong> Force mobilizations are monitored real-time. Direct links to Varanasi North (AC-1) and Siddharthnagar (AC-5) divisions have been reinforced.
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'MCC & Complaint Monitor' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State Model Code of Conduct & c-VIGIL Monitoring Desk</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Candidate Name</th>
                    <th style={{ padding: '10px' }}>District</th>
                    <th style={{ padding: '10px' }}>Violation Category</th>
                    <th style={{ padding: '10px' }}>Details</th>
                    <th style={{ padding: '10px' }}>Verification Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mccComplaints.map((comp) => (
                    <tr key={comp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{comp.id}</td>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{comp.candidate}</td>
                      <td style={{ padding: '10px' }}>{comp.district}</td>
                      <td style={{ padding: '10px', color: '#b91c1c', fontWeight: 'bold' }}>{comp.type}</td>
                      <td style={{ padding: '10px' }}>{comp.detail}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: comp.status === 'Resolved' ? '#dcfce7' : '#fee2e2',
                          color: comp.status === 'Resolved' ? '#15803d' : '#b91c1c'
                        }}>{comp.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setMccComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: "Official Warning Issued" } : c));
                            alert(`Warned candidate ${comp.candidate} on ${comp.type} allegations.`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginRight: '4px' }}
                        >Warn Candidate</button>
                        <button
                          onClick={() => {
                            setMccComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: "Referred to ECI" } : c));
                            alert(`Referred complaint ${comp.id} to Chief Election Commissioner desk.`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Refer to ECI</button>
                      </td>
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
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State Consolidated Statutory Reports Desk</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { title: "State Turnout Summary", desc: "Phase-wise consolidated reports by district", form: "CEO-Form 20S" },
                  { title: "MCC Violations Log Summary", desc: "c-Vigil consolidated statistics & resolutions", form: "CEO-Form MCC" },
                  { title: "Training Completion Registry", desc: "Staff training certifications compiled", form: "CEO-Form ST" },
                  { title: "EVM Logistics and Stock Roster", desc: "Double Randomization audits by DEOs", form: "CEO-Form EVM" }
                ].map((rep, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifycontent: 'space-between', height: '120px' }}>
                    <div>
                      <span style={{ fontSize: '9px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>{rep.form}</span>
                      <strong style={{ display: 'block', fontSize: '13px', marginTop: '6px', color: '#0f172a' }}>{rep.title}</strong>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0' }}>{rep.desc}</p>
                    </div>
                    <button
                      onClick={() => alert(`Exporting ${rep.title} file...`)}
                      style={{ border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', padding: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', color: '#2563eb', marginTop: '8px' }}
                    >
                      Export PDF / Excel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Election Readiness' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State district Readiness Verification Checklist</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ceoDistricts.map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>
                      {d.name} District Readiness Checklist Sign-Off
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Readiness Level: {d.readiness}</span>
                      <button
                        onClick={() => {
                          setCeoDistricts(prev => prev.map(item => item.id === d.id ? { ...item, readiness: "100.00%", status: "Healthy" } : item));
                          alert(`Certified and signed off election day readiness for ${d.name} district.`);
                        }}
                        style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                      >Sign Off Readiness</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Communication Hub' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State Broadcast Console</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Publish Broadcast to all 75 Districts</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!broadcastText.trim()) return;
                    alert(`State Circular broadcasted to all 75 Districts: "${broadcastText}"`);
                    setBroadcastText("");
                  }}>
                    <textarea
                      placeholder="Type priority operational guidelines to broadcast to all district DEO headquarters..."
                      value={broadcastText}
                      onChange={(e) => setBroadcastText(e.target.value)}
                      style={{ width: '100%', height: '100px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', marginBottom: '12px' }}
                      required
                    />
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Publish Priority Directives ⚡
                    </button>
                  </form>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Hotline Quick Dials</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <span>ECI National Command Desk</span>
                      <button onClick={() => handleTriggerCall("ECI National Command Desk", "+91 11-2301-ECI", false)} style={{ padding: '3px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Call</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <span>State Police Liaison Chief</span>
                      <button onClick={() => handleTriggerCall("State Police Coordinator", "+91 94544-XXXXX", false)} style={{ padding: '3px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Call</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Turnout Analytics' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>State Turnout split by Districts</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ceoDistricts.map((d) => (
                  <div key={d.id} style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>{d.name} District</span>
                      <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{d.turnout} Turnout</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: d.turnout,
                        backgroundColor: '#2563eb',
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'System Settings' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>State Operations Configuration</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Live Webcasting Monitoring</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Allow direct stream access from booth panels</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={ceoSettings.webcastActiveState}
                      onChange={(e) => setCeoSettings(prev => ({ ...prev, webcastActiveState: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Allow Electronic Devices in Booth</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Permit electors carrying mobile devices into polling chamber</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={ceoSettings.allowMobileInBooth}
                      onChange={(e) => setCeoSettings(prev => ({ ...prev, allowMobileInBooth: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>MCC Enforcement Advisory Level</label>
                    <select
                      value={ceoSettings.mccAdvisoryLevel}
                      onChange={(e) => setCeoSettings(prev => ({ ...prev, mccAdvisoryLevel: e.target.value }))}
                      style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Strict">Strict (Immediate notices and confiscations)</option>
                      <option value="Standard">Standard (ECI guidelines default)</option>
                      <option value="Lenient">Lenient (Warnings before notices)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => alert("State operation settings committed successfully.")}
                    style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
                  >
                    Commit Configuration
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
          &copy; 2026 NagarVaani Election System. All rights reserved. &bull; State Chief Electoral Officer Command Dashboard &bull; Version 2.0
        </footer>
      </main>
    </div>
  );
}
