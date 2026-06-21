// ─── DM Dashboard Types ───────────────────────────────────────────────────────

export type ComplaintStatus = 'Pending' | 'Active' | 'Resolved' | 'Escalated';
export type ComplaintPriority = 'Emergency' | 'High' | 'Medium' | 'Low';
export type ComplaintCategory =
  | 'Civic Infrastructure' | 'Water & Sewage' | 'Electricity & Power'
  | 'Public Health' | 'Education & Schools' | 'Revenue & Land'
  | 'Law & Order' | 'Sanitation';

export interface TimelineEvent {
  date: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  district: string;
  ward: string;
  citizenName: string;
  citizenPhone: string;
  dateFiled: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedSDM?: string;
  assignedOfficer?: string;
  department: string;
  timeline: TimelineEvent[];
  interimSent?: boolean;
  slaDay?: number;
}

export interface SDMOfficer {
  id: string;
  name: string;
  designation: string;
  zone: string;
  pendingCount: number;
  resolvedThisMonth: number;
  avgResolutionDays: number;
  phone: string;
  available: boolean;
}

export interface RevenueCase {
  id: string;
  caseType: 'Land Dispute' | 'Property Mutation' | 'Registration' | 'Encroachment';
  parties: string;
  ward: string;
  filedDate: string;
  statutoryDeadline: string;
  status: 'Hearing Scheduled' | 'Evidence Collection' | 'Order Pending' | 'Disposed';
  assignedPatwari: string;
  daysToDeadline: number;
}

export interface DMAuditLog {
  id: string;
  action: string;
  officer: string;
  timestamp: string;
  complaintId?: string;
  details: string;
}

export interface WalkInComplaint {
  citizenName: string;
  citizenPhone: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  ward: string;
  description: string;
}
