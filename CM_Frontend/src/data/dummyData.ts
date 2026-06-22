/**
 * dummyData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for ALL dummy / demo data used by the NagarVaani
 * CM Frontend when the backend API is unavailable or during local development.
 *
 * Replace API calls in Store.tsx with imports from this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  Complaint,
  Project,
  Officer,
  DigitalFile,
  Message,
  WelfareApplication,
  UserProfile,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function daysFromNow(n: number): string {
  return daysAgo(-n);
}

// =============================================================================
// 1. LOGIN CREDENTIALS
// =============================================================================

/** All valid demo users. Passwords are plain-text for demo purposes only. */
export const DUMMY_USERS: (UserProfile & { password: string })[] = [
  {
    username: 'cm',
    password: 'cm123',
    role: 'Chief Minister',
  },
  {
    username: 'newdelhidm',
    password: 'dm123',
    role: 'District Magistrate',
    district: 'New Delhi',
  },
  {
    username: 'shahdaradm',
    password: 'dm123',
    role: 'District Magistrate',
    district: 'Shahdara',
  },
  {
    username: 'healthhead',
    password: 'dept123',
    role: 'Department Head',
    department: 'Public Health',
  },
  {
    username: 'educationhead',
    password: 'dept123',
    role: 'Department Head',
    department: 'Education & Schools',
  },
  {
    username: 'pwdhead',
    password: 'dept123',
    role: 'Department Head',
    department: 'PWD & Infrastructure',
  },
];

// =============================================================================
// 2. FAST LOGIN BUTTONS (shown on the Login page)
// =============================================================================

export interface FastLoginRole {
  label: string;
  icon: string;
  username: string;
  password: string;
  color: string;
}

export const FAST_LOGIN_ROLES: FastLoginRole[] = [
  {
    label: 'CM Office',
    icon: '👑',
    username: 'cm',
    password: 'cm123',
    color: '#F59E0B',
  },
  {
    label: 'DM Office',
    icon: '🏛️',
    username: 'newdelhidm',
    password: 'dm123',
    color: '#3B82F6',
  },
  {
    label: 'Nodal Officer',
    icon: '💼',
    username: 'healthhead',
    password: 'dept123',
    color: '#10B981',
  },
];

// =============================================================================
// 3. DEMO CREDENTIALS PANEL (shown inline on login card)
// =============================================================================

export interface DemoCredential {
  label: string;
  username: string;
  password: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  { label: 'CM Office',  username: 'cm',          password: 'cm123'   },
  { label: 'DM Office',  username: 'newdelhidm',  password: 'dm123'   },
  { label: 'Nodal Off.', username: 'healthhead',  password: 'dept123' },
];

// =============================================================================
// 4. ROLE MAP for auto-login from query params (?autologin=true&role=cm)
// =============================================================================

export const ROLE_MAP: Record<string, { username: string; password: string }> = {
  cm:    { username: 'cm',          password: 'cm123'   },
  dm:    { username: 'newdelhidm',  password: 'dm123'   },
  nodal: { username: 'healthhead',  password: 'dept123' },
};

// =============================================================================
// 5. COMPLAINTS
// =============================================================================

