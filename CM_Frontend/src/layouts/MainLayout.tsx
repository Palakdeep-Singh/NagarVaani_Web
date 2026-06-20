import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Chatbot } from '../components/Chatbot';
import {
  LayoutDashboard, BarChart2, Award, BrainCircuit, Stethoscope,
  BookOpen, MapPin, Users2, CalendarCheck, DollarSign, FolderLock,
  MessageSquare, Video, Bell, UserCheck, Network,
  LogOut, ShieldCheck, AlertTriangle, RefreshCw,
  ChevronRight, X, Activity
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  badge?: number | string;
  roles: ('Chief Minister' | 'District Magistrate' | 'Department Head')[];
}

const NAV_GROUPS = [
  {
    title: 'Command',
    items: [
      { id: 'Overview',    label: 'Grievance Overview',  icon: LayoutDashboard, roles: ['Chief Minister','District Magistrate','Department Head'] },
      { id: 'Analytics',  label: 'Analytics & Trends',  icon: BarChart2,        roles: ['Chief Minister','District Magistrate','Department Head'] },
      { id: 'Rankings',   label: 'District Rankings',   icon: Award,            roles: ['Chief Minister','District Magistrate'] },
      { id: 'Suggestions',label: 'AI Suggestions',      icon: BrainCircuit,     roles: ['Chief Minister','District Magistrate','Department Head'] },
    ] as SidebarItem[],
  },
  {
    title: 'Field Operations',
    items: [
      { id: 'DM View',    label: 'DM Workspace',        icon: MapPin,           roles: ['Chief Minister','District Magistrate'] },
      { id: 'Officers',   label: 'Officer Directory',   icon: Users2,           roles: ['Chief Minister','District Magistrate','Department Head'] },
      { id: 'KnowledgeGraph', label: 'Knowledge Graph', icon: Network,          roles: ['Chief Minister','District Magistrate','Department Head'] },
    ] as SidebarItem[],
  },
  {
    title: 'Departments',
    items: [
      { id: 'Health',     label: 'Health & FW',         icon: Stethoscope,      roles: ['Chief Minister','Department Head'] },
      { id: 'Education',  label: 'Education Dept.',     icon: BookOpen,         roles: ['Chief Minister','Department Head'] },
    ] as SidebarItem[],
  },
  {
    title: 'Administration',
    items: [
      { id: 'Projects',   label: 'Project Monitoring',  icon: CalendarCheck,    roles: ['Chief Minister','District Magistrate','Department Head'] },
      { id: 'Funds',      label: 'Fund Allocation',     icon: DollarSign,       roles: ['Chief Minister'] },
      { id: 'Files',      label: 'E-File Management',   icon: FolderLock,       roles: ['Chief Minister','District Magistrate','Department Head'] },
    ] as SidebarItem[],
  },
  {
    title: 'Communications',
    items: [
      { id: 'Communications', label: 'Messaging',        icon: MessageSquare,    roles: ['Chief Minister','District Magistrate','Department Head'] },
      { id: 'VideoCall',      label: 'Video Conference',  icon: Video,            roles: ['Chief Minister','District Magistrate','Department Head'] },
    ] as SidebarItem[],
  },
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
  const { activeTab, setActiveTab, activeRole, activeDistrict, currentUser, logoutUser } = useStore();
  const [showNotif, setShowNotif]   = useState(false);
  const [showAI, setShowAI]         = useState(false);
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface-page)' }}>
      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Tricolor top stripe */}
        <div className="tricolor-stripe" />

        {/* Brand block */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-row">
            <div className="sidebar-logo-icon">
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div>
              <div className="sidebar-brand-name">NagarVaani</div>
              <div className="sidebar-brand-sub">GNCT Delhi — CM Portal</div>
            </div>
          </div>
          {/* Logged-in user info */}
          {currentUser && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-name">{currentUser.username}</div>
              <div className="sidebar-user-role">
                {ROLE_LABELS[activeRole]}{activeDistrict && activeRole !== 'Chief Minister' ? ` · ${activeDistrict}` : ''}
              </div>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, paddingBottom: 12 }}>
          {NAV_GROUPS.map(group => {
            const visible = group.items.filter(i => i.roles.includes(activeRole as any));
            if (visible.length === 0) return null;
            return (
              <div key={group.title}>
                <div className="sidebar-section-label">{group.title}</div>
                {visible.map(item => (
                  <div
                    key={item.id}
                    className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon size={17} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Bottom: compliance note */}
        <div className="sidebar-footer">
          NagarVaani v2.0 · GNCT Delhi<br />
          Protected under IT Act, 2000
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Main header */}
        <header className="main-header" style={{ position: 'relative' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              className="main-header-breadcrumb"
              style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              <span>Govt. of NCT of Delhi</span>
              <ChevronRight size={12} style={{ flexShrink: 0, opacity: 0.45 }} />
              <strong>
                {activeTab && activeTab !== 'Overview' ? (activeTab === 'KnowledgeGraph' ? 'Knowledge Graph' : activeTab.replace(/([A-Z])/g, ' $1').trim()) : 'CM Executive Dashboard'}
              </strong>
            </div>
          </div>
          <div className="main-header-right">
            {/* Refresh */}
            <button
              className="header-notif-btn"
              title="Refresh data"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={17} />
            </button>

            {/* Notifications */}
            <button
              className="header-notif-btn"
              onClick={() => { setShowNotif(!showNotif); }}
              title="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="header-notif-dot" />}
            </button>

            {/* AI assistant */}
            <button
              className="gov-btn gov-btn-outline gov-btn-sm"
              onClick={() => setShowAI(!showAI)}
            >
              <BrainCircuit size={15} /> AI Assist
            </button>

            {/* Role chip */}
            <div className="header-role-chip">
              <UserCheck size={15} />
              {ROLE_LABELS[activeRole]}
            </div>

            {/* Logout */}
            <button className="header-logout-btn" onClick={logoutUser}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>

          {/* Notification dropdown */}
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

        {/* Main scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div className="fade-in">{children}</div>
        </main>
      </div>

      {/* AI Chatbot */}
      {showAI && <Chatbot onClose={() => setShowAI(false)} />}
    </div>
  );
};
