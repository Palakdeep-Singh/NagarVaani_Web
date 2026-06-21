import React, { createContext, useState, useEffect } from 'react';

// Mock AuthContext
export const AuthContext = createContext<any>(null);

const DEFAULT_CITIZEN_PROFILE = {
  id: 'usr-101',
  full_name: 'Prakarsh Jain',
  phone: '9812345678',
  email: 'prakarsh@gov.in',
  aadhaar_number: '123456789012',
  voter_id: 'VOTER1234567',
  date_of_birth: '1998-05-15',
  gender: 'Male',
  occupation: 'Student / Agriculturist',
  annual_income: 150000,
  category: 'General',
  land_acres: 2,
  village: 'Nangloi Jat',
  ward: 'Ward 12',
  district: 'North Delhi',
  state: 'Delhi',
  pincode: '110041',
  area_type: 'Rural',
  total_benefits: 24000,
  civic_score: 84
};

export const AuthProvider: React.FC<{ children: React.ReactNode; onLogout: () => void }> = ({ children, onLogout }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cp_citizen_user');
    return saved ? JSON.parse(saved) : DEFAULT_CITIZEN_PROFILE;
  });

  const login = (data: any) => {
    setUser(data.user);
    localStorage.setItem('cp_citizen_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cp_citizen_user');
    onLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token: 'mock_citizen_token' }}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock API Client matching the exact calls in the citizen portal
export const API = {
  get: async (url: string) => {
    if (url.includes('/api/user/dashboard')) {
      const savedUser = localStorage.getItem('cp_citizen_user');
      const u = savedUser ? JSON.parse(savedUser) : DEFAULT_CITIZEN_PROFILE;
      return {
        data: {
          user: u,
          schemes: [
            { id: '1', scheme_name: 'CM Widow Pension Scheme', status: 'active' },
            { id: '2', scheme_name: 'Delhi Ladli Scheme', status: 'active' }
          ],
          complaints: [
            { id: 'GRV-2026-001', ticket_no: 'GRV-2026-001', title: 'Waterlogging at Ring Road Lajpat Nagar', status: 'Active', category: 'Civic Infrastructure' }
          ]
        }
      };
    }
    if (url.includes('/api/schemes/matched')) {
      return {
        data: [
          { id: '1', name: 'CM Widow Pension Scheme', category: 'pension', application_status: 'applied', benefit_amount: 1500, match_score: 95, match_grade: 'excellent', level: 'State' },
          { id: '2', name: 'Delhi Ladli Scheme', category: 'education', application_status: 'active', benefit_amount: 5000, match_score: 90, match_grade: 'excellent', level: 'State' }
        ]
      };
    }
    if (url.includes('/api/schemes/all')) {
      return {
        data: [
          { id: '1', name: 'CM Widow Pension Scheme', category: 'pension', application_status: 'applied', benefit_amount: 1500, match_score: 95, match_grade: 'excellent', level: 'State' },
          { id: '2', name: 'Delhi Ladli Scheme', category: 'education', application_status: 'active', benefit_amount: 5000, match_score: 90, match_grade: 'excellent', level: 'State' }
        ]
      };
    }
    if (url.includes('/api/milestones/scheme/')) {
      return {
        data: [
          { id: 'm1', step_number: 1, title: 'Document Verification', description: 'Verification of age and residency proofs.', amount: 0, progress: { status: 'completed', completed_at: '2026-06-15' } },
          { id: 'm2', step_number: 2, title: 'First Installment Disbursed', description: 'Direct transfer to citizen bank account.', amount: 1500, progress: { status: 'applied' } }
        ]
      };
    }
    if (url.includes('/api/documents/my')) {
      return {
        data: [
          { id: 'd1', doc_name: 'Aadhaar Card', doc_type: 'aadhaar', status: 'available', file_size: 102400 },
          { id: 'd2', doc_name: 'Income Certificate', doc_type: 'income_cert', status: 'available', file_size: 204800 }
        ]
      };
    }
    if (url.includes('/api/user/family')) {
      return {
        data: [
          { id: 'fm-1', full_name: 'Kavita Jain', relation: 'Spouse', gender: 'Female', date_of_birth: '2000-02-12', occupation: 'Teacher', is_disabled: false }
        ]
      };
    }
    if (url.includes('/api/complaints/my')) {
      return {
        data: [
          { id: 'GRV-2026-001', ticket_no: 'GRV-2026-001', title: 'Waterlogging at Ring Road Lajpat Nagar', status: 'Active', category: 'Civic Infrastructure', filed_at: '2026-06-10', timeline: [] }
        ]
      };
    }
    if (url.includes('/api/user/notifications')) {
      return {
        data: [
          { id: 'n1', title: 'Verification Successful', message: 'Your Income Certificate has been verified.', type: 'success', created_at: new Date().toISOString(), is_read: false }
        ]
      };
    }
    if (url.includes('/api/user/profile')) {
      const savedUser = localStorage.getItem('cp_citizen_user');
      return { data: savedUser ? JSON.parse(savedUser) : DEFAULT_CITIZEN_PROFILE };
    }
    return { data: [] };
  },
  post: async (url: string, data?: any) => {
    if (url.includes('/api/user/notifications/read-all')) {
      return { data: { success: true } };
    }
    if (url.includes('/api/user/profile/update')) {
      localStorage.setItem('cp_citizen_user', JSON.stringify(data));
      return { data };
    }
    if (url.includes('/api/complaints')) {
      const ticket = 'GRV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
      const newComplaint = { id: ticket, ticket_no: ticket, ...data, status: 'open', filed_at: new Date().toISOString(), due_at: new Date(Date.now() + 14 * 86400000).toISOString(), timeline: [] };
      return { data: newComplaint };
    }
    return { data: {} };
  },
  put: async (url: string, data?: any) => {
    if (url.includes('/api/user/profile')) {
      const savedUser = localStorage.getItem('cp_citizen_user');
      const current = savedUser ? JSON.parse(savedUser) : DEFAULT_CITIZEN_PROFILE;
      const updated = { ...current, ...data };
      localStorage.setItem('cp_citizen_user', JSON.stringify(updated));
      return { data: updated };
    }
    return { data: {} };
  }
};

// Mock Realtime
export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  // Return dummy unsubscribe function
  return () => {};
};