export const DUMMY_COMPLAINTS: Complaint[] = [
  {
    id: 'GR-2026-0001',
    title: 'Waterlogging on Main Road near Shahdara Metro',
    category: 'Water & Sewage',
    description: 'Severe waterlogging has rendered the road impassable for pedestrians and vehicles near Gate 3 of Shahdara Metro Station. Multiple households are affected.',
    status: 'Active',
    priority: 'High',
    district: 'Shahdara',
    department: 'Delhi Jal Board',
    citizenName: 'Ramesh Gupta',
    citizenPhone: '9876543210',
    dateFiled: daysAgo(12),
    ward: 'Ward 48',
    assignedSDM: 'Priya Sharma',
    assignedOfficer: 'Ramesh Chandra',
    aiSuggestedCategory: 'Water & Sewage',
    aiSuggestedSubCategory: 'Drainage Overflow',
    subCategory: 'Drainage Overflow',
    slaDay: 12,
    batchId: 'BATCH-DJB-W48-001',
    locality: 'Shahdara Metro Complex',
    timeline: [
      { date: daysAgo(12), action: 'Complaint Filed', actor: 'Ramesh Gupta', notes: 'Submitted via NagarVaani portal' },
      { date: daysAgo(11), action: 'AI Categorised', actor: 'AI Engine', notes: 'Category: Water & Sewage — Drainage Overflow (confidence 94%)' },
      { date: daysAgo(10), action: 'Assigned to Officer', actor: 'Nodal Officer', notes: 'Assigned to Ramesh Chandra (DJB)' },
      { date: daysAgo(8),  action: 'Field Inspection Done', actor: 'Ramesh Chandra', notes: 'Blocked sewer main confirmed. Pump ordered.' },
    ],
  },
  {
    id: 'GR-2026-0002',
    title: 'Street Light Outage — Laxmi Nagar Sector 3',
    category: 'Electricity & Power',
    description: 'Over 14 street lights are not functioning in Sector 3, Laxmi Nagar for the past 3 weeks. Area is unsafe at night.',
    status: 'Pending',
    priority: 'Medium',
    district: 'East Delhi',
    department: 'Power Department',
    citizenName: 'Sunita Rani',
    citizenPhone: '9876543211',
    dateFiled: daysAgo(20),
    ward: 'Ward 52',
    slaDay: 20,
    aiSuggestedCategory: 'Electricity & Power',
    aiSuggestedSubCategory: 'Street Light Fault',
    subCategory: 'Street Light Fault',
    timeline: [
      { date: daysAgo(20), action: 'Complaint Filed', actor: 'Sunita Rani', notes: 'Phone helpline' },
      { date: daysAgo(19), action: 'AI Categorised', actor: 'AI Engine', notes: 'Electricity & Power (confidence 91%)' },
    ],
  },
  {
    id: 'GR-2026-0003',
    title: 'Pothole — Laxmi Nagar Road Near Bus Stand',
    category: 'Civic Infrastructure',
    description: 'Large pothole approximately 2 ft wide has caused two road accidents in the past week. Immediate repair required.',
    status: 'Active',
    priority: 'High',
    district: 'East Delhi',
    department: 'PWD & Infrastructure',
    citizenName: 'Arvind Singh',
    citizenPhone: '9876543212',
    dateFiled: daysAgo(9),
    ward: 'Ward 52',
    assignedOfficer: 'Priya Nair',
    slaDay: 9,
    batchId: 'BATCH-PWD-W52-001',
    locality: 'Laxmi Nagar',
    aiSuggestedCategory: 'Civic Infrastructure',
    aiSuggestedSubCategory: 'Road Damage',
    subCategory: 'Road Damage',
    timeline: [
      { date: daysAgo(9), action: 'Complaint Filed', actor: 'Arvind Singh', notes: 'Submitted via citizen portal' },
      { date: daysAgo(8), action: 'Field Order Issued', actor: 'PWD Office', notes: 'Repair team dispatched' },
    ],
  },
  {
    id: 'GR-2026-0004',
    title: 'Garbage Pile-up — Rohini Sector 9',
    category: 'Sanitation',
    description: 'Municipal garbage has not been collected for 5 days in Rohini Sector 9. Foul smell and health hazard.',
    status: 'Resolved',
    priority: 'Medium',
    district: 'North Delhi',
    department: 'Municipal Corporation',
    citizenName: 'Meera Sharma',
    citizenPhone: '9876543213',
    dateFiled: daysAgo(18),
    ward: 'Ward 10',
    assignedOfficer: 'Dinesh Rao',
    citizenRating: 4,
    slaDay: 18,
    timeline: [
      { date: daysAgo(18), action: 'Complaint Filed', actor: 'Meera Sharma', notes: 'WhatsApp complaint' },
      { date: daysAgo(15), action: 'Assigned to Officer', actor: 'Nodal Officer', notes: 'Assigned to Dinesh Rao (MCD)' },
      { date: daysAgo(13), action: 'Resolved', actor: 'Dinesh Rao', notes: 'Garbage cleared. Strict monitoring in place.' },
    ],
  },
  {
    id: 'GR-2026-0005',
    title: 'Unauthorized Encroachment — DDA Land, Ward 53',
    category: 'Revenue & Land',
    description: 'DDA government land near Ward 53 has been illegally encroached. Immediate action required to evict encroachers.',
    status: 'Escalated',
    priority: 'Emergency',
    district: 'Shahdara',
    department: 'DM Office',
    citizenName: 'Rakesh Kumar',
    citizenPhone: '9876543214',
    dateFiled: daysAgo(6),
    ward: 'Ward 53',
    slaDay: 6,
    crossDeptTicket: true,
    assignedSDM: 'Aman Verma',
    aiSuggestedCategory: 'Revenue & Land',
    aiSuggestedSubCategory: 'Encroachment',
    subCategory: 'Encroachment',
    timeline: [
      { date: daysAgo(6), action: 'Complaint Filed', actor: 'Rakesh Kumar', notes: 'Walk-in complaint' },
      { date: daysAgo(5), action: 'Escalated to DM', actor: 'SDM Office', notes: 'Cross-dept ticket issued' },
    ],
  },
  {
    id: 'GR-2026-0006',
    title: 'Dog Bite Incident — Multiple Complaints, Ward 55',
    category: 'Stray Animals',
    description: 'Three residents bitten by stray dogs in Ward 55 this week. Dog-catching and vaccination drives are urgently needed.',
    status: 'Active',
    priority: 'Emergency',
    district: 'Shahdara',
    department: 'Health & Family Welfare',
    citizenName: 'Pooja Verma',
    citizenPhone: '9876543215',
    dateFiled: daysAgo(3),
    ward: 'Ward 55',
    slaDay: 3,
    crossDeptTicket: true,
    aiSuggestedCategory: 'Stray Animals',
    aiSuggestedSubCategory: 'Dog Bite',
    subCategory: 'Dog Bite',
    timeline: [
      { date: daysAgo(3), action: 'Complaint Filed', actor: 'Pooja Verma', notes: 'Emergency helpline' },
      { date: daysAgo(2), action: 'Cross-Dept Ticket CDT-2026-001 Created', actor: 'DM Office', notes: 'MCD + Health + Police involved' },
      { date: daysAgo(1), action: 'Dog-catching team dispatched', actor: 'MCD', notes: 'Anti-rabies vaccines verified by Health dept' },
    ],
  },
  {
    id: 'GR-2026-0007',
    title: 'Broken Water Supply — Rohini Sector 5',
    category: 'Water & Sewage',
    description: 'Main water supply line burst, leading to no water supply for 200 households for 48 hours.',
    status: 'Active',
    priority: 'Emergency',
    district: 'North Delhi',
    department: 'Delhi Jal Board',
    citizenName: 'Ajay Malhotra',
    citizenPhone: '9876543216',
    dateFiled: daysAgo(2),
    ward: 'Ward 12',
    slaDay: 2,
    timeline: [
      { date: daysAgo(2), action: 'Complaint Filed', actor: 'Ajay Malhotra', notes: 'Citizen portal' },
      { date: daysAgo(1), action: 'Emergency team dispatched', actor: 'DJB', notes: 'Temporary tankers arranged' },
    ],
  },
  {
    id: 'GR-2026-0008',
    title: 'School Roof Leakage — Govt School Ward 60',
    category: 'Education & Schools',
    description: 'Roof of the government school in Ward 60 is leaking. Classes have been disrupted. Repair work needed urgently before monsoon.',
    status: 'Pending',
    priority: 'High',
    district: 'Shahdara',
    department: 'Education & Schools',
    citizenName: 'Seema Devi',
    citizenPhone: '9876543217',
    dateFiled: daysAgo(14),
    ward: 'Ward 60',
    slaDay: 14,
    aiSuggestedCategory: 'Education & Schools',
    aiSuggestedSubCategory: 'Infrastructure Issue',
    subCategory: 'Infrastructure Issue',
    timeline: [
      { date: daysAgo(14), action: 'Complaint Filed', actor: 'Seema Devi', notes: 'School Principal forwarded complaint' },
    ],
  },
  {
    id: 'GR-2026-0009',
    title: 'Noise Pollution from Factory — Near Residential Area',
    category: 'Noise Pollution',
    description: 'Factory in Okhla Industrial Area operating 24x7 creating severe noise pollution for nearby residents.',
    status: 'Active',
    priority: 'Medium',
    district: 'South East Delhi',
    department: 'Municipal Corporation',
    citizenName: 'Vikram Sethi',
    citizenPhone: '9876543218',
    dateFiled: daysAgo(25),
    ward: 'Ward 72',
    slaDay: 25,
    timeline: [
      { date: daysAgo(25), action: 'Complaint Filed', actor: 'Vikram Sethi', notes: 'Online portal' },
      { date: daysAgo(22), action: 'Notice Issued', actor: 'MCD', notes: 'Factory served notice' },
    ],
  },
  {
    id: 'GR-2026-0010',
    title: 'Welfare Scheme — Pension Not Received',
    category: 'Social Welfare',
    description: 'Old age pension not credited for 3 months. Elderly citizen (78 yrs) living alone, in financial distress.',
    status: 'Resolved',
    priority: 'High',
    district: 'Central Delhi',
    department: 'Social Welfare Department',
    citizenName: 'Bimla Devi',
    citizenPhone: '9876543219',
    dateFiled: daysAgo(30),
    ward: 'Ward 32',
    citizenRating: 5,
    slaDay: 30,
    interimSent: true,
    timeline: [
      { date: daysAgo(30), action: 'Complaint Filed', actor: 'Bimla Devi', notes: 'Walk-in at DM office' },
      { date: daysAgo(27), action: 'Interim Reply Sent', actor: 'DM Office', notes: 'Citizen notified of processing' },
      { date: daysAgo(20), action: 'Resolved', actor: 'Social Welfare Dept', notes: 'Pending pension disbursed. Record corrected.' },
    ],
  },
  {
    id: 'GR-2026-0011',
    title: 'Bus Route Cancelled — North Delhi Sector 14',
    category: 'Transport & Roads',
    description: 'DTC bus route 526 cancelled without notice, leaving thousands of commuters stranded daily.',
    status: 'Pending',
    priority: 'Medium',
    district: 'North Delhi',
    department: 'Transport & Roads',
    citizenName: 'Harpreet Singh',
    citizenPhone: '9876543220',
    dateFiled: daysAgo(5),
    ward: 'Ward 8',
    slaDay: 5,
    timeline: [
      { date: daysAgo(5), action: 'Complaint Filed', actor: 'Harpreet Singh', notes: 'Online portal' },
    ],
  },
  {
    id: 'GR-2026-0012',
    title: 'Police Inaction — Theft Case Not Registered',
    category: 'Law & Policing',
    description: 'Police station refused to file FIR for theft. Victim has approached DM office after 3 visits to the police station.',
    status: 'Escalated',
    priority: 'High',
    district: 'New Delhi',
    department: 'DM Office',
    citizenName: 'Mohit Arora',
    citizenPhone: '9876543221',
    dateFiled: daysAgo(7),
    ward: 'Ward 21',
    slaDay: 7,
    crossDeptTicket: true,
    timeline: [
      { date: daysAgo(7), action: 'Complaint Filed', actor: 'Mohit Arora', notes: 'Walk-in, DM office' },
      { date: daysAgo(6), action: 'Escalated', actor: 'DM Office', notes: 'Forwarded to DCP with urgency note' },
    ],
  },
];

