import React, { createContext, useContext, useState } from 'react';
import type { Complaint, ComplaintStatus } from '../types';
import { MOCK_COMPLAINTS } from '../data/mockData';

type Tab = 'SmartCategorisation' | 'RedressalAssignment' | 'SLACountdown' | 'BatchResolution'
         | 'PendencyMonitor' | 'PoorRatingAppeals' | 'RootCauseClusters' | 'MonthlyReport'
         | 'CrossDeptTicket' | 'PolicyRecommendation';

interface NodalUser { username: string; designation: string; department: string; employeeId: string; }

interface StoreState {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  currentUser: NodalUser | null;
  loginUser: (username: string, password: string) => boolean;
  logoutUser: () => void;
  complaints: Complaint[];
  confirmAICategory: (id: string, approved: boolean, override?: string) => void;
  assignOfficer: (id: string, officerId: string, officerName: string) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, remark: string, actor: string) => void;
  closeBatch: (batchId: string, fieldOrder: string) => void;
  sendInterimReply: (id: string) => void;
  reopenComplaint: (id: string, reason: string) => void;
}

const Store = createContext<StoreState>({} as StoreState);
export const useStore = () => useContext(Store);

const NODAL_CREDENTIALS = [
  { username: 'nodal.shahdara', password: 'cpgrams@2024', designation: 'Nodal Officer — GNCT Delhi', department: 'Grievance Cell', employeeId: 'NO-SHA-001' },
  { username: 'admin', password: 'admin123', designation: 'Nodal Officer (Demo)', department: 'Grievance Cell', employeeId: 'NO-DEMO' },
];

export const NodalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('SmartCategorisation');
  const [currentUser, setCurrentUser] = useState<NodalUser | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);

  const loginUser = (username: string, password: string): boolean => {
    const found = NODAL_CREDENTIALS.find(c => c.username === username && c.password === password);
    if (found) {
      setCurrentUser({ username: found.username, designation: found.designation, department: found.department, employeeId: found.employeeId });
      return true;
    }
    return false;
  };

  const logoutUser = () => { setCurrentUser(null); setActiveTab('SmartCategorisation'); };

  const confirmAICategory = (id: string, approved: boolean, override?: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c,
      subCategory: approved ? c.aiSuggestedSubCategory : (override || c.subCategory),
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: approved ? `AI Category Confirmed: ${c.aiSuggestedSubCategory}` : `Category Override: ${override}`,
        actor: currentUser?.username || 'Nodal Officer',
        notes: approved ? 'Officer confirmed AI suggestion' : 'Manual override applied',
      }],
    } : c));
  };

  const assignOfficer = (id: string, _officerId: string, officerName: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c, assignedOfficer: officerName,
      status: 'Active' as ComplaintStatus,
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: `Assigned to ${officerName}`,
        actor: currentUser?.username || 'Nodal Officer',
      }],
    } : c));
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, remark: string, actor: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c, status,
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: `Status → ${status}`, actor, notes: remark,
      }],
    } : c));
  };

  const closeBatch = (batchId: string, fieldOrder: string) => {
    setComplaints(prev => prev.map(c => c.batchId === batchId ? {
      ...c, status: 'Active' as ComplaintStatus,
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: `Batch Field Order Issued`,
        actor: currentUser?.username || 'Nodal Officer',
        notes: `Field Order: ${fieldOrder}. Batch ${batchId} closed.`,
      }],
    } : c));
  };

  const sendInterimReply = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c,
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: 'Interim Reply Sent to Citizen',
        actor: currentUser?.username || 'Nodal Officer',
        notes: 'Auto-triggered: day 15 idle. DARPG 2024 compliance.',
      }],
    } : c));
  };

  const reopenComplaint = (id: string, reason: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c, status: 'Active' as ComplaintStatus, isReopen: true,
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: 'Complaint Reopened — Poor Rating Appeal',
        actor: currentUser?.username || 'Nodal Officer',
        notes: `Citizen appeal reason: ${reason}. Must resolve within 15 days per CPGRAMS mandate.`,
      }],
    } : c));
  };

  return (
    <Store.Provider value={{ activeTab, setActiveTab, currentUser, loginUser, logoutUser, complaints, confirmAICategory, assignOfficer, updateComplaintStatus, closeBatch, sendInterimReply, reopenComplaint }}>
      {children}
    </Store.Provider>
  );
};
