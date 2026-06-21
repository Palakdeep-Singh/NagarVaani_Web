// ─── graphEngine.ts ─────────────────────────────────────────────────────────────
export const TIER_CFG = {
  district:  { color: '#8B5CF6', ring: '#C4B5FD', radius: 14, label: 'District Magistrate' },
  officer:   { color: '#3B82F6', ring: '#93C5FD', radius: 8,  label: 'Nodal Officer (SDM)' },
  complaint: { color: '#F97316', ring: '#FDBA74', radius: 4,  label: 'Complaint' },
};

export type NodeTier = keyof typeof TIER_CFG;

export interface GNode {
  id: string;
  label: string;
  type: string;
  sub?: string;
  val?: number;
  meta?: any;
  fx?: number;
  fy?: number;
}

export interface GLink {
  source: string | GNode;
  target: string | GNode;
  label?: string;
}

export interface GraphData {
  nodes: GNode[];
  links: GLink[];
}

export function resolveId(n: any): string {
  return typeof n === 'object' ? n.id : n;
}

export function buildDMDashboardGraph(officers: any[], complaints: any[]): GraphData {
  const nodes: GNode[] = [];
  const links: GLink[] = [];

  const dmId = 'DM_SHAHDARA';
  nodes.push({
    id: dmId,
    label: 'Shahdara District',
    type: 'district',
    sub: 'District Magistrate Hub',
    val: 4,
    meta: {
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      escalated: complaints.filter(c => c.status === 'Escalated').length,
      resolutionRate: 73,
    }
  });

  officers.forEach(o => {
    nodes.push({
      id: o.id,
      label: o.name,
      type: 'officer',
      sub: o.designation,
      val: 2,
      meta: o
    });
    links.push({ source: dmId, target: o.id, label: 'officer' });
  });

  complaints.forEach(c => {
    nodes.push({
      id: c.id,
      label: c.title,
      type: 'complaint',
      sub: c.status,
      val: 1,
      meta: c
    });
    
    // Connect complaint to assigned SDM
    const assigned = officers.find(o => o.name === c.assignedSDM);
    if (assigned) {
      links.push({ source: assigned.id, target: c.id, label: 'complaint' });
    } else {
      // Unassigned go directly to DM Hub
      links.push({ source: dmId, target: c.id, label: 'complaint' });
    }
  });

  return { nodes, links };
}
