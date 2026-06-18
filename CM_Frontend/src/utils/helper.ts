import type { ComplaintStatus, ComplaintPriority } from '../types';

// Format currency into Indian Rupees (Crores and Lakhs)
export const formatINR = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

// Format date string for citizen eyes
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Get badge style for Complaint Status
export const getStatusBadgeStyle = (status: ComplaintStatus): string => {
  switch (status) {
    case 'Pending':
      return 'bg-slate-800 text-slate-300 border border-slate-700';
    case 'Active':
      return 'bg-blue-900/40 text-blue-300 border border-blue-700/50 animate-pulse';
    case 'Resolved':
      return 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30';
    case 'Escalated':
      return 'bg-rose-950/60 text-rose-400 border border-rose-500/30 font-bold';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
};

// Get badge style for Priority levels
export const getPriorityBadgeStyle = (priority: ComplaintPriority): string => {
  switch (priority) {
    case 'Low':
      return 'bg-slate-800 text-slate-400 border border-slate-700';
    case 'Medium':
      return 'bg-teal-950/40 text-teal-400 border border-teal-500/20';
    case 'High':
      return 'bg-amber-950/40 text-amber-400 border border-amber-500/25';
    case 'Emergency':
      return 'bg-rose-950/50 text-rose-400 border border-rose-500/30 font-extrabold animate-bounce';
    default:
      return 'bg-slate-800 text-slate-400 border border-slate-700';
  }
};

// Get badge style for File Priorities
export const getFilePriorityStyle = (priority: 'Routine' | 'Urgent' | 'Immediate'): string => {
  switch (priority) {
    case 'Routine':
      return 'bg-slate-800 text-slate-300 border border-slate-700';
    case 'Urgent':
      return 'bg-amber-950/40 text-amber-400 border border-amber-500/20';
    case 'Immediate':
      return 'bg-rose-950/60 text-rose-400 border border-rose-500/30 font-bold';
  }
};
