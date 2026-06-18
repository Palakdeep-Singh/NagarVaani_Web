import React from 'react';
import { useStore } from '../context/Store';
import { Heatmap } from '../components/Heatmap';
import { ShieldAlert, CheckCircle2, Clock, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatINR } from '../utils/helper';

export const Overview: React.FC = () => {
  const { complaints, files, projects, activeRole, activeDistrict, activeDepartment } = useStore();

  const isDM = activeRole === 'District Magistrate';
  const isDept = activeRole === 'Department Head';

  // Calculations for top KPI cards
  const filteredComplaints = complaints.filter(c => {
    if (isDM) return c.district === activeDistrict;
    if (isDept) return c.department === activeDepartment;
    return true;
  });

  const totalCount = filteredComplaints.length;
  const resolvedCount = filteredComplaints.filter(c => c.status === 'Resolved').length;
  const resolutionPercentage = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  
  const emergencyCount = filteredComplaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;
  const pendingFilesCount = files.filter(f => {
    if (isDM) return f.currentOwner === `${activeDistrict} DM` && f.status === 'Pending Approval';
    if (isDept) return f.department === activeDepartment && f.status === 'Pending Approval';
    return f.status === 'Pending Approval';
  }).length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {activeRole === 'Chief Minister' ? 'CM Executive' : activeRole === 'District Magistrate' ? `${activeDistrict} DM` : 'Nodal Officer'} Grievance Overview
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Administrative command center for the {activeRole === 'Chief Minister' ? 'Office of the Delhi Chief Minister' : activeRole === 'District Magistrate' ? `${activeDistrict} Zone Office` : `${activeDepartment} Portfolio`}.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-right shadow-sm">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Portfolio Budget</span>
            <div className="text-base font-extrabold text-teal-600 mt-1">
              {formatINR(projects.reduce((acc, p) => acc + p.budgetAllocated, 0))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Case Intake */}
        <div className="bg-white p-5 rounded-2xl border-l-4 border-indigo-500 flex items-center justify-between shadow-sm border border-slate-200/60">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Total Intake Cases</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalCount}</h3>
            <span className="text-xs text-indigo-600 flex items-center gap-1 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" /> +15% from last week
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <ShieldAlert className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
 
        {/* Resolution Rate */}
        <div className="bg-white p-5 rounded-2xl border-l-4 border-emerald-500 flex items-center justify-between shadow-sm border border-slate-200/60">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Resolution SLA</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{resolutionPercentage}%</h3>
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> {resolvedCount} cases closed
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
 
        {/* Emergency Escalls */}
        <div className="bg-white p-5 rounded-2xl border-l-4 border-rose-500 flex items-center justify-between shadow-sm border border-slate-200/60">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Emergency Cases</span>
            <h3 className="text-2xl font-extrabold text-rose-600">{emergencyCount}</h3>
            <span className="text-xs text-rose-600 flex items-center gap-1 font-bold">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" /> Urgent Field Inspection
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
            <AlertTriangle className="h-6 w-6 text-rose-600 animate-bounce" />
          </div>
        </div>
 
        {/* E-File Approvals */}
        <div className="bg-white p-5 rounded-2xl border-l-4 border-amber-500 flex items-center justify-between shadow-sm border border-slate-200/60">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">E-File Approvals</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{pendingFilesCount}</h3>
            <span className="text-xs text-amber-600 flex items-center gap-1 font-semibold">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Signatures pending
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <FileText className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Grid: Delhi state map Heatmap */}
      <div className="w-full">
        <Heatmap />
      </div>
    </div>
  );
};
