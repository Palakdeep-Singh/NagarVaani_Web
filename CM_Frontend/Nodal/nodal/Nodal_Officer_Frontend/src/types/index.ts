// ─── Nodal Officer Dashboard Types ───────────────────────────────────────────

export type ComplaintStatus = 'Pending' | 'Active' | 'Resolved' | 'Escalated' | 'Reopened';
export type ComplaintPriority = 'Emergency' | 'High' | 'Medium' | 'Low';
export type ComplaintCategory =
  | 'Civic Infrastructure' | 'Water & Sewage' | 'Electricity & Power'
  | 'Public Health' | 'Education & Schools' | 'Revenue & Land'
  | 'Sanitation' | 'Noise Pollution' | 'Stray Animals';

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
  subCategory?: string;
  district: string;
  ward: string;
  locality: string;
  citizenName: string;
  citizenPhone: string;
  dateFiled: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedOfficer?: string;
  department: string;
  timeline: TimelineEvent[];
  aiSuggestedCategory?: string;
  aiSuggestedSubCategory?: string;
  citizenRating?: number; // 1-5 after resolution
  isReopen?: boolean;
  batchId?: string;
  crossDeptTicket?: boolean;
  slaDay: number; // days since filed
}

export interface RedressalOfficer {
  id: string;
  name: string;
  designation: string;
  department: string;
  pendingCount: number;
  resolvedThisMonth: number;
  avgResolutionDays: number;
  phone: string;
  available: boolean;
}

export interface RootCauseCluster {
  clusterId: string;
  ward: string;
  category: ComplaintCategory;
  complaintIds: string[];
  count: number;
  isSystemic: boolean;
  detectedOn: string;
  description: string;
}

export interface BatchGroup {
  batchId: string;
  locality: string;
  category: ComplaintCategory;
  complaintIds: string[];
  count: number;
  status: 'Open' | 'Order Issued' | 'Resolved';
  fieldOrderIssued?: string;
}

export interface MonthlyReportData {
  month: string;
  totalReceived: number;
  totalResolved: number;
  avgResolutionDays: number;
  slaBreachCount: number;
  citizenSatisfactionScore: number;
  cpgramsSubmitted: boolean;
}

export interface CrossDeptTicket {
  ticketId: string;
  complaintId: string;
  departments: string[];
  status: 'Open' | 'In Progress' | 'Resolved';
  createdOn: string;
  lastUpdated: string;
  actions: { dept: string; action: string; timestamp: string }[];
}
