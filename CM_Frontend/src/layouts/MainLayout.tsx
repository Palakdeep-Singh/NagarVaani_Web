import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Chatbot } from '../components/Chatbot';
import {
  LayoutDashboard, BarChart2, Award, BrainCircuit, Stethoscope,
  BookOpen, MapPin, Users2, CalendarCheck, DollarSign,
  MessageSquare, Video, Bell, UserCheck, Network,
  LogOut, ShieldCheck, AlertTriangle, RefreshCw,
  ChevronRight, ChevronDown, X, Activity,
  FileText, ClipboardList, UserPlus, Send, Clock,
  Brain, Layers, ThumbsDown, FileBarChart, Share2, Lightbulb, BarChart3,
  Map, CheckSquare, Landmark, Upload
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  badge?: number | string;
}

const CM_NAV_GROUPS = [
  {
    title: 'Command',
    items: [
      { id: 'Overview', label: 'Grievance Overview', icon: LayoutDashboard },
      { id: 'CitizenOverview', label: 'Citizen Overview', icon: BarChart3 },
      { id: 'CitizenComplaints', label: 'Citizen Complaints', icon: ClipboardList },
      { id: 'MilestonesDocuments', label: 'Milestones & Documents', icon: CheckSquare },
      { id: 'CitizenDistrictView', label: 'Citizen District View', icon: Map },
      { id: 'BoothAnalyser', label: 'Booth Analyser', icon: Landmark },
      { id: 'FundPredictor', label: 'Fund Predictor', icon: Award },
      { id: 'ManageAdmins', label: 'Manage Admins', icon: UserPlus },
      { id: 'OfficerCsvImport', label: 'Officer CSV Import', icon: Upload },
      { id: 'Analytics', label: 'Analytics & Trends', icon: BarChart2 },
      { id: 'Rankings', label: 'District Rankings', icon: Award },
      { id: 'Suggestions', label: 'AI Suggestions', icon: BrainCircuit },
    ] as SidebarItem[]
  },
  {
    title: 'Field Operations',
    items: [
      { id: 'DM View', label: 'DM Workspace', icon: MapPin },
      { id: 'Officers', label: 'Officer Directory', icon: Users2 },
      { id: 'KnowledgeGraph', label: 'Knowledge Graph', icon: Network },
    ] as SidebarItem[]
  },
  {
    title: 'Departments',
    items: [
      { id: 'Health', label: 'Health & FW', icon: Stethoscope },
      { id: 'Education', label: 'Education Dept.', icon: BookOpen },
    ] as SidebarItem[]
  },
  {
    title: 'Administration',
    items: [
      { id: 'Projects', label: 'Project Monitoring', icon: CalendarCheck },
      { id: 'Funds', label: 'Fund Allocation', icon: DollarSign },
    ] as SidebarItem[]
  },
  {
    title: 'Communications',
    items: [
      { id: 'Communications', label: 'Messaging', icon: MessageSquare },
      { id: 'VideoCall', label: 'Video Conference', icon: Video },
    ] as SidebarItem[]
  }
];

const DM_NAV_GROUPS = [
  {
    title: 'Daily Operations',
    items: [
      { id: 'ComplaintQueue', label: 'Complaint Queue', icon: LayoutDashboard },
      { id: 'KnowledgeGraph', label: 'Knowledge Graph', icon: Network },
      { id: 'OfficerAssignment', label: 'Officer Assignment', icon: Users2 },
      { id: 'EscalateSecretary', label: 'Escalate to Secretary', icon: AlertTriangle },
      { id: 'InterimReply', label: 'Interim Reply Tool', icon: MessageSquare },
    ] as SidebarItem[]
  },
  {
    title: 'Revenue & Field Work',
    items: [
      { id: 'RevenueCases', label: 'Revenue Case Tracker', icon: FileText },
      { id: 'SDMLoadView', label: 'SDM Load View', icon: BarChart3 },
    ] as SidebarItem[]
  },
  {
    title: 'Performance & RTI',
    items: [
      { id: 'DMScorecard', label: 'DM Scorecard', icon: ClipboardList },
      { id: 'NewComplaintIntake', label: 'New Complaint Intake', icon: UserPlus },
    ] as SidebarItem[]
  },
  {
    title: 'Communications',
    items: [
      { id: 'DMDirectMessages', label: 'Official Directives', icon: Send },
      { id: 'VideoCall', label: 'Secure Video Call', icon: Video },
    ] as SidebarItem[]
  }
];

