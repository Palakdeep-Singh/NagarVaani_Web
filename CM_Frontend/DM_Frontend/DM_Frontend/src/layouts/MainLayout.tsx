import React, { useState } from 'react';
import { useStore } from '../context/Store';
import {
  LayoutDashboard, Users2, AlertTriangle, MessageSquare, FileText,
  BarChart3, ClipboardList, UserPlus, Bell, LogOut, UserCheck,
  ShieldCheck, RefreshCw, X, Activity, ChevronDown, ChevronRight, Network, Send, Video
} from 'lucide-react';

type Tab = 'ComplaintQueue' | 'KnowledgeGraph' | 'OfficerAssignment' | 'EscalateSecretary' | 'InterimReply'
         | 'RevenueCases' | 'SDMLoadView' | 'DMScorecard' | 'NewComplaintIntake'
         | 'DirectMessages' | 'VideoCall';

const NAV_GROUPS = [
  {
    title: 'Daily Operations',
    items: [
      { id: 'ComplaintQueue' as Tab,    label: 'Complaint Queue',        icon: LayoutDashboard },
      { id: 'KnowledgeGraph' as Tab,    label: 'Knowledge Graph',        icon: Network },
      { id: 'OfficerAssignment' as Tab, label: 'Officer Assignment',     icon: Users2 },
      { id: 'EscalateSecretary' as Tab, label: 'Escalate to Secretary',  icon: AlertTriangle },
      { id: 'InterimReply' as Tab,      label: 'Interim Reply Tool',     icon: MessageSquare },
    ],
  },
  {
    title: 'Revenue & Field Work',
    items: [
      { id: 'RevenueCases' as Tab, label: 'Revenue Case Tracker', icon: FileText },
      { id: 'SDMLoadView' as Tab,  label: 'SDM Load View',        icon: BarChart3 },
    ],
  },
  {
    title: 'Performance & RTI',
    items: [
      { id: 'DMScorecard' as Tab,        label: 'DM Scorecard',        icon: ClipboardList },
      { id: 'NewComplaintIntake' as Tab, label: 'New Complaint Intake', icon: UserPlus },
    ],
  },
  {
    title: 'Communications',
    items: [
      { id: 'DirectMessages' as Tab, label: 'Official Directives', icon: Send },
      { id: 'VideoCall' as Tab, label: 'Secure Video Call', icon: Video },
    ]
  }
];

const NOTIFICATIONS = [
  { id: 1, type: 'critical', text: '3 complaints have breached 21-day SLA — escalation required', time: '09:42 AM', unread: true },
  { id: 2, type: 'warning',  text: 'SDM Priya Sharma has 18 pending cases — consider rebalancing', time: '08:15 AM', unread: true },
  { id: 3, type: 'critical', text: 'Revenue Case RC-2026-001 is 5 days past statutory deadline', time: '07:30 AM', unread: true },
  { id: 4, type: 'info',     text: 'Weekly grievance digest ready for review', time: '06:00 AM', unread: false },
];

interface Props { children: React.ReactNode; }

export const MainLayout: React.FC<Props> = ({ children }) => {
  const { activeTab, setActiveTab, currentUser, logoutUser } = useStore();
  const [showNotif, setShowNotif] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Daily Operations': true, 'Revenue & Field Work': true, 'Performance & RTI': true, 'Communications': true
  });
  const unread = NOTIFICATIONS.filter(n => n.unread).length;

  const toggleGroup = (t: string) => setExpandedGroups(p => ({ ...p, [t]: !p[t] }));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface-page)' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="tricolor-stripe" />
        <div className="sidebar-brand">
          <div className="sidebar-logo-row">
            <div className="sidebar-logo-icon">
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div>
              <div className="sidebar-brand-name">NagarVaani</div>
              <div className="sidebar-brand-sub">DM Portal — Shahdara</div>
            </div>
          </div>
          {currentUser && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-name">{currentUser.username}</div>
              <div className="sidebar-user-role">{currentUser.designation} · {currentUser.district}</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, paddingBottom: 12 }}>
          {NAV_GROUPS.map(group => {
            const isExpanded = expandedGroups[group.title];
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
                  <div>
                    {group.items.map(item => (
                      <div
                        key={item.id}
                        className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <item.icon size={17} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          NagarVaani v2.0 · DM Office GNCT Delhi<br />
          DARPG Compliant · IT Act, 2000
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
        <header className="main-header" style={{ position: 'relative' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="main-header-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Govt. of NCT of Delhi</span>
              <ChevronRight size={12} style={{ opacity: 0.45 }} />
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label ?? 'District Operations'}
              </strong>
            </div>
          </div>
          <div className="main-header-right">
            <button className="header-notif-btn" onClick={() => window.location.reload()} title="Refresh">
              <RefreshCw size={17} />
            </button>
            <button className="header-notif-btn" onClick={() => setShowNotif(!showNotif)} title="Notifications">
              <Bell size={17} />
              {unread > 0 && <span className="header-notif-dot" />}
            </button>
            <div className="header-role-chip">
              <UserCheck size={15} />
              DM Office
            </div>
            <button className="header-logout-btn" onClick={logoutUser}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>

          {showNotif && (
            <div className="notif-panel">
              <div className="notif-header">
                <span>System Alerts</span>
                <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                  <div className="notif-icon" style={{ background: n.type === 'critical' ? 'var(--status-escalated-bg)' : n.type === 'warning' ? 'var(--status-pending-bg)' : 'var(--status-active-bg)' }}>
                    {n.type === 'critical' ? <AlertTriangle size={15} color="#8B3A3A" /> : <Activity size={15} color="var(--primary)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-primary)' }}>{n.text}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{n.time}</div>
                  </div>
                  {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />}
                </div>
              ))}
            </div>
          )}
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 32px 32px' }}>
          <div className="fade-in" style={{ maxWidth: 1600, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
