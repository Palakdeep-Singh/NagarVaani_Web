// ─── graphEngine.ts ───────────────────────────────────────────────────────────
// CM → Districts → Booths → Officers → Complaints
// ─────────────────────────────────────────────────────────────────────────────

export type NodeTier = 'cm' | 'district' | 'booth' | 'officer' | 'complaint';

export const TIER_CFG: Record<NodeTier, {
  color: string; glow: string; radius: number; ring: string; label: string;
}> = {
  cm:        { color: '#F59E0B', glow: '#FCD34D', radius: 24, ring: '#FDE68A', label: 'Chief Minister'    },
  district:  { color: '#8B5CF6', glow: '#A78BFA', radius: 16, ring: '#DDD6FE', label: 'District'         },
  booth:     { color: '#14B8A6', glow: '#2DD4BF', radius: 12, ring: '#99F6E4', label: 'Ward'             },
  officer:   { color: '#3B82F6', glow: '#60A5FA', radius: 10, ring: '#BFDBFE', label: 'Officer'          },
  complaint: { color: '#F97316', glow: '#FB923C', radius:  7, ring: '#FED7AA', label: 'Complaint'        },
};

export interface GNode {
  id: string;
  label: string;
  type: NodeTier;
  sub?: string;
  val?: number;
  x?: number; y?: number; fx?: number; fy?: number; vx?: number; vy?: number;
  meta?: {
    // district
    totalComplaints?: number;
    resolved?: number;
    pending?: number;
    escalated?: number;
    resolutionRate?: number;
    topIssue?: string;
    dmName?: string;
    // booth
    ward?: string;
    boothOfficerCount?: number;
    // officer
    name?: string;
    designation?: string;
    phone?: string;
    activeComplaints?: number;
    completedComplaints?: number;
    avgDays?: number;
    rating?: number;
    // complaint
    complaintId?: string;
    status?: 'Pending' | 'Active' | 'Resolved' | 'Escalated';
    priority?: 'Low' | 'Medium' | 'High' | 'Emergency';
    category?: string;
    dateFiled?: string;
    citizen?: string;
  };
}

export interface GLink {
  source: string | GNode;
  target: string | GNode;
  label?: string;
  weight?: number;
}

export interface GraphData { nodes: GNode[]; links: GLink[]; }

export const resolveId = (v: unknown): string => {
  if (!v) return '';
  if (typeof v === 'object' && 'id' in (v as any)) return (v as GNode).id;
  return String(v);
};