// =============================================================================
// 6. PROJECTS
// =============================================================================

export const DUMMY_PROJECTS: Project[] = [
  {
    id: 'PRJ-001',
    title: 'Delhi Metro Phase IV Extension — Janakpuri to RK Ashram',
    department: 'PWD & Infrastructure',
    budgetAllocated: 14200,
    budgetSpent: 8900,
    physicalProgress: 62,
    startDate: '2024-04-01',
    endDate: '2026-12-31',
    status: 'On Track',
    manager: 'R. K. Sharma',
    description: 'Extension of Delhi Metro Phase IV covering 12.6 km with 10 new stations from Janakpuri West to RK Ashram Marg.',
  },
  {
    id: 'PRJ-002',
    title: 'Yamuna Rejuvenation — Interceptor Sewer Project',
    department: 'PWD & Infrastructure',
    budgetAllocated: 5600,
    budgetSpent: 4800,
    physicalProgress: 85,
    startDate: '2023-09-01',
    endDate: '2026-06-30',
    status: 'Delayed',
    manager: 'Neha Kapoor',
    description: 'Construction of 3 interceptor sewers to prevent untreated sewage from 22 drains from flowing into the Yamuna river.',
  },
  {
    id: 'PRJ-003',
    title: 'Smart Classroom Initiative — 500 Govt Schools',
    department: 'Education & Schools',
    budgetAllocated: 320,
    budgetSpent: 210,
    physicalProgress: 65,
    startDate: '2025-01-01',
    endDate: '2026-08-31',
    status: 'On Track',
    manager: 'Anjali Mehta',
    description: 'Installation of interactive smart boards, projectors and high-speed internet in 500 government schools across Delhi.',
  },
  {
    id: 'PRJ-004',
    title: 'Mohalla Clinic Expansion — 100 New Clinics',
    department: 'Public Health',
    budgetAllocated: 450,
    budgetSpent: 220,
    physicalProgress: 48,
    startDate: '2025-03-01',
    endDate: '2026-09-30',
    status: 'On Track',
    manager: 'Dr. Pankaj Gupta',
    description: 'Setting up 100 new Mohalla Clinics in underserved colonies across Delhi with full OPD and diagnostic facilities.',
  },
  {
    id: 'PRJ-005',
    title: 'Flyover Construction — Madhu Vihar',
    department: 'PWD & Infrastructure',
    budgetAllocated: 890,
    budgetSpent: 870,
    physicalProgress: 98,
    startDate: '2023-11-01',
    endDate: '2026-04-30',
    status: 'Completed',
    manager: 'Suresh Lal',
    description: 'Elevated road flyover at Madhu Vihar intersection to reduce daily traffic congestion affecting 80,000 vehicles.',
  },
  {
    id: 'PRJ-006',
    title: 'Delhi Skill Mission — Youth Training Centers',
    department: 'Education & Schools',
    budgetAllocated: 280,
    budgetSpent: 60,
    physicalProgress: 20,
    startDate: '2026-01-01',
    endDate: '2027-03-31',
    status: 'Critical',
    manager: 'Ritu Singh',
    description: 'Establishment of 20 skill development centers to train 50,000 youth in trades like electrician, plumbing, IT and hospitality.',
  },
  {
    id: 'PRJ-007',
    title: 'Water Recycling Plant — Okhla',
    department: 'PWD & Infrastructure',
    budgetAllocated: 1800,
    budgetSpent: 420,
    physicalProgress: 22,
    startDate: '2025-07-01',
    endDate: '2027-12-31',
    status: 'On Track',
    manager: 'Dinesh Agarwal',
    description: 'Construction of a 90 MLD tertiary sewage treatment and water recycling plant at Okhla to supply treated water for irrigation and industry.',
  },
];

