export type ComplaintCategory =
  | 'Civic Infrastructure'
  | 'Water & Sewage'
  | 'Electricity & Power'
  | 'Public Health'
  | 'Education & Schools'
  | 'Law & Policing'
  | 'Transport & Roads'
  | 'Social Welfare'
  | 'Revenue & Land'
  | 'Sanitation'
  | 'Noise Pollution'
  | 'Stray Animals';

export type ComplaintStatus = 'Pending' | 'Active' | 'Resolved' | 'Escalated';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export type DistrictName =
  | 'New Delhi'
  | 'North Delhi'
  | 'North West Delhi'
  | 'West Delhi'
  | 'South West Delhi'
  | 'South Delhi'
  | 'South East Delhi'
  | 'Central Delhi'
  | 'East Delhi'
  | 'Shahdara'
  | 'North East Delhi';

export interface TimelineEvent {
  date: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  district: DistrictName;
  department: string;
  citizenName: string;
  citizenPhone: string;
  dateFiled: string;
  timeline: TimelineEvent[];
  ward?: string;
  assignedSDM?: string;
  assignedOfficer?: string;
  subCategory?: string;
  aiSuggestedCategory?: string;
  aiSuggestedSubCategory?: string;
  citizenRating?: number;
  isReopen?: boolean;
  batchId?: string;
  crossDeptTicket?: boolean;
  slaDay?: number;
  interimSent?: boolean;
  locality?: string;
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

export interface Project {
  id: string;
  title: string;
  department: string;
  budgetAllocated: number;
  budgetSpent: number;
  physicalProgress: number; 
  startDate: string;
  endDate: string;
  status: 'On Track' | 'Delayed' | 'Critical' | 'Completed';
  manager: string;
  description: string;
}

export interface Officer {
  id: string;
  name: string;
  designation: string;
  department: string;
  district?: DistrictName;
  resolutionRate: number; 
  avgResolutionTime: number; 
  activeComplaints: number;
  completedComplaints: number;
  rating: number; 
}

export interface FileRemark {
  author: string;
  action: string;
  text: string;
  date: string;
}

export interface DigitalFile {
  id: string;
  title: string;
  priority: 'Routine' | 'Urgent' | 'Immediate';
  dateCreated: string;
  initiator: string;
  currentOwner: string;
  department: string;
  path: string[]; 
  currentStep: number; 
  totalSteps: number;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  remarks: FileRemark[];
}

export interface Message {
  id: string;
  senderName: string;
  senderRole: string; 
  receiverRole: string;
  content: string;
  timestamp: string;
}

export interface DistrictMetric {
  name: DistrictName;
  activeGrievances: number;
  resolvedGrievances: number;
  score: number; 
}

export type BoothStatus = 'Normal' | 'Watch' | 'Critical' | 'Resolved';

export interface BoothIncident {
  id: string;
  time: string;
  type: 'EVM Issue' | 'Queue Surge' | 'Crowd/Law & Order' | 'Staff Shortage' | 'Voter Complaint' | 'Other';
  description: string;
  status: BoothStatus;
}

export interface Booth {
  id: string;
  boothNumber: string;
  name: string;
  district: DistrictName;
  ward: string;
  presidingOfficer: string;
  registeredVoters: number;
  votesCast: number;
  turnoutPct: number;
  status: BoothStatus;
  queueLengthMins: number;
  lastUpdated: string;
  incidents: BoothIncident[];
}

export type ElectionRole =
  | 'CEO'
  | 'DEO'
  | 'Returning Officer'
  | 'Sector Officer'
  | 'Presiding Officer'
  | 'Polling Officer'
  | 'Chief Minister';

export type EVMStatus = 'Warehouse' | 'In Transit' | 'At Booth' | 'Sealed Post-Poll' | 'Returned to Warehouse';

export interface EVMScanEvent {
  id: string;
  time: string;
  scannedBy: string;
  location: string;
  gpsLat: number;
  gpsLng: number;
  qrCode: string;
  note: string;
}

export interface EVMUnit {
  id: string;
  serialNumber: string;
  type: 'Control Unit' | 'Ballot Unit' | 'VVPAT';
  status: EVMStatus;
  assignedBoothNumber: string;
  district: DistrictName;
  custodyOfficer: string;
  history: EVMScanEvent[];
}

export interface MockPollChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface MockPollSession {
  id: string;
  boothNumber: string;
  district: DistrictName;
  scheduledTime: string;
  status: 'Scheduled' | 'In Progress' | 'Passed' | 'Failed';
  conductedBy: string;
  checklist: MockPollChecklistItem[];
  remarks: string;
}

export type EmergencyType = 'Long Queue' | 'EVM Malfunction' | 'Law & Order' | 'Medical Emergency' | 'Violence/Booth Capturing' | 'Staff Shortage' | 'Other';
export type EmergencySeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type EmergencyStatus = 'Open' | 'Acknowledged' | 'Resolving' | 'Resolved';

export interface EmergencyIncident {
  id: string;
  boothNumber: string;
  district: DistrictName;
  type: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  reportedAt: string;
  slaMinutes: number;
  assignedTo: string;
  description: string;
}

export interface TurnoutHourPoint {
  hour: string;
  turnoutPct: number;
  votesCast: number;
}

export interface UserProfile {
  username: string;
  role: 'Chief Minister' | 'District Magistrate' | 'Department Head';
  district?: DistrictName;
  department?: 'Education & Schools' | 'Public Health' | 'PWD & Infrastructure';
}

export interface WelfareApplication {
  _id: string;
  citizen: string;
  scheme: string;
  doc: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
