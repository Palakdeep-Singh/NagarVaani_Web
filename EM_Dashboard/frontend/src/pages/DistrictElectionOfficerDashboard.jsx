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

export default function DistrictElectionOfficerDashboard({ user, onLogout }) {
  const userName = user?.name || 'DEO Admin';
  const userRole = user?.role || 'District Election Officer';

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
    { sender: 'bot', text: 'Hello! I am your NagarVaani DEO Command Assistant. I monitor district-wide logistics, staff reporting, and Strong Room status.' },
    { sender: 'user', text: 'Which constituency shows the lowest turnout?' },
    { sender: 'bot', text: 'AC-Rohania shows the lowest turnout currently at 45.2%. Alert has been sent to the respective Returning Officer.' }
  ]);

  // DEO State Management
  const [districtBooths, setDistrictBooths] = useState([
    { id: 1, acName: "Varanasi North", totalBooths: 328, turnout: "52.34%", activeIncidents: 1, status: "Healthy" },
    { id: 2, acName: "Varanasi South", totalBooths: 295, turnout: "55.12%", activeIncidents: 0, status: "Healthy" },
    { id: 3, acName: "Varanasi Cantt", totalBooths: 345, turnout: "50.08%", activeIncidents: 2, status: "Warning" },
    { id: 4, acName: "Rohania", totalBooths: 312, turnout: "45.20%", activeIncidents: 3, status: "Warning" },
    { id: 5, acName: "Sevapuri", totalBooths: 288, turnout: "48.15%", activeIncidents: 1, status: "Healthy" }
  ]);
  const [evmInventory, setEvmInventory] = useState([
    { id: "EVM-D01", type: "BU (Ballot Unit)", status: "Warehouse", location: "District HQ Warehouse", checked: "Yes" },
    { id: "EVM-D02", type: "CU (Control Unit)", status: "Deployed", location: "AC-1 Varanasi North", checked: "Yes" },
    { id: "EVM-D03", type: "VVPAT", status: "In Transit", location: "En-route to AC-4 Rohania", checked: "Yes" },
    { id: "EVM-D04", type: "BU (Ballot Unit)", status: "Faulty", location: "District Repair Lab", checked: "No" }
  ]);
  const [staffTraining, setStaffTraining] = useState([
    { id: "ST-01", name: "Dr. Alok Nath", role: "Presiding Officer", trained: "Yes", certified: "Yes", checkIn: "Checked In" },
    { id: "ST-02", name: "Smt. Priya Rao", role: "Polling Officer 1", trained: "Yes", certified: "Yes", checkIn: "Checked In" },
    { id: "ST-03", name: "Sri. K. Verma", role: "Polling Officer 2", trained: "Yes", certified: "No", checkIn: "Yet to Report" },
    { id: "ST-04", name: " Sri. M. Khan", role: "Sector Officer", trained: "Yes", certified: "Yes", checkIn: "Checked In" }
  ]);
  const [vehicles, setVehicles] = useState([
    { id: "VEH-01", route: "HQ to Varanasi North", type: "Heavy Truck (EVMs)", status: "Active", gps: "Connected", driver: "Rajesh K." },
    { id: "VEH-02", route: "HQ to Rohania", type: "Medium Van (Security)", status: "Active", gps: "Connected", driver: "Vijay S." },
    { id: "VEH-03", route: "HQ to Sevapuri", type: "Jeep (Sector Officer)", status: "Delayed", gps: "Weak Signal", driver: "Anil P." },
    { id: "VEH-04", route: "HQ to Varanasi Cantt", type: "Heavy Truck (EVMs)", status: "Arrived", gps: "Disconnected", driver: "Satish M." }
  ]);
  const [strongRoomLog, setStrongRoomLog] = useState([
    { time: "11:15 AM", person: " Sri. Amit Singh (Observer)", action: "Seals Verification Check", remarks: "All seals fully intact" },
    { time: "09:30 AM", person: "Dr. R. K. Mishra (DEO)", action: "Routine CCTV & Guard Inspection", remarks: "CCTV grid OK. 12/12 Guards active." },
    { time: "06:00 AM", person: "Security Commander", action: "Guard Shift Handover", remarks: "Double locks confirmed" }
  ]);
  const [postalBallots, setPostalBallots] = useState([
    { id: "PB-101", voterName: "Subhas Bose", type: "Service Voter", status: "Accepted", date: "2026-06-18" },
    { id: "PB-102", voterName: "Karan Johar", type: "Absentee (Senior Citizen)", status: "Pending Verification", date: "2026-06-19" },
    { id: "PB-103", voterName: "Meena Kumari", type: "Essential Services", status: "Rejected", date: "2026-06-19" }
  ]);
  const [complaints, setComplaints] = useState([
    { id: "COMP-01", ac: "Rohania", boothId: 104, type: "EVM Issue", detail: "Electors alleging delay in VVPAT printout.", status: "Pending", time: "11:20 AM" },
    { id: "COMP-02", ac: "Varanasi Cantt", boothId: 215, type: "Crowd Gathering", detail: "Campaign workers violating 100m rule.", status: "Investigating", time: "11:10 AM" },
    { id: "COMP-03", ac: "Varanasi North", boothId: 12, type: "Power Cut", detail: "Power backup failed. Presiding Officer requests generator.", status: "Resolved", time: "09:45 AM" }
  ]);
  const [districtSettings, setDistrictSettings] = useState({
    webcastEnabled: true,
    autoAlertInterval: 10,
    forceGPSRequired: true,
    requireObserverSignoff: true
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
    alert(`Broadcast sent to all 10 Returning Officers and 2,347 booths: "${broadcastText}"`);
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
      if (query.includes("incident") || query.includes("fault")) {
        replyText = "District Alert: 7 active incidents reported. The critical CU fault at Booth 104 (Varanasi North) has been resolved by dispatching Sector reserve EVM.";
      } else if (query.includes("strong") || query.includes("room")) {
        replyText = "Strong Room Status: CCTV feed is fully online, guards are active (12/12), and seals are verified intact.";
      } else if (query.includes("vehicle") || query.includes("transit")) {
        replyText = "Vehicle Tracking: 412 vehicles are currently on route, and 366 have successfully arrived at booths.";
      } else {
        replyText = `Regarding "${question}": Check the DEO Command Center Handbook. You can deploy reserve staff or broadcast warnings using the dashboard panels.`;
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
            { id: 'Booth Management', name: 'Booth Management', icon: <Building size={16} /> },
            { id: 'EVM Management', name: 'EVM Management', icon: <Cpu size={16} /> },
            { id: 'Staff Management', name: 'Staff Management', icon: <Users size={16} /> },
            { id: 'Vehicle Management', name: 'Vehicle Management', icon: <Truck size={16} /> },
            { id: 'Sensitive Booths', name: 'Sensitive Booths', icon: <ShieldAlert size={16} /> },
            { id: 'Strong Room Monitoring', name: 'Strong Room Monitoring', icon: <Building size={16} /> },
            { id: 'Election Material', name: 'Election Material', icon: <FileText size={16} /> },
            { id: 'Postal Ballot Tracking', name: 'Postal Ballot Tracking', icon: <FileText size={16} /> },
            { id: 'Incident Management', name: 'Incident Management', icon: <AlertTriangle size={16} />, badge: 7 },
            { id: 'Communication Hub', name: 'Communication Hub', icon: <Volume2 size={16} /> },
            { id: 'Turnout Analytics', name: 'Turnout Analytics', icon: <Percent size={16} /> },
            { id: 'Reports & Analytics', name: 'Reports & Analytics', icon: <BarChart2 size={16} /> },
            { id: 'Checklist & Compliance', name: 'Checklist & Compliance', icon: <CheckCircle size={16} /> },
            { id: 'RO Management', name: 'RO Management', icon: <UserCheck size={16} /> },
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

        {/* BOTTOM FIXED SECTION (District Summary & Emergency) */}
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
            <div style={{ fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '2px' }}>District Summary</div>
            <div>Total Constituencies: <span style={{ color: '#fff', fontWeight: '600' }}>10</span></div>
            <div>Total Booths: <span style={{ color: '#fff', fontWeight: '600' }}>2,347</span></div>
            <div>Total Voters: <span style={{ color: '#fff', fontWeight: '600' }}>18,76,542</span></div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0', padding: '4px 0' }}>
              <div>Male: <span style={{ color: '#fff' }}>9,67,203</span></div>
              <div>Female: <span style={{ color: '#fff' }}>9,09,192</span></div>
              <div>Third Gender: <span style={{ color: '#fff' }}>2,147</span></div>
            </div>
            
            <button
              onClick={() => alert("Loading District Profile details...")}
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
              <span>View District Profile</span>
              <ArrowRight size={10} />
            </button>
          </div>

          <button
            onClick={() => {
              const confirmAlert = window.confirm("🚨 WARNING: Initiate district-wide emergency warning system?");
              if (confirmAlert) {
                alert("Emergency alerts broadcasted to all 10 Returning Officers and DEO Control room.");
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
            <span>DISTRICT EMERGENCY ALARM</span>
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
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>DEO Command Center</h1>
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
              District: Varanasi, Uttar Pradesh &bull; 10 ACs &bull; 2,347 Booths &bull; 18,76,542 Voters
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
              onClick={() => alert("Notification panel: 7 active incident alerts are unresolved.")}
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
              }}>7</span>
            </div>

            {/* Profile Widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                DEO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{userName}</span>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Varanasi District</span>
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
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Booths Ready</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>2,347 / 2,347</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>&bull; All Booths Ready</span>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb' }}>
                    <Building size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #16a34a', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>District Turnout %</span>
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
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', margin: '4px 0 0' }}>7</h3>
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
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>2,347 / 2,347</h3>
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
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Staff Deployed</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>12,568</h3>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>97.48% Assigned</span>
                  </div>
                  <div style={{ backgroundColor: '#fff7ed', padding: '6px', borderRadius: '8px', color: '#ea580c' }}>
                    <Users size={16} />
                  </div>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ca8a04', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Vehicles on Move</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ca8a04', margin: '4px 0 0' }}>412 / 523</h3>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>78.78% Logistics</span>
                  </div>
                  <div style={{ backgroundColor: '#fef9c3', padding: '6px', borderRadius: '8px', color: '#ca8a04' }}>
                    <Truck size={16} />
                  </div>
                </div>
              </div>

            </section>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr 1.5fr', gap: '24px' }}>
              
              {/* Section 1: Booth Readiness Overview */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Booth Readiness Overview</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
                  <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                    <svg width="90" height="90" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Ready: 94.24% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="94.24 100" strokeDashoffset="0" />
                      {/* Partially: 4.18% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#eab308" strokeWidth="3.5" 
                              strokeDasharray="4.18 100" strokeDashoffset="-94.24" />
                      {/* Not Ready: 1.58% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="3.5" 
                              strokeDasharray="1.58 100" strokeDashoffset="-98.42" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                      <strong style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>2,347</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Ready
                      </span>
                      <strong style={{ color: '#0f172a' }}>2,212 (94.24%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#eab308' }} /> Partially Ready
                      </span>
                      <strong style={{ color: '#0f172a' }}>98 (4.18%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Not Ready
                      </span>
                      <strong style={{ color: '#0f172a' }}>37 (1.58%)</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert("Loading detailed booth readiness database...")}
                  style={{
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  View Booth Status &rarr;
                </button>
              </div>

              {/* Section 2: Live Turnout Analytics */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Live Voter Turnout (Today)</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All &rarr;</span>
                </div>

                <div style={{ height: '120px', position: 'relative', margin: '12px 0' }}>
                  <svg width="100%" height="100%" viewBox="0 0 300 100" style={{ overflow: 'visible' }}>
                    <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" />

                    <defs>
                      <linearGradient id="deoTurnoutGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M 10 90 L 10 82 Q 70 70 130 50 T 250 25 L 250 90 Z"
                      fill="url(#deoTurnoutGrad)"
                    />
                    <path
                      d="M 10 82 Q 70 70 130 50 T 250 25"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 250 25 L 290 15"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />

                    <circle cx="10" cy="82" r="3" fill="#2563eb" />
                    <circle cx="90" cy="65" r="3" fill="#2563eb" />
                    <circle cx="170" cy="45" r="3" fill="#2563eb" />
                    <circle cx="250" cy="25" r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                    
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
                    { id: "ALT-1", text: "EVM Fault – Booth 104", detail: "AC: Varanasi North", priority: "Critical", time: "11:28 AM", color: "#dc2626", bg: "#fee2e2" },
                    { id: "ALT-2", text: "Crowd Gathering – Booth 145", detail: "AC: Rohania", priority: "High", time: "11:20 AM", color: "#ea580c", bg: "#ffedd5" },
                    { id: "ALT-3", text: "VVPAT Not Responding – Booth 212", detail: "AC: Varanasi Cantt", priority: "Medium", time: "11:15 AM", color: "#ca8a04", bg: "#fef9c3" },
                    { id: "ALT-4", text: "Polling Officer Unwell – Booth 301", detail: "AC: Sevapuri", priority: "Medium", time: "11:10 AM", color: "#ca8a04", bg: "#fef9c3" },
                    { id: "ALT-5", text: "Minor Dispute – Booth 64", detail: "AC: Pindra", priority: "Low", time: "11:05 AM", color: "#3b82f6", bg: "#eff6ff" }
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
              
              {/* Section 4: EVM Deployment Status */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>EVM Deployment Status</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Deployed: 100% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="100 100" strokeDashoffset="0" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                      <strong style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>2,347</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Deployed
                      </span>
                      <strong style={{ color: '#0f172a' }}>2,347 (100%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> In Transit
                      </span>
                      <strong style={{ color: '#0f172a' }}>0 (0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} /> Reserve
                      </span>
                      <strong style={{ color: '#0f172a' }}>120 (5.11%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Faulty
                      </span>
                      <strong style={{ color: '#0f172a' }}>18 (0.77%)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Vehicle Tracking */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Vehicle Tracking</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { label: "On the Way", val: "412", color: "#3b82f6" },
                    { label: "Arrived at AC/Booth", val: "366", color: "#22c55e" },
                    { label: "Delayed", val: "18", color: "#eab308" },
                    { label: "Breakdown", val: "5", color: "#ef4444" },
                    { label: "Returned", val: "107", color: "#8b5cf6" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }} />
                        {item.label}
                      </span>
                      <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Staff Deployment */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Staff Deployment</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { label: "Deployed", val: "12,568 (97.48%)", color: "#22c55e" },
                    { label: "Yet to Report", val: "325 (2.52%)", color: "#eab308" },
                    { label: "Absent", val: "74", color: "#ef4444" },
                    { label: "Reserve Available", val: "462", color: "#8b5cf6" },
                    { label: "Total Required", val: "12,893", color: "#475569" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }} />
                        {item.label}
                      </span>
                      <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 7: Sensitive Booths Summary */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Sensitive Booths Summary</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Map</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Normal: 90.37% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                              strokeDasharray="90.37 100" strokeDashoffset="0" />
                      {/* Sensitive: 6.65% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ea580c" strokeWidth="3.5" 
                              strokeDasharray="6.65 100" strokeDashoffset="-90.37" />
                      {/* Hyper Sensitive: 2.98% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#dc2626" strokeWidth="3.5" 
                              strokeDasharray="2.98 100" strokeDashoffset="-97.02" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                      <strong style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>226</strong>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Normal
                      </span>
                      <strong style={{ color: '#0f172a' }}>2,121 (90.37%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} /> Sensitive
                      </span>
                      <strong style={{ color: '#0f172a' }}>156 (6.65%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }} /> Hyper Sensitive
                      </span>
                      <strong style={{ color: '#0f172a' }}>70 (2.98%)</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* MAIN DASHBOARD SECTIONS GRID: ROW 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '24px' }}>
              
              {/* Section 8: Strong Room Monitoring */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Strong Room Status</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '10px 0' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                    <Building size={20} />
                  </div>
                  <div style={{ textAlign: 'left', fontSize: '11px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Main Strong Room</strong>
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>&bull; Secure</span>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>EVMs Stored</span><strong style={{ color: '#0f172a' }}>2,347</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CCTV Status</span><strong style={{ color: '#16a34a' }}>Online</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Guards On Duty</span><strong style={{ color: '#0f172a' }}>12 / 12</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Seal Status</span><strong style={{ color: '#16a34a' }}>Intact &bull; Verified</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Last Verified</span><strong style={{ color: '#0f172a' }}>11:20 AM</strong></div>
                </div>
              </div>

              {/* Section 9: Postal Ballot Tracking */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Postal Ballot Tracking</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { label: "Applications Received", val: "1,248" },
                    { label: "Dispatched", val: "1,102" },
                    { label: "Received Back", val: "986" },
                    { label: "Accepted", val: "972" },
                    { label: "Rejected", val: "14" },
                    { label: "Yet to Receive", val: "116" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#475569' }}>{item.label}</span>
                      <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 10: Election Material Status */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Election Material Status</h2>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>View Details</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', fontSize: '11px' }}>
                  {[
                    { label: "Ballot Units", val: "2,467 / 2,500" },
                    { label: "Control Units", val: "2,467 / 2,500" },
                    { label: "VVPATs", val: "2,467 / 2,500" },
                    { label: "Indelible Ink (Bottles)", val: "2,600 / 2,600" },
                    { label: "Seals", val: "25,000 / 25,000" },
                    { label: "Forms & Registers", val: "100% Available" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#475569' }}>{item.label}</span>
                      <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 'bold', marginTop: '6px', textAlign: 'center' }}>
                  &bull; All Materials Verified
                </div>
              </div>

              {/* Section 11 & 12: Checklist Compliance & Quick Actions */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '800' }}>Checklist Compliance</h2>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
                    <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                      <svg width="50" height="50" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="3.5" 
                                strokeDasharray="92 100" strokeDashoffset="0" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                        92%
                      </div>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Completed</span><strong>92%</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>In Progress</span><strong>5%</strong></div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Quick Actions</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button onClick={() => alert("Send District Alert Warning System...")} style={{ padding: '6px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Alert SOs</button>
                    <button onClick={() => alert("Deploy reserve staff pool...")} style={{ padding: '6px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Deploy Staff</button>
                    <button onClick={() => alert("Assign reserve logistics vehicle...")} style={{ padding: '6px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Assign Vehicle</button>
                    <button onClick={() => alert("Reporting Custom Incident...")} style={{ padding: '6px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Log Incident</button>
                  </div>
                </div>
              </div>

            </div>

            {/* LOWER RO WIDGETS: AI ASSISTANT CHAT & SUMMARY */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              
              {/* SOP AI Assistant Chat */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} color="#2563eb" />
                  <h2 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>DEO AI Logistics & Operations Assistant</h2>
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
                    placeholder="Ask AI about strong room protocols, security layout parameters, or vehicle updates..."
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
                  <h2 style={{ fontSize: '14px', fontWeight: '800' }}>District Command Center Insights</h2>
                </div>
                <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
                  <div>&bull; <strong>Communication Hub:</strong> Call logs verified.</div>
                  <div>&bull; <strong>Checklist Compliance:</strong> 15 / 16 parameters completed.</div>
                  <div>&bull; <strong>Logistics Pool:</strong> 111 reserve vehicles ready.</div>
                  <div>&bull; <strong>Constituencies:</strong> 10 / 10 RO teams active.</div>
                </div>
                <button
                  onClick={() => alert("Loading advanced analytical logs...")}
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
                  Open Advanced analytics console
                </button>
              </div>

            </div>

          </div>
        )}

        {/* DEO WORKSPACE DETAILED VIEWS */}
        {activeMenu === 'Booth Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Assembly Constituencies & Booth Telemetries</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>AC Name</th>
                    <th style={{ padding: '10px' }}>Total Booths</th>
                    <th style={{ padding: '10px' }}>Voter Turnout</th>
                    <th style={{ padding: '10px' }}>Active Incidents</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {districtBooths.map((ac) => (
                    <tr key={ac.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{ac.acName}</td>
                      <td style={{ padding: '10px' }}>{ac.totalBooths}</td>
                      <td style={{ padding: '10px', color: '#2563eb', fontWeight: 'bold' }}>{ac.turnout}</td>
                      <td style={{ padding: '10px', color: ac.activeIncidents > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{ac.activeIncidents}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: ac.status === 'Healthy' ? '#dcfce7' : '#fef9c3',
                          color: ac.status === 'Healthy' ? '#15803d' : '#854d0e'
                        }}>{ac.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => alert(`Connecting to CCTV Webcast feed for ${ac.acName}... Stream online.`)}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginRight: '4px' }}
                        >Live Webcast</button>
                        <button
                          onClick={() => alert(`Launching AC profile for ${ac.acName}...`)}
                          style={{ padding: '4px 8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'EVM Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District EVM & VVPAT Roster</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>Unit ID</th>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Current Location</th>
                    <th style={{ padding: '10px' }}>Randomization Check</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {evmInventory.map((evm) => (
                    <tr key={evm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{evm.id}</td>
                      <td style={{ padding: '10px' }}>{evm.type}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: evm.status === 'Warehouse' ? '#e2e8f0' : evm.status === 'Deployed' ? '#dcfce7' : evm.status === 'In Transit' ? '#eff6ff' : '#fee2e2',
                          color: evm.status === 'Warehouse' ? '#475569' : evm.status === 'Deployed' ? '#15803d' : evm.status === 'In Transit' ? '#1e40af' : '#b91c1c'
                        }}>{evm.status}</span>
                      </td>
                      <td style={{ padding: '10px' }}>{evm.location}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: evm.checked === 'Yes' ? '#16a34a' : '#dc2626' }}>{evm.checked}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setEvmInventory(prev => prev.map(e => e.id === evm.id ? { ...e, checked: "Yes" } : e));
                            alert(`EVM ${evm.id} randomized and verified.`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Verify Unit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() => alert("Initiating second randomization matrix check. Synchronizing with state ECI servers...")}
                style={{ marginTop: '16px', padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '220px' }}
              >
                Run 2nd Randomization Matrix
              </button>
            </div>
          </div>
        )}

        {activeMenu === 'Staff Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Polling Personnel Registry</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Officer Name</th>
                    <th style={{ padding: '10px' }}>Roster Role</th>
                    <th style={{ padding: '10px' }}>ECI Training Completed</th>
                    <th style={{ padding: '10px' }}>Certified</th>
                    <th style={{ padding: '10px' }}>Check In Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffTraining.map((staff) => (
                    <tr key={staff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{staff.id}</td>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{staff.name}</td>
                      <td style={{ padding: '10px' }}>{staff.role}</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>{staff.trained}</td>
                      <td style={{ padding: '10px', color: staff.certified === 'Yes' ? '#16a34a' : '#ea580c', fontWeight: 'bold' }}>{staff.certified}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: staff.checkIn === 'Checked In' ? '#dcfce7' : '#fef9c3',
                          color: staff.checkIn === 'Checked In' ? '#15803d' : '#854d0e'
                        }}>{staff.checkIn}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setStaffTraining(prev => prev.map(s => s.id === staff.id ? { ...s, certified: "Yes" } : s));
                            alert(`Training certificate issued for ${staff.name}`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginRight: '4px' }}
                        >Issue Certificate</button>
                        <button
                          onClick={() => {
                            setStaffTraining(prev => prev.map(s => s.id === staff.id ? { ...s, checkIn: "Checked In" } : s));
                            alert(`Sent check-in reminder alert to ${staff.name}`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Alert Officer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Vehicle Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District GPS Vehicle Dispatch Hub</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>Vehicle ID</th>
                    <th style={{ padding: '10px' }}>Dispatch Route</th>
                    <th style={{ padding: '10px' }}>Logistics Type</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>GPS Link</th>
                    <th style={{ padding: '10px' }}>Driver</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{v.id}</td>
                      <td style={{ padding: '10px' }}>{v.route}</td>
                      <td style={{ padding: '10px' }}>{v.type}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: v.status === 'Arrived' ? '#dcfce7' : v.status === 'Active' ? '#eff6ff' : '#fee2e2',
                          color: v.status === 'Arrived' ? '#15803d' : v.status === 'Active' ? '#1e40af' : '#b91c1c'
                        }}>{v.status}</span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: v.gps === 'Connected' ? '#16a34a' : '#ea580c' }}>{v.gps}</td>
                      <td style={{ padding: '10px' }}>{v.driver}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => alert(`Launching live map routing for ${v.id}... Driver: ${v.driver}`)}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginRight: '4px' }}
                        >Trace Vehicle</button>
                        <button
                          onClick={() => {
                            setVehicles(prev => prev.map(item => item.id === v.id ? { ...item, status: "Active", gps: "Connected" } : item));
                            alert(`GPS link reset commands dispatched to vehicle ${v.id}`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Reset GPS Link</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Sensitive Booths' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Sensitive Booth Security Matrix</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Micro-Observers Assigned</div>
                  <strong style={{ fontSize: '20px', display: 'block', margin: '4px 0' }}>156 Booths</strong>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>100% Staff In-Place</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>CAPF Static Guards</div>
                  <strong style={{ fontSize: '20px', display: 'block', margin: '4px 0' }}>70 Booths</strong>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>Armed Guarding Active</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Webcasting Booths</div>
                  <strong style={{ fontSize: '20px', display: 'block', margin: '4px 0' }}>226 Booths</strong>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>Streams Configured</span>
                </div>
              </div>
              <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '12px', color: '#b91c1c' }}>
                <strong>Varanasi District Police Liaison Advisory:</strong> CAPF patrols and QRT reserves must remain stationed within 5 mins response radius of Varanasi Cantt (AC-3) and Rohania (AC-4) sensitive areas.
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Strong Room Monitoring' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Strong Room CCTV & Seal Audit Logs</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Access and Seals Logs</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '8px' }}>Time</th>
                        <th style={{ padding: '8px' }}>Official</th>
                        <th style={{ padding: '8px' }}>Action</th>
                        <th style={{ padding: '8px' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strongRoomLog.map((log, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', color: '#64748b' }}>{log.time}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>{log.person}</td>
                          <td style={{ padding: '8px' }}>{log.action}</td>
                          <td style={{ padding: '8px', fontStyle: 'italic' }}>{log.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Log New Authorized Access visit</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target;
                    const official = form.elements.official.value;
                    const action = form.elements.action.value;
                    const remarks = form.elements.remarks.value;
                    if (!official || !action) return;
                    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setStrongRoomLog(prev => [{ time: nowStr, person: official, action, remarks }, ...prev]);
                    form.reset();
                    alert("Strong Room access successfully logged.");
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Official Name & Role</label>
                      <input name="official" type="text" placeholder="e.g. Shri. S. Kumar (Observer)" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Action Performed</label>
                      <input name="action" type="text" placeholder="e.g. CCTV Grid Verification" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Remarks</label>
                      <input name="remarks" type="text" placeholder="e.g. Double locks verified intact" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Commit Access Entry
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'Election Material' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Statutory Election Material Distribution</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>Material Item</th>
                    <th style={{ padding: '10px' }}>Unit Type</th>
                    <th style={{ padding: '10px' }}>Total Allocated</th>
                    <th style={{ padding: '10px' }}>Distributed</th>
                    <th style={{ padding: '10px' }}>Reserve Stocks</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: "Electoral Roll Copies (Marked)", unit: "Sets", allocated: 2500, dist: 2347, reserve: 153, status: "Completed" },
                    { item: "Indelible Ink Phials", unit: "Bottles", allocated: 5000, dist: 4694, reserve: 306, status: "Completed" },
                    { item: "Statutory Green Seals", unit: "Units", allocated: 10000, dist: 9388, reserve: 612, status: "Completed" },
                    { item: "Form 17A Voter Registers", unit: "Books", allocated: 3000, dist: 2347, reserve: 653, status: "In Progress" }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.item}</td>
                      <td style={{ padding: '10px' }}>{row.unit}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.allocated}</td>
                      <td style={{ padding: '10px' }}>{row.dist}</td>
                      <td style={{ padding: '10px' }}>{row.reserve}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: row.status === 'Completed' ? '#dcfce7' : '#eff6ff',
                          color: row.status === 'Completed' ? '#15803d' : '#1e40af'
                        }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => alert(`Material dispatch order signed for ${row.item}. Dispatching reserves...`)}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Dispatch Reserves</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Postal Ballot Tracking' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Postal Ballot Registry</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>Ballot ID</th>
                    <th style={{ padding: '10px' }}>Voter Name</th>
                    <th style={{ padding: '10px' }}>Category</th>
                    <th style={{ padding: '10px' }}>Received Date</th>
                    <th style={{ padding: '10px' }}>Verification Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postalBallots.map((pb) => (
                    <tr key={pb.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{pb.id}</td>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{pb.voterName}</td>
                      <td style={{ padding: '10px' }}>{pb.type}</td>
                      <td style={{ padding: '10px' }}>{pb.date}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: pb.status === 'Accepted' ? '#dcfce7' : pb.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                          color: pb.status === 'Accepted' ? '#15803d' : pb.status === 'Rejected' ? '#b91c1c' : '#854d0e'
                        }}>{pb.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setPostalBallots(prev => prev.map(item => item.id === pb.id ? { ...item, status: "Accepted" } : item));
                            alert(`Postal ballot ${pb.id} verification completed & ACCEPTED.`);
                          }}
                          disabled={pb.status !== 'Pending Verification'}
                          style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: pb.status === 'Pending Verification' ? 'pointer' : 'not-allowed', opacity: pb.status === 'Pending Verification' ? 1 : 0.5, marginRight: '4px' }}
                        >Approve</button>
                        <button
                          onClick={() => {
                            setPostalBallots(prev => prev.map(item => item.id === pb.id ? { ...item, status: "Rejected" } : item));
                            alert(`Postal ballot ${pb.id} REJECTED.`);
                          }}
                          disabled={pb.status !== 'Pending Verification'}
                          style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: pb.status === 'Pending Verification' ? 'pointer' : 'not-allowed', opacity: pb.status === 'Pending Verification' ? 1 : 0.5 }}
                        >Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'Incident Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Incident Command Desk (Varanasi War Room)</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>AC Division</th>
                    <th style={{ padding: '10px' }}>Booth ID</th>
                    <th style={{ padding: '10px' }}>Category</th>
                    <th style={{ padding: '10px' }}>Details</th>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((comp) => (
                    <tr key={comp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{comp.id}</td>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{comp.ac}</td>
                      <td style={{ padding: '10px' }}>Booth {comp.boothId}</td>
                      <td style={{ padding: '10px', color: '#b91c1c', fontWeight: 'bold' }}>{comp.type}</td>
                      <td style={{ padding: '10px' }}>{comp.detail}</td>
                      <td style={{ padding: '10px' }}>{comp.time}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: comp.status === 'Resolved' ? '#dcfce7' : comp.status === 'Investigating' ? '#eff6ff' : '#fee2e2',
                          color: comp.status === 'Resolved' ? '#15803d' : comp.status === 'Investigating' ? '#1e40af' : '#b91c1c'
                        }}>{comp.status}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: "Investigating" } : c));
                            alert(`Observer / QRT force dispatched to ${comp.ac} Booth ${comp.boothId}`);
                          }}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginRight: '4px' }}
                        >Dispatch Patrol</button>
                        <button
                          onClick={() => {
                            setComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: "Resolved" } : c));
                            alert(`Incident ${comp.id} marked as resolved.`);
                          }}
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

        {activeMenu === 'Communication Hub' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Broadcast Console</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Push Broadcast to ROs and Sector Pools</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!broadcastText.trim()) return;
                    alert(`District circular broadcasted: "${broadcastText}"`);
                    setBroadcastText("");
                  }}>
                    <textarea
                      placeholder="Type priority operational guidelines to broadcast to all AC offices..."
                      value={broadcastText}
                      onChange={(e) => setBroadcastText(e.target.value)}
                      style={{ width: '100%', height: '100px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', marginBottom: '12px' }}
                      required
                    />
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Publish Broadcast Directives ⚡
                    </button>
                  </form>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Hotline Quick Dials</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <span>State CEO Command Desk</span>
                      <button onClick={() => handleTriggerCall("State CEO Desk", "+91 11-2301-ECI", false)} style={{ padding: '3px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Call</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <span>AC-1 Returning Officer (Varanasi N)</span>
                      <button onClick={() => handleTriggerCall("RO Varanasi N", "+91 94530-XXXX", false)} style={{ padding: '3px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Call</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <span>District SP (Police Coordinator)</span>
                      <button onClick={() => handleTriggerCall("District SP Varanasi", "+91 94544-XXXX", false)} style={{ padding: '3px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Call</button>
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
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Varanasi Assembly Turnout split</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {districtBooths.map((ac) => (
                  <div key={ac.id} style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>{ac.acName} &bull; <span style={{ color: '#64748b' }}>{ac.totalBooths} Polling Booths</span></span>
                      <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{ac.turnout} Turnout</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: ac.turnout,
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

        {activeMenu === 'Reports & Analytics' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Statutory Forms & Reports Desk</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { title: "District Turnout Consolidated", desc: "AC-wise turnout registry & percentages", form: "DEO-Form 17C Summary" },
                  { title: "Strong Room Seal audit", desc: "Visitor logs & double lock signoff certificates", form: "DEO-Form SR" },
                  { title: "Randomization verification Log", desc: "First & second randomisation reports", form: "DEO-Form EVMR" },
                  { title: "Security Dispatch checklist", desc: "CAPF & police personnel assignments", form: "DEO-Form Sec" }
                ].map((rep, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '120px' }}>
                    <div>
                      <span style={{ fontSize: '9px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>{rep.form}</span>
                      <strong style={{ display: 'block', fontSize: '13px', marginTop: '6px', color: '#0f172a' }}>{rep.title}</strong>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0' }}>{rep.desc}</p>
                    </div>
                    <button
                      onClick={() => alert(`Exporting ${rep.title} file...`)}
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

        {activeMenu === 'Checklist & Compliance' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Statutory Compliance checklist</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { check: "Establishment of double-lock strong room guards & CCTV synchronization", status: "Done", date: "2026-06-18" },
                  { check: "Second EVM Randomisation Commits in presence of party candidate agents", status: "Done", date: "2026-06-19" },
                  { check: "Distribution of marked copies of electoral rolls and ink phials to ROs", status: "Done", date: "2026-06-19" },
                  { check: "Verification of GPS transponders in all dispatch trucks and reserve pools", status: "Pending Verification", date: "Today" }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>
                      {idx + 1}. {item.check}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Due: {item.date}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                        backgroundColor: item.status === 'Done' ? '#dcfce7' : '#fef9c3',
                        color: item.status === 'Done' ? '#15803d' : '#854d0e'
                      }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'RO Management' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>District Returning Officers Roster</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px' }}>AC ID</th>
                    <th style={{ padding: '10px' }}>Constituency Division</th>
                    <th style={{ padding: '10px' }}>RO Administrator</th>
                    <th style={{ padding: '10px' }}>Contact Number</th>
                    <th style={{ padding: '10px' }}>Sync Connection</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "AC-1", name: "Varanasi North", officer: "Shri. Rajesh Kumar", phone: "+91 94530-XXXX", sync: "Online" },
                    { id: "AC-2", name: "Varanasi South", officer: "Shri. Sunita Devi", phone: "+91 94532-XXXX", sync: "Online" },
                    { id: "AC-3", name: "Varanasi Cantt", officer: "Shri. Vijay Malhotra", phone: "+91 94534-XXXX", sync: "Online" },
                    { id: "AC-4", name: "Rohania", officer: "Shri. Anita Sen", phone: "+91 94536-XXXX", sync: "Online" }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.id}</td>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{row.name}</td>
                      <td style={{ padding: '10px' }}>{row.officer}</td>
                      <td style={{ padding: '10px' }}>{row.phone}</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>{row.sync}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleTriggerCall(row.officer, row.phone, false)}
                          style={{ padding: '4px 8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >Connect Hotline</button>
                      </td>
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
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>District Operations Configuration</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Mandatory Live Webcasting</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Force CCTV stream encoding from sensitive booths</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={districtSettings.webcastEnabled}
                      onChange={(e) => setDistrictSettings(prev => ({ ...prev, webcastEnabled: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Enforce Truck GPS Sync</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Require active GPS transponders in EVM dispatch vehicles</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={districtSettings.forceGPSRequired}
                      onChange={(e) => setDistrictSettings(prev => ({ ...prev, forceGPSRequired: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Observer Lock Signoff</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Require external observer validation to seals matrix</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={districtSettings.requireObserverSignoff}
                      onChange={(e) => setDistrictSettings(prev => ({ ...prev, requireObserverSignoff: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Auto Telemetry Update Sync rate</label>
                    <select
                      value={districtSettings.autoAlertInterval}
                      onChange={(e) => setDistrictSettings(prev => ({ ...prev, autoAlertInterval: parseInt(e.target.value) }))}
                      style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="5">Every 5 Seconds</option>
                      <option value="10">Every 10 Seconds</option>
                      <option value="30">Every 30 Seconds</option>
                      <option value="60">Every 60 Seconds</option>
                    </select>
                  </div>

                  <button
                    onClick={() => alert("District operation settings successfully committed local storage.")}
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
          &copy; 2026 NagarVaani Election System. All rights reserved. &bull; District Election Officer Command Dashboard &bull; Version 2.0
        </footer>
      </main>
    </div>
  );
}