const NODAL_NAV_GROUPS = [
  {
    title: 'Categorisation Queue',
    items: [
      { id: 'SmartCategorisation', label: 'Smart Categorisation', icon: Brain },
      { id: 'RedressalAssignment', label: 'Redressal Officer Assignment', icon: Users2 },
    ] as SidebarItem[]
  },
  {
    title: 'SLA & Resolution',
    items: [
      { id: 'SLACountdown', label: 'SLA Countdown', icon: Clock },
      { id: 'BatchResolution', label: 'Batch Resolution', icon: Layers },
    ] as SidebarItem[]
  },
  {
    title: 'Monitoring & Analysis',
    items: [
      { id: 'PendencyMonitor', label: 'Pendency Monitor', icon: BarChart3 },
      { id: 'PoorRatingAppeals', label: 'Poor-Rating Appeals', icon: ThumbsDown },
      { id: 'RootCauseClusters', label: 'Root Cause Clusters', icon: Network },
      { id: 'MonthlyReport', label: 'Monthly Data Report', icon: FileBarChart },
    ] as SidebarItem[]
  },
  {
    title: 'Inter-Dept & Policy',
    items: [
      { id: 'CrossDeptTicket', label: 'Cross-Dept Shared Ticket', icon: Share2 },
      { id: 'PolicyRecommendation', label: 'Policy Recommendation Flag', icon: Lightbulb },
    ] as SidebarItem[]
  },
  {
    title: 'Communications',
    items: [
      { id: 'NodalDirectMessages', label: 'Secure Inbox', icon: Send },
      { id: 'VideoCall', label: 'Secure Video Call', icon: Video },
    ] as SidebarItem[]
  }
];

const NOTIFICATIONS = [
  { id: 1, type: 'critical', text: '14 Emergency grievances unresolved > 48 hrs in North East Delhi', time: '09:42 AM', unread: true },
  { id: 2, type: 'warning',  text: 'PWD & Infrastructure SLA breach rate crossed 35% today', time: '08:15 AM', unread: true },
  { id: 3, type: 'warning',  text: 'South West Delhi: 8 complaints escalated — DM response pending', time: '07:30 AM', unread: true },
  { id: 4, type: 'info',     text: 'Scheduled report ready: Weekly Grievance Digest (19 Jun 2026)', time: '06:00 AM', unread: false },
  { id: 5, type: 'info',     text: 'System backup completed. Data integrity verified.', time: 'Yesterday', unread: false },
];

const ROLE_LABELS: Record<string, string> = {
  'Chief Minister': 'CM Office',
  'District Magistrate': 'DM Office',
  'Department Head': 'Dept. Head',
};

interface Props { children: React.ReactNode; }

