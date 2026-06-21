import type { Complaint, RedressalOfficer, RootCauseCluster, BatchGroup, MonthlyReportData, CrossDeptTicket } from '../types';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'GR-2026-0042', title: 'Waterlogging on Main Road near Shahdara Metro',
    description: 'Severe waterlogging causing traffic jam and health hazard.',
    category: 'Water & Sewage', district: 'Shahdara', ward: 'Ward 48', locality: 'Shahdara Metro Complex',
    citizenName: 'Rajesh Kumar', citizenPhone: '9876543210',
    dateFiled: daysAgo(22), priority: 'Emergency', status: 'Escalated',
    assignedOfficer: 'Field Officer Ramesh', department: 'Delhi Jal Board',
    aiSuggestedCategory: 'Water & Sewage', aiSuggestedSubCategory: 'Drainage Overflow',
    timeline: [
      { date: daysAgo(22), action: 'Complaint Filed', actor: 'Citizen Portal' },
      { date: daysAgo(21), action: 'AI Categorised', actor: 'Smart Categorisation Engine', notes: 'Sub-cat: Drainage Overflow — confidence 94%' },
      { date: daysAgo(20), action: 'Assigned to Field Officer', actor: 'Nodal Officer' },
    ],
    citizenRating: 1, isReopen: false, batchId: 'BATCH-DJB-W48-001', slaDay: 22,
  },
  {
    id: 'GR-2026-0043', title: 'Waterlogging at Ramlila Ground parking',
    description: 'Parking area fully submerged. Same issue as metro road.',
    category: 'Water & Sewage', district: 'Shahdara', ward: 'Ward 48', locality: 'Shahdara Metro Complex',
    citizenName: 'Suresh Chand', citizenPhone: '9988112233',
    dateFiled: daysAgo(20), priority: 'High', status: 'Active',
    assignedOfficer: 'Field Officer Ramesh', department: 'Delhi Jal Board',
    aiSuggestedCategory: 'Water & Sewage', aiSuggestedSubCategory: 'Drainage Overflow',
    timeline: [
      { date: daysAgo(20), action: 'Filed', actor: 'Citizen' },
      { date: daysAgo(19), action: 'AI Batch Detected', actor: 'System', notes: 'Grouped with GR-2026-0042' },
    ],
    batchId: 'BATCH-DJB-W48-001', slaDay: 20,
  },
  {
    id: 'GR-2026-0051', title: 'Pothole on Ring Road causing accidents',
    description: 'Deep pothole near Laxmi Nagar flyover. Three accidents reported.',
    category: 'Civic Infrastructure', district: 'Shahdara', ward: 'Ward 52', locality: 'Laxmi Nagar',
    citizenName: 'Sunita Devi', citizenPhone: '9123456780',
    dateFiled: daysAgo(18), priority: 'High', status: 'Active',
    assignedOfficer: 'Field Officer Priya', department: 'PWD & Infrastructure',
    aiSuggestedCategory: 'Civic Infrastructure', aiSuggestedSubCategory: 'Road Repair — Pothole',
    timeline: [
      { date: daysAgo(18), action: 'Filed', actor: 'Walk-in' },
      { date: daysAgo(17), action: 'AI Categorised — Confidence 98%', actor: 'AI Engine' },
      { date: daysAgo(16), action: 'Assigned to Officer Priya', actor: 'Nodal Officer' },
    ],
    slaDay: 18,
  },
  {
    id: 'GR-2026-0055', title: 'Pothole near Laxmi Nagar Bus Stand',
    description: 'Another large pothole 200m from GR-2026-0051.',
    category: 'Civic Infrastructure', district: 'Shahdara', ward: 'Ward 52', locality: 'Laxmi Nagar',
    citizenName: 'Vipin Arora', citizenPhone: '9765432100',
    dateFiled: daysAgo(16), priority: 'Medium', status: 'Active',
    assignedOfficer: 'Field Officer Priya', department: 'PWD & Infrastructure',
    aiSuggestedCategory: 'Civic Infrastructure', aiSuggestedSubCategory: 'Road Repair — Pothole',
    timeline: [
      { date: daysAgo(16), action: 'Filed', actor: 'Citizen App' },
      { date: daysAgo(15), action: 'AI Batch Clustered', actor: 'System', notes: 'Same locality + category as GR-2026-0051' },
    ],
    batchId: 'BATCH-PWD-W52-001', slaDay: 16,
  },
  {
    id: 'GR-2026-0063', title: 'Power outage in Block C residential colony',
    description: 'Entire block without electricity for 72 hours.',
    category: 'Electricity & Power', district: 'Shahdara', ward: 'Ward 60', locality: 'Block C, Shahdara',
    citizenName: 'Mohammed Aslam', citizenPhone: '9988776655',
    dateFiled: daysAgo(4), priority: 'Emergency', status: 'Active',
    assignedOfficer: 'Field Officer Vikram', department: 'Power Department',
    aiSuggestedCategory: 'Electricity & Power', aiSuggestedSubCategory: 'Extended Outage',
    timeline: [
      { date: daysAgo(4), action: 'Emergency Filed', actor: 'Citizen' },
      { date: daysAgo(4), action: 'AI Auto-flagged Emergency', actor: 'System' },
      { date: daysAgo(3), action: 'Assigned — priority routing', actor: 'Nodal Officer' },
    ],
    slaDay: 4,
  },
  {
    id: 'GR-2026-0071', title: 'Garbage not collected for 2 weeks',
    description: 'Municipal garbage truck has not visited our lane.',
    category: 'Sanitation', district: 'Shahdara', ward: 'Ward 55', locality: 'Bhajanpura',
    citizenName: 'Anita Singh', citizenPhone: '9011223344',
    dateFiled: daysAgo(14), priority: 'Medium', status: 'Pending',
    department: 'Municipal Corporation',
    aiSuggestedCategory: 'Sanitation', aiSuggestedSubCategory: 'Garbage Collection Missed',
    timeline: [
      { date: daysAgo(14), action: 'Filed via App', actor: 'Citizen' },
    ],
    slaDay: 14,
  },
  {
    id: 'GR-2026-0091', title: 'Hospital OPD not functional on weekends',
    description: 'Government hospital OPD closed on Saturdays for 3 months.',
    category: 'Public Health', district: 'Shahdara', ward: 'Ward 49', locality: 'Dilshad Colony',
    citizenName: 'Savita Kumari', citizenPhone: '9654321098',
    dateFiled: daysAgo(11), priority: 'High', status: 'Resolved',
    assignedOfficer: 'Field Officer Kaveri', department: 'Health & Family Welfare',
    aiSuggestedCategory: 'Public Health', aiSuggestedSubCategory: 'Service Availability',
    timeline: [
      { date: daysAgo(11), action: 'Filed', actor: 'Patient Representative' },
      { date: daysAgo(9), action: 'Verified by Officer Kaveri', actor: 'Field Officer Kaveri' },
      { date: daysAgo(3), action: 'Resolved', actor: 'Nodal Officer', notes: 'Weekend OPD restored' },
    ],
    citizenRating: 5, slaDay: 11,
  },
  {
    id: 'GR-2026-0095', title: 'Stray dogs menace near school gate',
    description: 'Pack of 8 stray dogs near children\'s school. Two bite incidents.',
    category: 'Stray Animals', district: 'Shahdara', ward: 'Ward 53', locality: 'Jhilmil Colony',
    citizenName: 'Geeta Sharma', citizenPhone: '9212345678',
    dateFiled: daysAgo(3), priority: 'High', status: 'Active',
    department: 'Municipal Corporation',
    aiSuggestedCategory: 'Stray Animals', aiSuggestedSubCategory: 'Dog Menace — School Zone',
    crossDeptTicket: true,
    timeline: [
      { date: daysAgo(3), action: 'Filed — marked urgent', actor: 'School Principal' },
      { date: daysAgo(3), action: 'Cross-dept ticket created', actor: 'Nodal Officer', notes: 'MCD + Health Dept. tagged' },
    ],
    slaDay: 3,
  },
  {
    id: 'GR-2026-0096', title: 'Sewage overflow on residential street',
    description: 'Sewage line broken — raw sewage on street for 5 days.',
    category: 'Water & Sewage', district: 'Shahdara', ward: 'Ward 55', locality: 'Bhajanpura',
    citizenName: 'Sonu Sharma', citizenPhone: '9345678901',
    dateFiled: daysAgo(5), priority: 'Emergency', status: 'Pending',
    department: 'Delhi Jal Board',
    aiSuggestedCategory: 'Water & Sewage', aiSuggestedSubCategory: 'Sewage Overflow',
    timeline: [{ date: daysAgo(5), action: 'Filed — Emergency', actor: 'Citizen' }],
    slaDay: 5,
  },
  {
    id: 'GR-2026-0097', title: 'Street light not working — 3rd week',
    description: 'Entire stretch of Bhajanpura road dark at night.',
    category: 'Electricity & Power', district: 'Shahdara', ward: 'Ward 55', locality: 'Bhajanpura',
    citizenName: 'Rahul Meena', citizenPhone: '9456789012',
    dateFiled: daysAgo(19), priority: 'Medium', status: 'Active',
    assignedOfficer: 'Field Officer Vikram', department: 'Power Department',
    aiSuggestedCategory: 'Electricity & Power', aiSuggestedSubCategory: 'Street Light Outage',
    timeline: [
      { date: daysAgo(19), action: 'Filed', actor: 'Citizen' },
      { date: daysAgo(18), action: 'Assigned', actor: 'Nodal Officer' },
    ],
    slaDay: 19,
  },
];