// =============================================================================
// 7. OFFICERS
// =============================================================================

export const DUMMY_OFFICERS: Officer[] = [
  {
    id: 'OFF-001',
    name: 'Ramesh Chandra',
    designation: 'Field Officer Grade A',
    department: 'Delhi Jal Board',
    district: 'Shahdara',
    resolutionRate: 82,
    avgResolutionTime: 7.2,
    activeComplaints: 12,
    completedComplaints: 34,
    rating: 4.3,
  },
  {
    id: 'OFF-002',
    name: 'Priya Nair',
    designation: 'Field Officer Grade A',
    department: 'PWD & Infrastructure',
    district: 'East Delhi',
    resolutionRate: 91,
    avgResolutionTime: 5.8,
    activeComplaints: 8,
    completedComplaints: 48,
    rating: 4.7,
  },
  {
    id: 'OFF-003',
    name: 'Vikram Soni',
    designation: 'Field Officer Grade B',
    department: 'Power Department',
    district: 'North Delhi',
    resolutionRate: 65,
    avgResolutionTime: 9.1,
    activeComplaints: 15,
    completedComplaints: 29,
    rating: 3.6,
  },
  {
    id: 'OFF-004',
    name: 'Kaveri Patel',
    designation: 'Field Officer Grade A',
    department: 'Public Health',
    district: 'New Delhi',
    resolutionRate: 94,
    avgResolutionTime: 4.9,
    activeComplaints: 5,
    completedComplaints: 51,
    rating: 4.8,
  },
  {
    id: 'OFF-005',
    name: 'Dinesh Rao',
    designation: 'Field Officer Grade B',
    department: 'Municipal Corporation',
    district: 'North Delhi',
    resolutionRate: 58,
    avgResolutionTime: 11.4,
    activeComplaints: 18,
    completedComplaints: 22,
    rating: 3.2,
  },
  {
    id: 'OFF-006',
    name: 'Anita Choudhary',
    designation: 'Field Officer Grade A',
    department: 'Education & Schools',
    district: 'Shahdara',
    resolutionRate: 88,
    avgResolutionTime: 6.3,
    activeComplaints: 6,
    completedComplaints: 39,
    rating: 4.4,
  },
  {
    id: 'OFF-007',
    name: 'Sunil Verma',
    designation: 'Field Officer Grade B',
    department: 'Social Welfare Department',
    district: 'Central Delhi',
    resolutionRate: 76,
    avgResolutionTime: 8.7,
    activeComplaints: 10,
    completedComplaints: 33,
    rating: 4.0,
  },
];

