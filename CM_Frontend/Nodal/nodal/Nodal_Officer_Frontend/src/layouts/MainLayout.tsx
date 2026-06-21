import React, { useState } from 'react';
import { useStore } from '../context/Store';
import {
  Brain, Users2, Clock, Layers, BarChart3, ThumbsDown,
  Network, FileBarChart, Share2, Flag, Bell, LogOut, UserCheck,
  ShieldCheck, RefreshCw, X, AlertTriangle, Activity, ChevronDown, ChevronRight,
  Send, Video, Lightbulb
} from 'lucide-react';

type Tab = 'SmartCategorisation' | 'RedressalAssignment' | 'SLACountdown' | 'BatchResolution'
         | 'PendencyMonitor' | 'PoorRatingAppeals' | 'RootCauseClusters' | 'MonthlyReport'
         | 'CrossDeptTicket' | 'PolicyRecommendation' | 'DirectMessages' | 'VideoCall';

const NAV_GROUPS = [
  {
    title: 'Categorisation Queue',
    items: [
      { id: 'SmartCategorisation' as Tab,  label: 'Smart Categorisation',       icon: Brain },
      { id: 'RedressalAssignment' as Tab,  label: 'Redressal Officer Assignment', icon: Users2 },
    ],
  },
  {
    title: 'SLA & Resolution',
    items: [
      { id: 'SLACountdown' as Tab,   label: 'SLA Countdown',    icon: Clock },
      { id: 'BatchResolution' as Tab, label: 'Batch Resolution', icon: Layers },
    ],
  },
  {
    title: 'Monitoring & Analysis',
    items: [
      { id: 'PendencyMonitor' as Tab,   label: 'Pendency Monitor',        icon: BarChart3 },
      { id: 'PoorRatingAppeals' as Tab, label: 'Poor-Rating Appeals',     icon: ThumbsDown },
      { id: 'RootCauseClusters' as Tab, label: 'Root Cause Clusters',     icon: Network },
      { id: 'MonthlyReport' as Tab,     label: 'Monthly Data Report',     icon: FileBarChart },
    ],
  },
  {
    title: 'Inter-Dept & Policy',
    items: [
      { id: 'CrossDeptTicket' as Tab,      label: 'Cross-Dept Shared Ticket',    icon: Share2 },
      { id: 'PolicyRecommendation' as Tab, label: 'Policy Recommendation Flag', icon: Lightbulb },
    ],
  },
  {
    title: 'Communications',
    items: [
      { id: 'DirectMessages' as Tab, label: 'Secure Inbox', icon: Send },
      { id: 'VideoCall' as Tab, label: 'Secure Video Call', icon: Video },
    ],
  },
];

const NOTIFICATIONS = [
  { id: 1, type: 'critical', text: '7 complaints uncategorised for more than 20 hours — action required', time: '09:45 AM', unread: true },
  { id: 2, type: 'warning',  text: '3 poor-rating appeals awaiting officer response', time: '08:30 AM', unread: true },
  { id: 3, type: 'info',     text: 'Monthly CPGRAMS report due in 3 days', time: '07:00 AM', unread: false },
];

interface Props { children: React.ReactNode; }

export const MainLayout: React.FC<Props> = ({ children }) => {
  const { activeTab, setActiveTab, currentUser, logoutUser } = useStore();
  const [showNotif, setShowNotif] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Categorisation Queue': true, 'SLA & Resolution': true, 'Monitoring & Analysis': true, 'Inter-Dept & Policy': true, 'Communications': true,
  });
  const unread = NOTIFICATIONS.filter(n => n.unread).length;

  const toggleGroup = (t: string) => setExpandedGroups(p => ({ ...p, [t]: !p[t] }));

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
              <div className="sidebar-brand-sub">Nodal Officer Portal</div>
            </div>
          </div>
          {currentUser && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-name">{currentUser.username}</div>
              <div className="sidebar-user-role">{currentUser.designation}</div>
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
          NagarVaani v2.0 · GNCT Delhi<br />
          CPGRAMS Compliant · IT Act, 2000
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
        <header className="main-header" style={{ position: 'relative' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="main-header-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Govt. of NCT of Delhi</span>
              <ChevronRight size={12} style={{ opacity: 0.45 }} />
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label ?? 'Nodal Operations'}
              </strong>
            </div>
          </div>
          <div className="main-header-right">
            <button className="header-notif-btn" onClick={() => window.location.reload()} title="Refresh">
              <RefreshCw size={17} />
            </button>
            <button className="header-notif-btn" onClick={() => setShowNotif(!showNotif)}>
              <Bell size={17} />
              {unread > 0 && <span className="header-notif-dot" />}
            </button>
            <div className="header-role-chip">
              <UserCheck size={15} />
              Nodal Officer
            </div>
            <button className="header-logout-btn" onClick={logoutUser}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>

          {showNotif && (
            <div className="notif-panel">
              <div className="notif-header">
                <span>Alerts & Notifications</span>
                <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                  <div className="notif-icon" style={{ background: n.type === 'critical' ? 'var(--status-escalated-bg)' : 'var(--status-active-bg)' }}>
                    {n.type === 'critical' ? <AlertTriangle size={15} color="#8B3A3A" /> : <Activity size={15} color="var(--primary)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.83rem' }}>{n.text}</div>
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
