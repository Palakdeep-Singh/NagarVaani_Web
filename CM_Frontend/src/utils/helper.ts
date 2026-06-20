import type { ComplaintStatus, ComplaintPriority, UserProfile } from '../types';


/** Human-readable role label used as the calling/messaging identity
 *  (e.g. "Chief Minister", "New Delhi DM", "Director of Education"). */
export const getRoleLabel = (user: UserProfile | null): string => {
  if (!user) return 'Unknown';
  if (user.role === 'Chief Minister') return 'Chief Minister';
  if (user.role === 'District Magistrate') return `${user.district} DM`;
  if (user.role === 'Department Head') {
    if (user.department === 'Education & Schools') return 'Director of Education';
    if (user.department === 'Public Health') return 'Director Health Services';
    if (user.department === 'PWD & Infrastructure') return 'Chief Engineer';
    return user.department || 'Department Head';
  }
  return user.role;
};


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


export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getStatusBadgeStyle = (status: ComplaintStatus): string => {
  switch (status) {
    case 'Pending':
      return 'bg-[var(--color-pending-bg)] text-[var(--color-pending-text)] border border-[var(--color-pending-border)]';
    case 'Active':
      return 'bg-[var(--color-active-bg)] text-[var(--color-active-text)] border border-[var(--color-active-border)]';
    case 'Resolved':
      return 'bg-[var(--color-resolved-bg)] text-[var(--color-resolved-text)] border border-[var(--color-resolved-border)]';
    case 'Escalated':
      return 'bg-[var(--color-escalated-bg)] text-[var(--color-escalated-text)] border border-[var(--color-escalated-border)] font-bold';
    default:
      return 'bg-[var(--color-pending-bg)] text-[var(--color-pending-text)] border border-[var(--color-pending-border)]';
  }
};


export const getPriorityBadgeStyle = (priority: ComplaintPriority): string => {
  switch (priority) {
    case 'Low':
      return 'bg-[var(--color-priority-low-bg)] text-[var(--color-priority-low-text)] border border-[var(--color-priority-low-border)]';
    case 'Medium':
      return 'bg-[var(--color-priority-medium-bg)] text-[var(--color-priority-medium-text)] border border-[var(--color-priority-medium-border)]';
    case 'High':
      return 'bg-[var(--color-priority-high-bg)] text-[var(--color-priority-high-text)] border border-[var(--color-priority-high-border)]';
    case 'Emergency':
      return 'bg-[var(--color-priority-emergency-bg)] text-[var(--color-priority-emergency-text)] border border-[var(--color-priority-emergency-border)] font-bold';
    default:
      return 'bg-[var(--color-priority-low-bg)] text-[var(--color-priority-low-text)] border border-[var(--color-priority-low-border)]';
  }
};


export const getFilePriorityStyle = (priority: 'Routine' | 'Urgent' | 'Immediate'): string => {
  switch (priority) {
    case 'Routine':
      return 'bg-[var(--color-pending-bg)] text-[var(--color-pending-text)] border border-[var(--color-pending-border)]';
    case 'Urgent':
      return 'bg-[var(--color-priority-high-bg)] text-[var(--color-priority-high-text)] border border-[var(--color-priority-high-border)]';
    case 'Immediate':
      return 'bg-[var(--color-priority-emergency-bg)] text-[var(--color-priority-emergency-text)] border border-[var(--color-priority-emergency-border)] font-bold';
  }
};