// =============================================================================
// 8. DIGITAL FILES
// =============================================================================

export const DUMMY_FILES: DigitalFile[] = [
  {
    id: 'FILE-001',
    title: 'Budget Proposal — Smart Classroom Q3 2026',
    priority: 'Urgent',
    dateCreated: daysAgo(8),
    initiator: 'Anjali Mehta',
    currentOwner: 'CM Office',
    department: 'Education & Schools',
    path: ['Education Dept', 'District Secretariat', 'DM Office', 'CM Office'],
    currentStep: 3,
    totalSteps: 4,
    status: 'Pending Approval',
    remarks: [
      { author: 'Anjali Mehta', action: 'Created', text: 'Budget proposal for Q3 Smart Classroom rollout', date: daysAgo(8) },
      { author: 'DM Office', action: 'Reviewed', text: 'Verified figures. Recommend approval.', date: daysAgo(3) },
    ],
  },
  {
    id: 'FILE-002',
    title: 'Yamuna Rejuvenation — Environmental Impact Report',
    priority: 'Immediate',
    dateCreated: daysAgo(15),
    initiator: 'Neha Kapoor',
    currentOwner: 'DM Office',
    department: 'PWD & Infrastructure',
    path: ['PWD Dept', 'DM Office', 'CM Office'],
    currentStep: 1,
    totalSteps: 3,
    status: 'Pending Approval',
    remarks: [
      { author: 'Neha Kapoor', action: 'Created', text: 'EIA report as per NGT mandate', date: daysAgo(15) },
    ],
  },
  {
    id: 'FILE-003',
    title: 'Mohalla Clinic Staffing — Additional 200 Doctors',
    priority: 'Urgent',
    dateCreated: daysAgo(20),
    initiator: 'Dr. Pankaj Gupta',
    currentOwner: 'CM Office',
    department: 'Public Health',
    path: ['Health Dept', 'DM Office', 'CM Office'],
    currentStep: 2,
    totalSteps: 3,
    status: 'Approved',
    remarks: [
      { author: 'Dr. Pankaj Gupta', action: 'Created', text: 'Requisition for 200 doctors for new Mohalla Clinics', date: daysAgo(20) },
      { author: 'DM Office', action: 'Approved', text: 'Approved and forwarded to CM Office', date: daysAgo(10) },
      { author: 'CM Office', action: 'Approved', text: 'Full sanction granted. Finance to release funds.', date: daysAgo(5) },
    ],
  },
  {
    id: 'FILE-004',
    title: 'RTI Response — Flyover Construction Costs',
    priority: 'Routine',
    dateCreated: daysAgo(35),
    initiator: 'Public',
    currentOwner: 'DM Office',
    department: 'PWD & Infrastructure',
    path: ['PWD Dept', 'DM Office'],
    currentStep: 1,
    totalSteps: 2,
    status: 'Rejected',
    remarks: [
      { author: 'PWD Dept', action: 'Created', text: 'RTI application received, forwarded for response', date: daysAgo(35) },
      { author: 'DM Office', action: 'Rejected', text: 'Incomplete documentation. Applicant to resubmit.', date: daysAgo(28) },
    ],
  },
  {
    id: 'FILE-005',
    title: 'Delhi Skill Mission — MoU with NSDC',
    priority: 'Immediate',
    dateCreated: daysAgo(4),
    initiator: 'Ritu Singh',
    currentOwner: 'DM Office',
    department: 'Education & Schools',
    path: ['Education Dept', 'DM Office', 'CM Office'],
    currentStep: 1,
    totalSteps: 3,
    status: 'Pending Approval',
    remarks: [
      { author: 'Ritu Singh', action: 'Created', text: 'MoU for skill mission partnership with National Skill Dev. Corp', date: daysAgo(4) },
    ],
  },
];

