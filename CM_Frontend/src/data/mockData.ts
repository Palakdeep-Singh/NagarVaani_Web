import type {
  Complaint,
  SDMOfficer,
  RevenueCase,
  RedressalOfficer,
  RootCauseCluster,
  BatchGroup,
  MonthlyReportData,
  CrossDeptTicket
} from '../types';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ── SDM Officers ──────────────────────────────────────────────────────────────
export const MOCK_SDM_OFFICERS: SDMOfficer[] = [
  { id: 'SDM001', name: 'Priya Sharma', designation: 'SDM Zone A', zone: 'Shahdara North', pendingCount: 18, resolvedThisMonth: 42, avgResolutionDays: 8.2, phone: '011-23890001', available: true },
  { id: 'SDM002', name: 'Aman Verma', designation: 'SDM Zone B', zone: 'Shahdara Central', pendingCount: 9, resolvedThisMonth: 56, avgResolutionDays: 6.1, phone: '011-23890002', available: true },
  { id: 'SDM003', name: 'Kavita Mehra', designation: 'SDM Zone C', zone: 'Shahdara South', pendingCount: 14, resolvedThisMonth: 38, avgResolutionDays: 9.5, phone: '011-23890003', available: false },
  { id: 'SDM004', name: 'Sunil Pandey', designation: 'SDM Zone D', zone: 'Shahdara East', pendingCount: 6, resolvedThisMonth: 61, avgResolutionDays: 5.3, phone: '011-23890004', available: true },
];

// ── Revenue Cases ─────────────────────────────────────────────────────────────
export const MOCK_REVENUE_CASES: RevenueCase[] = [
  { id: 'RC-2026-001', caseType: 'Land Dispute', parties: 'Sharma vs. Municipal Board', ward: 'Ward 48', filedDate: daysAgo(45), statutoryDeadline: daysAgo(-5), status: 'Hearing Scheduled', assignedPatwari: 'Rakesh Tiwari', daysToDeadline: -5 },
  { id: 'RC-2026-002', caseType: 'Property Mutation', parties: 'Gupta Estate Transfer', ward: 'Ward 52', filedDate: daysAgo(30), statutoryDeadline: daysAgo(10), status: 'Evidence Collection', assignedPatwari: 'Sanjay Kumar', daysToDeadline: 10 },
  { id: 'RC-2026-003', caseType: 'Registration', parties: 'Sale Deed — Plot 45/B', ward: 'Ward 60', filedDate: daysAgo(15), statutoryDeadline: daysAgo(15), status: 'Order Pending', assignedPatwari: 'Rakesh Tiwari', daysToDeadline: 15 },
  { id: 'RC-2026-004', caseType: 'Encroachment', parties: 'DDA Govt Land Encroachment', ward: 'Ward 53', filedDate: daysAgo(7), statutoryDeadline: daysAgo(23), status: 'Evidence Collection', assignedPatwari: 'Meena Devi', daysToDeadline: 23 },
  { id: 'RC-2026-005', caseType: 'Land Dispute', parties: 'Verma vs. Singh (Agricultural)', ward: 'Ward 61', filedDate: daysAgo(60), statutoryDeadline: daysAgo(-15), status: 'Hearing Scheduled', assignedPatwari: 'Sanjay Kumar', daysToDeadline: -15 },
  { id: 'RC-2026-006', caseType: 'Property Mutation', parties: 'Khan Family Inheritance', ward: 'Ward 55', filedDate: daysAgo(22), statutoryDeadline: daysAgo(8), status: 'Order Pending', assignedPatwari: 'Meena Devi', daysToDeadline: 8 },
];

export const DM_SCORECARD_DATA = {
  resolutionRate: 73.4,
  avgResolutionDays: 7.8,
  slaBreachPct: 12.3,
  citizenSatisfactionScore: 4.1,
  rtiRequestsFiled: 24,
  rtiDisposed: 21,
  escalationsThisMonth: 8,
  interimRepliesSent: 34,
};