// ── Static Delhi data ──────────────────────────────────────────────────────
const DISTRICTS_DATA = [
  {
    id: 'D_NEWDELHI', label: 'New Delhi', dmName: 'Smt. Alice Vaz (IAS)',
    resolved: 240, pending: 12, escalated: 3, topIssue: 'Civic Infrastructure',
    booths: [
      {
        id: 'B_CP', label: 'Connaught Place Ward', ward: 'Ward 1',
        officers: [
          { id: 'O_CP1', name: 'Rajesh Sharma', designation: 'Ward Officer', phone: '9810001001', active: 4,  done: 58, avgDays: 2.1, rating: 4.7 },
          { id: 'O_CP2', name: 'Priya Nair',    designation: 'Field Inspector', phone: '9810001002', active: 2, done: 41, avgDays: 1.8, rating: 4.9 },
        ],
        complaints: [
          { id: 'C_CP1', title: 'Open manhole near school gate', status: 'Escalated', priority: 'Emergency', category: 'Civic Infrastructure', date: '2026-06-17', citizen: 'Karan Johar' },
          { id: 'C_CP2', title: 'Broken footpath at Janpath', status: 'Active',    priority: 'Medium',    category: 'Civic Infrastructure', date: '2026-06-15', citizen: 'Meena Kumari' },
        ],
      },
      {
        id: 'B_CHANAKYAPURI', label: 'Chanakyapuri Ward', ward: 'Ward 2',
        officers: [
          { id: 'O_CHP1', name: 'Amit Sehgal', designation: 'Ward Officer', phone: '9810002001', active: 3, done: 67, avgDays: 2.5, rating: 4.6 },
        ],
        complaints: [
          { id: 'C_CHP1', title: 'Waterlogging at diplomatic enclave', status: 'Active', priority: 'High', category: 'Water & Sewage', date: '2026-06-14', citizen: 'Ravi Menon' },
        ],
      },
    ],
  },
  {
    id: 'D_SOUTHDELHI', label: 'South Delhi', dmName: 'Smt. Cheshta Yadav (IAS)',
    resolved: 280, pending: 28, escalated: 5, topIssue: 'Transport & Roads',
    booths: [
      {
        id: 'B_HAUZ', label: 'Hauz Khas Ward', ward: 'Ward 14',
        officers: [
          { id: 'O_HK1', name: 'Sunita Verma',  designation: 'Ward Officer',   phone: '9810003001', active: 7,  done: 89, avgDays: 3.2, rating: 4.4 },
          { id: 'O_HK2', name: 'Deepak Tiwari', designation: 'Sanitation Insp', phone: '9810003002', active: 5, done: 72, avgDays: 4.0, rating: 4.1 },
        ],
        complaints: [
          { id: 'C_HK1', title: 'Lajpat Nagar flyover waterlogging', status: 'Active',  priority: 'High',    category: 'Civic Infrastructure', date: '2026-06-10', citizen: 'Amit Sharma' },
          { id: 'C_HK2', title: 'Potholes on Aurobindo Marg',        status: 'Pending', priority: 'Medium',  category: 'Transport & Roads',    date: '2026-06-16', citizen: 'Neha Gupta' },
          { id: 'C_HK3', title: 'Stray dog menace near market',      status: 'Active',  priority: 'Medium',  category: 'Public Health',        date: '2026-06-13', citizen: 'Vijay Rao'  },
        ],
      },
      {
        id: 'B_SAKET', label: 'Saket Ward', ward: 'Ward 15',
        officers: [
          { id: 'O_SK1', name: 'Rohit Mehta', designation: 'Ward Officer', phone: '9810004001', active: 3, done: 94, avgDays: 2.8, rating: 4.8 },
        ],
        complaints: [
          { id: 'C_SK1', title: 'Street light out on Main Saket Rd', status: 'Resolved', priority: 'Low',  category: 'Electricity & Power', date: '2026-06-08', citizen: 'Pooja Iyer' },
          { id: 'C_SK2', title: 'Garbage dump near school',          status: 'Active',   priority: 'High', category: 'Civic Infrastructure', date: '2026-06-17', citizen: 'Nisha Rani' },
        ],
      },
    ],
  },
  {
    id: 'D_NORTHDELHI', label: 'North Delhi', dmName: 'Shri Rajesh Yadav (IAS)',
    resolved: 195, pending: 38, escalated: 8, topIssue: 'Water & Sewage',
    booths: [
      {
        id: 'B_KASHMERE', label: 'Kashmere Gate Ward', ward: 'Ward 20',
        officers: [
          { id: 'O_KG1', name: 'Suresh Chandra', designation: 'Ward Officer',   phone: '9810005001', active: 9,  done: 55, avgDays: 5.1, rating: 3.7 },
          { id: 'O_KG2', name: 'Lata Bhatt',     designation: 'Field Inspector', phone: '9810005002', active: 7, done: 48, avgDays: 4.8, rating: 3.9 },
        ],
        complaints: [
          { id: 'C_KG1', title: 'Water supply disrupted for 3 days', status: 'Escalated', priority: 'Emergency', category: 'Water & Sewage',       date: '2026-06-15', citizen: 'Gaurav Kumar'  },
          { id: 'C_KG2', title: 'Illegal parking on Old Delhi Road',  status: 'Pending',   priority: 'Medium',    category: 'Transport & Roads',    date: '2026-06-16', citizen: 'Mohd. Arif'   },
          { id: 'C_KG3', title: 'Open sewer near bus stand',          status: 'Active',    priority: 'High',      category: 'Civic Infrastructure', date: '2026-06-14', citizen: 'Rekha Devi'   },
        ],
      },
    ],
  },
  {
    id: 'D_WESTDELHI', label: 'West Delhi', dmName: 'Shri Amit Kumar (IAS)',
    resolved: 310, pending: 45, escalated: 6, topIssue: 'Water & Sewage',
    booths: [
      {
        id: 'B_VIKASPURI', label: 'Vikas Puri Ward', ward: 'Ward 28',
        officers: [
          { id: 'O_VP1', name: 'Manish Sharma', designation: 'Ward Officer',    phone: '9810006001', active: 11, done: 120, avgDays: 3.9, rating: 4.2 },
          { id: 'O_VP2', name: 'Ritu Kapoor',   designation: 'Sanitation Insp', phone: '9810006002', active: 8,  done: 85,  avgDays: 4.5, rating: 3.8 },
        ],
        complaints: [
          { id: 'C_VP1', title: 'Muddy contaminated water supply',    status: 'Active',   priority: 'High',    category: 'Water & Sewage',       date: '2026-06-12', citizen: 'Manpreet Singh' },
          { id: 'C_VP2', title: 'Potholes causing accidents near mkt', status: 'Active',  priority: 'High',    category: 'Transport & Roads',    date: '2026-06-14', citizen: 'Rahul Gupta'    },
          { id: 'C_VP3', title: 'School boundary wall encroachment',   status: 'Pending', priority: 'Medium',  category: 'Civic Infrastructure', date: '2026-06-15', citizen: 'Pooja Sharma'   },
        ],
      },
      {
        id: 'B_JANAKPURI', label: 'Janakpuri Ward', ward: 'Ward 29',
        officers: [
          { id: 'O_JP1', name: 'Vivek Anand', designation: 'Ward Officer', phone: '9810007001', active: 6, done: 98, avgDays: 3.1, rating: 4.5 },
        ],
        complaints: [
          { id: 'C_JP1', title: 'Transformer blast near market',     status: 'Resolved', priority: 'Emergency', category: 'Electricity & Power',  date: '2026-06-05', citizen: 'Suresh Iyer'   },
          { id: 'C_JP2', title: 'Drain overflow in block E housing', status: 'Active',   priority: 'High',      category: 'Water & Sewage',       date: '2026-06-13', citizen: 'Seema Malhotra' },
        ],
      },
    ],
  },
  {
    id: 'D_SHAHDARA', label: 'Shahdara', dmName: 'Shri Anil Bankar (IAS)',
    resolved: 125, pending: 62, escalated: 14, topIssue: 'Public Health',
    booths: [
      {
        id: 'B_GTB', label: 'GTB Nagar Ward', ward: 'Ward 45',
        officers: [
          { id: 'O_GTB1', name: 'Ramesh Pal',   designation: 'Ward Officer',   phone: '9810008001', active: 18, done: 40, avgDays: 7.5, rating: 3.0 },
          { id: 'O_GTB2', name: 'Kavya Singh',  designation: 'Health Insp',    phone: '9810008002', active: 12, done: 35, avgDays: 6.8, rating: 3.2 },
          { id: 'O_GTB3', name: 'Mohd. Salman', designation: 'Field Inspector', phone: '9810008003', active: 15, done: 28, avgDays: 8.1, rating: 2.9 },
        ],
        complaints: [
          { id: 'C_GTB1', title: 'GTB Hospital ICU bed shortage',    status: 'Escalated', priority: 'Emergency', category: 'Public Health',        date: '2026-06-14', citizen: 'Priya Mehra' },
          { id: 'C_GTB2', title: 'Medicine shortage at clinic',      status: 'Escalated', priority: 'Emergency', category: 'Public Health',        date: '2026-06-14', citizen: 'Sanjay Das'  },
          { id: 'C_GTB3', title: 'Shahdara drain overflow',          status: 'Active',    priority: 'High',      category: 'Water & Sewage',       date: '2026-06-15', citizen: 'Geeta Rani'  },
          { id: 'C_GTB4', title: 'Illegal construction blocking road', status: 'Pending', priority: 'Medium',    category: 'Civic Infrastructure', date: '2026-06-16', citizen: 'Arjun Tomar' },
        ],
      },
    ],
  },
  {
    id: 'D_NEDELHI', label: 'North East Delhi', dmName: 'Shri Vikram Singh (IAS)',
    resolved: 140, pending: 51, escalated: 10, topIssue: 'Civic Infrastructure',
    booths: [
      {
        id: 'B_SEELAMPUR', label: 'Seelampur Ward', ward: 'Ward 52',
        officers: [
          { id: 'O_SL1', name: 'Nasreen Begum', designation: 'Ward Officer',   phone: '9810009001', active: 13, done: 52, avgDays: 6.2, rating: 3.4 },
          { id: 'O_SL2', name: 'Tarun Bhatt',   designation: 'Field Inspector', phone: '9810009002', active: 10, done: 44, avgDays: 5.8, rating: 3.6 },
        ],
        complaints: [
          { id: 'C_SL1', title: 'E-rickshaw chaos at metro exit',   status: 'Resolved', priority: 'Medium', category: 'Transport & Roads',    date: '2026-06-03', citizen: 'Mohd. Sajid'   },
          { id: 'C_SL2', title: 'Mohalla Clinic doctor absenteeism', status: 'Active',  priority: 'Medium', category: 'Public Health',        date: '2026-06-13', citizen: 'Sohan Lal'     },
          { id: 'C_SL3', title: 'No street lights for 1 km stretch', status: 'Active',  priority: 'High',   category: 'Electricity & Power', date: '2026-06-11', citizen: 'Kirti Devi'    },
        ],
      },
    ],
  },
  {
    id: 'D_CENTRALDELHI', label: 'Central Delhi', dmName: 'Smt. Isha Khosla (IAS)',
    resolved: 198, pending: 15, escalated: 2, topIssue: 'Transport & Roads',
    booths: [
      {
        id: 'B_KAROL', label: 'Karol Bagh Ward', ward: 'Ward 8',
        officers: [
          { id: 'O_KB1', name: 'Sanjeev Patel', designation: 'Ward Officer', phone: '9810010001', active: 5, done: 88, avgDays: 2.3, rating: 4.7 },
        ],
        complaints: [
          { id: 'C_KB1', title: 'Potholes causing accidents near market', status: 'Active',   priority: 'High',   category: 'Transport & Roads', date: '2026-06-14', citizen: 'Rahul Gupta'  },
          { id: 'C_KB2', title: 'Overcrowded parking at Ajmal Khan Rd',  status: 'Pending',  priority: 'Medium', category: 'Transport & Roads', date: '2026-06-17', citizen: 'Deepa Sinha'  },
        ],
      },
    ],
  },
  {
    id: 'D_EASTDELHI', label: 'East Delhi', dmName: 'Shri Pradeep Kumar (IAS)',
    resolved: 176, pending: 42, escalated: 7, topIssue: 'Civic Infrastructure',
    booths: [
      {
        id: 'B_LAXMI', label: 'Laxmi Nagar Ward', ward: 'Ward 35',
        officers: [
          { id: 'O_LN1', name: 'Girish Pandey', designation: 'Ward Officer',    phone: '9810011001', active: 10, done: 62, avgDays: 5.3, rating: 3.6 },
          { id: 'O_LN2', name: 'Anita Bose',    designation: 'Sanitation Insp', phone: '9810011002', active: 8,  done: 54, avgDays: 4.9, rating: 3.8 },
        ],
        complaints: [
          { id: 'C_LN1', title: 'Yamuna flood plain encroachment',  status: 'Pending',  priority: 'High',   category: 'Civic Infrastructure', date: '2026-06-12', citizen: 'Ajay Ghosh'   },
          { id: 'C_LN2', title: 'Laxmi Nagar traffic jam daily',    status: 'Active',   priority: 'Medium', category: 'Transport & Roads',    date: '2026-06-15', citizen: 'Ravi Mathur'  },
          { id: 'C_LN3', title: 'Garbage dump near MCD school',     status: 'Active',   priority: 'Medium', category: 'Civic Infrastructure', date: '2026-06-17', citizen: 'Nisha Rani'   },
        ],
      },
    ],
  },
];