// =============================================================================
// 9. MESSAGES
// =============================================================================

export const DUMMY_MESSAGES: Message[] = [
  {
    id: 'MSG-001',
    senderName: 'DM New Delhi',
    senderRole: 'District Magistrate',
    receiverRole: 'Chief Minister',
    content: 'Sir, the Yamuna rejuvenation report has been reviewed. We are on track to meet the NGT deadline. Full EIA report has been escalated for CM signature.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'MSG-002',
    senderName: 'CM Office',
    senderRole: 'Chief Minister',
    receiverRole: 'District Magistrate',
    content: 'Please expedite the Mohalla Clinic staffing file. We need 50 clinics operational before the monsoon session in Parliament.',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'MSG-003',
    senderName: 'Health Dept Head',
    senderRole: 'Department Head',
    receiverRole: 'District Magistrate',
    content: 'Anti-rabies vaccine stock has been verified and dispatched to Ward 55. Dog-catching teams coordinating with MCD.',
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'MSG-004',
    senderName: 'CM Office',
    senderRole: 'Chief Minister',
    receiverRole: 'Department Head',
    content: 'Good work on the clinic expansion. Please prepare a summary report for Monday\'s cabinet meeting.',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'MSG-005',
    senderName: 'DM Shahdara',
    senderRole: 'District Magistrate',
    receiverRole: 'Chief Minister',
    content: 'Waterlogging at Shahdara Metro has been resolved by DJB. Drainage system upgrades will prevent recurrence during monsoon.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

// =============================================================================
// 10. WELFARE APPLICATIONS
// =============================================================================

export const DUMMY_WELFARE_APPS: WelfareApplication[] = [
  {
    _id: 'WEL-001',
    citizen: 'Bimla Devi (Age 78)',
    scheme: 'Old Age Pension Scheme',
    doc: 'Aadhaar, Bank Passbook',
    status: 'Approved',
  },
  {
    _id: 'WEL-002',
    citizen: 'Suresh Kumar (Age 62)',
    scheme: 'Disability Pension',
    doc: 'Disability Certificate, Aadhaar',
    status: 'Pending',
  },
  {
    _id: 'WEL-003',
    citizen: 'Fatima Begum (Age 45)',
    scheme: 'Widow Pension Scheme',
    doc: 'Death Certificate of Spouse, Aadhaar',
    status: 'Pending',
  },
  {
    _id: 'WEL-004',
    citizen: 'Raju Yadav (Age 34)',
    scheme: 'Labour Welfare Scheme',
    doc: 'Labour Card, Income Certificate',
    status: 'Rejected',
  },
  {
    _id: 'WEL-005',
    citizen: 'Kamla Singh (Age 55)',
    scheme: 'Free Ration (PMGKAY)',
    doc: 'Ration Card, Aadhaar',
    status: 'Approved',
  },
  {
    _id: 'WEL-006',
    citizen: 'Deepak Sharma (Age 28)',
    scheme: 'Delhi Rozgar Yojana',
    doc: 'Education Certificate, Aadhaar',
    status: 'Pending',
  },
];

// =============================================================================
// 11. HEALTH METRICS (Beds)
// =============================================================================

export const DUMMY_HEALTH_BEDS = [
  { district: 'New Delhi',       totalBeds: 1200, occupiedBeds: 890, icuBeds: 120, icuOccupied: 98  },
  { district: 'North Delhi',     totalBeds: 800,  occupiedBeds: 610, icuBeds: 80,  icuOccupied: 55  },
  { district: 'East Delhi',      totalBeds: 950,  occupiedBeds: 720, icuBeds: 95,  icuOccupied: 74  },
  { district: 'West Delhi',      totalBeds: 700,  occupiedBeds: 480, icuBeds: 70,  icuOccupied: 40  },
  { district: 'South Delhi',     totalBeds: 1100, occupiedBeds: 830, icuBeds: 110, icuOccupied: 85  },
  { district: 'Shahdara',        totalBeds: 650,  occupiedBeds: 500, icuBeds: 65,  icuOccupied: 50  },
  { district: 'Central Delhi',   totalBeds: 900,  occupiedBeds: 680, icuBeds: 90,  icuOccupied: 67  },
  { district: 'North East Delhi',totalBeds: 550,  occupiedBeds: 420, icuBeds: 55,  icuOccupied: 45  },
];

// =============================================================================
// 12. HEALTH METRICS (Inventory)
// =============================================================================

export const DUMMY_HEALTH_INVENTORY = [
  { item: 'Paracetamol 500mg',     stock: 125000, unit: 'Tablets',  reorderLevel: 50000, status: 'Adequate'  },
  { item: 'Amoxicillin 500mg',     stock: 38000,  unit: 'Capsules', reorderLevel: 40000, status: 'Low'       },
  { item: 'ORS Sachets',           stock: 85000,  unit: 'Packets',  reorderLevel: 30000, status: 'Adequate'  },
  { item: 'Insulin Vials',         stock: 4200,   unit: 'Vials',    reorderLevel: 5000,  status: 'Critical'  },
  { item: 'Surgical Masks (N95)',  stock: 220000, unit: 'Units',    reorderLevel: 100000,status: 'Adequate'  },
  { item: 'Anti-Rabies Vaccine',   stock: 1800,   unit: 'Doses',    reorderLevel: 2000,  status: 'Low'       },
  { item: 'Disposable Syringes',   stock: 95000,  unit: 'Units',    reorderLevel: 50000, status: 'Adequate'  },
  { item: 'Blood Pressure Monitor',stock: 310,    unit: 'Devices',  reorderLevel: 200,   status: 'Adequate'  },
];

// =============================================================================
// 13. EDUCATION METRICS (Smart Boards)
// =============================================================================

export const DUMMY_SCHOOL_SMART_BOARDS = [
  { district: 'New Delhi',        schools: 180, withSmartBoard: 145, pct: 80.6 },
  { district: 'North Delhi',      schools: 120, withSmartBoard: 74,  pct: 61.7 },
  { district: 'East Delhi',       schools: 140, withSmartBoard: 98,  pct: 70.0 },
  { district: 'West Delhi',       schools: 130, withSmartBoard: 80,  pct: 61.5 },
  { district: 'South Delhi',      schools: 155, withSmartBoard: 118, pct: 76.1 },
  { district: 'Shahdara',         schools: 95,  withSmartBoard: 52,  pct: 54.7 },
  { district: 'Central Delhi',    schools: 110, withSmartBoard: 88,  pct: 80.0 },
  { district: 'North East Delhi', schools: 85,  withSmartBoard: 40,  pct: 47.1 },
];

// =============================================================================
// 14. GENERAL METRICS (displayed in Overview / Dashboard KPI cards)
// =============================================================================

export const DUMMY_GENERAL_METRICS: Record<string, string> = {
  totalComplaints:        '2,847',
  resolvedThisMonth:      '1,204',
  avgResolutionDays:      '7.8',
  slaBreachPct:           '12.3',
  citizenSatisfaction:    '4.1',
  totalOfficers:          '342',
  activeProjects:         '18',
  totalProjectBudget:     '₹23,540 Cr',
  rtiDisposalRate:        '87.5%',
  escalationsThisMonth:   '24',
  pendingEscalations:     '8',
  pendingWelfare:         '134',
  healthBedsOccupancy:    '74.2%',
  smartBoardCoverage:     '68.9%',
};

// =============================================================================
// 15. Helper: dummy loginUser function (mirrors backend auth)
// =============================================================================

/**
 * Validates credentials against DUMMY_USERS and returns a UserProfile on success.
 * Returns null on failure (mimics a failed API auth response).
 */
export function validateDummyLogin(
  username: string,
  password: string
): UserProfile | null {
  const found = DUMMY_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) return null;
  // Strip password before returning
  const { password: _pw, ...profile } = found;
  return profile as UserProfile;
}
