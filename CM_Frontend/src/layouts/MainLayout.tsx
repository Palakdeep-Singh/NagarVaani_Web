import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Chatbot } from '../components/Chatbot';
import {
  LayoutDashboard,
  BarChart2,
  Award,
  BrainCircuit,
  Stethoscope,
  BookOpen,
  MapPin,
  Users2,
  CalendarCheck,
  DollarSign,
  FolderLock,
  MessageSquare,
  Video,
  Menu,
  Bell,
  UserCheck,
  Building,
  Bot
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('Chief Minister' | 'District Magistrate' | 'Department Head')[];
}

// Grouped navigation layout to de-clutter the interface
const NAV_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { id: 'Overview', label: 'Overview Map', icon: LayoutDashboard, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
      { id: 'Analytics', label: 'Analytics Graphs', icon: BarChart2, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
      { id: 'Rankings', label: 'District Rankings', icon: Award, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
      { id: 'Suggestions', label: 'AI Suggestions', icon: BrainCircuit, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] }
    ] as SidebarItem[]
  },
  {
    title: 'Departments',
    items: [
      { id: 'Health', label: 'Health Department', icon: Stethoscope, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
      { id: 'Education', label: 'Education Department', icon: BookOpen, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] }
    ] as SidebarItem[]
  },
  {
    title: 'Workspaces',
    items: [
      { id: 'DM View', label: 'DM Workspace', icon: MapPin, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
      { id: 'Officers', label: 'Officer Directory', icon: Users2, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] }
    ] as SidebarItem[]
  },
  {
    title: 'Administration',
    items: [
      { id: 'Projects', label: 'Project Monitoring', icon: CalendarCheck, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
      { id: 'Funds', label: 'Fund Allocation', icon: DollarSign, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
      { id: 'Files', label: 'File Management', icon: FolderLock, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] }
    ] as SidebarItem[]
  },
  {
    title: 'Communications',
    items: [
      { id: 'Communications', label: 'Internal Chat', icon: MessageSquare, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] },
      { id: 'VideoCall', label: 'Video Call Room', icon: Video, roles: ['Chief Minister', 'District Magistrate', 'Department Head'] }
    ] as SidebarItem[]
  }
];

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeRole,
    activeDistrict,
    activeDepartment,
    activeTab,
    setActiveTab,
    complaints,
    files,
    currentUser,
    logoutUser,
    showAIPanel,
    setShowAIPanel
  } = useStore();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Derive notifications count for light badge
  const pendingFilesCount = files.filter(
    f => f.currentOwner === (activeRole === 'Chief Minister' ? 'Chief Minister' : activeDepartment) && 
    f.status === 'Pending Approval'
  ).length;
  
  const emergencyComplaintsCount = complaints.filter(
    c => c.priority === 'Emergency' && c.status !== 'Resolved'
  ).length;

  const notifications = [
    ...(pendingFilesCount > 0 ? [`${pendingFilesCount} E-Files pending signature.`] : []),
    ...(emergencyComplaintsCount > 0 ? [`CRITICAL: ${emergencyComplaintsCount} emergencies registered.`] : []),
    "District rankings updated. Shahdara DM flagged for SLA delays.",
    "Monsoon drainage readiness briefing scheduled for 3:00 PM."
  ];

  return (
    <div className="h-screen overflow-hidden flex bg-slate-50 text-slate-800 relative w-screen font-sans">
      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/35 z-35 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* SIDEBAR */}
      <aside
        className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-40 shrink-0 h-full overflow-hidden fixed md:relative inset-y-0 left-0 md:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0 w-64 shadow-xl md:shadow-none'
            : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200 gap-3 bg-white">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/10 text-white font-extrabold text-lg">
            N
          </div>
          {sidebarOpen && (
            <div className="leading-none">
              <span className="text-sm font-extrabold text-slate-800 tracking-wide">
                NAGARVAANI
              </span>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">
                Delhi CM Dashboard
              </div>
            </div>
          )}
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto bg-white">
          {NAV_GROUPS.map((group, gIdx) => {
            const visibleItems = group.items.filter(item => {
              if (!item.roles.includes(activeRole)) return false;
              // Lock Department Head portfolio command centers
              if (currentUser?.role === 'Department Head') {
                if (item.id === 'Health' && currentUser.department !== 'Public Health') return false;
                if (item.id === 'Education' && currentUser.department !== 'Education & Schools') return false;
              }
              return true;
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {sidebarOpen && (
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-widest px-4 block mb-1.5">
                    {group.title}
                  </span>
                )}
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}`} />
                      {sidebarOpen && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-indigo-600 uppercase">
              {activeRole[0]}
            </div>
            {sidebarOpen && (
              <div className="leading-none overflow-hidden">
                <div className="text-xs font-extrabold text-slate-800 truncate">{activeRole}</div>
                <div className="text-xs text-slate-500 mt-1 truncate">
                  {activeRole === 'District Magistrate' && `Zone: ${activeDistrict}`}
                  {activeRole === 'Department Head' && `Dept: ${activeDepartment.split(' ')[0]}`}
                  {activeRole === 'Chief Minister' && 'Delhi Govt Executive'}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* NAVBAR */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            
            <div className="hidden md:flex items-center gap-3 border-l border-slate-200 pl-4">
              <span className="text-xs text-slate-500 font-semibold">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right Menu Controls */}
          <div className="flex items-center gap-2.5">
            {/* NagarVaani AI Side Panel Toggle */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100/50 transition-all cursor-pointer shadow-sm"
              title="Open NagarVaani AI"
            >
              <Bot className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">NagarVaani AI</span>
            </button>

            {/* DM Context Selector - LOCKED */}
            {activeRole === 'District Magistrate' && (
              <div className="bg-slate-50 border border-slate-200 text-xs text-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>Zone: {activeDistrict}</span>
              </div>
            )}

            {/* Department Head Context Selector - LOCKED */}
            {activeRole === 'Department Head' && (
              <div className="bg-slate-50 border border-slate-200 text-xs text-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                <Building className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Dept: {activeDepartment === 'Public Health' ? 'Health' : activeDepartment === 'Education & Schools' ? 'Education' : 'PWD'}</span>
              </div>
            )}

            {/* Notifications Alert Center */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-all cursor-pointer relative shadow-sm"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600" />
                )}
              </button>

              {showNotificationMenu && (
                <>
                  {/* Transparent backdrop for click-outside dismissal */}
                  <div
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setShowNotificationMenu(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Bell className="h-3.5 w-3.5 text-indigo-600" /> Administrative Alerts
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map((notif, idx) => (
                        <div key={idx} className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {notif}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout Trigger Button */}
            <button
              onClick={() => logoutUser()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50 text-xs font-bold text-slate-700 hover:text-rose-600 transition-all cursor-pointer shadow-sm"
              title="Log Out Session"
            >
              <UserCheck className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* CONTAINER SCROLL SPACE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          {children}
        </main>
      </div>

      <Chatbot />
    </div>
  );
};