// ── Build graph ────────────────────────────────────────────────────────────────
export function buildDelhiGovGraph(
  _uploadedOfficers: any[] = [],
  filters: { district?: string; department?: string } = {}
): GraphData {
  const nodes: GNode[] = [];
  const links: GLink[] = [];
  const ids = new Set<string>();

  const add = (n: GNode) => { if (!ids.has(n.id)) { nodes.push(n); ids.add(n.id); } };
  const link = (s: string, t: string, label = '', w = 1) => {
    if (s && t && ids.has(s) && ids.has(t)) links.push({ source: s, target: t, label, weight: w });
  };

  // CM node
  const totalResolved = DISTRICTS_DATA.reduce((a, d) => a + d.resolved, 0);
  const totalPending  = DISTRICTS_DATA.reduce((a, d) => a + d.pending,  0);
  const totalEsc      = DISTRICTS_DATA.reduce((a, d) => a + d.escalated, 0);
  add({
    id: 'CM', label: 'Chief Minister', type: 'cm', sub: 'NCT Delhi', val: 5,
    meta: {
      resolved: totalResolved, pending: totalPending, escalated: totalEsc,
      totalComplaints: totalResolved + totalPending + totalEsc,
      resolutionRate: Math.round((totalResolved / (totalResolved + totalPending + totalEsc)) * 100),
    }
  });

  let filteredDistricts = DISTRICTS_DATA;
  if (filters.district && filters.district !== 'All Districts') {
    filteredDistricts = DISTRICTS_DATA.filter(d =>
      d.label.toLowerCase().includes(filters.district!.toLowerCase())
    );
  }

  filteredDistricts.forEach(dist => {
    const total = dist.resolved + dist.pending + dist.escalated;
    const rate  = Math.round((dist.resolved / total) * 100);

    add({
      id: dist.id, label: dist.label, type: 'district', sub: dist.dmName, val: 2.5,
      meta: {
        dmName: dist.dmName, resolved: dist.resolved, pending: dist.pending,
        escalated: dist.escalated, totalComplaints: total, resolutionRate: rate,
        topIssue: dist.topIssue,
      }
    });
    link('CM', dist.id, 'commands', 1);

    dist.booths.forEach(booth => {
      const boothTotal    = booth.complaints.length;
      const boothResolved = booth.complaints.filter(c => c.status === 'Resolved').length;

      add({
        id: booth.id, label: booth.label, type: 'booth', sub: booth.ward, val: 1.5,
        meta: {
          ward: booth.ward,
          boothOfficerCount: booth.officers.length,
          totalComplaints: boothTotal,
          resolved: boothResolved,
          pending: boothTotal - boothResolved,
        }
      });
      link(dist.id, booth.id, 'sub', 1);

      booth.officers.forEach(off => {
        add({
          id: off.id, label: off.name, type: 'officer', sub: off.designation, val: 1.2,
          meta: {
            name: off.name, designation: off.designation, phone: off.phone,
            activeComplaints: off.active, completedComplaints: off.done,
            avgDays: off.avgDays, rating: off.rating,
            resolutionRate: Math.round((off.done / (off.done + off.active)) * 100),
          }
        });
        link(booth.id, off.id, 'sub', 1);
      });

      booth.complaints.forEach(c => {
        // Optional: filter by dept/category
        if (filters.department && filters.department !== 'All Departments') {
          if (!c.category.toLowerCase().includes(filters.department.toLowerCase())) return;
        }
        add({
          id: c.id, label: c.title.slice(0, 28) + (c.title.length > 28 ? '…' : ''), type: 'complaint',
          sub: c.status, val: 0.8,
          meta: {
            complaintId: c.id, status: c.status as any, priority: c.priority as any,
            category: c.category, dateFiled: c.date, citizen: c.citizen,
          }
        });
        link(booth.id, c.id, 'complaint', 1);
      });
    });
  });

  return { nodes, links };
}

// Legacy compat
export const NODE_CFG = TIER_CFG;
export const buildGraph = (officers: any[], _a: any, _b: any, _c: any) =>
  buildDelhiGovGraph(officers);
