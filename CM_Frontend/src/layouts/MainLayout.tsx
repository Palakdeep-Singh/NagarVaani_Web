import React, { useState } from 'react';
import { useStore } from '../context/Store';
import type { DistrictName } from '../types';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  FolderLock,
  CalendarCheck,
  MessageSquare,
  Users2,
  Menu,
  Bell,
  UserCheck,
  ChevronDown,
  Building,
  Award
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('Chief Minister' | 'District Magistrate' | 'Department Head')[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'Overview', label: 'CM Command Center', icon: LayoutDashboard, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
  { id: 'Departments', label: 'Health & Education', icon: Building2, roles: ['Chief Minister', 'Department Head'] },
  { id: 'DM View', label: 'DM Workbench', icon: MapPin, roles: ['Chief Minister', 'District Magistrate'] },
  { id: 'Files', label: 'Digital E-Office', icon: FolderLock, roles: ['Chief Minister', 'Department Head'] },
  { id: 'Projects', label: 'Capital Projects', icon: CalendarCheck, roles: ['Chief Minister', 'Department Head'] },
  { id: 'Communications', label: 'Internal Messages', icon: MessageSquare, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
  { id: 'Officers', label: 'Officer Accountability', icon: Users2, roles: ['Chief Minister', 'Department Head'] }
];

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeRole,
    setActiveRole,
    activeDistrict,
    setActiveDistrict,
    activeDepartment,
    setActiveDepartment,
    activeTab,
    setActiveTab,
    complaints,
    files
  } = useStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const districts: DistrictName[] = [
    'New Delhi', 'North Delhi', 'North West Delhi', 'West Delhi',
    'South West Delhi', 'South Delhi', 'South East Delhi', 'Central Delhi',
    'East Delhi', 'Shahdara', 'North East Delhi'
  ];

  // Derive notifications
  const pendingFilesCount = files.filter(f => f.currentOwner === (activeRole === 'Chief Minister' ? 'Chief Minister' : activeDepartment) && f.status === 'Pending Approval').length;
  const emergencyComplaintsCount = complaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;

  const notifications = [
    ...(pendingFilesCount > 0 ? [`${pendingFilesCount} E-Files pending your authorization sign-off.`] : []),
    ...(emergencyComplaintsCount > 0 ? [`CRITICAL: ${emergencyComplaintsCount} emergency grievances registered.`] : []),
    "District rankings updated. Shahdara DM flagged for SLA delays.",
    "Monsoon drainage readiness briefing scheduled for 3:00 PM."
  ];

  const filteredSidebarItems = SIDEBAR_ITEMS.filter(item => item.roles.includes(activeRole));

  return (
    <div className="min-h-screen flex bg-[#070b13] text-slate-100 overflow-x-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-900/10 blur-[130px] pointer-events-none" />

      {/* SIDEBAR */}
      <aside
        className={`glass-panel border-r border-slate-800/80 flex flex-col transition-all duration-300 z-30 shrink-0 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-extrabold text-lg">
            N
          </div>
          {sidebarOpen && (
            <div className="leading-none">
              <span className="text-sm font-extrabold bg-gradient-to-r from-white via-indigo-200 to-teal-400 bg-clip-text text-transparent tracking-wide">
                NAGARVAANI
              </span>
              <div className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                Delhi CM Dashboard
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {filteredSidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/80 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Active Session Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400 uppercase">
              {activeRole[0]}
            </div>
            {sidebarOpen && (
              <div className="leading-none overflow-hidden">
                <div className="text-xs font-extrabold text-white truncate">{activeRole}</div>
                <div className="text-[9px] text-slate-400 mt-1 truncate">
                  {activeRole === 'District Magistrate' && `Zone: ${activeDistrict}`}
                  {activeRole === 'Department Head' && `Dept: ${activeDepartment}`}
                  {activeRole === 'Chief Minister' && 'Office of Delhi CM'}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* NAVBAR */}
        <header className="h-16 border-b border-slate-800/80 flex items-center justify-between px-6 bg-[#070b13]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-900 border border-slate-800/60 transition-colors cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            
            {/* Title / Clock */}
            <div className="hidden md:flex items-center gap-3 border-l border-slate-800 pl-4">
              <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gov Network Active
              </span>
              <span className="text-xs text-slate-400 font-semibold font-mono">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="flex items-center gap-3">
            {/* Context Dropdown triggers */}
            {activeRole === 'District Magistrate' && (
              <div className="relative">
                <select
                  value={activeDistrict}
                  onChange={(e) => setActiveDistrict(e.target.value as DistrictName)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                >
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            )}

            {activeRole === 'Department Head' && (
              <div className="relative">
                <select
                  value={activeDepartment}
                  onChange={(e) => setActiveDepartment(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                >
                  <option value="Health & Family Welfare">Health Department</option>
                  <option value="Education Department">Education Department</option>
                  <option value="PWD & Infrastructure">PWD Department</option>
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setShowRoleMenu(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800 hover:bg-slate-800/80 transition-all cursor-pointer relative"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <Bell className="h-3.5 w-3.5 text-indigo-400" /> Administrative Alerts
                  </h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="text-[11px] leading-relaxed text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/40">
                        {notif}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowNotificationMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 bg-slate-900/80 text-xs font-semibold text-slate-200 hover:bg-slate-800/60 transition-all cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-indigo-400" />
                <span className="hidden sm:inline">Role: {activeRole}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Access Portal Switcher
                  </div>
                  <div className="p-1.5 space-y-1">
                    <button
                      onClick={() => {
                        setActiveRole('Chief Minister');
                        setActiveTab('Overview');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                        activeRole === 'Chief Minister' ? 'bg-indigo-600/20 text-indigo-300 font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <Award className="h-4 w-4 text-indigo-400" />
                      Chief Minister (Office)
                    </button>
                    <button
                      onClick={() => {
                        setActiveRole('District Magistrate');
                        setActiveTab('DM View');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                        activeRole === 'District Magistrate' ? 'bg-indigo-600/20 text-indigo-300 font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <MapPin className="h-4 w-4 text-teal-400" />
                      District Magistrate (DM)
                    </button>
                    <button
                      onClick={() => {
                        setActiveRole('Department Head');
                        setActiveTab('Departments');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                        activeRole === 'Department Head' ? 'bg-indigo-600/20 text-indigo-300 font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <Building className="h-4 w-4 text-amber-400" />
                      Department Nodal Officer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE PANEL SPACE */}
        <main className="flex-1 p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