export const MOCK_OFFICERS: RedressalOfficer[] = [
  { id: 'OFF001', name: 'Ramesh Chandra', designation: 'Field Officer Grade A', department: 'Delhi Jal Board', pendingCount: 12, resolvedThisMonth: 34, avgResolutionDays: 7.2, phone: '9876500001', available: true },
  { id: 'OFF002', name: 'Priya Nair', designation: 'Field Officer Grade A', department: 'PWD & Infrastructure', pendingCount: 8, resolvedThisMonth: 48, avgResolutionDays: 5.8, phone: '9876500002', available: true },
  { id: 'OFF003', name: 'Vikram Soni', designation: 'Field Officer Grade B', department: 'Power Department', pendingCount: 15, resolvedThisMonth: 29, avgResolutionDays: 9.1, phone: '9876500003', available: false },
  { id: 'OFF004', name: 'Kaveri Patel', designation: 'Field Officer Grade A', department: 'Health & Family Welfare', pendingCount: 5, resolvedThisMonth: 51, avgResolutionDays: 4.9, phone: '9876500004', available: true },
  { id: 'OFF005', name: 'Dinesh Rao', designation: 'Field Officer Grade B', department: 'Municipal Corporation', pendingCount: 18, resolvedThisMonth: 22, avgResolutionDays: 11.4, phone: '9876500005', available: true },
];

