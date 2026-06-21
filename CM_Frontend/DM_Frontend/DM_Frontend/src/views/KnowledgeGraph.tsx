import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { X, Search, ChevronRight, User, MapPin } from 'lucide-react';
import { useStore } from '../context/Store';
import { TIER_CFG, buildDMDashboardGraph, resolveId } from '../graph/graphEngine';
import type { GNode, GLink, GraphData, NodeTier } from '../graph/graphEngine';
import { paintNode as _paintNode, paintNodeArea, paintLink as _paintLink } from '../graph/painters';
import { MOCK_SDM_OFFICERS } from '../data/mockData';

const STATUS_COLOR: Record<string, string> = { Resolved: '#10B981', Active: '#3B82F6', Pending: '#F59E0B', Escalated: '#EF4444' };
const PRIORITY_COLOR: Record<string, string> = { Emergency: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#10B981' };

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: color + '25', color, border: `1px solid ${color}55` }}>
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
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: (TIER_CFG[n.type as NodeTier]?.color ?? '#333') + 'BB' }}>
            {n.label.length > 14 ? n.label.slice(0,13)+'…' : n.label}
          </span>
          {i < path.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function DetailDistrict({ node }: { node: GNode }) {
  const m = node.meta!;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-purple-400" />
        <div>
          <div className="text-xs font-bold text-white">{node.label}</div>
          <div className="text-[10px] text-slate-400">{node.sub}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-2.5 text-center">
          <div className="text-base font-bold text-emerald-500">{m.resolved}</div>
          <div className="text-[9px] text-slate-500 uppercase">Resolved</div>
        </div>
        <div className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-2.5 text-center">
          <div className="text-base font-bold text-amber-500">{m.pending}</div>
          <div className="text-[9px] text-slate-500 uppercase">Pending</div>
        </div>
        <div className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-2.5 text-center">
          <div className="text-base font-bold text-rose-500">{m.escalated}</div>
          <div className="text-[9px] text-slate-500 uppercase">Escalated</div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400">Hub node for the District Magistrate. Shows all subordinate Nodal Officers (SDMs) and their respective grievances.</p>
    </div>
  );
}

function DetailOfficer({ node }: { node: GNode }) {
  const m = node.meta!;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{m.name}</div>
          <div className="text-[10px] text-slate-400">{m.designation} · {m.zone}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-2.5 text-center">
          <div className="text-base font-bold text-amber-500">{m.pendingCount}</div>
          <div className="text-[9px] text-slate-500 uppercase">Active Cases</div>
        </div>
        <div className="bg-[#0D1730] border border-[#1E2D47] rounded-lg p-2.5 text-center">
          <div className="text-base font-bold text-blue-500">{m.avgResolutionDays}</div>
          <div className="text-[9px] text-slate-500 uppercase">Avg Days</div>
        </div>
      </div>
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
        <div className="text-sm font-bold font-mono text-white">{m.id}</div>
      </div>
      <div className="flex gap-2">
        <Pill label={m.status ?? ''} color={sc} />
        <Pill label={m.priority ?? ''} color={pc} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-2"><span className="text-[11px] text-slate-500 shrink-0">Category</span><span className="text-[11px] font-medium text-slate-200 text-right">{m.category}</span></div>
        <div className="flex justify-between items-start gap-2"><span className="text-[11px] text-slate-500 shrink-0">Filed By</span><span className="text-[11px] font-medium text-slate-200 text-right">{m.citizenName}</span></div>
        <div className="flex justify-between items-start gap-2"><span className="text-[11px] text-slate-500 shrink-0">Days Old</span><span className="text-[11px] font-medium text-slate-200 text-right">{m.slaDay} Days</span></div>
      </div>
    </div>
  );
}

