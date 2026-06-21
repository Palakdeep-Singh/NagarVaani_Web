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

export interface ToastMessage {
  id: string;
  senderRole: string;
  senderName: string;
  content: string;
  exiting?: boolean;
}

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
  socket: any;
  unreadCounts: Record<string, number>;
  activeChatPartner: string | null;
  setActiveChatPartner: (role: string | null) => void;
  toasts: ToastMessage[];
  clearUnreadCount: (role: string) => void;
  dismissToast: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);


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

  
  const [healthBeds, setHealthBeds] = useState<any[]>([]);
  const [healthInventory, setHealthInventory] = useState<any[]>([]);
  const [schoolSmartBoards, setSchoolSmartBoards] = useState<any[]>([]);
  const [generalMetrics, setGeneralMetrics] = useState<Record<string, string>>({});

  const [socket, setSocket] = useState<any>(null);

  
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeChatPartner, setActiveChatPartner] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  
  const activeTabRef = React.useRef(activeTab);
  const activeChatPartnerRef = React.useRef(activeChatPartner);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    activeChatPartnerRef.current = activeChatPartner;
  }, [activeChatPartner]);

  
  useEffect(() => {
    if (currentUser && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [currentUser]);

  
  useEffect(() => {
    if (activeTab === 'Communications' && activeChatPartner) {
      setUnreadCounts((prev) => {
        if (!prev[activeChatPartner] || prev[activeChatPartner] === 0) return prev;
        return {
          ...prev,
          [activeChatPartner]: 0,
        };
      });
    }
  }, [activeTab, activeChatPartner]);

  const clearUnreadCount = (role: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [role]: 0,
    }));
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  
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

  
  useEffect(() => {
    if (!currentUser) {
      setSocket(null);
      return;
    }

    const socketUrl = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:5000';
    const s = io(socketUrl, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      const roleLabel = getRoleLabel(currentUser);
      s.emit('register', roleLabel);
    });

    s.on('message_received', (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      const myRole = getRoleLabel(currentUser);
      if (newMessage.receiverRole === myRole) {
        const currentActiveTab = activeTabRef.current;
        const currentActiveChatPartner = activeChatPartnerRef.current;

        
        if (
          currentActiveTab === 'Communications' &&
          currentActiveChatPartner === newMessage.senderRole &&
          document.visibilityState === 'visible'
        ) {
          return;
        }

        
        setUnreadCounts((prev) => ({
          ...prev,
          [newMessage.senderRole]: (prev[newMessage.senderRole] || 0) + 1,
        }));

        
        const toastId = `toast-${Date.now()}-${Math.random()}`;
        setToasts((prev) => [
          ...prev,
          {
            id: toastId,
            senderRole: newMessage.senderRole,
            senderName: newMessage.senderName,
            content: newMessage.content,
          },
        ]);

        
        setTimeout(() => {
          setToasts((prev) => prev.map((t) => t.id === toastId ? { ...t, exiting: true } : t));
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toastId));
          }, 300);
        }, 5000);

        
        if (document.hidden && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`New message from ${newMessage.senderName}`, {
              body: newMessage.content,
              tag: newMessage.senderRole,
            });
          } catch (err) {
            console.error('Desktop notification failed:', err);
          }
        }
      }
    });

    return () => {
      s.disconnect();
      setSocket(null);
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
    setUnreadCounts({});
    setActiveChatPartner(null);
    setToasts([]);
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
        setShowAIPanel,
        socket,
        unreadCounts,
        activeChatPartner,
        setActiveChatPartner,
        toasts,
        clearUnreadCount,
        dismissToast
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
