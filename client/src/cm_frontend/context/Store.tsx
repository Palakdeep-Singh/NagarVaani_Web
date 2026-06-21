import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Complaint,
  Project,
  Officer,
  DigitalFile,
  Message,
  DistrictName,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
  TimelineEvent,
  UserProfile
} from '../types';

interface DashboardContextType {
  complaints: Complaint[];
  projects: Project[];
  officers: Officer[];
  files: DigitalFile[];
  messages: Message[];
  activeRole: 'Chief Minister' | 'District Magistrate' | 'Department Head';
  activeDistrict: DistrictName;
  activeDepartment: 'Education & Schools' | 'Public Health' | 'PWD & Infrastructure';
  activeTab: string;
  currentUser: UserProfile | null;
  setActiveRole: (role: 'Chief Minister' | 'District Magistrate' | 'Department Head') => void;
  setActiveDistrict: (district: DistrictName) => void;
  setActiveDepartment: (dept: 'Education & Schools' | 'Public Health' | 'PWD & Infrastructure') => void;
  setActiveTab: (tab: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'dateFiled' | 'timeline'>) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, remarkText?: string, actor?: string) => void;
  addMessage: (content: string, receiverRole: string) => void;
  approveFile: (fileId: string, remarkText: string) => void;
  rejectFile: (fileId: string, remarkText: string) => void;
  updateProjectProgress: (projectId: string, progress: number, status?: 'On Track' | 'Delayed' | 'Critical' | 'Completed') => void;
  addNewProject: (project: Omit<Project, 'id' | 'budgetSpent' | 'physicalProgress'>) => void;
  loginUser: (username: string, password: string) => boolean;
  registerUser: (username: string, password: string, role: 'Chief Minister' | 'District Magistrate' | 'Department Head', district?: DistrictName, department?: 'Education & Schools' | 'Public Health' | 'PWD & Infrastructure') => boolean;
  logoutUser: () => void;
  showAIPanel: boolean;
  setShowAIPanel: (val: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const INITIAL_DISTRICTS: DistrictName[] = [
  'New Delhi', 'North Delhi', 'North West Delhi', 'West Delhi',
  'South West Delhi', 'South Delhi', 'South East Delhi', 'Central Delhi',
  'East Delhi', 'Shahdara', 'North East Delhi'
];

const DEPARTMENTS = {
  'Civic Infrastructure': 'PWD & Infrastructure',
  'Water & Sewage': 'Delhi Jal Board',
  'Electricity & Power': 'Power Department',
  'Public Health': 'Health & Family Welfare',
  'Education & Schools': 'Education Department',
  'Law & Policing': 'Delhi Police',
  'Transport & Roads': 'Transport Department',
  'Social Welfare': 'Social Welfare Department'
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('nagarvaani_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showAIPanel, setShowAIPanel] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState<Record<string, { password: string; profile: UserProfile }>>(() => {
    const savedList = localStorage.getItem('nagarvaani_users');
    if (savedList) return JSON.parse(savedList);

    
    const initialAccounts = {
      cm: {
        password: 'cm123',
        profile: { username: 'cm', role: 'Chief Minister' as const }
      },
      newdelhidm: {
        password: 'dm123',
        profile: { username: 'newdelhidm', role: 'District Magistrate' as const, district: 'New Delhi' as const }
      },
      healthhead: {
        password: 'dept123',
        profile: { username: 'healthhead', role: 'Department Head' as const, department: 'Public Health' as const }
      }
    };
    localStorage.setItem('nagarvaani_users', JSON.stringify(initialAccounts));
    return initialAccounts;
  });

  
  const [activeRole, setActiveRole] = useState<'Chief Minister' | 'District Magistrate' | 'Department Head'>(() => {
    const savedUser = localStorage.getItem('nagarvaani_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as UserProfile;
      return parsed.role;
    }
    return 'Chief Minister';
  });

  const [activeDistrict, setActiveDistrict] = useState<DistrictName>(() => {
    const savedUser = localStorage.getItem('nagarvaani_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as UserProfile;
      if (parsed.district) return parsed.district;
    }
    return 'New Delhi';
  });

  const [activeDepartment, setActiveDepartment] = useState<'Education & Schools' | 'Public Health' | 'PWD & Infrastructure'>(() => {
    const savedUser = localStorage.getItem('nagarvaani_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as UserProfile;
      if (parsed.department) return parsed.department;
    }
    return 'Public Health';
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedUser = localStorage.getItem('nagarvaani_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as UserProfile;
      if (parsed.role === 'District Magistrate') return 'DistrictMinistry';
      if (parsed.role === 'Department Head') return 'OfficerWorkspace';
    }
    return 'Overview';
  });

  
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('nagarvaani_complaints');
    return saved ? JSON.parse(saved) : [];
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('nagarvaani_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [officers, setOfficers] = useState<Officer[]>(() => {
    const saved = localStorage.getItem('nagarvaani_officers');
    return saved ? JSON.parse(saved) : [];
  });
  const [files, setFiles] = useState<DigitalFile[]>(() => {
    const saved = localStorage.getItem('nagarvaani_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('nagarvaani_messages');
    return saved ? JSON.parse(saved) : [];
  });

  
  useEffect(() => {
    const savedComplaints = localStorage.getItem('nagarvaani_complaints');
    const savedProjects = localStorage.getItem('nagarvaani_projects');
    const savedOfficers = localStorage.getItem('nagarvaani_officers');
    const savedFiles = localStorage.getItem('nagarvaani_files');
    const savedMessages = localStorage.getItem('nagarvaani_messages');

    if (savedComplaints && savedProjects && savedOfficers && savedFiles && savedMessages) {
      return;
    }
    
    const initialComplaints: Complaint[] = [
      {
        id: 'GRV-2026-001',
        title: 'Waterlogging at Ring Road near Lajpat Nagar Flyover',
        category: 'Civic Infrastructure',
        description: 'Every year during rains, the drain underneath the Lajpat Nagar flyover gets clogged, causing massive waterlogging up to 3 feet. Trapped traffic stretches for kilometers. Need immediate cleaning before heavy monsoon.',
        status: 'Active',
        priority: 'High',
        district: 'South Delhi',
        department: 'PWD & Infrastructure',
        citizenName: 'Amit Sharma',
        citizenPhone: '98123XXXXX',
        dateFiled: '2026-06-10',
        timeline: [
          { date: '2026-06-10', action: 'Grievance Registered', actor: 'Citizen Portal' },
          { date: '2026-06-11', action: 'Assigned to PWD Sub-Division', actor: 'Automated Router' },
          { date: '2026-06-12', action: 'Site Inspection Conducted', actor: 'Executive Engineer PWD' }
        ]
      },
      {
        id: 'GRV-2026-002',
        title: 'Shortage of Medicines and ICU Beds at GTB Hospital',
        category: 'Public Health',
        description: 'The emergency wing is facing extreme shortage of essential antibiotics and syringe pumps. Also, the online bed tracking shows 12 vacant ICU beds but the hospital desk is refusing admissions.',
        status: 'Escalated',
        priority: 'Emergency',
        district: 'Shahdara',
        department: 'Health & Family Welfare',
        citizenName: 'Priya Mehra',
        citizenPhone: '97115XXXXX',
        dateFiled: '2026-06-14',
        timeline: [
          { date: '2026-06-14', action: 'Grievance Registered', actor: 'Citizen Portal' },
          { date: '2026-06-14', action: 'Assigned to Medical Superintendent', actor: 'Health Directorate' },
          { date: '2026-06-15', action: 'Escalated to Director Health Services', actor: 'System Auto-Escalator' }
        ]
      },
      {
        id: 'GRV-2026-003',
        title: 'Smartboards not functional in Sarvodaya Kanya Vidyalaya',
        category: 'Education & Schools',
        description: 'The digital boards installed in Class 9 and 10 rooms have been dead for 3 weeks. The local agency is not responding to calls. Online classes and interactive sessions are disrupted.',
        status: 'Pending',
        priority: 'Medium',
        district: 'North West Delhi',
        department: 'Education Department',
        citizenName: 'Rajesh Kumar',
        citizenPhone: '99580XXXXX',
        dateFiled: '2026-06-16',
        timeline: [
          { date: '2026-06-16', action: 'Grievance Registered', actor: 'Citizen Portal' },
          { date: '2026-06-17', action: 'Assigned to School Principal & Zonal Head', actor: 'Education Router' }
        ]
      },
      {
        id: 'GRV-2026-004',
        title: 'Frequent 4-hour Power Cuts in Dwarka Sector 12',
        category: 'Electricity & Power',
        description: 'BSES Rajdhani is scheduling unannounced power cuts daily from 2 PM to 6 PM. In this blistering heat of 45 degrees, senior citizens are suffering. No updates on helpline.',
        status: 'Resolved',
        priority: 'High',
        district: 'South West Delhi',
        department: 'Power Department',
        citizenName: 'Suresh Iyer',
        citizenPhone: '98991XXXXX',
        dateFiled: '2026-06-05',
        timeline: [
          { date: '2026-06-05', action: 'Grievance Registered', actor: 'Citizen Portal' },
          { date: '2026-06-06', action: 'Assigned to BSES Nodal Officer', actor: 'Power Grid Routing' },
          { date: '2026-06-08', action: 'Transformer Repair Done', actor: 'BSES Field Team' },
          { date: '2026-06-09', action: 'Grievance Resolved successfully', actor: 'BSES Nodal Officer', notes: 'Replaced faulty 400kVA transformer coil. Citizen confirmed resolution.' }
        ]
      },
      {
        id: 'GRV-2026-005',
        title: 'Contaminated muddy water supply in Vikas Puri',
        category: 'Water & Sewage',
        description: 'Since last Thursday, the tap water supply is pitch black and smells of sewage. It is totally unfit even for washing dishes. Multiple complaints to local DJB office went unaddressed.',
        status: 'Active',
        priority: 'High',
        district: 'West Delhi',
        department: 'Delhi Jal Board',
        citizenName: 'Manpreet Singh',
        citizenPhone: '96543XXXXX',
        dateFiled: '2026-06-12',
        timeline: [
          { date: '2026-06-12', action: 'Grievance Registered', actor: 'Citizen Portal' },
          { date: '2026-06-13', action: 'Assigned to Assistant Engineer DJB', actor: 'DJB Central Router' },
          { date: '2026-06-15', action: 'Site Excavation to locate pipe leak started', actor: 'West Delhi DJB' }
        ]
      },
      {
        id: 'GRV-2026-006',
        title: 'Open garbage dump near MCD Primary School',
        category: 'Civic Infrastructure',
        description: 'An illegal garbage dump has accumulated right in front of the gate of MCD Primary school. Stray dogs and cows roam around, creating a health hazard for little kids.',
        status: 'Pending',
        priority: 'Medium',
        district: 'East Delhi',
        department: 'PWD & Infrastructure',
        citizenName: 'Nisha Rani',
        citizenPhone: '88002XXXXX',
        dateFiled: '2026-06-17',
        timeline: [
          { date: '2026-06-17', action: 'Grievance Registered', actor: 'Citizen Portal' }
        ]
      },
      {
        id: 'GRV-2026-007',
        title: 'Streetlights defunct on Outer Ring Road, Pitampura',
        category: 'Electricity & Power',
        description: 'A dark stretch of 1.5 km near Pitampura metro station has no working streetlights. Extremely unsafe for women walking home from metro station after 8 PM.',
        status: 'Active',
        priority: 'High',
        district: 'North West Delhi',
        department: 'Power Department',
        citizenName: 'Kirti Sen',
        citizenPhone: '99110XXXXX',
        dateFiled: '2026-06-11',
        timeline: [
          { date: '2026-06-11', action: 'Grievance Registered', actor: 'Citizen Portal' },
          { date: '2026-06-12', action: 'Assigned to PWD Electrical division', actor: 'System Router' }
        ]
      },
      {
        id: 'GRV-2026-008',
        title: 'Potholes causing accidents near Karol Bagh Market',
        category: 'Transport & Roads',
        description: 'Multiple deep potholes on Padam Singh Road are causing two-wheelers to slip. Three major slips occurred today. Patchwork is urgently needed.',
        status: 'Active',
        priority: 'High',
        district: 'Central Delhi',
        department: 'Transport Department',
        citizenName: 'Rahul Gupta',
        citizenPhone: '95603XXXXX',
        dateFiled: '2026-06-14',
        timeline: [
          { date: '2026-06-14', action: 'Grievance Registered', actor: 'Citizen' },
          { date: '2026-06-15', action: 'Assigned to MCD Maintenance Wing', actor: 'System' }
        ]
      },
      {
        id: 'GRV-2026-009',
        title: 'Inadequate staff in Mohalla Clinic, Yamuna Vihar',
        category: 'Public Health',
        description: 'The clinic opens at 9 AM but the doctor arrives only by 11 AM. The pharmacist is frequently absent, forcing poor citizens to buy medicines from private chemist shops.',
        status: 'Active',
        priority: 'Medium',
        district: 'North East Delhi',
        department: 'Health & Family Welfare',
        citizenName: 'Sohan Lal',
        citizenPhone: '98188XXXXX',
        dateFiled: '2026-06-13',
        timeline: [
          { date: '2026-06-13', action: 'Grievance Registered', actor: 'Citizen' },
          { date: '2026-06-14', action: 'Assigned to CDMO North East', actor: 'Health Directorate' }
        ]
      },
      {
        id: 'GRV-2026-010',
        title: 'No water supply for 3 days in Shahdara Block C',
        category: 'Water & Sewage',
        description: 'Absolutely no water coming in the pipelines since Monday morning. No DJB water tanker has been sent despite multiple requests to the ward councillor.',
        status: 'Active',
        priority: 'High',
        district: 'Shahdara',
        department: 'Delhi Jal Board',
        citizenName: 'Gaurav Kumar',
        citizenPhone: '98104XXXXX',
        dateFiled: '2026-06-15',
        timeline: [
          { date: '2026-06-15', action: 'Grievance Registered', actor: 'Citizen' },
          { date: '2026-06-16', action: 'Assigned to DJB Executive Engineer', actor: 'System' }
        ]
      },
      {
        id: 'GRV-2026-011',
        title: 'Open Manhole near Senior Secondary School, Connaught Place',
        category: 'Civic Infrastructure',
        description: 'An open sewer manhole is lying right on the footpath near gate no 2 of the school. It poses a grave threat to school kids running out in the afternoon.',
        status: 'Pending',
        priority: 'Emergency',
        district: 'New Delhi',
        department: 'PWD & Infrastructure',
        citizenName: 'Karan Johar',
        citizenPhone: '99101XXXXX',
        dateFiled: '2026-06-17',
        timeline: [
          { date: '2026-06-17', action: 'Grievance Registered', actor: 'Citizen' }
        ]
      },
      {
        id: 'GRV-2026-012',
        title: 'Reckless e-rickshaw parking causing traffic jam at Seelampur',
        category: 'Transport & Roads',
        description: 'Dozens of e-rickshaws park right at the exit of Seelampur Metro Station. The road width is reduced to one lane, making commute during rush hour absolute torture.',
        status: 'Resolved',
        priority: 'Medium',
        district: 'North East Delhi',
        department: 'Transport Department',
        citizenName: 'Mohd. Sajid',
        citizenPhone: '95821XXXXX',
        dateFiled: '2026-06-03',
        timeline: [
          { date: '2026-06-03', action: 'Grievance Registered', actor: 'Citizen' },
          { date: '2026-06-04', action: 'Assigned to Traffic Police (East Zone)', actor: 'System' },
          { date: '2026-06-06', action: 'Enforcement Drive Conducted', actor: 'TI Seelampur Office' },
          { date: '2026-06-07', action: 'Grievance Resolved successfully', actor: 'Traffic Inspector', notes: 'Created a designated charging/parking bay. Impounded 12 illegal rickshaws.' }
        ]
      }
    ];

    
    const extraTitles = [
      { t: 'Potholes near metro pillar 102', c: 'Transport & Roads' as ComplaintCategory },
      { t: 'Drain overflow in block E housing block', c: 'Water & Sewage' as ComplaintCategory },
      { t: 'Drug peddling in local public park', c: 'Law & Policing' as ComplaintCategory },
      { t: 'Low voltage issues damaging appliances', c: 'Electricity & Power' as ComplaintCategory },
      { t: 'Mid-day meal quality concerns in govt school', c: 'Education & Schools' as ComplaintCategory },
      { t: 'Dengue breeding due to stagnant water in construction site', c: 'Public Health' as ComplaintCategory },
      { t: 'Pension disbursement delayed by two months', c: 'Social Welfare' as ComplaintCategory },
      { t: 'Broken swings in children park', c: 'Civic Infrastructure' as ComplaintCategory }
    ];

    let startIdNum = 13;
    const districtList = INITIAL_DISTRICTS;
    
    
    for (let i = 0; i < 20; i++) {
      const titleObj = extraTitles[i % extraTitles.length];
      const dist = districtList[i % districtList.length];
      const category = titleObj.c;
      const dept = DEPARTMENTS[category];
      const randDay = 1 + (i % 17);
      
      const states: ComplaintStatus[] = ['Pending', 'Active', 'Resolved', 'Escalated'];
      const priorities: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Emergency'];
      const state = states[i % states.length];
      const priority = priorities[i % priorities.length];

      initialComplaints.push({
        id: `GRV-2026-0${startIdNum++}`,
        title: `${titleObj.t} (${dist})`,
        category,
        description: `This is a simulated description detailing public grievances regarding ${titleObj.t.toLowerCase()} located in ${dist}. Residents have raised this multiple times in community forums.`,
        status: state,
        priority,
        district: dist,
        department: dept,
        citizenName: `Citizen ${i + 10}`,
        citizenPhone: `992000${1000 + i}`,
        dateFiled: `2026-06-${randDay < 10 ? '0' + randDay : randDay}`,
        timeline: [
          { date: `2026-06-${randDay < 10 ? '0' + randDay : randDay}`, action: 'Grievance Registered', actor: 'Citizen Portal' },
          ...(state !== 'Pending' ? [{ date: `2026-06-${randDay + 1}`, action: 'Assigned to Nodal Officer', actor: 'Router' }] : []),
          ...(state === 'Resolved' ? [{ date: `2026-06-${randDay + 2}`, action: 'Grievance Resolved', actor: 'Department Staff', notes: 'Action taken and resolved.' }] : [])
        ]
      });
    }

    setComplaints(initialComplaints);

    
    const initialProjects: Project[] = [
      {
        id: 'PRJ-DEL-101',
        title: 'Barapullah Phase-III Extension Flyover',
        department: 'PWD & Infrastructure',
        budgetAllocated: 1260000000, 
        budgetSpent: 980000000, 
        physicalProgress: 82,
        startDate: '2023-01-15',
        endDate: '2026-09-30',
        status: 'On Track',
        manager: 'Er. R.K. Bhardwaj (Chief Engineer PWD)',
        description: 'Construction of bridge over River Yamuna connecting Mayur Vihar Phase-I to Sarai Kale Khan, easing traffic between East and South Delhi.'
      },
      {
        id: 'PRJ-DEL-102',
        title: 'Mohalla Clinics Digital Upgrade (Phase 4)',
        department: 'Health & Family Welfare',
        budgetAllocated: 450000000, 
        budgetSpent: 410000000, 
        physicalProgress: 91,
        startDate: '2024-05-10',
        endDate: '2026-07-15',
        status: 'On Track',
        manager: 'Dr. Shalini Gupta (Director Health)',
        description: 'Deployment of automated cloud diagnostic terminals, digital medicine dispensaries, and centralized EHR integration across all 500+ operational clinics.'
      },
      {
        id: 'PRJ-DEL-103',
        title: '100 Model Smart Schools Infrastructure Project',
        department: 'Education Department',
        budgetAllocated: 1850000000, 
        budgetSpent: 920000000, 
        physicalProgress: 49,
        startDate: '2025-02-01',
        endDate: '2026-12-31',
        status: 'Delayed',
        manager: 'Shri Himanshu Gupta (IAS, Director Education)',
        description: 'Renovation of govt school campuses into smart hubs equipped with computer labs, specialized physics/chemistry modules, and modern sports complexes.'
      },
      {
        id: 'PRJ-DEL-104',
        title: 'Signature Bridge Heritage Tourist Hub',
        department: 'PWD & Infrastructure',
        budgetAllocated: 320000000, 
        budgetSpent: 310000000, 
        physicalProgress: 98,
        startDate: '2024-08-20',
        endDate: '2026-06-25',
        status: 'Completed',
        manager: 'Smt. Alka Lamba (PWD Project Head)',
        description: 'Beautification of Signature Bridge bank, construction of glass elevators, selfie decks, and eco-parks for tourism enhancement.'
      },
      {
        id: 'PRJ-DEL-105',
        title: 'Yamuna Interceptor Sewer Project (Sonia Vihar)',
        department: 'Delhi Jal Board',
        budgetAllocated: 2400000000, 
        budgetSpent: 1650000000, 
        physicalProgress: 68,
        startDate: '2024-01-10',
        endDate: '2026-11-20',
        status: 'Critical',
        manager: 'Er. Vipin Kumar (Member Drainage DJB)',
        description: 'Laying of 24 km interceptor sewers along major storm drains to divert raw sewage to Sewage Treatment Plants (STPs) before entering River Yamuna.'
      }
    ];
    setProjects(initialProjects);

    
    const initialOfficers: Officer[] = [
      {
        id: 'OFF-001',
        name: 'Smt. Alice Vaz (IAS)',
        designation: 'District Magistrate',
        department: 'Revenue & Grievance',
        district: 'New Delhi',
        resolutionRate: 94,
        avgResolutionTime: 2.4,
        activeComplaints: 12,
        completedComplaints: 240,
        rating: 4.8
      },
      {
        id: 'OFF-002',
        name: 'Shri Amit Kumar (IAS)',
        designation: 'District Magistrate',
        department: 'Revenue & Grievance',
        district: 'West Delhi',
        resolutionRate: 88,
        avgResolutionTime: 3.8,
        activeComplaints: 45,
        completedComplaints: 310,
        rating: 4.3
      },
      {
        id: 'OFF-003',
        name: 'Smt. Cheshta Yadav (IAS)',
        designation: 'District Magistrate',
        department: 'Revenue & Grievance',
        district: 'South Delhi',
        resolutionRate: 91,
        avgResolutionTime: 3.1,
        activeComplaints: 28,
        completedComplaints: 280,
        rating: 4.6
      },
      {
        id: 'OFF-004',
        name: 'Shri Anil Bankar (IAS)',
        designation: 'District Magistrate',
        department: 'Revenue & Grievance',
        district: 'Shahdara',
        resolutionRate: 67,
        avgResolutionTime: 7.2,
        activeComplaints: 62,
        completedComplaints: 125,
        rating: 3.2
      },
      {
        id: 'OFF-005',
        name: 'Shri Vikram Singh (IAS)',
        designation: 'District Magistrate',
        department: 'Revenue & Grievance',
        district: 'North East Delhi',
        resolutionRate: 72,
        avgResolutionTime: 6.5,
        activeComplaints: 51,
        completedComplaints: 140,
        rating: 3.5
      },
      {
        id: 'OFF-006',
        name: 'Dr. Shalini Gupta',
        designation: 'Director Health Services',
        department: 'Health & Family Welfare',
        resolutionRate: 85,
        avgResolutionTime: 4.1,
        activeComplaints: 110,
        completedComplaints: 620,
        rating: 4.2
      },
      {
        id: 'OFF-007',
        name: 'Shri Himanshu Gupta (IAS)',
        designation: 'Director of Education',
        department: 'Education Department',
        resolutionRate: 89,
        avgResolutionTime: 3.5,
        activeComplaints: 75,
        completedComplaints: 590,
        rating: 4.5
      },
      {
        id: 'OFF-008',
        name: 'Er. R.K. Bhardwaj',
        designation: 'Chief Engineer',
        department: 'PWD & Infrastructure',
        resolutionRate: 78,
        avgResolutionTime: 5.8,
        activeComplaints: 145,
        completedComplaints: 410,
        rating: 3.8
      },
      {
        id: 'OFF-009',
        name: 'Smt. Isha Khosla (IAS)',
        designation: 'District Magistrate',
        department: 'Revenue & Grievance',
        district: 'Central Delhi',
        resolutionRate: 93,
        avgResolutionTime: 2.1,
        activeComplaints: 15,
        completedComplaints: 198,
        rating: 4.7
      },
      {
        id: 'OFF-010',
        name: 'Shri Santosh Kumar (IAS)',
        designation: 'District Magistrate',
        department: 'Revenue & Grievance',
        district: 'North West Delhi',
        resolutionRate: 81,
        avgResolutionTime: 4.5,
        activeComplaints: 39,
        completedComplaints: 215,
        rating: 4.0
      },
      {
        id: 'OFF-011',
        name: 'Shri Pradeep Kumar (IAS)',
        designation: 'District Magistrate',
        department: 'Revenue & Grievance',
        district: 'East Delhi',
        resolutionRate: 75,
        avgResolutionTime: 5.2,
        activeComplaints: 42,
        completedComplaints: 176,
        rating: 3.6
      }
    ];
    setOfficers(initialOfficers);

    
    const initialFiles: DigitalFile[] = [
      {
        id: 'DF-2026-302',
        title: 'Budget Allocation Proposal for 50 New Mohalla Clinics in Outer Delhi Wards',
        priority: 'Immediate',
        dateCreated: '2026-06-12',
        initiator: 'Medical Superintendent DHS',
        currentOwner: 'Minister of Health',
        department: 'Health & Family Welfare',
        path: ['Medical Superintendent DHS', 'Director Health Services', 'Minister of Health', 'Finance Secretary', 'Chief Minister'],
        currentStep: 2,
        totalSteps: 5,
        status: 'Pending Approval',
        remarks: [
          { author: 'Medical Superintendent DHS', action: 'Initiated', text: 'Proposed allocation of ₹18 Cr for setting up pre-fab clinics in rural sectors.', date: '2026-06-12' },
          { author: 'Director Health Services', action: 'Recommended & Approved', text: 'Verified layouts and target demographics. The setup is highly needed in Nangloi and Alipur zones.', date: '2026-06-14' }
        ]
      },
      {
        id: 'DF-2026-405',
        title: 'NOC approval for PWD flyover construction over Railway crossing near Dwarka Sec 21',
        priority: 'Urgent',
        dateCreated: '2026-06-15',
        initiator: 'Executive Engineer PWD',
        currentOwner: 'Director of Education',
        department: 'PWD & Infrastructure',
        path: ['Executive Engineer PWD', 'Director of Education', 'Minister of Transport', 'Chief Minister'],
        currentStep: 1,
        totalSteps: 4,
        status: 'Pending Approval',
        remarks: [
          { author: 'Executive Engineer PWD', action: 'Initiated', text: 'Seeking approval to construct bypass corridor. Part of the structural columns pass near Sarvodaya School playground. Seeking school education department approval.', date: '2026-06-15' }
        ]
      },
      {
        id: 'DF-2026-101',
        title: 'Procurement of 10,000 Dual Desk Benches for Secondary Govt Schools',
        priority: 'Routine',
        dateCreated: '2026-06-05',
        initiator: 'Under Secretary Education',
        currentOwner: 'Chief Minister',
        department: 'Education Department',
        path: ['Under Secretary Education', 'Director of Education', 'Minister of Education', 'Chief Minister'],
        currentStep: 3,
        totalSteps: 4,
        status: 'Pending Approval',
        remarks: [
          { author: 'Under Secretary Education', action: 'Initiated', text: 'L1 Bidder selected at ₹2.4 Crores.', date: '2026-06-05' },
          { author: 'Director of Education', action: 'Approved', text: 'Allocation within current financial year budget.', date: '2026-06-08' },
          { author: 'Minister of Education', action: 'Forwarded for CM Final Signature', text: 'Clear file, recommended for approval.', date: '2026-06-12' }
        ]
      },
      {
        id: 'DF-2026-512',
        title: 'Emergency Medical Procurement Policy during Monsoon Dengue Preparedness',
        priority: 'Immediate',
        dateCreated: '2026-06-16',
        initiator: 'Director Health Services',
        currentOwner: 'Minister of Health',
        department: 'Health & Family Welfare',
        path: ['Director Health Services', 'Minister of Health', 'Chief Minister'],
        currentStep: 1,
        totalSteps: 3,
        status: 'Pending Approval',
        remarks: [
          { author: 'Director Health Services', action: 'Initiated', text: 'Urgent authorization requested for fast-track purchase of platelets and test kits up to ₹50 Lakhs.', date: '2026-06-16' }
        ]
      }
    ];
    setFiles(initialFiles);

    const initialMessages: Message[] = [
      { id: 'MSG-001', senderName: 'Alice Vaz', senderRole: 'New Delhi DM', receiverRole: 'Chief Minister', content: 'Sir, the Connaught Place restoration project is 95% complete. The streetlights and pedestrian zones are now operational. Ready for site visit.', timestamp: '2026-06-18 10:15 AM' },
      { id: 'MSG-002', senderName: 'Chief Minister', senderRole: 'Chief Minister', receiverRole: 'New Delhi DM', content: 'Excellent work, Alice. Let\'s schedule the inauguration for next Monday. Meanwhile, ensure the open manhole complaint near the school is fixed by tonight.', timestamp: '2026-06-18 10:20 AM' },
      { id: 'MSG-003', senderName: 'Amit Kumar', senderRole: 'West Delhi DM', receiverRole: 'Director of Education', content: 'Director sir, parents in Vikas Puri are requesting a boundary wall increase for Sarvodaya School to prevent trespassing. Requesting layout funds approval.', timestamp: '2026-06-18 11:30 AM' },
      { id: 'MSG-004', senderName: 'Director of Education', senderRole: 'Director of Education', receiverRole: 'West Delhi DM', content: 'Acknowledged DM. We have sent the proposal (File Ref: DF-2026-405) for alignment check. Once cleared, funds will be released.', timestamp: '2026-06-18 11:45 AM' }
    ];
    setMessages(initialMessages);

    localStorage.setItem('nagarvaani_complaints', JSON.stringify(initialComplaints));
    localStorage.setItem('nagarvaani_projects', JSON.stringify(initialProjects));
    localStorage.setItem('nagarvaani_officers', JSON.stringify(initialOfficers));
    localStorage.setItem('nagarvaani_files', JSON.stringify(initialFiles));
    localStorage.setItem('nagarvaani_messages', JSON.stringify(initialMessages));
  }, []);

  useEffect(() => {
    if (complaints.length > 0) {
      localStorage.setItem('nagarvaani_complaints', JSON.stringify(complaints));
    }
  }, [complaints]);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('nagarvaani_projects', JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    if (officers.length > 0) {
      localStorage.setItem('nagarvaani_officers', JSON.stringify(officers));
    }
  }, [officers]);

  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem('nagarvaani_files', JSON.stringify(files));
    }
  }, [files]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('nagarvaani_messages', JSON.stringify(messages));
    }
  }, [messages]);

  

  
  const addComplaint = (newGrip: Omit<Complaint, 'id' | 'dateFiled' | 'timeline'>) => {
    const formattedId = `GRV-2026-0${complaints.length + 13}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const item: Complaint = {
      ...newGrip,
      id: formattedId,
      dateFiled: todayStr,
      timeline: [
        { date: todayStr, action: 'Grievance Registered', actor: 'Portal Intake' }
      ]
    };
    setComplaints((prev) => [item, ...prev]);

    
    setOfficers((prevOffs) =>
      prevOffs.map((off) => {
        
        if (off.district === newGrip.district) {
          return { ...off, activeComplaints: off.activeComplaints + 1 };
        }
        
        if (off.department === newGrip.department && !off.district) {
          return { ...off, activeComplaints: off.activeComplaints + 1 };
        }
        return off;
      })
    );
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, remarkText?: string, actor?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetComplaint = complaints.find(c => c.id === id);
    if (!targetComplaint) return;
    const originalStatus = targetComplaint.status;

    setComplaints((prevComplaints) =>
      prevComplaints.map((c) => {
        if (c.id === id) {
          const newTimeline: TimelineEvent = {
            date: todayStr,
            action: `Status updated to ${status}`,
            actor: actor || activeRole,
            notes: remarkText
          };
          return {
            ...c,
            status,
            timeline: [...c.timeline, newTimeline]
          };
        }
        return c;
      })
    );

    if (status === 'Resolved' && originalStatus !== 'Resolved') {
      setOfficers((prevOffs) =>
        prevOffs.map((off) => {
          if (off.district === targetComplaint.district) {
            const comp = off.completedComplaints + 1;
            const act = Math.max(0, off.activeComplaints - 1);
            const rate = Math.round((comp / (comp + act)) * 100);
            return {
              ...off,
              completedComplaints: comp,
              activeComplaints: act,
              resolutionRate: rate,
              rating: Math.min(5, Number((off.rating + 0.1).toFixed(1)))
            };
          }
          if (off.department === targetComplaint.department && !off.district) {
            const comp = off.completedComplaints + 1;
            const act = Math.max(0, off.activeComplaints - 1);
            const rate = Math.round((comp / (comp + act)) * 100);
            return {
              ...off,
              completedComplaints: comp,
              activeComplaints: act,
              resolutionRate: rate,
              rating: Math.min(5, Number((off.rating + 0.05).toFixed(1)))
            };
          }
          return off;
        })
      );
    }
  };
  const addMessage = (content: string, receiverRole: string) => {
    const today = new Date();
    const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + (today.getHours() >= 12 ? 'PM' : 'AM');
    
    let senderName = 'System';
    let senderRole = activeRole as string;
    
    if (activeRole === 'Chief Minister') {
      senderName = 'Chief Minister';
    } else if (activeRole === 'District Magistrate') {
      senderName = `${activeDistrict} DM`;
      senderRole = `${activeDistrict} DM`;
    } else {
      senderName = activeDepartment === 'Education & Schools' ? 'Director of Education' : 'Director Health Services';
      senderRole = activeDepartment === 'Education & Schools' ? 'Director of Education' : 'Director Health Services';
    }

    const newMessage: Message = {
      id: `MSG-0${messages.length + 1}`,
      senderName,
      senderRole,
      receiverRole,
      content,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  
  const approveFile = (fileId: string, remarkText: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let authorName = 'Chief Minister';
    if (activeRole === 'District Magistrate') authorName = `${activeDistrict} DM`;
    else if (activeRole === 'Department Head') authorName = activeDepartment;

    setFiles((prevFiles) =>
      prevFiles.map((file) => {
        if (file.id === fileId) {
          const nextStep = file.currentStep + 1;
          const isFinished = nextStep >= file.totalSteps;
          const updatedRemarks = [
            ...file.remarks,
            { author: authorName, action: 'Approved & Signed', text: remarkText, date: todayStr }
          ];

          return {
            ...file,
            remarks: updatedRemarks,
            currentStep: isFinished ? file.currentStep : nextStep,
            currentOwner: isFinished ? 'Archived (Approved)' : file.path[nextStep],
            status: isFinished ? 'Approved' : 'Pending Approval'
          };
        }
        return file;
      })
    );
  };

  const rejectFile = (fileId: string, remarkText: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let authorName = 'Chief Minister';
    if (activeRole === 'District Magistrate') authorName = `${activeDistrict} DM`;
    else if (activeRole === 'Department Head') authorName = activeDepartment;

    setFiles((prevFiles) =>
      prevFiles.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            status: 'Rejected',
            currentOwner: 'Archived (Rejected)',
            remarks: [
              ...file.remarks,
              { author: authorName, action: 'Rejected', text: remarkText, date: todayStr }
            ]
          };
        }
        return file;
      })
    );
  };

  
  const updateProjectProgress = (
    projectId: string,
    progress: number,
    status?: 'On Track' | 'Delayed' | 'Critical' | 'Completed'
  ) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const budgetDelta = Math.round((progress - proj.physicalProgress) * (proj.budgetAllocated / 100) * 0.95);
          const newSpent = Math.min(proj.budgetAllocated, proj.budgetSpent + Math.max(0, budgetDelta));
          
          let computedStatus = status || proj.status;
          if (progress >= 100) computedStatus = 'Completed';
          else if (progress > proj.physicalProgress && computedStatus === 'Critical') computedStatus = 'On Track';

          return {
            ...proj,
            physicalProgress: Math.min(100, progress),
            budgetSpent: newSpent,
            status: computedStatus
          };
        }
        return proj;
      })
    );
  };

  const addNewProject = (newProj: Omit<Project, 'id' | 'budgetSpent' | 'physicalProgress'>) => {
    const formattedId = `PRJ-DEL-${projects.length + 106}`;
    const proj: Project = {
      ...newProj,
      id: formattedId,
      budgetSpent: 0,
      physicalProgress: 0
    };
    setProjects((prev) => [...prev, proj]);
  };

  const loginUser = (username: string, password: string): boolean => {
    const userKey = username.trim().toLowerCase();
    const account = registeredUsers[userKey];
    if (account && account.password === password) {
      setCurrentUser(account.profile);
      localStorage.setItem('nagarvaani_user', JSON.stringify(account.profile));
      
      setActiveRole(account.profile.role);
      if (account.profile.district) {
        setActiveDistrict(account.profile.district);
        setActiveTab('DistrictMinistry');
      } else if (account.profile.department) {
        setActiveDepartment(account.profile.department);
        setActiveTab('OfficerWorkspace');
      } else {
        setActiveTab('Overview');
      }
      return true;
    }
    return false;
  };

  const registerUser = (
    username: string,
    password: string,
    role: 'Chief Minister' | 'District Magistrate' | 'Department Head',
    district?: DistrictName,
    department?: 'Education & Schools' | 'Public Health' | 'PWD & Infrastructure'
  ): boolean => {
    const userKey = username.trim().toLowerCase();
    if (registeredUsers[userKey]) {
      return false;
    }

    const newProfile: UserProfile = {
      username: username.trim(),
      role,
      district,
      department
    };

    const newUsers = {
      ...registeredUsers,
      [userKey]: {
        password,
        profile: newProfile
      }
    };

    setRegisteredUsers(newUsers);
    localStorage.setItem('nagarvaani_users', JSON.stringify(newUsers));
    
    setCurrentUser(newProfile);
    localStorage.setItem('nagarvaani_user', JSON.stringify(newProfile));
    setActiveRole(role);
    if (district) {
      setActiveDistrict(district);
      setActiveTab('DM View');
    } else if (department) {
      setActiveDepartment(department);
      setActiveTab(department === 'Public Health' ? 'Health' : 'Education');
    } else {
      setActiveTab('Overview');
    }
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('nagarvaani_user');
    setActiveRole('Chief Minister');
    setActiveTab('Overview');
  };

  return (
    <DashboardContext.Provider
      value={{
        complaints,
        projects,
        officers,
        files,
        messages,
        activeRole,
        activeDistrict,
        activeDepartment,
        activeTab,
        currentUser,
        setActiveRole,
        setActiveDistrict,
        setActiveDepartment,
        setActiveTab,
        addComplaint,
        updateComplaintStatus,
        addMessage,
        approveFile,
        rejectFile,
        updateProjectProgress,
        addNewProject,
        loginUser,
        registerUser,
        logoutUser,
        showAIPanel,
        setShowAIPanel
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useStore must be used within a DashboardProvider');
  }
  return context;
};