export const MOCK_ROOT_CLUSTERS: RootCauseCluster[] = [
  { clusterId: 'RC-W48-WS', ward: 'Ward 48', category: 'Water & Sewage', complaintIds: ['GR-2026-0042', 'GR-2026-0043'], count: 2, isSystemic: true, detectedOn: daysAgo(18), description: 'Recurring drainage overflow near Shahdara Metro — blocked main sewer line (systemic).' },
  { clusterId: 'RC-W52-CI', ward: 'Ward 52', category: 'Civic Infrastructure', complaintIds: ['GR-2026-0051', 'GR-2026-0055'], count: 2, isSystemic: false, detectedOn: daysAgo(15), description: 'Two potholes 200m apart — same road section. One-off road damage, not systemic.' },
  { clusterId: 'RC-W55-SN', ward: 'Ward 55', category: 'Sanitation', complaintIds: ['GR-2026-0071'], count: 1, isSystemic: false, detectedOn: daysAgo(12), description: 'Single garbage collection miss — operational, not systemic.' },
];

export const MOCK_BATCH_GROUPS: BatchGroup[] = [
  { batchId: 'BATCH-DJB-W48-001', locality: 'Shahdara Metro Complex', category: 'Water & Sewage', complaintIds: ['GR-2026-0042', 'GR-2026-0043'], count: 2, status: 'Open' },
  { batchId: 'BATCH-PWD-W52-001', locality: 'Laxmi Nagar', category: 'Civic Infrastructure', complaintIds: ['GR-2026-0051', 'GR-2026-0055'], count: 2, status: 'Order Issued', fieldOrderIssued: daysAgo(12) },
];

export const MOCK_MONTHLY_REPORTS: MonthlyReportData[] = [
  { month: 'June 2026', totalReceived: 148, totalResolved: 109, avgResolutionDays: 7.8, slaBreachCount: 18, citizenSatisfactionScore: 4.1, cpgramsSubmitted: false },
  { month: 'May 2026', totalReceived: 132, totalResolved: 121, avgResolutionDays: 8.2, slaBreachCount: 11, citizenSatisfactionScore: 4.3, cpgramsSubmitted: true },
  { month: 'April 2026', totalReceived: 119, totalResolved: 115, avgResolutionDays: 7.1, slaBreachCount: 4, citizenSatisfactionScore: 4.5, cpgramsSubmitted: true },
  { month: 'March 2026', totalReceived: 155, totalResolved: 138, avgResolutionDays: 9.4, slaBreachCount: 22, citizenSatisfactionScore: 3.8, cpgramsSubmitted: true },
];

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
