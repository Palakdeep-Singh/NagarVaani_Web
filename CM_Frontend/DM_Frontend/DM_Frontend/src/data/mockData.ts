import type { Complaint, SDMOfficer, RevenueCase } from '../types';

// ── Helper ────────────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ── Complaints ────────────────────────────────────────────────────────────────
export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'GR-2026-0042', title: 'Waterlogging on Main Road near Shahdara Metro',
    description: 'Severe waterlogging causing traffic jam and health hazard.',
    category: 'Water & Sewage', district: 'Shahdara', ward: 'Ward 48',
    citizenName: 'Rajesh Kumar', citizenPhone: '9876543210',
    dateFiled: daysAgo(22), priority: 'Emergency', status: 'Escalated',
    assignedSDM: 'Priya Sharma', department: 'Delhi Jal Board',
    timeline: [
      { date: daysAgo(22), action: 'Complaint Filed', actor: 'Citizen Portal', notes: 'Auto-assigned to DJB' },
      { date: daysAgo(20), action: 'Acknowledged', actor: 'SDM Priya Sharma', notes: 'Site inspection scheduled' },
      { date: daysAgo(15), action: 'Interim Reply Sent', actor: 'DM Office', notes: 'Citizen notified of progress' },
      { date: daysAgo(2), action: 'Escalated to Secretary', actor: 'DM Office', notes: 'SLA breach — auto-escalation triggered' },
    ],
    interimSent: true, slaDay: 22,
  },
  {
    id: 'GR-2026-0051', title: 'Pothole on Ring Road causing accidents',
    description: 'Deep pothole near Laxmi Nagar flyover. Three accidents reported.',
    category: 'Civic Infrastructure', district: 'Shahdara', ward: 'Ward 52',
    citizenName: 'Sunita Devi', citizenPhone: '9123456780',
    dateFiled: daysAgo(18), priority: 'High', status: 'Active',
    assignedSDM: 'Aman Verma', department: 'PWD & Infrastructure',
    timeline: [
      { date: daysAgo(18), action: 'Complaint Filed', actor: 'Walk-in', notes: 'Submitted at DM office' },
      { date: daysAgo(16), action: 'Assigned to SDM', actor: 'DM Dispatch', notes: 'SDM Aman Verma assigned' },
      { date: daysAgo(10), action: 'PWD team deployed', actor: 'SDM Aman Verma', notes: 'Work order issued' },
    ],
    slaDay: 18,
  },
  {
    id: 'GR-2026-0063', title: 'Power outage in residential colony — 72 hours',
    description: 'Entire colony without electricity. Elderly residents affected.',
    category: 'Electricity & Power', district: 'Shahdara', ward: 'Ward 60',
    citizenName: 'Mohammed Aslam', citizenPhone: '9988776655',
    dateFiled: daysAgo(4), priority: 'Emergency', status: 'Active',
    assignedSDM: 'Priya Sharma', department: 'Power Department',
    timeline: [
      { date: daysAgo(4), action: 'Emergency Complaint Filed', actor: 'Citizen Portal' },
      { date: daysAgo(4), action: 'Emergency Tag Applied', actor: 'AI System', notes: 'Auto-flagged emergency' },
      { date: daysAgo(3), action: 'SDM Notified', actor: 'DM Office' },
    ],
    slaDay: 4,
  },
  {
    id: 'GR-2026-0071', title: 'Garbage not collected for 2 weeks',
    description: 'Municipal garbage truck has not visited our lane in 14 days.',
    category: 'Sanitation', district: 'Shahdara', ward: 'Ward 55',
    citizenName: 'Anita Singh', citizenPhone: '9011223344',
    dateFiled: daysAgo(14), priority: 'Medium', status: 'Pending',
    assignedSDM: 'Aman Verma', department: 'Municipal Corporation',
    timeline: [
      { date: daysAgo(14), action: 'Filed via NagarVaani App', actor: 'Citizen' },
    ],
    slaDay: 14,
  },
  {
    id: 'GR-2026-0078', title: 'School building roof leaking — monsoon risk',
    description: 'Government primary school building has major roof leaks.',
    category: 'Education & Schools', district: 'Shahdara', ward: 'Ward 53',
    citizenName: 'Ramesh Gupta', citizenPhone: '9871234567',
    dateFiled: daysAgo(8), priority: 'High', status: 'Active',
    assignedSDM: 'Kavita Mehra', department: 'Education Department',
    timeline: [
      { date: daysAgo(8), action: 'Filed', actor: 'School Principal' },
      { date: daysAgo(7), action: 'Site Visit Conducted', actor: 'SDM Kavita Mehra' },
      { date: daysAgo(5), action: 'PWD Repair Initiated', actor: 'SDM Kavita Mehra', notes: 'Emergency repair started' },
    ],
    slaDay: 8,
  },
  {
    id: 'GR-2026-0082', title: 'Illegal construction blocking drainage',
    description: 'Unauthorized structure built over drain causing flooding.',
    category: 'Civic Infrastructure', district: 'Shahdara', ward: 'Ward 61',
    citizenName: 'Deepak Yadav', citizenPhone: '9765432109',
    dateFiled: daysAgo(5), priority: 'High', status: 'Active',
    assignedSDM: 'Priya Sharma', department: 'DDA & Land Management',
    timeline: [
      { date: daysAgo(5), action: 'Filed', actor: 'RWA President' },
      { date: daysAgo(4), action: 'Notice Issued', actor: 'SDM Priya Sharma' },
    ],
    slaDay: 5,
  },
  {
    id: 'GR-2026-0091', title: 'Hospital OPD not functional on weekends',
    description: 'Government hospital OPD has been closed on Saturdays for 3 months.',
    category: 'Public Health', district: 'Shahdara', ward: 'Ward 49',
    citizenName: 'Savita Kumari', citizenPhone: '9654321098',
    dateFiled: daysAgo(11), priority: 'High', status: 'Resolved',
    assignedSDM: 'Kavita Mehra', department: 'Health & Family Welfare',
    timeline: [
      { date: daysAgo(11), action: 'Filed', actor: 'Patient Representative' },
      { date: daysAgo(9), action: 'Health Dept. Contacted', actor: 'SDM Kavita Mehra' },
      { date: daysAgo(3), action: 'Resolved — OPD Resumed', actor: 'DM Office', notes: 'Weekend OPD restored' },
    ],
    slaDay: 11,
  },
  {
    id: 'GR-2026-0094', title: 'Water supply contamination — diarrhea outbreak',
    description: 'Multiple cases of diarrhea in locality. Suspected contaminated water supply.',
    category: 'Water & Sewage', district: 'Shahdara', ward: 'Ward 57',
    citizenName: 'Dr. Rohit Sinha', citizenPhone: '9543210987',
    dateFiled: daysAgo(2), priority: 'Emergency', status: 'Active',
    assignedSDM: 'Priya Sharma', department: 'Delhi Jal Board',
    timeline: [
      { date: daysAgo(2), action: 'Emergency Alert Filed', actor: 'Local Doctor' },
      { date: daysAgo(2), action: 'Health Team Dispatched', actor: 'DM Office', notes: 'Water testing initiated' },
      { date: daysAgo(1), action: 'DJB Alerted', actor: 'SDM Priya Sharma' },
    ],
    slaDay: 2,
  },
];

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