// ── Nodal Officers ─────────────────────────────────────────────────────────────
export const MOCK_OFFICERS: RedressalOfficer[] = [
  { id: 'OFF001', name: 'Ramesh Chandra', designation: 'Field Officer Grade A', department: 'Delhi Jal Board', pendingCount: 12, resolvedThisMonth: 34, avgResolutionDays: 7.2, phone: '9876500001', available: true },
  { id: 'OFF002', name: 'Priya Nair', designation: 'Field Officer Grade A', department: 'PWD & Infrastructure', pendingCount: 8, resolvedThisMonth: 48, avgResolutionDays: 5.8, phone: '9876500002', available: true },
  { id: 'OFF003', name: 'Vikram Soni', designation: 'Field Officer Grade B', department: 'Power Department', pendingCount: 15, resolvedThisMonth: 29, avgResolutionDays: 9.1, phone: '9876500003', available: false },
  { id: 'OFF004', name: 'Kaveri Patel', designation: 'Field Officer Grade A', department: 'Health & Family Welfare', pendingCount: 5, resolvedThisMonth: 51, avgResolutionDays: 4.9, phone: '9876500004', available: true },
  { id: 'OFF005', name: 'Dinesh Rao', designation: 'Field Officer Grade B', department: 'Municipal Corporation', pendingCount: 18, resolvedThisMonth: 22, avgResolutionDays: 11.4, phone: '9876500005', available: true },
];

// ── Nodal Root Causes ──────────────────────────────────────────────────────────
export const MOCK_ROOT_CLUSTERS: RootCauseCluster[] = [
  { clusterId: 'RC-W48-WS', ward: 'Ward 48', category: 'Water & Sewage', complaintIds: ['GR-2026-0042', 'GR-2026-0043'], count: 2, isSystemic: true, detectedOn: daysAgo(18), description: 'Recurring drainage overflow near Shahdara Metro — blocked main sewer line (systemic).' },
  { clusterId: 'RC-W52-CI', ward: 'Ward 52', category: 'Civic Infrastructure', complaintIds: ['GR-2026-0051', 'GR-2026-0055'], count: 2, isSystemic: false, detectedOn: daysAgo(15), description: 'Two potholes 200m apart — same road section. One-off road damage, not systemic.' },
  { clusterId: 'RC-W55-SN', ward: 'Ward 55', category: 'Sanitation', complaintIds: ['GR-2026-0071'], count: 1, isSystemic: false, detectedOn: daysAgo(12), description: 'Single garbage collection miss — operational, not systemic.' },
];

// ── Nodal Batch Groups ─────────────────────────────────────────────────────────
export const MOCK_BATCH_GROUPS: BatchGroup[] = [
  { batchId: 'BATCH-DJB-W48-001', locality: 'Shahdara Metro Complex', category: 'Water & Sewage', complaintIds: ['GR-2026-0042', 'GR-2026-0043'], count: 2, status: 'Open' },
  { batchId: 'BATCH-PWD-W52-001', locality: 'Laxmi Nagar', category: 'Civic Infrastructure', complaintIds: ['GR-2026-0051', 'GR-2026-0055'], count: 2, status: 'Order Issued', fieldOrderIssued: daysAgo(12) },
];

// ── Nodal Monthly Reports ───────────────────────────────────────────────────────
export const MOCK_MONTHLY_REPORTS: MonthlyReportData[] = [
  { month: 'June 2026', totalReceived: 148, totalResolved: 109, avgResolutionDays: 7.8, slaBreachCount: 18, citizenSatisfactionScore: 4.1, cpgramsSubmitted: false },
  { month: 'May 2026', totalReceived: 132, totalResolved: 121, avgResolutionDays: 8.2, slaBreachCount: 11, citizenSatisfactionScore: 4.3, cpgramsSubmitted: true },
  { month: 'April 2026', totalReceived: 119, totalResolved: 115, avgResolutionDays: 7.1, slaBreachCount: 4, citizenSatisfactionScore: 4.5, cpgramsSubmitted: true },
  { month: 'March 2026', totalReceived: 155, totalResolved: 138, avgResolutionDays: 9.4, slaBreachCount: 22, citizenSatisfactionScore: 3.8, cpgramsSubmitted: true },
];

// ── Nodal Cross Dept Tickets ──────────────────────────────────────────────────
export const MOCK_CROSS_DEPT_TICKETS: CrossDeptTicket[] = [
  {
    ticketId: 'CDT-2026-001',
    complaintId: 'GR-2026-0095',
    departments: ['Municipal Corporation', 'Health & Family Welfare', 'Police'],
    status: 'In Progress',
    createdOn: daysAgo(3),
    lastUpdated: daysAgo(1),
    actions: [
      { dept: 'Municipal Corporation', action: 'Dog catching team dispatched', timestamp: daysAgo(2) },
      { dept: 'Health & Family Welfare', action: 'Anti-rabies vaccine stock verified', timestamp: daysAgo(1) },
    ],
  },
];
