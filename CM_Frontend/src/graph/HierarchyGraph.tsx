// ─── HierarchyGraph.tsx ────────────────────────────────────────────────────────
// CM → District → Booth → Officer → Complaint — orbital web layout
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  X, Search, ChevronRight, Star, Clock, CheckCircle,
  AlertCircle, AlertTriangle, MapPin, User, FileText, TrendingUp,
} from 'lucide-react';
import { TIER_CFG, buildDelhiGovGraph, resolveId } from './graphEngine';
import type { NodeTier, GNode, GLink, GraphData } from './graphEngine';
import { paintNode as _paintNode, paintNodeArea, paintLink as _paintLink } from './painters';
import { useStore } from '../context/Store';

export interface HierarchyGraphProps { officers?: any[] }

const DISTRICTS = [
  'All Districts','New Delhi','North Delhi','North West Delhi','West Delhi',
  'South West Delhi','South Delhi','South East Delhi','Central Delhi',
  'East Delhi','Shahdara','North East Delhi',
];
const DEPARTMENTS = [
  'All Departments','Civic Infrastructure','Water & Sewage','Electricity & Power',
  'Public Health','Education & Schools','Law & Policing','Transport & Roads','Social Welfare',
];

const STATUS_COLOR: Record<string, string> = {
  Resolved: '#10B981', Active: '#3B82F6', Pending: '#F59E0B', Escalated: '#EF4444',
};
const PRIORITY_COLOR: Record<string, string> = {
  Emergency: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#10B981',
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Stars({ v }: { v: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(v) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
      ))}
      <span className="ml-1 text-[11px] font-bold text-slate-200">{v?.toFixed(1)}</span>
    </span>
  );
}
function Bar({ v, color }: { v: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 bg-[#1E2D47] rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, v)}%`, backgroundColor: color }} />
    </div>
  );
}
function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ backgroundColor: color + '25', color, border: `1px solid ${color}55` }}>
      {label}
    </span>
  );
}
function Crumb({ path }: { path: GNode[] }) {
  if (path.length < 2) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap py-2">
      {path.map((n, i) => (
        <React.Fragment key={n.id}>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: (TIER_CFG[n.type as NodeTier]?.color ?? '#333') + 'BB' }}>
            {n.label.length > 14 ? n.label.slice(0,13)+'…' : n.label}
          </span>
          {i < path.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Detail panels per node type ───────────────────────────────────────────────
function DetailCM({ node }: { node: GNode }) {
  const m = node.meta!;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Total Complaints', value: m.totalComplaints?.toLocaleString(), icon: <FileText className="w-4 h-4 text-slate-400" /> },
          { label: 'Resolved',         value: m.resolved?.toLocaleString(),        icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
          { label: 'Pending',          value: m.pending?.toLocaleString(),          icon: <Clock className="w-4 h-4 text-amber-400" /> },
          { label: 'Escalated',        value: m.escalated?.toLocaleString(),        icon: <AlertTriangle className="w-4 h-4 text-red-400" /> },
        ].map(item => (
          <div key={item.label} className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">{item.icon}<span className="text-[9px] text-slate-500 uppercase tracking-wider">{item.label}</span></div>
            <div className="text-lg font-bold text-white">{item.value}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-slate-400">Overall Resolution Rate</span>
          <span className="text-sm font-bold text-white">{m.resolutionRate}%</span>
        </div>
        <Bar v={m.resolutionRate!} color="#10B981" />
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Showing live command web across <strong className="text-white">all 11 Delhi districts</strong>, 
        their ward booths, assigned officers, and active grievances filed by citizens.
      </p>
    </div>
  );
}
function DetailDistrict({ node }: { node: GNode }) {
  const m = node.meta!;
  const rate = m.resolutionRate ?? 0;
  const perfColor = rate >= 90 ? '#10B981' : rate >= 80 ? '#3B82F6' : rate >= 70 ? '#F59E0B' : '#EF4444';
  const perfLabel = rate >= 90 ? 'EXCELLENT' : rate >= 80 ? 'GOOD' : rate >= 70 ? 'AVERAGE' : 'NEEDS ATTENTION';
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-purple-400" />
        <div>
          <div className="text-xs font-bold text-white">{node.sub}</div>
          <div className="text-[10px] text-slate-400">District Magistrate</div>
        </div>
        <Pill label={perfLabel} color={perfColor} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Resolved',  value: m.resolved,  color: '#10B981' },
          { label: 'Pending',   value: m.pending,   color: '#F59E0B' },
          { label: 'Escalated', value: m.escalated, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-2.5 text-center">
            <div className="text-base font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] text-slate-500 uppercase">{s.label}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[11px] text-slate-400">Resolution Rate</span>
          <span className="text-sm font-bold text-white">{rate}%</span>
        </div>
        <Bar v={rate} color={perfColor} />
      </div>
      {m.topIssue && (
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-400">Top Complaint Issue</span>
          <span className="text-[11px] font-bold text-orange-400">{m.topIssue}</span>
        </div>
      )}
    </div>
  );
}
function DetailBooth({ node }: { node: GNode }) {
  const m = node.meta!;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-teal-400" />
        <div>
          <div className="text-xs font-bold text-white">{m.ward}</div>
          <div className="text-[10px] text-slate-400">Administrative Ward</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Officers Assigned', value: m.boothOfficerCount, color: '#3B82F6' },
          { label: 'Total Complaints',  value: m.totalComplaints,   color: '#F97316' },
          { label: 'Resolved',          value: m.resolved,          color: '#10B981' },
          { label: 'Pending',           value: m.pending,           color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] text-slate-500 uppercase">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-400">
        Click any <span className="text-blue-400 font-medium">officer node</span> or <span className="text-orange-400 font-medium">complaint node</span> branching from this ward to drill down.
      </p>
    </div>
  );
}
function DetailOfficer({ node }: { node: GNode }) {
  const m = node.meta!;
  const rate = m.resolutionRate ?? 0;
  const perfColor = rate >= 90 ? '#10B981' : rate >= 80 ? '#3B82F6' : rate >= 70 ? '#F59E0B' : '#EF4444';
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{m.name}</div>
          <div className="text-[10px] text-slate-400">{m.designation}</div>
          {m.phone && <div className="text-[10px] text-slate-500 font-mono">{m.phone}</div>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Resolved', value: m.completedComplaints, color: '#10B981' },
          { label: 'Active',   value: m.activeComplaints,    color: '#F59E0B' },
          { label: 'Avg Days', value: m.avgDays + 'd',       color: '#3B82F6' },
        ].map(s => (
          <div key={s.label} className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-2.5 text-center">
            <div className="text-base font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] text-slate-500 uppercase">{s.label}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[11px] text-slate-400">Resolution Rate</span>
          <span className="text-sm font-bold text-white">{rate}%</span>
        </div>
        <Bar v={rate} color={perfColor} />
      </div>
      {m.rating != null && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Citizen Rating</span>
          <Stars v={m.rating} />
        </div>
      )}
    </div>
  );
}
function DetailComplaint({ node }: { node: GNode }) {
  const m = node.meta!;
  const sc = STATUS_COLOR[m.status ?? ''] ?? '#888';
  const pc = PRIORITY_COLOR[m.priority ?? ''] ?? '#888';
  return (
    <div className="space-y-3">
      <div className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Complaint ID</div>
        <div className="text-sm font-bold font-mono text-white">{m.complaintId}</div>
      </div>
      <div className="flex gap-2">
        <Pill label={m.status ?? ''} color={sc} />
        <Pill label={m.priority ?? ''} color={pc} />
      </div>
      <div className="space-y-2">
        {[
          { label: 'Category',    value: m.category },
          { label: 'Filed By',   value: m.citizen },
          { label: 'Date Filed', value: m.dateFiled },
        ].map(r => (
          <div key={r.label} className="flex justify-between items-start gap-2">
            <span className="text-[11px] text-slate-500 shrink-0">{r.label}</span>
            <span className="text-[11px] font-medium text-slate-200 text-right">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-lg border" style={{ backgroundColor: sc + '11', borderColor: sc + '44' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc }} />
          <span className="text-[11px] font-bold" style={{ color: sc }}>Status: {m.status}</span>
        </div>
        {m.status === 'Escalated' && <p className="text-[10px] text-red-300 mt-1">⚠ This complaint has been escalated and requires immediate CM-level attention.</p>}
        {m.status === 'Resolved'  && <p className="text-[10px] text-emerald-300 mt-1">✓ Complaint resolved successfully by the assigned ward officer.</p>}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export const HierarchyGraph: React.FC<HierarchyGraphProps> = ({ officers: propOfficers }) => {
  const storeData   = useStore();
  const allOfficers = propOfficers ?? storeData.officers ?? [];

  const [distFilter, setDistFilter] = useState('All Districts');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [search,     setSearch]     = useState('');

  const [graphData,    setGraphData]    = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [hoverNode,    setHoverNode]    = useState<GNode | null>(null);
  const [pulseIds,     setPulseIds]     = useState<Set<string>>(new Set());

  const fgRef  = useRef<any>(null);
  const rafRef = useRef<number>(0);

  // Build
  useEffect(() => {
    const gd = buildDelhiGovGraph(allOfficers, {
      district:   distFilter !== 'All Districts'   ? distFilter   : undefined,
      department: deptFilter !== 'All Departments' ? deptFilter   : undefined,
    });
    setGraphData(gd);
    setSelectedNode(null);
  }, [allOfficers, distFilter, deptFilter]);

  // Force: orbital web, CM pinned at centre
  useEffect(() => {
    if (!graphData.nodes.length) return;
    const fg = fgRef.current;
    if (!fg) return;

    fg.d3Force('charge')?.strength((n: GNode) => {
      const s: Record<string, number> = { cm: -1200, district: -500, booth: -300, officer: -200, complaint: -120 };
      return s[n.type] ?? -150;
    });

    fg.d3Force('link')?.distance((l: GLink) => {
      const t = (typeof l.source === 'object' ? (l.source as GNode).type : '') as NodeTier;
      const d: Record<string, number> = { cm: 180, district: 130, booth: 90, officer: 70, complaint: 55 };
      return d[t] ?? 60;
    }).strength(0.5);

    // Radial rings
    const tierR: Record<string, number> = { cm: 0, district: 180, booth: 320, officer: 440, complaint: 560 };
    try {
      const d3 = (window as any).d3;
      if (d3?.forceRadial) {
        fg.d3Force('radial', d3.forceRadial((n: GNode) => tierR[n.type] ?? 500, 0, 0).strength(0.25));
      }
      if (d3?.forceCollide) {
        const cR: Record<string, number> = { cm: 32, district: 22, booth: 18, officer: 15, complaint: 12 };
        fg.d3Force('collision', d3.forceCollide((n: GNode) => (cR[n.type] ?? 12) + 4).strength(0.85));
      }
    } catch (_) {}

    // Pin CM
    const cm = graphData.nodes.find(n => n.id === 'CM');
    if (cm) { cm.fx = 0; cm.fy = 0; }

    const t = setTimeout(() => fg.zoomToFit(900, 90), 1100);
    return () => clearTimeout(t);
  }, [graphData]);

  // Animation
  useEffect(() => {
    const loop = () => { fgRef.current?.refresh?.(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Path tracing
  const buildPath = useCallback((nodeId: string): GNode[] => {
    const map = new Map(graphData.nodes.map(n => [n.id, n]));
    const path: GNode[] = [];
    let curr = nodeId;
    const visited = new Set<string>();
    while (curr && !visited.has(curr)) {
      visited.add(curr);
      const n = map.get(curr);
      if (n) path.unshift(n);
      if (curr === 'CM') break;
      const pl = graphData.links.find(l => resolveId(l.target) === curr);
      if (!pl) break;
      curr = resolveId(pl.source);
    }
    return path;
  }, [graphData]);

  const activeNodes = useMemo((): Set<string> | null => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches = graphData.nodes.filter(n =>
        n.label.toLowerCase().includes(q) ||
        (n.sub || '').toLowerCase().includes(q) ||
        (n.meta?.category || '').toLowerCase().includes(q) ||
        (n.meta?.name || '').toLowerCase().includes(q) ||
        (n.meta?.citizen || '').toLowerCase().includes(q)
      );
      if (!matches.length) return new Set();
      const set = new Set<string>();
      matches.forEach(m => { buildPath(m.id).forEach(n => set.add(n.id)); });
      return set;
    }
    const tgt = selectedNode || hoverNode;
    if (!tgt) return null;
    const set = new Set<string>();
    buildPath(tgt.id).forEach(n => set.add(n.id));
    // children
    graphData.links.forEach(l => {
      if (resolveId(l.source) === tgt.id) set.add(resolveId(l.target));
    });
    return set;
  }, [selectedNode, hoverNode, search, graphData, buildPath]);

  const paintNodeCb = useCallback((node: any, ctx: CanvasRenderingContext2D, gs: number) => {
    _paintNode(node, ctx, gs, { activeNodes, selectedId: selectedNode?.id ?? null, pulseIds });
  }, [activeNodes, selectedNode, pulseIds]);

  const paintLinkCb = useCallback((link: any, ctx: CanvasRenderingContext2D, gs: number) => {
    _paintLink(link, ctx, gs, { activeNodes });
  }, [activeNodes]);

  const onNodeClick = useCallback((node: any) => {
    setSelectedNode(prev => prev?.id === node.id ? null : (node as GNode));
    setSearch('');
    setPulseIds(new Set([node.id]));
    setTimeout(() => setPulseIds(new Set()), 1600);
  }, []);

  const selectedPath = useMemo(() => selectedNode ? buildPath(selectedNode.id) : [], [selectedNode, buildPath]);

  const stats = useMemo(() => ({
    districts: graphData.nodes.filter(n => n.type === 'district').length,
    booths:    graphData.nodes.filter(n => n.type === 'booth').length,
    officers:  graphData.nodes.filter(n => n.type === 'officer').length,
    complaints:graphData.nodes.filter(n => n.type === 'complaint').length,
    total:     graphData.nodes.length,
  }), [graphData]);

  const cfg = selectedNode ? TIER_CFG[selectedNode.type as NodeTier] : null;

  return (
    <div className="flex flex-col h-full bg-[#050C1A] font-sans">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 bg-[#080F22] border-b border-[#1A2540] shrink-0">
        <div className="shrink-0">
          <div className="text-[11px] font-bold text-white tracking-widest uppercase">CM Command Web</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Delhi Governance · {stats.total} nodes live</div>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedNode(null); }}
            placeholder="Search officer, complaint, district, citizen…"
            className="w-full bg-[#0D1730] border border-[#1E2D47] text-[11px] text-slate-200 rounded pl-7 pr-3 py-1.5 outline-none focus:border-cyan-600 placeholder-slate-600 transition-colors"
          />
        </div>

        <select value={distFilter} onChange={e => setDistFilter(e.target.value)}
          className="bg-[#0D1730] border border-[#1E2D47] text-[11px] text-slate-300 rounded px-2 py-1.5 outline-none cursor-pointer">
          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
        </select>

        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="bg-[#0D1730] border border-[#1E2D47] text-[11px] text-slate-300 rounded px-2 py-1.5 outline-none cursor-pointer">
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>

        <button onClick={() => { setDistFilter('All Districts'); setDeptFilter('All Departments'); setSearch(''); setSelectedNode(null); }}
          className="text-[9px] font-bold text-slate-500 hover:text-white border border-[#1E2D47] hover:border-slate-500 px-2 py-1.5 rounded transition-colors shrink-0">
          RESET
        </button>

        {/* Live stats pills */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          {[
            { label: 'Districts', v: stats.districts,  c: '#8B5CF6' },
            { label: 'Booths',    v: stats.booths,     c: '#14B8A6' },
            { label: 'Officers',  v: stats.officers,   c: '#3B82F6' },
            { label: 'Complaints',v: stats.complaints, c: '#F97316' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1 px-2 py-1 rounded bg-[#0D1730] border border-[#1E2D47]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.c }} />
              <span className="text-[9px] font-bold" style={{ color: s.c }}>{s.v}</span>
              <span className="text-[9px] text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[#050C1A]">

          {/* Legend */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none space-y-1">
            {Object.entries(TIER_CFG).map(([type, c]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[9px] text-slate-500 font-medium">{c.label}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-[#1A2540] space-y-1">
              {Object.entries({ Resolved: '#10B981', Active: '#3B82F6', Pending: '#F59E0B', Escalated: '#EF4444' }).map(([k,v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v }} />
                  <span className="text-[9px] text-slate-600">{k}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hint */}
          {!selectedNode && !hoverNode && !search && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-[#080F22]/90 border border-[#1A2540] rounded-full px-4 py-1.5 text-[10px] text-slate-500 flex items-center gap-2">
                <span>🖱</span> Click any node — CM · Districts · Booths · Officers · Complaints
              </div>
            </div>
          )}

          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeCanvasObject={paintNodeCb}
            nodeCanvasObjectMode={() => 'replace'}
            nodePointerAreaPaint={paintNodeArea}
            linkCanvasObject={paintLinkCb}
            linkCanvasObjectMode={() => 'replace'}
            nodeVal={(n: any) => n.val ?? 1}
            d3AlphaDecay={0.007}
            d3VelocityDecay={0.22}
            cooldownTicks={350}
            warmupTicks={60}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            onNodeClick={onNodeClick}
            onNodeHover={(n: any) => setHoverNode(n ?? null)}
            onBackgroundClick={() => setSelectedNode(null)}
            backgroundColor="transparent"
          />

          {/* Hover tooltip */}
          {hoverNode && !selectedNode && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="bg-[#0D1730] border border-[#2D3F65] rounded-lg px-3 py-2 shadow-2xl flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: hoverNode.type === 'complaint' && hoverNode.meta?.status
                    ? STATUS_COLOR[hoverNode.meta.status] ?? TIER_CFG[hoverNode.type as NodeTier]?.color
                    : TIER_CFG[hoverNode.type as NodeTier]?.color }} />
                <div>
                  <div className="text-[11px] font-bold text-white">{hoverNode.label}</div>
                  {hoverNode.sub && <div className="text-[10px] text-slate-400">{hoverNode.sub}</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-[320px] bg-[#080F22] border-l border-[#1A2540] flex flex-col shrink-0 overflow-hidden">
          {!selectedNode ? (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">How to navigate</div>
                <div className="space-y-2">
                  {[
                    { icon: '🟡', label: 'Chief Minister', desc: 'Centre node — citywide stats' },
                    { icon: '🟣', label: 'Districts (11)',  desc: 'DM name, resolution rate' },
                    { icon: '🟢', label: 'Ward / Booths',  desc: 'Officers & complaint count' },
                    { icon: '🔵', label: 'Officers',       desc: 'Individual KPIs, ratings' },
                    { icon: '🟠', label: 'Complaints',     desc: 'Status, priority, citizen' },
                  ].map(r => (
                    <div key={r.label} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#0D1730] border border-[#1A2540]">
                      <span className="text-sm shrink-0 mt-0.5">{r.icon}</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">{r.label}</div>
                        <div className="text-[10px] text-slate-500">{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Complaint status</div>
                {Object.entries(STATUS_COLOR).map(([s, c]) => (
                  <div key={s} className="flex items-center gap-2 py-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-[11px] text-slate-400">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#1A2540] relative shrink-0"
                style={{ backgroundColor: (cfg?.color ?? '#1E2D47') + '18' }}>
                <button onClick={() => setSelectedNode(null)}
                  className="absolute top-2.5 right-2.5 text-slate-600 hover:text-white p-1 rounded hover:bg-[#1A2540] transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2.5 pr-6">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: cfg?.color ?? '#1E2D47' }}>
                    {selectedNode.type === 'complaint' ? '!' :
                     selectedNode.type === 'officer'   ? <User className="w-4 h-4" /> :
                     selectedNode.label.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: cfg?.color }}>
                      {TIER_CFG[selectedNode.type as NodeTier]?.label}
                    </div>
                    <div className="text-sm font-bold text-white leading-tight truncate">{selectedNode.label}</div>
                    {selectedNode.sub && (
                      <div className="text-[10px] text-slate-400 mt-0.5">{selectedNode.sub}</div>
                    )}
                  </div>
                </div>

                <Crumb path={selectedPath} />
              </div>

              {/* Detail body */}
              <div className="px-4 py-4 flex-1">
                {selectedNode.type === 'cm'        && <DetailCM        node={selectedNode} />}
                {selectedNode.type === 'district'  && <DetailDistrict  node={selectedNode} />}
                {selectedNode.type === 'booth'     && <DetailBooth     node={selectedNode} />}
                {selectedNode.type === 'officer'   && <DetailOfficer   node={selectedNode} />}
                {selectedNode.type === 'complaint' && <DetailComplaint node={selectedNode} />}
              </div>

              {/* Children list */}
              {(() => {
                const kids = graphData.nodes.filter(n =>
                  graphData.links.some(l => resolveId(l.source) === selectedNode.id && resolveId(l.target) === n.id)
                );
                if (!kids.length) return null;
                const typeLabel: Record<string, string> = { district: 'Districts', booth: 'Wards', officer: 'Officers', complaint: 'Complaints' };
                return (
                  <div className="px-4 pb-4 border-t border-[#1A2540] pt-3 shrink-0">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      {typeLabel[kids[0].type] ?? 'Reports to this node'} ({kids.length})
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {kids.map(k => {
                        const kc = TIER_CFG[k.type as NodeTier];
                        const kColor = k.type === 'complaint' && k.meta?.status
                          ? STATUS_COLOR[k.meta.status] ?? kc?.color
                          : kc?.color;
                        return (
                          <button key={k.id} onClick={() => setSelectedNode(k)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#0D1730] transition-colors text-left">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: kColor }} />
                            <span className="text-[11px] text-slate-300 flex-1 truncate">{k.label}</span>
                            {k.type === 'complaint' && k.meta?.priority && (
                              <span className="text-[9px] font-bold shrink-0" style={{ color: PRIORITY_COLOR[k.meta.priority] ?? '#888' }}>
                                {k.meta.priority}
                              </span>
                            )}
                            <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="px-4 py-1.5 border-t border-[#1A2540] shrink-0">
                <div className="text-[9px] font-mono text-slate-700">NODE {selectedNode.id}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HierarchyGraph;
