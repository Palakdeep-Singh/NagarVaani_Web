



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
    
    totalComplaints?: number;
    resolved?: number;
    pending?: number;
    escalated?: number;
    resolutionRate?: number;
    topIssue?: string;
    dmName?: string;
    
    ward?: string;
    boothOfficerCount?: number;
    
    name?: string;
    designation?: string;
    phone?: string;
    activeComplaints?: number;
    completedComplaints?: number;
    avgDays?: number;
    rating?: number;
    
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






export function buildDelhiGovGraph(
  officers: any[] = [],
  complaints: any[] = [],
  filters: { district?: string; department?: string } = {}
): GraphData {
  const nodes: GNode[] = [];
  const links: GLink[] = [];
  const ids = new Set<string>();

  const add = (n: GNode) => {
    if (!ids.has(n.id)) {
      nodes.push(n);
      ids.add(n.id);
    }
  };

  const link = (s: string, t: string, label = '', w = 1) => {
    if (s && t && ids.has(s) && ids.has(t)) {
      links.push({ source: s, target: t, label, weight: w });
    }
  };

  
  const totalResolved = complaints.filter(c => c.status === 'Resolved').length;
  const totalPending  = complaints.filter(c => c.status !== 'Resolved').length;
  const totalEsc      = complaints.filter(c => c.status === 'Escalated').length;
  const totalComplaints = complaints.length;
  add({
    id: 'CM', label: 'Chief Minister', type: 'cm', sub: 'NCT Delhi', val: 5,
    meta: {
      resolved: totalResolved,
      pending: totalPending,
      escalated: totalEsc,
      totalComplaints,
      resolutionRate: totalComplaints > 0 ? Math.round((totalResolved / totalComplaints) * 100) : 100,
    }
  });

  
  const deptHeads = officers.filter(o => o.designation !== 'District Magistrate');
  deptHeads.forEach(dh => {
    if (filters.department && filters.department !== 'All Departments') {
      if (!dh.department.toLowerCase().includes(filters.department.toLowerCase())) return;
    }
    const rate = dh.completedComplaints + dh.activeComplaints > 0
      ? Math.round((dh.completedComplaints / (dh.completedComplaints + dh.activeComplaints)) * 100)
      : dh.resolutionRate;
    add({
      id: dh.id, label: dh.name, type: 'officer', sub: dh.designation, val: 1.2,
      meta: {
        name: dh.name, designation: dh.designation, phone: dh.phone,
        activeComplaints: dh.activeComplaints, completedComplaints: dh.completedComplaints,
        avgDays: dh.avgResolutionTime, rating: dh.rating,
        resolutionRate: rate
      }
    });
    link('CM', dh.id, 'coordinates', 1);
  });

  
  const DISTRICT_NAMES = Array.from(new Set([
    ...officers.map(o => o.district).filter(Boolean),
    ...complaints.map(c => c.district).filter(Boolean)
  ])) as string[];

  let filteredDistricts = DISTRICT_NAMES;
  if (filters.district && filters.district !== 'All Districts') {
    filteredDistricts = DISTRICT_NAMES.filter(d =>
      d.toLowerCase().includes(filters.district!.toLowerCase())
    );
  }

  filteredDistricts.forEach(distName => {
    const distComplaints = complaints.filter(c => c.district === distName);
    const resolved = distComplaints.filter(c => c.status === 'Resolved').length;
    const pending = distComplaints.filter(c => c.status !== 'Resolved').length;
    const escalated = distComplaints.filter(c => c.status === 'Escalated').length;
    const total = distComplaints.length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    
    const dmOfficer = officers.find(o => o.district === distName && o.designation === 'District Magistrate');
    const dmName = dmOfficer ? dmOfficer.name : `DM ${distName}`;

    
    const categoryCounts: Record<string, number> = {};
    distComplaints.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });
    let topIssue = 'None';
    let maxCount = 0;
    for (const [cat, cnt] of Object.entries(categoryCounts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        topIssue = cat;
      }
    }

    const distId = `D_${distName.toUpperCase().replace(/\s+/g, '')}`;
    add({
      id: distId, label: distName, type: 'district', sub: dmName, val: 2.5,
      meta: {
        dmName, resolved, pending, escalated, totalComplaints: total, resolutionRate: rate, topIssue
      }
    });
    link('CM', distId, 'commands', 1);

    
    if (dmOfficer) {
      const dmRate = dmOfficer.completedComplaints + dmOfficer.activeComplaints > 0
        ? Math.round((dmOfficer.completedComplaints / (dmOfficer.completedComplaints + dmOfficer.activeComplaints)) * 100)
        : dmOfficer.resolutionRate;
      add({
        id: dmOfficer.id, label: dmOfficer.name, type: 'officer', sub: dmOfficer.designation, val: 1.2,
        meta: {
          name: dmOfficer.name, designation: dmOfficer.designation, phone: dmOfficer.phone,
          activeComplaints: dmOfficer.activeComplaints, completedComplaints: dmOfficer.completedComplaints,
          avgDays: dmOfficer.avgResolutionTime, rating: dmOfficer.rating,
          resolutionRate: dmRate
        }
      });
      link(distId, dmOfficer.id, 'magistrate', 1);
    }

    
    const categories = Array.from(new Set(distComplaints.map(c => c.category)));
    categories.forEach((cat) => {
      if (filters.department && filters.department !== 'All Departments') {
        const mappings: Record<string, string> = {
          'Civic Infrastructure': 'PWD & Infrastructure',
          'Water & Sewage': 'Delhi Jal Board',
          'Electricity & Power': 'Power Department',
          'Public Health': 'Health & Family Welfare',
          'Education & Schools': 'Education Department',
          'Law & Policing': 'Delhi Police',
          'Transport & Roads': 'Transport Department',
          'Social Welfare': 'Social Welfare Department'
        };
        const dept = mappings[cat] || '';
        if (!dept.toLowerCase().includes(filters.department.toLowerCase())) return;
      }

      const catComplaints = distComplaints.filter(c => c.category === cat);
      const wardId = `W_${distName.toUpperCase().replace(/\s+/g, '')}_${cat.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
      const wardName = `${cat} Ward`;

      
      const mappings: Record<string, string> = {
        'Civic Infrastructure': 'PWD & Infrastructure',
        'Water & Sewage': 'Delhi Jal Board',
        'Electricity & Power': 'Power Department',
        'Public Health': 'Health & Family Welfare',
        'Education & Schools': 'Education Department',
        'Law & Policing': 'Delhi Police',
        'Transport & Roads': 'Transport Department',
        'Social Welfare': 'Social Welfare Department'
      };
      const dept = mappings[cat] || '';
      const matchingDeptHead = deptHeads.find(dh => dh.department === dept);

      add({
        id: wardId, label: wardName, type: 'booth', sub: `District Division`, val: 1.5,
        meta: {
          ward: wardName,
          boothOfficerCount: matchingDeptHead ? 2 : 1, 
          totalComplaints: catComplaints.length,
          resolved: catComplaints.filter(c => c.status === 'Resolved').length,
          pending: catComplaints.filter(c => c.status !== 'Resolved').length,
        }
      });
      link(distId, wardId, 'supervises', 1);

      if (matchingDeptHead) {
        link(matchingDeptHead.id, wardId, 'oversees', 1);
      }

      
      catComplaints.forEach(c => {
        add({
          id: c.id, label: c.title.slice(0, 28) + (c.title.length > 28 ? '…' : ''), type: 'complaint',
          sub: c.status, val: 0.8,
          meta: {
            complaintId: c.id, status: c.status as any, priority: c.priority as any,
            category: c.category, dateFiled: c.dateFiled, citizen: c.citizenName,
          }
        });
        link(wardId, c.id, 'grieve', 1);
      });
    });
  });

  return { nodes, links };
}


export const NODE_CFG = TIER_CFG;
export const buildGraph = (officers: any[], complaints: any[] = []) =>
  buildDelhiGovGraph(officers, complaints);
