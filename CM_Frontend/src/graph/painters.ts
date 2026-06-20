// ─── painters.ts ──────────────────────────────────────────────────────────────
import { TIER_CFG, resolveId } from './graphEngine';

export interface PaintNodeOptions {
  activeNodes: Set<string> | null;
  selectedId:  string | null;
  pulseIds:    Set<string>;
}

const STATUS_COLOR: Record<string, string> = {
  Resolved:  '#10B981',
  Active:    '#3B82F6',
  Pending:   '#F59E0B',
  Escalated: '#EF4444',
};

export function paintNode(node: any, ctx: CanvasRenderingContext2D, gs: number, opts: PaintNodeOptions): void {
  const { activeNodes, selectedId, pulseIds } = opts;
  if (typeof node.x !== 'number' || typeof node.y !== 'number') return;

  const cfg = TIER_CFG[node.type as keyof typeof TIER_CFG] ?? TIER_CFG.officer;
  const r   = cfg.radius;

  const isDimmed = activeNodes !== null && !activeNodes.has(node.id);
  const isActive = activeNodes?.has(node.id) ?? false;
  const isSel    = node.id === selectedId;
  const isPulse  = pulseIds.has(node.id);

  // Use status color for complaint nodes
  const nodeColor = node.type === 'complaint' && node.meta?.status
    ? (STATUS_COLOR[node.meta.status] ?? cfg.color)
    : cfg.color;

  ctx.globalAlpha = isDimmed ? 0.06 : 1;

  // Pulse ring
  if (isPulse && !isDimmed) {
    const t = (Date.now() % 1500) / 1500;
    ctx.save();
    ctx.globalAlpha = (1 - t) * 0.6;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 6 + t * 18, 0, 2 * Math.PI);
    ctx.strokeStyle = nodeColor;
    ctx.lineWidth   = 2 / gs;
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Active glow
  if (isActive && !isDimmed) {
    const g = ctx.createRadialGradient(node.x, node.y, r * 0.3, node.x, node.y, r + 16);
    g.addColorStop(0, nodeColor + 'BB');
    g.addColorStop(1, nodeColor + '00');
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 16, 0, 2 * Math.PI);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // Selected ring
  if (isSel && !isDimmed) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 11, 0, 2 * Math.PI);
    ctx.strokeStyle = cfg.ring;
    ctx.lineWidth = 2 / gs;
    ctx.stroke();
  }

  // Main circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
  const bg = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
  if (isDimmed) {
    bg.addColorStop(0, '#1A2540'); bg.addColorStop(1, '#0D1626');
  } else {
    bg.addColorStop(0, nodeColor + 'EE'); bg.addColorStop(1, nodeColor + '66');
  }
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth   = (isSel ? 2.5 : 1.5) / gs;
  ctx.strokeStyle = isDimmed ? '#243252' : nodeColor;
  ctx.stroke();

  // Inner dot
  ctx.beginPath();
  ctx.arc(node.x, node.y, r * 0.28, 0, 2 * Math.PI);
  ctx.fillStyle = isDimmed ? '#1E2D47' : 'rgba(255,255,255,0.88)';
  ctx.fill();

  // Label
  if (!isDimmed || isSel) {
    const lbl = (node.label as string) || '';
    const fz  = Math.max(7.5 / gs, 2);
    ctx.font      = `${isSel ? 700 : 500} ${fz}px "Inter","Segoe UI",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = isDimmed ? '#2D3F55' : '#F1F5F9';
    ctx.fillText(lbl, node.x, node.y + r + 2.5 / gs);
  }

  ctx.globalAlpha = 1;
}

export function paintNodeArea(node: any, color: string, ctx: CanvasRenderingContext2D, gs: number): void {
  if (typeof node.x !== 'number' || typeof node.y !== 'number') return;
  const r = (TIER_CFG[node.type as keyof typeof TIER_CFG] ?? TIER_CFG.officer).radius;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x, node.y, Math.max(r + 10, 14 / gs), 0, 2 * Math.PI);
  ctx.fill();
}

export interface PaintLinkOptions { activeNodes: Set<string> | null; }

export function paintLink(link: any, ctx: CanvasRenderingContext2D, gs: number, opts: PaintLinkOptions): void {
  const { activeNodes } = opts;
  const sx = typeof link.source === 'object' ? link.source.x : undefined;
  const sy = typeof link.source === 'object' ? link.source.y : undefined;
  const tx = typeof link.target === 'object' ? link.target.x : undefined;
  const ty = typeof link.target === 'object' ? link.target.y : undefined;
  if (typeof sx !== 'number' || typeof tx !== 'number') return;

  const sId = resolveId(link.source);
  const tId = resolveId(link.target);
  const isActive = activeNodes !== null && activeNodes.has(sId) && activeNodes.has(tId);
  const isDimmed = activeNodes !== null && !isActive;

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(tx, ty);

  if (isActive) {
    ctx.strokeStyle = '#67E8F9';
    ctx.lineWidth   = 2.5 / gs;
    ctx.globalAlpha = 1;
  } else if (isDimmed) {
    ctx.strokeStyle = '#1E2D4722';
    ctx.lineWidth   = 0.6 / gs;
    ctx.globalAlpha = 0.3;
  } else {
    // Color by link type
    const isComplaint = link.label === 'complaint';
    ctx.strokeStyle = isComplaint ? '#F9733366' : '#0EA5E955';
    ctx.lineWidth   = (isComplaint ? 0.7 : 0.9) / gs;
    ctx.globalAlpha = 0.65;
  }
  ctx.stroke();

  // Arrowhead on active links
  if (isActive) {
    const dx = tx - sx; const dy = ty - sy;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len < 4) { ctx.globalAlpha = 1; return; }
    const ux = dx/len; const uy = dy/len;
    const tCfg = TIER_CFG[(link.target as any)?.type as keyof typeof TIER_CFG] ?? TIER_CFG.officer;
    const ax = tx - ux * (tCfg.radius + 2);
    const ay = ty - uy * (tCfg.radius + 2);
    const as_ = 5 / gs;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - ux*as_ - uy*as_*0.6, ay - uy*as_ + ux*as_*0.6);
    ctx.lineTo(ax - ux*as_ + uy*as_*0.6, ay - uy*as_ - ux*as_*0.6);
    ctx.closePath();
    ctx.fillStyle = '#67E8F9';
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
