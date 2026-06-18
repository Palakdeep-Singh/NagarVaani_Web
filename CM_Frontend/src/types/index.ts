export type ComplaintCategory =
  | 'Civic Infrastructure'
  | 'Water & Sewage'
  | 'Electricity & Power'
  | 'Public Health'
  | 'Education & Schools'
  | 'Law & Policing'
  | 'Transport & Roads'
  | 'Social Welfare';

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

export interface UserProfile {
  username: string;
  role: 'Chief Minister' | 'District Magistrate' | 'Department Head';
  district?: DistrictName;
  department?: 'Education & Schools' | 'Public Health' | 'PWD & Infrastructure';
}
