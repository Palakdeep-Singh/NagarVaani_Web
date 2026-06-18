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

// Get badge style for Priority levels
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

// Get badge style for File Priorities
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
