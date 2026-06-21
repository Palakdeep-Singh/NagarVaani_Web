import React, { createContext, useContext, useState } from 'react';
import type { Complaint, ComplaintStatus } from '../types';
import { MOCK_COMPLAINTS } from '../data/mockData';

type Tab = 'ComplaintQueue' | 'OfficerAssignment' | 'EscalateSecretary' | 'InterimReply'
         | 'RevenueCases' | 'SDMLoadView' | 'DMScorecard' | 'NewComplaintIntake';

interface DMUser { username: string; designation: string; district: string; employeeId: string; }

interface StoreState {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  currentUser: DMUser | null;
  loginUser: (username: string, password: string) => boolean;
  logoutUser: () => void;
  complaints: Complaint[];
  updateComplaintStatus: (id: string, status: ComplaintStatus, remark: string, actor: string) => void;
  updateAssignedSDM: (id: string, sdm: string) => void;
  sendInterimReply: (id: string) => void;
  addWalkInComplaint: (data: { citizenName: string; citizenPhone: string; category: string; priority: string; ward: string; description: string }) => string;
}

const Store = createContext<StoreState>({} as StoreState);
export const useStore = () => useContext(Store);

const DM_CREDENTIALS = [
  { username: 'dm.shahdara', password: 'darpg@2024', designation: 'District Magistrate', district: 'Shahdara', employeeId: 'DM-SHA-001' },
  { username: 'admin', password: 'admin123', designation: 'District Magistrate (Demo)', district: 'Shahdara', employeeId: 'DM-DEMO' },
];

let idCounter = MOCK_COMPLAINTS.length + 100;

export const DMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('ComplaintQueue');
  const [currentUser, setCurrentUser] = useState<DMUser | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);

  const loginUser = (username: string, password: string): boolean => {
    const found = DM_CREDENTIALS.find(c => c.username === username && c.password === password);
    if (found) {
      setCurrentUser({ username: found.username, designation: found.designation, district: found.district, employeeId: found.employeeId });
      return true;
    }
    return false;
  };

  const logoutUser = () => { setCurrentUser(null); setActiveTab('ComplaintQueue'); };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, remark: string, actor: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c, status,
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: `Status → ${status}`, actor, notes: remark,
      }],
    } : c));
  };

  const updateAssignedSDM = (id: string, sdm: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c, assignedSDM: sdm,
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: `Reassigned to SDM: ${sdm}`, actor: currentUser?.username || 'DM Office',
      }],
    } : c));
  };

  const sendInterimReply = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c, interimSent: true,
      timeline: [...c.timeline, {
        date: new Date().toISOString().split('T')[0],
        action: 'Interim Reply Sent to Citizen', actor: currentUser?.username || 'DM Office',
        notes: 'Citizen notified of current status and expected resolution date per DARPG 2024.',
      }],
    } : c));
  };

  const addWalkInComplaint = (data: { citizenName: string; citizenPhone: string; category: string; priority: string; ward: string; description: string }): string => {
    idCounter++;
    const newId = `GR-2026-${String(idCounter).padStart(4, '0')}`;
    const newComplaint: Complaint = {
      id: newId,
      title: `Walk-in: ${data.category} — ${data.ward}`,
      description: data.description,
      category: data.category as Complaint['category'],
      district: currentUser?.district || 'Shahdara',
      ward: data.ward,
      citizenName: data.citizenName,
      citizenPhone: data.citizenPhone,
      dateFiled: new Date().toISOString().split('T')[0],
      priority: data.priority as Complaint['priority'],
      status: 'Pending',
      department: 'DM Office',
      timeline: [{
        date: new Date().toISOString().split('T')[0],
        action: 'Walk-in Complaint Filed at DM Office',
        actor: currentUser?.username || 'DM Office Staff',
        notes: `Ref ID issued: ${newId}`,
      }],
      slaDay: 0,
    };
    setComplaints(prev => [newComplaint, ...prev]);
    return newId;
  };

  return (
    <Store.Provider value={{ activeTab, setActiveTab, currentUser, loginUser, logoutUser, complaints, updateComplaintStatus, updateAssignedSDM, sendInterimReply, addWalkInComplaint }}>
      {children}
    </Store.Provider>
  );
};