export const KnowledgeGraph: React.FC = () => {
  const { complaints } = useStore();
  const [search, setSearch] = useState('');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [hoverNode, setHoverNode] = useState<GNode | null>(null);
  const [pulseIds, setPulseIds] = useState<Set<string>>(new Set());

  const fgRef = useRef<any>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setGraphData(buildDMDashboardGraph(MOCK_SDM_OFFICERS, complaints));
  }, [complaints]);

  useEffect(() => {
    if (!graphData.nodes.length) return;
    const fg = fgRef.current;
    if (!fg) return;

    fg.d3Force('charge')?.strength((n: GNode) => {
      const s: Record<string, number> = { district: -1000, officer: -400, complaint: -150 };
      return s[n.type] ?? -150;
    });

    fg.d3Force('link')?.distance((l: GLink) => {
      const t = (typeof l.source === 'object' ? (l.source as GNode).type : '') as NodeTier;
      const d: Record<string, number> = { district: 160, officer: 80 };
      return d[t] ?? 60;
    }).strength(0.6);

    try {
      const d3 = (window as any).d3;
      if (d3?.forceRadial) {
        const tierR: Record<string, number> = { district: 0, officer: 250, complaint: 450 };
        fg.d3Force('radial', d3.forceRadial((n: GNode) => tierR[n.type] ?? 300, 0, 0).strength(0.3));
      }
    } catch (_) {}

    const dmHub = graphData.nodes.find(n => n.id === 'DM_SHAHDARA');
    if (dmHub) { dmHub.fx = 0; dmHub.fy = 0; }

    const t = setTimeout(() => fg.zoomToFit(800, 80), 800);
    return () => clearTimeout(t);
  }, [graphData]);

  useEffect(() => {
    const loop = () => { fgRef.current?.refresh?.(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const buildPath = useCallback((nodeId: string): GNode[] => {
    const map = new Map(graphData.nodes.map(n => [n.id, n]));
    const path: GNode[] = [];
    let curr = nodeId;
    const visited = new Set<string>();
    while (curr && !visited.has(curr)) {
      visited.add(curr);
      const n = map.get(curr);
      if (n) path.unshift(n);
      if (curr === 'DM_SHAHDARA') break;
      const pl = graphData.links.find(l => resolveId(l.target) === curr);
      if (!pl) break;
      curr = resolveId(pl.source);
    }
    return path;
  }, [graphData]);

  const activeNodes = useMemo((): Set<string> | null => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches = graphData.nodes.filter(n => n.label.toLowerCase().includes(q) || (n.sub || '').toLowerCase().includes(q));
      if (!matches.length) return new Set();
      const set = new Set<string>();
      matches.forEach(m => buildPath(m.id).forEach(n => set.add(n.id)));
      return set;
    }
    const tgt = selectedNode || hoverNode;
    if (!tgt) return null;
    const set = new Set<string>();
    buildPath(tgt.id).forEach(n => set.add(n.id));
    graphData.links.forEach(l => { if (resolveId(l.source) === tgt.id) set.add(resolveId(l.target)); });
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

  const cfg = selectedNode ? TIER_CFG[selectedNode.type as NodeTier] : null;

  return (
    <div className="h-full bg-[#050C1A] flex flex-col font-sans fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#080F22] border-b border-[#1A2540] shrink-0">
        <div>
          <div className="text-[11px] font-bold text-white tracking-widest uppercase">District Knowledge Graph</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Shahdara District · {graphData.nodes.length} Live Nodes</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
            <input value={search} onChange={e => { setSearch(e.target.value); setSelectedNode(null); }} placeholder="Search officer, complaint..." className="w-full bg-[#0D1730] border border-[#1E2D47] text-[11px] text-slate-200 rounded pl-7 pr-3 py-1.5 outline-none focus:border-indigo-600 placeholder-slate-600" />
          </div>
          <div className="flex gap-3">
            {Object.entries(TIER_CFG).map(([k,v]) => (
              <div key={k} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} /> {v.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        <div className="flex-1 bg-[#050C1A] relative">
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeCanvasObject={paintNodeCb}
            nodeCanvasObjectMode={() => 'replace'}
            nodePointerAreaPaint={paintNodeArea}
            linkCanvasObject={paintLinkCb}
            linkCanvasObjectMode={() => 'replace'}
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.25}
            cooldownTicks={300}
            onNodeClick={onNodeClick}
            onNodeHover={(n: any) => setHoverNode(n ?? null)}
            onBackgroundClick={() => setSelectedNode(null)}
          />
        </div>

        {/* Sidebar */}
        <div className="w-[320px] bg-[#080F22] border-l border-[#1A2540] shrink-0 overflow-y-auto">
          {!selectedNode ? (
            <div className="p-6 text-center text-slate-500 flex flex-col items-center justify-center h-full">
              <MapPin className="w-12 h-12 text-[#1E2D47] mb-4" />
              <div className="text-sm font-bold text-slate-300 mb-2">District Command Web</div>
              <div className="text-[11px] max-w-[200px] leading-relaxed">
                Visualizing Shahdara District Hub, Nodal Officers (SDMs), and their assigned active grievances. Click any node to drill down.
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-[#1A2540] relative" style={{ backgroundColor: (cfg?.color ?? '#1E2D47') + '18' }}>
                <button onClick={() => setSelectedNode(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: cfg?.color }}>{cfg?.label}</div>
                <div className="text-sm font-bold text-white mb-2">{selectedNode.label}</div>
                <Crumb path={selectedNode ? buildPath(selectedNode.id) : []} />
              </div>
              <div className="p-4 flex-1">
                {selectedNode.type === 'district' && <DetailDistrict node={selectedNode} />}
                {selectedNode.type === 'officer' && <DetailOfficer node={selectedNode} />}
                {selectedNode.type === 'complaint' && <DetailComplaint node={selectedNode} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
