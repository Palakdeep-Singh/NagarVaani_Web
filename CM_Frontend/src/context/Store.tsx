import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { getRoleLabel } from '../utils/helper';
import type {
  Complaint,
  Project,
  Officer,
  DigitalFile,
  Message,
  DistrictName,
  ComplaintStatus,
  UserProfile
} from '../types';

interface DashboardContextType {
  complaints: Complaint[];
  projects: Project[];
  officers: Officer[];
  files: DigitalFile[];
  messages: Message[];
  healthBeds: any[];
  healthInventory: any[];
  schoolSmartBoards: any[];
  generalMetrics: Record<string, string>;
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
  loginUser: (username: string, password: string) => Promise<boolean>;
  registerUser: (username: string, password: string, role: 'Chief Minister' | 'District Magistrate' | 'Department Head', district?: DistrictName, department?: 'Education & Schools' | 'Public Health' | 'PWD & Infrastructure') => Promise<boolean>;
  logoutUser: () => void;
  showAIPanel: boolean;
  setShowAIPanel: (val: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// API Client Setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nagarvaani_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('nagarvaani_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [activeRole, setActiveRole] = useState<'Chief Minister' | 'District Magistrate' | 'Department Head'>('Chief Minister');
  const [activeDistrict, setActiveDistrict] = useState<DistrictName>('New Delhi');
  const [activeDepartment, setActiveDepartment] = useState<'Education & Schools' | 'Public Health' | 'PWD & Infrastructure'>('Public Health');
  const [activeTab, setActiveTab] = useState<string>('Overview');

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [files, setFiles] = useState<DigitalFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Health and Education metrics from DB
  const [healthBeds, setHealthBeds] = useState<any[]>([]);
  const [healthInventory, setHealthInventory] = useState<any[]>([]);
  const [schoolSmartBoards, setSchoolSmartBoards] = useState<any[]>([]);
  const [generalMetrics, setGeneralMetrics] = useState<Record<string, string>>({});

  // Configure starting roles/tabs when user loads
  useEffect(() => {
    if (currentUser) {
      setActiveRole(currentUser.role);
      if (currentUser.district) {
        setActiveDistrict(currentUser.district);
        setActiveTab('DistrictMinistry');
      } else if (currentUser.department) {
        setActiveDepartment(currentUser.department);
        setActiveTab('OfficerWorkspace');
      } else {
        setActiveTab('Overview');
      }
    }
  }, [currentUser]);

  // Fetch Dashboard Data from Backend
  const fetchAllData = async () => {
    try {
      const [
        complaintsRes,
        projectsRes,
        officersRes,
        filesRes,
        messagesRes,
        healthBedsRes,
        healthInventoryRes,
        schoolSmartBoardsRes,
        generalMetricsRes
      ] = await Promise.all([
        api.get('/complaints'),
        api.get('/projects'),
        api.get('/officers'),
        api.get('/files'),
        api.get('/messages'),
        api.get('/metrics/health/beds'),
        api.get('/metrics/health/inventory'),
        api.get('/metrics/education/smartboards'),
        api.get('/metrics/general')
      ]);
      setComplaints(complaintsRes.data);
      setProjects(projectsRes.data);
      setOfficers(officersRes.data);
      setFiles(filesRes.data);
      setMessages(messagesRes.data);
      setHealthBeds(healthBedsRes.data);
      setHealthInventory(healthInventoryRes.data);
      setSchoolSmartBoards(schoolSmartBoardsRes.data);
      setGeneralMetrics(generalMetricsRes.data);
    } catch (err) {
      console.error('Failed to fetch data from API:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  // Real-time Chat Sync with Socket.IO
  useEffect(() => {
    if (!currentUser) return;

    const socketUrl = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      const roleLabel = getRoleLabel(currentUser);
      socket.emit('register', roleLabel);
    });

    socket.on('message_received', (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  const addComplaint = async (newGrip: Omit<Complaint, 'id' | 'dateFiled' | 'timeline'>) => {
    try {
      const res = await api.post('/complaints', newGrip);
      setComplaints((prev) => [res.data, ...prev]);
      
      const officersRes = await api.get('/officers');
      setOfficers(officersRes.data);
    } catch (err) {
      console.error('Failed to add complaint:', err);
    }
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus, remarkText?: string, actor?: string) => {
    try {
      const res = await api.patch(`/complaints/${id}/status`, { status, remarkText, actor });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? res.data : c))
      );

      const officersRes = await api.get('/officers');
      setOfficers(officersRes.data);
    } catch (err) {
      console.error('Failed to update complaint status:', err);
    }
  };

  const addMessage = async (content: string, receiverRole: string) => {
    try {
      const res = await api.post('/messages', { content, receiverRole });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const approveFile = async (fileId: string, remarkText: string) => {
    try {
      const res = await api.patch(`/files/${fileId}/approve`, { remarkText });
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? res.data : f))
      );
    } catch (err) {
      console.error('Failed to approve file:', err);
    }
  };

  const rejectFile = async (fileId: string, remarkText: string) => {
    try {
      const res = await api.patch(`/files/${fileId}/reject`, { remarkText });
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? res.data : f))
      );
    } catch (err) {
      console.error('Failed to reject file:', err);
    }
  };

  const updateProjectProgress = async (
    projectId: string,
    progress: number,
    status?: 'On Track' | 'Delayed' | 'Critical' | 'Completed'
  ) => {
    try {
      const res = await api.patch(`/projects/${projectId}/progress`, { progress, status });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? res.data : p))
      );
    } catch (err) {
      console.error('Failed to update project progress:', err);
    }
  };

  const addNewProject = async (newProj: Omit<Project, 'id' | 'budgetSpent' | 'physicalProgress'>) => {
    try {
      const res = await api.post('/projects', newProj);
      setProjects((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to add project:', err);
    }
  };

  const loginUser = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token, user } = res.data;

      localStorage.setItem('nagarvaani_token', token);
      localStorage.setItem('nagarvaani_user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const registerUser = async (
    username: string,
    password: string,
    role: 'Chief Minister' | 'District Magistrate' | 'Department Head',
    district?: DistrictName,
    department?: 'Education & Schools' | 'Public Health' | 'PWD & Infrastructure'
  ): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', {
        username,
        password,
        role,
        district,
        department
      });
      const { token, user } = res.data;

      localStorage.setItem('nagarvaani_token', token);
      localStorage.setItem('nagarvaani_user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      return false;
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('nagarvaani_user');
    localStorage.removeItem('nagarvaani_token');
    setActiveRole('Chief Minister');
    setActiveTab('Overview');
    setComplaints([]);
    setProjects([]);
    setOfficers([]);
    setFiles([]);
    setMessages([]);
    setHealthBeds([]);
    setHealthInventory([]);
    setSchoolSmartBoards([]);
    setGeneralMetrics({});
  };

  return (
    <DashboardContext.Provider
      value={{
        complaints,
        projects,
        officers,
        files,
        messages,
        healthBeds,
        healthInventory,
        schoolSmartBoards,
        generalMetrics,
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
