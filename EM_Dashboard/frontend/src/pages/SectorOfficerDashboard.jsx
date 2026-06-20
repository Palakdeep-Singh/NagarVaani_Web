import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Activity, Users, Percent, ShieldAlert,
  Cpu, PhoneCall, Check, Clock, AlertTriangle, Battery, LogOut,
  Send, MapPin, RefreshCw, Eye, BookOpen, Settings, Radio,
  FileText, Video, AlertCircle, ArrowRight, ChevronRight, Plus,
  Truck, UserCheck, Volume2, Briefcase, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

export default function SectorOfficerDashboard({ user, onLogout }) {
  const userRole = user?.role || 'Sector Officer';
  const userName = user?.name || 'Officer';

  // Navigation state (Default to Dashboard)
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  // Setup clock
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

  // Selected booth for Right Command Sidebar / Operational Desk (default Booth 104)
  const [selectedBoothId, setSelectedBoothId] = useState(() => Math.floor(Math.random() * 62) + 72);

  // Core booths state (Booths 101 - 112)
  const [booths, setBooths] = useState([
    { id: 101, name: "Primary School Room 1", status: "Healthy", turnout: 48, voters: 1205, voted: 578, queueCount: 12, evmBattery: 95, evmSignal: "Strong", evmStatus: "Operational", visitStatus: "Visited", visitTime: "08:15 AM", gpsVerified: true },
    { id: 102, name: "Primary School Room 2", status: "Healthy", turnout: 58, voters: 1150, voted: 667, queueCount: 18, evmBattery: 92, evmSignal: "Strong", evmStatus: "Operational", visitStatus: "Visited", visitTime: "08:42 AM", gpsVerified: true },
    { id: 103, name: "Community Center Hall A", status: "Long Queue", turnout: 41, voters: 1450, voted: 594, queueCount: 130, evmBattery: 88, evmSignal: "Medium", evmStatus: "Operational", visitStatus: "Pending", visitTime: "Pending", gpsVerified: false },
    { id: 104, name: "Government High School Ward 4", status: "EVM Fault", turnout: 22, voters: 1380, voted: 304, queueCount: 14, evmBattery: 12, evmSignal: "Weak", evmStatus: "EVM Fault", visitStatus: "Visited", visitTime: "09:05 AM", gpsVerified: true },
    { id: 105, name: "Panchayat Ghar Room 1", status: "Not Visited", turnout: 49, voters: 1020, voted: 500, queueCount: 8, evmBattery: 97, evmSignal: "Strong", evmStatus: "Operational", visitStatus: "Pending", visitTime: "Pending", gpsVerified: false },
    { id: 106, name: "Panchayat Ghar Room 2", status: "Healthy", turnout: 52, voters: 1080, voted: 561, queueCount: 10, evmBattery: 90, evmSignal: "Strong", evmStatus: "Operational", visitStatus: "Visited", visitTime: "09:35 AM", gpsVerified: true },
    { id: 107, name: "Vikas Bhawan Reception", status: "Turnout Delay", turnout: 31, voters: 1250, voted: 387, queueCount: 65, evmBattery: 85, evmSignal: "Medium", evmStatus: "Operational", visitStatus: "Pending", visitTime: "Pending", gpsVerified: false },
    { id: 108, name: "Girls College Lobby", status: "EVM Fault", turnout: 38, voters: 1312, voted: 498, queueCount: 15, evmBattery: 24, evmSignal: "Medium", evmStatus: "Battery Low", visitStatus: "Pending", visitTime: "Pending", gpsVerified: false },
    { id: 109, name: "Town Hall East Wing", status: "Not Visited", turnout: 45, voters: 1190, voted: 535, queueCount: 9, evmBattery: 94, evmSignal: "Strong", evmStatus: "Operational", visitStatus: "Pending", visitTime: "Pending", gpsVerified: false },
    { id: 110, name: "MCD School Hall B", status: "Healthy", turnout: 50, voters: 1280, voted: 640, queueCount: 11, evmBattery: 96, evmSignal: "Strong", evmStatus: "Operational", visitStatus: "Visited", visitTime: "10:12 AM", gpsVerified: true },
    { id: 111, name: "Civil Hospital Room 4", status: "Healthy", turnout: 53, voters: 1100, voted: 583, queueCount: 7, evmBattery: 89, evmSignal: "Strong", evmStatus: "Operational", visitStatus: "Visited", visitTime: "10:40 AM", gpsVerified: true },
    { id: 112, name: "Veterinary Clinic Annex", status: "Healthy", turnout: 47, voters: 1145, voted: 538, queueCount: 6, evmBattery: 91, evmSignal: "Medium", evmStatus: "Operational", visitStatus: "Visited", visitTime: "11:15 AM", gpsVerified: true }
  ]);

  // Live alerts state
  const [alerts, setAlerts] = useState([
    { id: "ALT-201", boothId: 104, type: "EVM Fault", detail: "Control Unit display frozen. Verification halted.", priority: "Critical", time: "11:28 AM" },
    { id: "ALT-202", boothId: 103, type: "Long Queue", detail: "130+ voters waiting. Expected wait time > 45m.", priority: "High", time: "11:20 AM" },
    { id: "ALT-203", boothId: 108, type: "Staff Missing", detail: "Polling Officer 2 reported absent due to medical emergency.", priority: "Medium", time: "10:55 AM" }
  ]);

  // Smart patrol route state
  const [patrolRoute, setPatrolRoute] = useState([
    { label: "Current Location", detail: "Sector 12 Headquarters", eta: "Now", type: "Base", priority: "Normal" },
    { label: "Booth 104", detail: "Government High School Ward 4", eta: "8 mins travel", type: "EVM Fault", priority: "Critical" },
    { label: "Booth 103", detail: "Community Center Hall A", eta: "15 mins travel", type: "Long Queue", priority: "High" },
    { label: "Booth 108", detail: "Girls College Lobby", eta: "23 mins travel", type: "Staff Missing", priority: "Medium" },
    { label: "Booth 107", detail: "Vikas Bhawan Reception", eta: "32 mins travel", type: "Turnout Delay", priority: "Low" }
  ]);

  // Incident War Room states
  const [incidents, setIncidents] = useState([
    { id: "INC-901", time: "11:28 AM", type: "EVM Fault", boothId: 104, status: "Open" },
    { id: "INC-902", time: "11:20 AM", type: "Long Queue", boothId: 103, status: "Open" },
    { id: "INC-903", time: "10:55 AM", type: "Power Fluctuation", boothId: 102, status: "Resolved" }
  ]);

  // Pending action checklists
  const [pendingActions, setPendingActions] = useState([
    { id: "ACT-1", text: "3 Booth Visits Pending", count: 3, priority: "warning", type: "Visits" },
    { id: "ACT-2", text: "2 Complaints Pending", count: 2, priority: "danger", type: "Complaints" },
    { id: "ACT-3", text: "1 EVM Verification Pending", count: 1, priority: "info", type: "EVM" },
    { id: "ACT-4", text: "4 Turnout Reports Missing", count: 4, priority: "warning", type: "Reports" }
  ]);

  // Requests from RO state
  const [roRequests, setRoRequests] = useState([
    { id: "RO-REQ-201", text: "Verify Complaint – Booth 108", detail: "Voter reported discrepancy in VVPAT slip printout.", priority: "High", dueTime: "12:00 PM", status: "Pending" },
    { id: "RO-REQ-202", text: "Submit Turnout Summary", detail: "Sector 12 consolidated turnout update required for 12:00 PM briefing.", priority: "Critical", dueTime: "12:15 PM", status: "Accepted" },
    { id: "RO-REQ-203", text: "Inspect Booth 103 Queue", detail: "Report back if supplementary staff or queue barrier control is needed.", priority: "Medium", dueTime: "12:45 PM", status: "Pending" }
  ]);

  // Reserve Pools State
  const [reserveStaff, setReserveStaff] = useState({
    officers: 6,
    presiding: 2,
    polling: 4
  });

  const [reserveResources, setReserveResources] = useState({
    evms: 3,
    vvpats: 2,
    vehicles: 2,
    staff: 6
  });

  // Recent communication logs
  const [commLogs, setCommLogs] = useState([
    { id: 1, type: "Broadcast", text: "Broadcast to all booths: Speed up mock verification logs.", time: "11:10 AM" },
    { id: 2, type: "Incoming Call", text: "Call from PO Booth 102: Power fluctuation resolved.", time: "10:58 AM" },
    { id: 3, type: "Outgoing Call", text: "Call to RO Desk: Requested emergency VVPAT spare status.", time: "10:45 AM" }
  ]);

  // Communication modal state
  const [callModal, setCallModal] = useState({ open: false, recipient: '', number: '', isVideo: false });
  const [broadcastText, setBroadcastText] = useState('');

  // AI assistant chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Sector Assistant. I monitor real-time telemetries and EC guideline manuals.' },
    { sender: 'user', text: 'Which booth requires immediate attention?' },
    { sender: 'bot', text: 'Booth 104 requires immediate attention due to EVM failure, increasing queue length and turnout stagnation.' }
  ]);

  // Fetch telemetry from server (if online)
  const fetchTelemetry = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await axios.get(`${apiUrl}/booth/status`);
      if (res.status === 200) {
        setIsOnline(true);
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      setIsOnline(false);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      fetchTelemetry();
      setLoading(false);
    }, 800);
  };

  // Dispatch Spare EVM to Selected Booth
  const handleDeployEVM = (boothId) => {
    if (reserveResources.evms <= 0) {
      alert("No reserve EVMs available in the Sector pool!");
      return;
    }
    setReserveResources(prev => ({ ...prev, evms: prev.evms - 1 }));
    setBooths(prev => prev.map(b => b.id === boothId ? { ...b, evmStatus: "Operational", evmBattery: 100, status: "Healthy" } : b));
    setAlerts(prev => prev.filter(a => !(a.boothId === boothId && a.type === "EVM Fault")));
    setIncidents(prev => prev.map(inc => (inc.boothId === boothId && inc.type === "EVM Fault") ? { ...inc, status: "Resolved" } : inc));
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCommLogs(prev => [
      { id: Date.now(), type: "System Dispatch", text: `Dispatched Reserve EVM to Booth ${boothId}.`, time: now },
      ...prev
    ]);
    alert(`Successfully deployed Reserve EVM to Booth ${boothId}. Battery reset to 100% and status marked Operational.`);
  };

  // Dispatch Spare Staff to Selected Booth
  const handleDeployStaff = (boothId) => {
    if (reserveStaff.polling <= 0) {
      alert("No reserve Polling Officers available in the Sector pool!");
      return;
    }
    setReserveStaff(prev => ({ ...prev, polling: prev.polling - 1, officers: prev.officers - 1 }));
    setReserveResources(prev => ({ ...prev, staff: prev.staff - 1 }));
    setAlerts(prev => prev.filter(a => !(a.boothId === boothId && a.type === "Staff Missing")));
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCommLogs(prev => [
      { id: Date.now(), type: "System Dispatch", text: `Deployed Polling Staff to Booth ${boothId}.`, time: now },
      ...prev
    ]);
    alert(`Successfully deployed 1 Reserve Polling Officer to Booth ${boothId}.`);
  };

  // Handle Returning Officer Request Actions
  const handleAcceptRoRequest = (reqId) => {
    setRoRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "Accepted" } : r));
  };

  const handleCompleteRoRequest = (reqId) => {
    setRoRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "Completed" } : r));
    setPendingActions(prev => prev.map(act => {
      if (act.type === "Complaints" && reqId === "RO-REQ-201") return { ...act, count: Math.max(0, act.count - 1) };
      return act;
    }));
  };

  // Broadcast messages
  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCommLogs(prev => [
      { id: Date.now(), type: "Broadcast", text: `Broadcast: "${broadcastText}"`, time: now },
      ...prev
    ]);
    alert(`Message broadcasted to all 12 Presiding Officers: "${broadcastText}"`);
    setBroadcastText('');
  };

  // Chat logic
  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const question = chatInput;
    const newMessages = [...chatMessages, { sender: 'user', text: question }];
    setChatMessages(newMessages);
    setChatInput('');

    setTimeout(() => {
      let replyText = "";
      const query = question.toLowerCase();
      if (query.includes("booth 104") || query.includes("immediate") || query.includes("attention")) {
        replyText = "Booth 104 requires immediate action. EVM battery is at 12% with a critical Control Unit Fault. Recommend deploying a Reserve EVM from the Deployment Center.";
      } else if (query.includes("queue") || query.includes("booth 103")) {
        replyText = "Booth 103 shows a high queue length of 130 voters with a 50+ minutes wait time. Recommended action: inspect queue line partitioning or coordinate with security.";
      } else if (query.includes("staff") || query.includes("absent") || query.includes("booth 108")) {
        replyText = "Booth 108 is flagged for missing staff. You have 6 Reserve Officers in your pool. Click 'Deploy Staff' in the Resource Deployment Center to assign a Polling Officer.";
      } else if (query.includes("evm") || query.includes("reserve")) {
        replyText = "You have 3 Reserve EVMs and 2 Reserve VVPATs in your inventory. You can dispatch them to Booth 104 or Booth 108 using the Right Command panel.";
      } else {
        replyText = `Regarding "${question}": Check the EC SOP Handbooks. To resolve booth alarms, check the visits planner or escalate the incident to the Returning Officer.`;
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
    }, 600);
  };

  const selectedBooth = booths.find(b => b.id === selectedBoothId) || booths[0];

  // Helper status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy':
      case 'Operational':
        return '#16a34a'; // Green
      case 'Long Queue':
      case 'Battery Low':
        return '#d97706'; // Yellow
      case 'Turnout Delay':
        return '#ea580c'; // Orange
      case 'EVM Fault':
      case 'Critical':
        return '#dc2626'; // Red
      default:
        return '#94a3b8'; // Gray / Not Visited
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Healthy':
      case 'Operational':
        return '#dcfce7'; // Light Green
      case 'Long Queue':
      case 'Battery Low':
        return '#fef3c7'; // Light Yellow
      case 'Turnout Delay':
        return '#ffedd5'; // Light Orange
      case 'EVM Fault':
      case 'Critical':
        return '#fee2e2'; // Light Red
      default:
        return '#f1f5f9'; // Light Gray
    }
  };

  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
  };

  return (
    <div className="dashboard-container" style={{ textAlign: 'left', minHeight: '100vh', display: 'flex', backgroundColor: '#f8fafc' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar" style={{ width: '270px', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <img
            src="https://img.icons8.com/?size=100&id=2969&format=png&color=FFFFFF"
            alt="India Emblem"
            className="sidebar-logo-img"
            style={{ width: '30px', height: '30px' }}
          />
          <div className="sidebar-logo-text">
            <h2 style={{ fontSize: '18px', margin: 0, color: '#fff', fontWeight: 800 }}>NagarVaani</h2>
            <p style={{ fontSize: '9px', margin: 0, color: '#38bdf8', letterSpacing: '1px', fontWeight: 700 }}>NAGARVAANI SYSTEM</p>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="sidebar-menu" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '16px', paddingRight: '4px' }}>
          {[
            { id: 'Dashboard', name: '1. Dashboard', icon: <LayoutDashboard size={16} /> },
            { id: 'Operational Desk', name: '2. Operational Desk', icon: <Cpu size={16} />, priority: true },
            { id: 'Booth Heatmap', name: '3. Booth Heatmap', icon: <Activity size={16} /> },
            { id: 'Booth Monitoring', name: '4. Booth Monitoring', icon: <Eye size={16} /> },
            { id: 'Live Alerts', name: '5. Live Alerts', icon: <ShieldAlert size={16} /> },
            { id: 'Visits & Patrol', name: '6. Visits & Patrol', icon: <MapPin size={16} /> },
            { id: 'Turnout Analytics', name: '7. Turnout Analytics', icon: <Percent size={16} /> },
            { id: 'Queue Monitor', name: '8. Queue Monitor', icon: <Clock size={16} /> },
            { id: 'EVM Status', name: '9. EVM Status', icon: <Cpu size={16} /> },
            { id: 'Incident War Room', name: '10. Incident War Room', icon: <AlertTriangle size={16} /> },
            { id: 'EVM Movement', name: '11. EVM Movement', icon: <Truck size={16} /> },
            { id: 'Staff Attendance', name: '12. Staff Attendance', icon: <UserCheck size={16} /> },
            { id: 'Resource Deployment', name: '13. Resource Deployment', icon: <Briefcase size={16} /> },
            { id: 'Requests from RO', name: '14. Requests from RO', icon: <FileText size={16} /> },
            { id: 'Communications', name: '15. Communications', icon: <Volume2 size={16} /> },
            { id: 'Reports', name: '16. Reports', icon: <BookOpen size={16} /> },
            { id: 'AI Assistant', name: '17. AI Assistant', icon: <Cpu size={16} /> },
            { id: 'Settings', name: '18. Settings', icon: <Settings size={16} /> }
          ].map((item) => (
            <div
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: activeMenu === item.id ? '700' : '500',
                cursor: 'pointer',
                marginBottom: '4px',
                color: activeMenu === item.id ? '#fff' : (item.priority ? '#38bdf8' : '#94a3b8'),
                backgroundColor: activeMenu === item.id ? '#2563eb' : (item.priority ? 'rgba(56, 189, 248, 0.05)' : 'transparent'),
                borderLeft: item.priority ? '3px solid #38bdf8' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => handleMenuClick(item.id)}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        {/* BOTTOM FIXED SECTION (Non-scrollable, containing direct redirect button to Operational Desk, location card, and emergency alarm button) */}
        <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* DIRECT NAVIGATION LINK CARD TO OPERATIONAL DESK */}
          <div
            onClick={() => setActiveMenu('Operational Desk')}
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.25)',
              borderRadius: '10px',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
              color: '#38bdf8'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>Operational Desk</span>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Open Control Console</span>
              </div>
            </div>
            <ArrowRight size={14} />
          </div>

          {/* Location & GPS Info */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            color: '#94a3b8'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 'bold' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              <span>GPS Status: Active</span>
            </div>
            <div style={{ fontSize: '10px' }}>Lat/Long: <span style={{ color: '#f1f5f9' }}>28.6139° N, 77.2090° E</span></div>
            <button
              onClick={() => alert("Broadcasting live Sector GPS location to Returning Officer Headquarters...")}
              style={{
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '2px',
                transition: 'background 0.2s'
              }}
            >
              Share Location
            </button>
          </div>

          {/* EMERGENCY FIXED BUTTON */}
          <button
            className="emergency-btn"
            onClick={() => {
              const confirmLog = window.confirm("🚨 WARNING: Trigger Sector-wide Emergency Broadcast Alert? This notifies the Returning Officer, local Police Control, and all 12 Polling Station booths immediately.");
              if (confirmLog) {
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setCommLogs(prev => [
                  { id: Date.now(), type: "EMERGENCY", text: "CRITICAL: Sector Officer triggered Emergency Broadcast Alert!", time: now },
                  ...prev
                ]);
                alert("Emergency Signal Dispatched to RO HQ and Booth Operators.");
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
              letterSpacing: '0.5px',
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
            <span>EMERGENCY ALARM</span>
          </button>

        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="main-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* TOP HEADER */}
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
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#1e3a8a', letterSpacing: '0.5px' }}>NAGARVAANI</span>
              <span style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1' }}></span>
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Sector 12 Command Center</h1>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: '500' }}>
              12 Booths supervised &bull; 14,562 registered voters &bull; <span style={{ color: '#dc2626', fontWeight: 'bold' }}>3 active alerts pending</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleRefresh}
              className={`btn-refresh ${loading ? 'animating' : ''}`}
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
              <RefreshCw size={13} style={{ transform: loading ? 'rotate(360deg)' : 'none', transition: 'transform 0.8s ease' }} />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            {/* Current Sync Info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '11px', color: '#64748b' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{timeString || '02:15 PM'}</span>
              <span>{dateString || '19 Jun 2026'}</span>
            </div>

            {/* Notification Bell */}
            <div
              onClick={() => alert(`Active Alerts:\n1. Booth 104 EVM Fault\n2. Booth 103 Long Queue\n3. Booth 108 Staff Missing`)}
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
              }}>3</span>
            </div>

            {/* Profile widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                SO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{userName}</span>
                <span style={{ color: '#64748b', fontWeight: '500' }}>{userRole}</span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* ==================== SCREEN 1: MAIN DASHBOARD (SPACIOUS SUMMARY) ==================== */}
        {activeMenu === 'Dashboard' && (
          <div className="dashboard-body" style={{ flexGrow: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* TOP KPI CARDS ROW */}
            <section className="summary-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
              
              {/* KPI 1: Total Booths */}
              <div className="summary-card" style={{ padding: '18px 16px', borderRadius: '12px', borderLeft: '4px solid #16a34a', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Booths</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>12 / 12 Active</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', display: 'block', marginTop: '2px' }}>&bull; 100% Online</span>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '6px', borderRadius: '8px', color: '#16a34a' }}>
                    <Activity size={16} />
                  </div>
                </div>
              </div>

              {/* KPI 2: Turnout */}
              <div className="summary-card" style={{ padding: '18px 16px', borderRadius: '12px', borderLeft: '4px solid #ea580c', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Sector Turnout</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>46%</h3>
                    <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: '700', display: 'block', marginTop: '2px' }}>&bull; 6,700 / 14,562 Voted</span>
                  </div>
                  <div style={{ backgroundColor: '#fff7ed', padding: '6px', borderRadius: '8px', color: '#ea580c' }}>
                    <Percent size={16} />
                  </div>
                </div>
              </div>

              {/* KPI 3: Alerts */}
              <div className="summary-card" style={{ padding: '18px 16px', borderRadius: '12px', borderLeft: '4px solid #dc2626', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Alerts</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>{alerts.length} Pending</h3>
                    <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: '700', display: 'block', marginTop: '2px' }}>&bull; 1 Critical Alarm</span>
                  </div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '8px', color: '#dc2626' }}>
                    <ShieldAlert size={16} />
                  </div>
                </div>
              </div>

              {/* KPI 4: EVM Status */}
              <div className="summary-card" style={{ padding: '18px 16px', borderRadius: '12px', borderLeft: '4px solid #16a34a', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>EVM Status</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>100% Oper.</h3>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', display: 'block', marginTop: '2px' }}>&bull; Spares in Reserve</span>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '6px', borderRadius: '8px', color: '#16a34a' }}>
                    <Cpu size={16} />
                  </div>
                </div>
              </div>

              {/* KPI 5: Visits */}
              <div className="summary-card" style={{ padding: '18px 16px', borderRadius: '12px', borderLeft: '4px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Visits Complete</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                      {booths.filter(b => b.visitStatus === 'Visited').length} / 12
                    </h3>
                    <span style={{ fontSize: '10px', color: '#d97706', fontWeight: '700', display: 'block', marginTop: '2px' }}>&bull; {12 - booths.filter(b => b.visitStatus === 'Visited').length} booths pending</span>
                  </div>
                  <div style={{ backgroundColor: '#fffbeb', padding: '6px', borderRadius: '8px', color: '#d97706' }}>
                    <MapPin size={16} />
                  </div>
                </div>
              </div>

              {/* KPI 6: Pending actions */}
              <div className="summary-card" style={{ padding: '18px 16px', borderRadius: '12px', borderLeft: '4px solid #ea580c', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Actions</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>7 Actions</h3>
                    <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: '700', display: 'block', marginTop: '2px' }}>&bull; Immediate Tasks</span>
                  </div>
                  <div style={{ backgroundColor: '#fff7ed', padding: '6px', borderRadius: '8px', color: '#ea580c' }}>
                    <Clock size={16} />
                  </div>
                </div>
              </div>

            </section>

            {/* SPACIOUS DASHBOARD BODY (2 columns, stretching full-width) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Booth Heatmap */}
                <div className="card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#0f172a', margin: 0 }}>Booth Heatmap Grid</h2>
                    <span className="panel-link" style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', cursor: 'pointer' }} onClick={() => setActiveMenu('Booth Heatmap')}>View Full Screen Map</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', margin: '16px 0' }}>
                    {booths.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBoothId(b.id);
                          setActiveMenu('Operational Desk'); // Focus redirects to Operational Desk console view
                        }}
                        style={{
                          padding: '14px 10px',
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          border: selectedBoothId === b.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: selectedBoothId === b.id ? '#eff6ff' : '#fff',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          transition: 'all 0.15s ease-in-out'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Booth {b.id}</div>
                        <div style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(b.status),
                          marginTop: '6px'
                        }} title={b.status}></div>
                        <div style={{ fontSize: '9px', fontWeight: '700', color: getStatusColor(b.status), textTransform: 'uppercase', marginTop: '2px' }}>
                          {b.status}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#64748b', fontWeight: 'bold', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span> Healthy</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d97706' }}></span> Long Queue</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ea580c' }}></span> Turnout Delay</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }}></span> EVM Fault</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span> Not Visited</span>
                  </div>
                </div>

                {/* Queue length & Turnout summary metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  
                  {/* Turnout chart preview */}
                  <div className="card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="panel-header" style={{ marginBottom: '12px' }}>
                      <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>Voter Turnout Curve</h2>
                    </div>
                    
                    <div style={{ height: '80px', position: 'relative' }}>
                      <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0 }}>
                        <path d="M 10 70 Q 70 55 130 45 T 250 15" fill="none" stroke="#2563eb" strokeWidth="2" />
                        <circle cx="10" cy="70" r="3" fill="#2563eb" />
                        <circle cx="130" cy="45" r="3" fill="#2563eb" />
                        <circle cx="250" cy="15" r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                        <text x="220" y="32" fill="#1e3a8a" fontSize="10" fontWeight="bold">46%</text>
                      </svg>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', fontWeight: 'bold', marginTop: '12px' }}>
                      <span>7 AM</span>
                      <span>12 PM</span>
                      <span>5 PM</span>
                    </div>
                  </div>

                  {/* Top Critical Queues */}
                  <div className="card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="panel-header" style={{ marginBottom: '10px' }}>
                      <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>Active Queue Alerts</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>Booth 103</span>
                          <span style={{ color: '#dc2626' }}>130 voters (Critical)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
                          <div style={{ width: '86%', height: '100%', backgroundColor: '#dc2626' }}></div>
                        </div>
                      </div>

                      <div style={{ fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>Booth 107</span>
                          <span style={{ color: '#ea580c' }}>65 voters (High)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
                          <div style={{ width: '45%', height: '100%', backgroundColor: '#ea580c' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Live Alerts */}
                <div className="card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#0f172a', margin: 0 }}>Live Alerts Feed</h2>
                    <span className="panel-link" style={{ fontSize: '12px' }} onClick={() => setActiveMenu('Live Alerts')}>All ({alerts.length})</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {alerts.map((alt) => (
                      <div key={alt.id} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #f3f4f6',
                        backgroundColor: '#fafafa',
                        borderLeft: `4px solid ${getStatusColor(alt.priority)}`,
                        fontSize: '11px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ color: '#0f172a', fontSize: '12px' }}>Booth {alt.boothId} &bull; {alt.type}</strong>
                          <span style={{
                            fontSize: '8px',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: getStatusBgColor(alt.priority),
                            color: getStatusColor(alt.priority)
                          }}>{alt.priority}</span>
                        </div>
                        <p style={{ margin: '4px 0', color: '#475569' }}>{alt.detail}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '9px' }}>{alt.time}</span>
                          <button
                            onClick={() => {
                              setSelectedBoothId(alt.boothId);
                              setActiveMenu('Operational Desk');
                            }}
                            style={{
                              border: 'none',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: 'bold',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                          >
                            Open Console Focus &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Patrol Route Timeline */}
                <div className="card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div className="panel-header" style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>Patrol Sequence Planner</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '4px' }}>
                    {patrolRoute.slice(0, 4).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                        {idx < 3 && (
                          <div style={{
                            position: 'absolute',
                            left: '5px',
                            top: '12px',
                            bottom: '-12px',
                            width: '2px',
                            backgroundColor: '#e2e8f0',
                            zIndex: 1
                          }} />
                        )}
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(item.priority),
                          border: '2px solid #fff',
                          boxShadow: '0 0 0 1px #cbd5e1',
                          zIndex: 2,
                          marginTop: '2px'
                        }} />
                        <div style={{ fontSize: '11px', flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.label}</span>
                            <span style={{ color: '#64748b', fontSize: '9px' }}>{item.eta}</span>
                          </div>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{item.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom incident feed & quick communications logs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              
              {/* Incident War Room Feed */}
              <div className="card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>Incident War Room Log</h2>
                  <span className="panel-link" onClick={() => setActiveMenu('Incident War Room')}>Join War Room</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {incidents.map((inc) => (
                    <div key={inc.id} style={{ display: 'flex', gap: '8px', fontSize: '11px', borderBottom: '1px solid #f8fafc', paddingBottom: '6px', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>{inc.time}</span>
                      <span style={{ color: getStatusColor(inc.type), fontWeight: 'bold' }}>{inc.type}</span>
                      <span style={{ color: '#475569' }}>&bull; Booth {inc.boothId}</span>
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        padding: '1px 4px',
                        borderRadius: '4px',
                        backgroundColor: inc.status === 'Open' ? '#fee2e2' : '#dcfce7',
                        color: inc.status === 'Open' ? '#dc2626' : '#16a34a'
                      }}>{inc.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Speed dial communication */}
              <div className="card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="panel-header" style={{ marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>Quick Communications desk</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    onClick={() => setCallModal({ open: true, recipient: "Returning Officer (RO)", number: "+91 99999 88888", isVideo: false })}
                    style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <PhoneCall size={12} /> Call RO
                  </button>
                  <button
                    onClick={() => setCallModal({ open: true, recipient: "Police Dispatch Control Room", number: "+91 112-999-00", isVideo: false })}
                    style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px', fontSize: '11px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <ShieldAlert size={12} /> Call Police
                  </button>
                  <button
                    onClick={() => alert("Secure video conference starting with District headquarters...")}
                    style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px', fontSize: '11px', fontWeight: 'bold', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Video size={12} /> Conf Video
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== SCREEN 2: OPERATIONAL DESK (PRIORITY, FULL VIEWPORT COCKPIT PANEL) ==================== */}
        {activeMenu === 'Operational Desk' && (
          <div style={{
            height: 'calc(100vh - 120px)',
            overflow: 'hidden',
            display: 'flex',
            gap: '20px',
            padding: '20px',
            boxSizing: 'border-box'
          }}>
            
            {/* Column 1: Booth Selector List */}
            <div className="card" style={{
              flex: '0.8',
              backgroundColor: '#fff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Station Selector</span>
              
              <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                {booths.map((b) => {
                  const isSelected = selectedBoothId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBoothId(b.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid #2563eb' : '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '12px', color: isSelected ? '#1e40af' : '#1e293b' }}>Booth {b.id}</strong>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>{b.name.slice(0, 20)}...</div>
                      </div>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(b.status)
                      }}></span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Booth Critical Actions Desk */}
            <div className="card" style={{
              flex: '1.2',
              backgroundColor: '#fff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#2563eb', textTransform: 'uppercase' }}>Selected Console Actions</span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: getStatusBgColor(selectedBooth.status),
                  color: getStatusColor(selectedBooth.status)
                }}>{selectedBooth.status}</span>
              </div>

              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Booth {selectedBooth.id}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>{selectedBooth.name}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Consolidated Turnout</span>
                    <strong style={{ color: '#0f172a' }}>{selectedBooth.turnout}% ({selectedBooth.voted} / {selectedBooth.voters} voted)</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Voter Queue length</span>
                    <strong style={{ color: selectedBooth.queueCount > 50 ? '#dc2626' : '#16a34a' }}>{selectedBooth.queueCount} voters waiting</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>EVM Device Status</span>
                    <strong style={{ color: getStatusColor(selectedBooth.evmStatus) }}>{selectedBooth.evmStatus}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>EVM Telemetry logs</span>
                    <strong style={{ color: '#0f172a' }}>Batt: {selectedBooth.evmBattery}% &bull; Signal: {selectedBooth.evmSignal}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>GPS Patrol visit state</span>
                    <strong style={{ color: '#0f172a' }}>{selectedBooth.visitStatus} {selectedBooth.visitTime !== 'Pending' && `(${selectedBooth.visitTime})`}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: 'auto' }}>
                  <button
                    onClick={() => setCallModal({ open: true, recipient: `PO Booth ${selectedBooth.id}`, number: `+91 98765 00${selectedBooth.id}`, isVideo: false })}
                    style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <PhoneCall size={12} /> Call Presiding Officer
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCallModal({ open: true, recipient: `PO Booth ${selectedBooth.id} Video Feed`, number: `VID-LINK-B${selectedBooth.id}`, isVideo: true })}
                      style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', padding: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Video size={10} /> Video Call
                    </button>
                    
                    <button
                      onClick={() => {
                        setPatrolRoute(prev => [
                          ...prev.slice(0, 2),
                          { label: `Booth ${selectedBooth.id}`, detail: selectedBooth.name, eta: "10 mins (Urgent Dispatch)", type: "Visit Assigned", priority: "High" },
                          ...prev.slice(2)
                        ]);
                        setBooths(prev => prev.map(b => b.id === selectedBooth.id ? { ...b, visitStatus: "Pending" } : b));
                        alert(`Patrol route updated: Dispatch assigned to Booth ${selectedBooth.id}.`);
                      }}
                      style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', padding: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <MapPin size={10} /> Assign Visit
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDeployEVM(selectedBooth.id)}
                      disabled={selectedBooth.evmStatus === "Operational"}
                      style={{ flex: 1, backgroundColor: selectedBooth.evmStatus === "Operational" ? '#f8fafc' : '#fff', border: '1px solid #cbd5e1', color: selectedBooth.evmStatus === "Operational" ? '#cbd5e1' : '#2563eb', borderRadius: '6px', padding: '8px', fontSize: '10px', fontWeight: 'bold', cursor: selectedBooth.evmStatus === "Operational" ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Cpu size={10} /> Deploy Reserve EVM
                    </button>

                    <button
                      onClick={() => {
                        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        setCommLogs(prev => [
                          { id: Date.now(), type: "Escalation", text: `Escalated Booth ${selectedBooth.id} issue: ${selectedBooth.status} to RO.`, time: now },
                          ...prev
                        ]);
                        alert(`Escalated Booth ${selectedBooth.id} operational status to Returning Officer HQ.`);
                      }}
                      style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#dc2626', borderRadius: '6px', padding: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <ShieldAlert size={10} /> Escalate to RO
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Column 3: Requests from RO & Reserves */}
            <div className="card" style={{
              flex: '1',
              backgroundColor: '#fff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                
                {/* Requests list */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>RO Action Items</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {roRequests.map((req) => (
                      <div key={req.id} style={{
                        backgroundColor: req.status === 'Completed' ? '#f8fafc' : '#fff8f2',
                        border: '1px solid #f3f4f6',
                        borderRadius: '8px',
                        padding: '8px',
                        fontSize: '11px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        opacity: req.status === 'Completed' ? 0.6 : 1
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>{req.text}</span>
                          <span style={{ color: getStatusColor(req.priority) }}>{req.priority}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '9px', color: '#94a3b8' }}>Due: {req.dueTime}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {req.status === 'Pending' && <button onClick={() => handleAcceptRoRequest(req.id)} style={{ border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e40af', borderRadius: '4px', padding: '1px 4px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}>Accept</button>}
                            {req.status === 'Accepted' && <button onClick={() => handleCompleteRoRequest(req.id)} style={{ border: '1px solid #bbf7d0', background: '#dcfce7', color: '#15803d', borderRadius: '4px', padding: '1px 4px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}>Complete</button>}
                            {req.status === 'Completed' && <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '9px' }}>Done</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reserves staff pool */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Reserve Staff pool</span>
                    <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 'bold' }}>{reserveStaff.officers} Available</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Reserve Presiding Officers:</span>
                      <strong style={{ color: '#0f172a' }}>{reserveStaff.presiding}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Reserve Polling Officers:</span>
                      <strong style={{ color: '#0f172a' }}>{reserveStaff.polling}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeployStaff(selectedBoothId)}
                    style={{ width: '100%', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Deploy Staff to Booth {selectedBoothId}
                  </button>
                </div>

                {/* Resources inventory summary */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Reserve Spares Pool</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '10px', color: '#475569' }}>
                    <div style={{ border: '1px solid #f1f5f9', padding: '4px 6px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                      <span>EVMs: <strong style={{ color: '#0f172a' }}>{reserveResources.evms}</strong></span>
                    </div>
                    <div style={{ border: '1px solid #f1f5f9', padding: '4px 6px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                      <span>VVPATs: <strong style={{ color: '#0f172a' }}>{reserveResources.vvpats}</strong></span>
                    </div>
                    <div style={{ border: '1px solid #f1f5f9', padding: '4px 6px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                      <span>Vehicles: <strong style={{ color: '#0f172a' }}>{reserveResources.vehicles}</strong></span>
                    </div>
                    <div style={{ border: '1px solid #f1f5f9', padding: '4px 6px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                      <span>Officers: <strong style={{ color: '#0f172a' }}>{reserveResources.staff}</strong></span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== SCREEN 3: OTHER 16 SIDEBAR MENU VIEW fallbacks ==================== */}
        {activeMenu !== 'Dashboard' && activeMenu !== 'Operational Desk' && (
          <div style={{ padding: '24px', flexGrow: 1, overflowY: 'auto' }}>
            <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <button
                  onClick={() => setActiveMenu('Dashboard')}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  &larr; Back to Dashboard
                </button>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{activeMenu} Details</h2>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
                Operational oversight details panel for {activeMenu} in Sector 12. Information is synced in real-time with District HQ.
              </p>

              {activeMenu === 'Booth Heatmap' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', margin: '20px 0' }}>
                    {booths.map(b => (
                      <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#fff', textAlign: 'center' }}>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>Booth {b.id}</strong>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 12px' }}>{b.name}</p>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: getStatusBgColor(b.status),
                          color: getStatusColor(b.status)
                        }}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'Live Alerts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {alerts.map(alt => (
                    <div key={alt.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', borderLeft: `6px solid ${getStatusColor(alt.priority)}`, backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '14px' }}>Booth {alt.boothId} &bull; {alt.type}</strong>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', backgroundColor: getStatusBgColor(alt.priority), color: getStatusColor(alt.priority) }}>{alt.priority}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#475569', margin: '8px 0' }}>{alt.detail}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px', fontSize: '11px' }}>
                        <span style={{ color: '#94a3b8' }}>Reported: {alt.time}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { handleDeployEVM(alt.boothId); }} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Dispatch Reserve EVM</button>
                          <button onClick={() => { handleDeployStaff(alt.boothId); }} style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Deploy Staff</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeMenu === 'Visits & Patrol' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
                    {patrolRoute.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '14px', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', backgroundColor: '#fafafa', alignItems: 'center' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: getStatusColor(p.priority), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>{idx + 1}</span>
                        <div>
                          <strong style={{ fontSize: '13px' }}>{p.label}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{p.detail}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 'bold', color: '#2563eb' }}>{p.eta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'Turnout Analytics' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {booths.map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <span><strong>Booth {b.id}</strong> &bull; {b.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{b.voted} / {b.voters} voted</span>
                          <strong style={{ color: b.turnout < 30 ? '#dc2626' : '#16a34a', fontSize: '13px' }}>{b.turnout}%</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'Queue Monitor' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {booths.map(b => (
                    <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>
                        <span>Booth {b.id} - {b.name}</span>
                        <span style={{ color: b.queueCount > 100 ? '#dc2626' : '#16a34a' }}>{b.queueCount} voters in queue</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (b.queueCount / 150) * 100)}%`, height: '100%', backgroundColor: b.queueCount > 100 ? '#dc2626' : '#16a34a' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeMenu === 'EVM Status' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: 'bold' }}>
                      <th style={{ padding: '8px' }}>Booth</th>
                      <th style={{ padding: '8px' }}>Battery</th>
                      <th style={{ padding: '8px' }}>Signal Strength</th>
                      <th style={{ padding: '8px' }}>Status</th>
                      <th style={{ padding: '8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booths.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>Booth {b.id}</td>
                        <td style={{ padding: '8px' }}>{b.evmBattery}%</td>
                        <td style={{ padding: '8px' }}>{b.evmSignal}</td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: getStatusColor(b.evmStatus) }}>{b.evmStatus}</td>
                        <td style={{ padding: '8px' }}>
                          <button onClick={() => handleDeployEVM(b.id)} style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>Deploy replacement</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeMenu === 'Requests from RO' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {roRequests.map(r => (
                    <div key={r.id} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px' }}>{r.text}</strong>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: getStatusBgColor(r.priority), color: getStatusColor(r.priority) }}>{r.priority}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0' }}>{r.detail}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11px' }}>
                        <span>Due time: {r.dueTime}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.status === 'Pending' && <button onClick={() => handleAcceptRoRequest(r.id)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Accept</button>}
                          {r.status === 'Accepted' && <button onClick={() => handleCompleteRoRequest(r.id)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Complete</button>}
                          {r.status === 'Completed' && <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Completed</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* fallback for other views */}
              {activeMenu === 'Operational Desk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Booth Control Desk &bull; Booth {selectedBooth.id}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</span>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: getStatusColor(selectedBooth.status), margin: '4px 0 0' }}>{selectedBooth.status}</h4>
                      </div>
                      <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Voter Turnout</span>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>{selectedBooth.turnout}%</h4>
                      </div>
                      <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>EVM Battery</span>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: selectedBooth.evmBattery < 30 ? '#dc2626' : '#16a34a', margin: '4px 0 0' }}>{selectedBooth.evmBattery}%</h4>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>Command Center Actions</h4>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleDeployEVM(selectedBooth.id)} style={{ flexGrow: 1, padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Deploy Spare EVM</button>
                        <button onClick={() => handleDeployStaff(selectedBooth.id)} style={{ flexGrow: 1, padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Deploy Reserve Staff</button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const directive = e.target.directive.value;
                          if (!directive.trim()) return;
                          alert(`Directive sent to Presiding Officer of Booth ${selectedBooth.id}: "${directive}"`);
                          e.target.reset();
                        }}
                        style={{ display: 'flex', gap: '8px', marginTop: '8px' }}
                      >
                        <input name="directive" type="text" placeholder="Type official directive to Presiding Officer..." style={{ flexGrow: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none' }} />
                        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Send Directive</button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Booth Heatmap' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Sector Booth Heatmap Grid</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {booths.map(b => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBoothId(b.id)}
                        style={{
                          padding: '20px 14px',
                          border: selectedBoothId === b.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: selectedBoothId === b.id ? '#eff6ff' : '#fff',
                          borderRadius: '12px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <strong style={{ fontSize: '15px', color: '#1e293b' }}>Booth {b.id}</strong>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 10px' }}>{b.name}</p>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          backgroundColor: getStatusBgColor(b.status),
                          color: getStatusColor(b.status)
                        }}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'Booth Monitoring' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>All Booths Database</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '10px' }}>Booth ID</th>
                          <th style={{ padding: '10px' }}>Polling Station Name</th>
                          <th style={{ padding: '10px' }}>Status</th>
                          <th style={{ padding: '10px' }}>Turnout</th>
                          <th style={{ padding: '10px' }}>Queue</th>
                          <th style={{ padding: '10px' }}>Visit Status</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {booths.map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{b.id}</td>
                            <td style={{ padding: '10px' }}>{b.name}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold', color: getStatusColor(b.status) }}>{b.status}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{b.turnout}%</td>
                            <td style={{ padding: '10px' }}>{b.queueCount} voters</td>
                            <td style={{ padding: '10px' }}>{b.visitStatus} ({b.visitTime})</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  setSelectedBoothId(b.id);
                                  setActiveMenu('Operational Desk');
                                }}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'Incident War Room' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Incident War Room</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {incidents.map(inc => (
                      <div key={inc.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ef4444', backgroundColor: '#fef2f2', padding: '3px 8px', borderRadius: '8px' }}>
                            TICKET ID: {inc.id}
                          </span>
                          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: '8px 0 2px' }}>{inc.type} at Booth {inc.boothId}</h4>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Reported: {inc.time}</span>
                        </div>

                        <button
                          onClick={() => {
                            setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: i.status === 'Resolved' ? 'Open' : 'Resolved' } : i));
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
                </div>
              )}

              {activeMenu === 'EVM Movement' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>EVM & VVPAT Logistics Tracker</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '14px' }}>Active GPS Patrol Vehicles</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                        <div>🚚 <strong>Vehicle 1 (Spare Stock):</strong> En-route to Booth 104 (Eta 3 mins)</div>
                        <div>🚚 <strong>Vehicle 2 (Security Escort):</strong> Base Standby (Ready)</div>
                      </div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '14px' }}>EVM & VVPAT Spares Pool</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                        <span>Reserve EVM Units</span>
                        <strong>{reserveResources.evms} Units Available</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span>Reserve VVPAT Units</span>
                        <strong>{reserveResources.vvpats} Units Available</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Staff Attendance' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Counter Staff Attendance Desk</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '10px' }}>Staff Name</th>
                          <th style={{ padding: '10px' }}>Assigned Duty</th>
                          <th style={{ padding: '10px' }}>Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "Officer Rajesh", role: "PO-1 (Verification) Booth 101", status: "Present" },
                          { name: "Officer Priya", role: "PO-2 (Ink & Entry) Booth 101", status: "Present" },
                          { name: "Officer Vinod", role: "PO-3 (EVM) Booth 102", status: "Present" },
                          { name: "Officer Sita", role: "PO-4 (Auxiliary) Booth 103", status: "Present" }
                        ].map((staff, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{staff.name}</td>
                            <td style={{ padding: '10px' }}>{staff.role}</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '8px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                backgroundColor: '#dcfce7',
                                color: '#16a34a'
                              }}>{staff.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'Resource Deployment' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Reserve Pools Deployment Center</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {[
                      { name: "Reserve EVMs", val: reserveResources.evms, color: '#3b82f6' },
                      { name: "Reserve VVPATs", val: reserveResources.vvpats, color: '#2563eb' },
                      { name: "Reserve Staff", val: reserveResources.staff, color: '#10b981' },
                      { name: "Reserve Vehicles", val: reserveResources.vehicles, color: '#f59e0b' }
                    ].map((res, idx) => (
                      <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{res.name}</span>
                        <h4 style={{ fontSize: '24px', fontWeight: '900', color: res.color, margin: '6px 0 0' }}>{res.val}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'Communications' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Secure Sector Radio Logs</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Radio Calls & Activity</h4>
                      {commLogs.map((log, idx) => (
                        <div key={idx} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                          <div>
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>{log.type}</span>
                            <p style={{ fontSize: '12px', color: '#334155', margin: '4px 0 0', fontWeight: '500' }}>{log.text}</p>
                          </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{log.time}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleBroadcast} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>Push Sector-wide Announcement</h4>
                      <textarea
                        value={broadcastText}
                        onChange={(e) => setBroadcastText(e.target.value)}
                        placeholder="Type message to broadcast to all 12 booths..."
                        style={{ height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', resize: 'none' }}
                      />
                      <button type="submit" style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Broadcast Announcement</button>
                    </form>
                  </div>
                </div>
              )}

              {activeMenu === 'Reports' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Constituency Forms & Diary Logs</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                      { name: "Mock Poll Certificates", status: "12 / 12 Submitted", color: '#16a34a' },
                      { name: "Form 17C Accounts", status: "0 / 12 Submitted", color: '#ef4444' },
                      { name: "Presiding Officer Diaries", status: "2 / 12 Closed", color: '#ea580c' }
                    ].map((rep, idx) => (
                      <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{rep.name}</span>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: rep.color, margin: '6px 0 0' }}>{rep.status}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'AI Assistant' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Offline AI Advisor Console</h3>
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
              )}

              {activeMenu === 'Settings' && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Sector Command Configuration</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span>Enable Sound Notification Alarms</span>
                      <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                    </label>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span>Direct GPS Tracking Broadcasts</span>
                      <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                    </label>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span>Poll Interval Rate</span>
                      <select style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }} defaultValue="5s">
                        <option>3s</option>
                        <option>5s</option>
                        <option>10s</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

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
          &copy; 2026 NagarVaani Election Management System &bull; Sector Officer Command Dashboard &bull; Version 2.0
        </footer>
      </main>
    </div>
  );
}