export const MainLayout: React.FC<Props> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    activeDistrict,
    currentUser,
    logoutUser,
    toasts,
    dismissToast,
    unreadCounts,
    setActiveChatPartner
  } = useStore();
  const [showNotif, setShowNotif]   = useState(false);
  const [showAI, setShowAI]         = useState(false);
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  const totalUnreadCount = Object.values(unreadCounts).reduce((acc, val) => acc + val, 0);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    // CM
    'Command': true,
    'Field Operations': true,
    'Departments': true,
    'Administration': true,
    'Communications': true,
    // DM
    'Daily Operations': true,
    'Revenue & Field Work': true,
    'Performance & RTI': true,
    // Nodal
    'Categorisation Queue': true,
    'SLA & Resolution': true,
    'Monitoring & Analysis': true,
    'Inter-Dept & Policy': true,
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const getNavGroups = () => {
    switch (activeRole) {
      case 'District Magistrate':
        return DM_NAV_GROUPS;
      case 'Department Head':
        return NODAL_NAV_GROUPS;
      case 'Chief Minister':
      default:
        return CM_NAV_GROUPS;
    }
  };

  const currentNavGroups = getNavGroups();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface-page)' }}>
      
      <aside className="sidebar">
        
        <div className="tricolor-stripe" />

        
        <div className="sidebar-brand">
          <div className="sidebar-logo-row">
            <div className="sidebar-logo-icon">
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div>
              <div className="sidebar-brand-name">NagarVaani</div>
              <div className="sidebar-brand-sub">
                {activeRole === 'Chief Minister' && 'GNCT Delhi — CM Portal'}
                {activeRole === 'District Magistrate' && `DM Portal — ${activeDistrict}`}
                {activeRole === 'Department Head' && 'Nodal Officer Portal'}
              </div>
            </div>
          </div>
          
          {currentUser && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-name">{currentUser.username}</div>
              <div className="sidebar-user-role">
                {ROLE_LABELS[activeRole]}
                {activeRole === 'District Magistrate' && activeDistrict ? ` · ${activeDistrict}` : ''}
                {activeRole === 'Department Head' && currentUser.department ? ` · ${currentUser.department}` : ''}
              </div>
            </div>
          )}
        </div>

        
        <nav style={{ flex: 1, paddingBottom: 12 }}>
          {currentNavGroups.map(group => {
            const isExpanded = expandedGroups[group.title] !== false;
            
            return (
              <div key={group.title} className="mb-2">
                <div 
                  className="sidebar-section-label flex justify-between items-center cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleGroup(group.title)}
                >
                  {group.title}
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                
                {isExpanded && (
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const badgeValue = item.id === 'Communications' || item.id === 'DMDirectMessages' || item.id === 'NodalDirectMessages'
                        ? (totalUnreadCount > 0 ? totalUnreadCount : undefined)
                        : undefined;
                      return (
                        <div
                          key={item.id}
                          className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <item.icon size={17} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {badgeValue !== undefined && <span className="sidebar-badge">{badgeValue}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        
        <div className="sidebar-footer">
          {activeRole === 'Chief Minister' && (
            <>NagarVaani v2.0 · GNCT Delhi<br />Protected under IT Act, 2000</>
          )}
          {activeRole === 'District Magistrate' && (
            <>NagarVaani v2.0 · DM Office GNCT Delhi<br />DARPG Compliant · IT Act, 2000</>
          )}
          {activeRole === 'Department Head' && (
            <>NagarVaani v2.0 · GNCT Delhi<br />CPGRAMS Compliant · IT Act, 2000</>
          )}
        </div>
      </aside>

      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>

        
        <header className="main-header border-b border-slate-200 bg-white" style={{ position: 'relative', marginLeft: 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              className="main-header-breadcrumb text-slate-500"
              style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              <span className="font-semibold text-xs tracking-wider uppercase">Govt. of NCT of Delhi</span>
              <ChevronRight size={12} style={{ flexShrink: 0, opacity: 0.45 }} />
              <strong className="text-slate-900 text-sm">
                {currentNavGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || (
                  activeRole === 'District Magistrate' ? 'District Operations' :
                  activeRole === 'Department Head' ? 'Nodal Operations' : 'Executive Command Center'
                )}
              </strong>
            </div>
          </div>
          <div className="main-header-right">
            
            <button
              className="header-notif-btn"
              title="Refresh data"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={17} />
            </button>

            
            <button
              className="header-notif-btn"
              onClick={() => { setShowNotif(!showNotif); }}
              title="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="header-notif-dot" />}
            </button>

            
            <button
              className="gov-btn gov-btn-outline gov-btn-sm"
              onClick={() => setShowAI(!showAI)}
            >
              <BrainCircuit size={15} /> AI Assist
            </button>

            
            <div className="header-role-chip">
              <UserCheck size={15} />
              {activeRole === 'Chief Minister' && 'CM Office'}
              {activeRole === 'District Magistrate' && 'DM Office'}
              {activeRole === 'Department Head' && 'Nodal Officer'}
            </div>

            
            <button className="header-logout-btn" onClick={logoutUser}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>

          
          {showNotif && (
            <div className="notif-panel">
              <div className="notif-header">
                <span>System Alerts & Notifications</span>
                <button
                  onClick={() => setShowNotif(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                  <div className="notif-icon" style={{
                    background: n.type === 'critical' ? 'var(--status-escalated-bg)' : n.type === 'warning' ? 'var(--status-pending-bg)' : 'var(--status-active-bg)',
                  }}>
                    {n.type === 'critical' ? <AlertTriangle size={15} color="#8B3A3A" /> : n.type === 'warning' ? <Bell size={15} color="#9B8030" /> : <Activity size={15} color="var(--primary)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>{n.text}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{n.time}</div>
                  </div>
                  {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
              <div style={{ padding: '8px 16px', background: 'var(--surface-row-alt)', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                Alerts generated from live complaint data · Refresh every 5 min
              </div>
            </div>
          )}
        </header>

        
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 32px 32px 32px' }}>
          <div className="fade-in" style={{ maxWidth: 1600, margin: '0 auto', width: '100%' }}>{children}</div>
        </main>
      </div>

      
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item ${toast.exiting ? 'exiting' : ''}`}
            onClick={() => {
              setActiveTab('Communications');
              setActiveChatPartner(toast.senderRole);
              dismissToast(toast.id);
            }}
          >
            <div className="toast-icon-wrapper">
              <MessageSquare size={16} />
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.senderName}</div>
              <div className="toast-desc">{toast.content}</div>
            </div>
            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      
      {showAI && <Chatbot onClose={() => setShowAI(false)} />}
    </div>
  );
};
