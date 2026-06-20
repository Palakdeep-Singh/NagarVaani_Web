import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ShieldCheck, Radio, QrCode, ClipboardCheck, TrendingUp, AlertOctagon, Grid3x3,
  Truck, Warehouse, MapPinned, CheckCircle2, XCircle, Clock, Users, ChevronRight,
  Siren, PhoneCall, Activity
} from 'lucide-react';
import { generateBooths } from '../../data/boothSeed';
import {
  generateEVMUnits, generateMockPollSessions, generateEmergencies,
  generateHourlyTurnout, computeBoothHealth
} from '../../data/electionSeed';
import type {
  Booth, ElectionRole, EVMUnit, MockPollSession, EmergencyIncident, EmergencyStatus
} from '../../types';

// ─── Role configuration ─────────────────────────────────────────────────────

const ROLES: ElectionRole[] = ['CEO', 'DEO', 'Returning Officer', 'Sector Officer', 'Presiding Officer', 'Polling Officer'];

const ROLE_SCOPE: Record<ElectionRole, string> = {
  'Chief Minister': 'State-wide oversight, all districts',
  CEO: 'State-wide: Chief Electoral Officer',
  DEO: 'District Election Officer — single district',
  'Returning Officer': 'Assembly constituency — group of sectors',
  'Sector Officer': 'Sector — cluster of 8-12 booths',
  'Presiding Officer': 'Single booth — full charge',
  'Polling Officer': 'Single booth — assisting duty',
};

type SubTab = 'overview' | 'evm' | 'mockpoll' | 'turnout' | 'emergency' | 'heatmap';

const SUB_TABS: { id: SubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: ShieldCheck },
  { id: 'evm', label: 'EVM Movement', icon: Truck },
  { id: 'mockpoll', label: 'Mock Polling', icon: ClipboardCheck },
  { id: 'turnout', label: 'Hourly Turnout', icon: TrendingUp },
  { id: 'emergency', label: 'Emergencies', icon: AlertOctagon },
  { id: 'heatmap', label: 'Booth Health Map', icon: Grid3x3 },
];

export const ElectionCommandCenter: React.FC = () => {
  const [role, setRole] = useState<ElectionRole>('CEO');
  const [sub, setSub] = useState<SubTab>('overview');

  const [booths] = useState<Booth[]>(() => generateBooths());
  const [evmUnits] = useState<EVMUnit[]>(() => generateEVMUnits());
  const [mockPolls] = useState<MockPollSession[]>(() => generateMockPollSessions());
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>(() => generateEmergencies());
  const turnout = useMemo(() => generateHourlyTurnout(), []);

  const scopedBooths = role === 'Presiding Officer' || role === 'Polling Officer' ? booths.slice(0, 1) : booths;

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Radio className="h-5 w-5 text-indigo-600" /> Election Command Center
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            7-tier election operations system — CEO down to Polling Officer, with CM oversight.
          </p>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-2 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase pl-2">Viewing as</span>
          <select
            value={role}
            onChange={e => setRole(e.target.value as ElectionRole)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-2.5 text-xs text-indigo-700 font-semibold flex items-center gap-2">
        <ChevronRight className="h-3.5 w-3.5" /> {ROLE_SCOPE[role]}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUB_TABS.map(t => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                active ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {sub === 'overview' && <OverviewPanel booths={booths} evmUnits={evmUnits} mockPolls={mockPolls} emergencies={emergencies} turnout={turnout} role={role} />}
      {sub === 'evm' && <EVMPanel units={evmUnits} />}
      {sub === 'mockpoll' && <MockPollPanel sessions={mockPolls} />}
      {sub === 'turnout' && <TurnoutPanel turnout={turnout} booths={scopedBooths} />}
      {sub === 'emergency' && <EmergencyPanel emergencies={emergencies} setEmergencies={setEmergencies} />}
      {sub === 'heatmap' && <HeatmapPanel booths={booths} />}
    </div>
  );
};

// ─── Overview ───────────────────────────────────────────────────────────────

const OverviewPanel: React.FC<{
  booths: Booth[]; evmUnits: EVMUnit[]; mockPolls: MockPollSession[]; emergencies: EmergencyIncident[];
  turnout: ReturnType<typeof generateHourlyTurnout>; role: ElectionRole;
}> = ({ booths, evmUnits, mockPolls, emergencies, turnout, role }) => {
  const liveTurnout = turnout[turnout.length - 1]?.turnoutPct ?? 0;
  const evmAtBooth = evmUnits.filter(u => u.status === 'At Booth' || u.status === 'Sealed Post-Poll').length;
  const mockFailed = mockPolls.filter(m => m.status === 'Failed').length;
  const openEmergencies = emergencies.filter(e => e.status !== 'Resolved').length;
  const criticalBooths = booths.filter(b => b.status === 'Critical').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat icon={TrendingUp} color="indigo" label="State Turnout" value={`${liveTurnout}%`} />
        <Stat icon={Truck} color="teal" label="EVMs Deployed" value={`${evmAtBooth}/${evmUnits.length}`} />
        <Stat icon={ClipboardCheck} color="amber" label="Mock Poll Failures" value={mockFailed.toString()} />
        <Stat icon={Siren} color="rose" label="Open Emergencies" value={openEmergencies.toString()} />
        <Stat icon={AlertOctagon} color="rose" label="Critical Booths" value={criticalBooths.toString()} />
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-extrabold text-slate-800 mb-4">7-Component Chain of Command</h3>
        <div className="flex flex-col lg:flex-row gap-3">
          {[
            { r: 'CEO', d: 'State-level EVM & process custodian' },
            { r: 'DEO', d: 'District coordination & reporting' },
            { r: 'Returning Officer', d: 'Constituency-level results & disputes' },
            { r: 'Sector Officer', d: 'Mobile, covers 8-12 booths' },
            { r: 'Presiding Officer', d: 'In-charge of one booth' },
            { r: 'Polling Officer', d: 'Booth-level voter assistance' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.r}>
              <div className={`flex-1 rounded-xl border p-3 ${role === item.r ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs font-extrabold text-slate-800">{item.r}</p>
                <p className="text-[11px] text-slate-500 mt-1">{item.d}</p>
              </div>
              {i < arr.length - 1 && <ChevronRight className="hidden lg:block h-4 w-4 text-slate-300 self-center shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-3">CM receives a state-wide rollup across every tier above — visible throughout this Command Center regardless of selected role.</p>
      </div>
    </div>
  );
};

// ─── EVM Tracking ───────────────────────────────────────────────────────────

const EVM_STATUS_STYLE: Record<string, string> = {
  Warehouse: 'bg-slate-100 text-slate-600 border-slate-200',
  'In Transit': 'bg-amber-50 text-amber-700 border-amber-200',
  'At Booth': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Sealed Post-Poll': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Returned to Warehouse': 'bg-slate-100 text-slate-500 border-slate-200',
};

const EVMPanel: React.FC<{ units: EVMUnit[] }> = ({ units }) => {
  const [selected, setSelected] = useState<EVMUnit | null>(null);
  const [filter, setFilter] = useState('All');

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    units.forEach(u => { c[u.status] = (c[u.status] || 0) + 1; });
    return c;
  }, [units]);

  const filtered = filter === 'All' ? units : units.filter(u => u.status === filter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {['All', 'Warehouse', 'In Transit', 'At Booth', 'Sealed Post-Poll', 'Returned to Warehouse'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-[11px] font-bold px-2 py-2 rounded-xl border ${filter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {s} {s !== 'All' && `(${counts[s] || 0})`}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100">
            {filtered.map(u => (
              <button key={u.id} onClick={() => setSelected(u)} className="w-full text-left p-4 hover:bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{u.serialNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${EVM_STATUS_STYLE[u.status]}`}>{u.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{u.type} · Booth {u.assignedBoothNumber} · {u.district}</p>
                </div>
                <QrCode className="h-4 w-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-2">
          <MapPinned className="h-4 w-4 text-indigo-600" /> {selected ? `Custody Chain — ${selected.serialNumber}` : 'Select an EVM unit'}
        </h3>
        {!selected && <p className="text-xs text-slate-400">Tap any EVM in the list to view its QR-scan and GPS custody trail from warehouse to booth.</p>}
        {selected && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500">Custody officer: <span className="font-bold text-slate-700">{selected.custodyOfficer}</span></div>
            <div className="space-y-2">
              {selected.history.map((h, i) => (
                <div key={h.id} className="flex items-start gap-2 text-xs">
                  <div className="flex flex-col items-center pt-0.5">
                    {i === 0 ? <Warehouse className="h-3.5 w-3.5 text-indigo-500" /> : <Truck className="h-3.5 w-3.5 text-slate-400" />}
                    {i < selected.history.length - 1 && <div className="w-px h-6 bg-slate-200 mt-1" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{h.note} <span className="text-slate-400 font-normal">· {h.time}</span></p>
                    <p className="text-slate-500">{h.location}</p>
                    <p className="text-slate-400 font-mono text-[10px]">{h.qrCode} · {h.gpsLat.toFixed(4)}, {h.gpsLng.toFixed(4)}</p>
                    <p className="text-slate-400">Scanned by {h.scannedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Mock Polling ───────────────────────────────────────────────────────────

const MOCK_STATUS_STYLE: Record<string, string> = {
  Scheduled: 'bg-slate-100 text-slate-600 border-slate-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Passed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const MockPollPanel: React.FC<{ sessions: MockPollSession[] }> = ({ sessions }) => {
  const passed = sessions.filter(s => s.status === 'Passed').length;
  const failed = sessions.filter(s => s.status === 'Failed').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat icon={CheckCircle2} color="teal" label="Passed" value={passed.toString()} />
        <Stat icon={XCircle} color="rose" label="Failed" value={failed.toString()} />
        <Stat icon={Clock} color="amber" label="Scheduled" value={sessions.filter(s => s.status === 'Scheduled').length.toString()} />
        <Stat icon={Activity} color="indigo" label="In Progress" value={sessions.filter(s => s.status === 'In Progress').length.toString()} />
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
          {sessions.map(s => (
            <div key={s.id} className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <span className="font-bold text-slate-800 text-sm">Booth {s.boothNumber}</span>
                  <span className="text-xs text-slate-400 ml-2">{s.district} · {s.scheduledTime} · {s.conductedBy}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${MOCK_STATUS_STYLE[s.status]}`}>{s.status}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {s.checklist.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                    {c.checked ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                    {c.label}
                  </div>
                ))}
              </div>
              {s.remarks && <p className="text-[11px] text-slate-500 mt-2 italic">{s.remarks}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Hourly Turnout ─────────────────────────────────────────────────────────

const TurnoutPanel: React.FC<{ turnout: ReturnType<typeof generateHourlyTurnout>; booths: Booth[] }> = ({ turnout, booths }) => {
  const byDistrict = useMemo(() => {
    const map: Record<string, { total: number; cast: number }> = {};
    booths.forEach(b => {
      map[b.district] = map[b.district] || { total: 0, cast: 0 };
      map[b.district].total += b.registeredVoters;
      map[b.district].cast += b.votesCast;
    });
    return Object.entries(map).map(([d, v]) => ({ district: d, pct: ((v.cast / v.total) * 100).toFixed(1) })).sort((a, b) => Number(b.pct) - Number(a.pct));
  }, [booths]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-extrabold text-slate-800 mb-1 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-600" /> State-Wide Hourly Turnout</h3>
        <p className="text-xs text-slate-400 mb-4">Cumulative voter turnout reported across all booths, by hour.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={turnout} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="turnoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 15, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 15, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Turnout']} />
              <Area type="monotone" dataKey="turnoutPct" stroke="#4f46e5" strokeWidth={2.5} fill="url(#turnoutGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-teal-600" /> By District</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {byDistrict.map(d => (
            <div key={d.district} className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">{d.district}</span>
              <span className="font-bold text-slate-800">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Emergency Control ──────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
};

const EmergencyPanel: React.FC<{ emergencies: EmergencyIncident[]; setEmergencies: React.Dispatch<React.SetStateAction<EmergencyIncident[]>> }> = ({ emergencies, setEmergencies }) => {
  const advance = (id: string) => {
    const order: EmergencyStatus[] = ['Open', 'Acknowledged', 'Resolving', 'Resolved'];
    setEmergencies(prev => prev.map(e => {
      if (e.id !== id) return e;
      const idx = order.indexOf(e.status);
      return idx < order.length - 1 ? { ...e, status: order[idx + 1] } : e;
    }));
  };

  const sorted = [...emergencies].sort((a, b) => {
    const sevOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2"><Siren className="h-4 w-4 text-rose-600" /> Live Incident Queue</h3>
        <span className="text-xs text-slate-400">{emergencies.filter(e => e.status !== 'Resolved').length} open of {emergencies.length}</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
        {sorted.map(e => (
          <div key={e.id} className="p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[e.severity]}`}>{e.severity}</span>
                <span className="font-bold text-slate-800 text-sm">{e.type}</span>
                <span className="text-xs text-slate-400">Booth {e.boothNumber} · {e.district}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{e.description}</p>
              <p className="text-[11px] text-slate-400 mt-1">Reported {e.reportedAt} · SLA {e.slaMinutes}m · Assigned: {e.assignedTo}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${e.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{e.status}</span>
              {e.status !== 'Resolved' && (
                <button onClick={() => advance(e.id)} className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                  <PhoneCall className="h-3 w-3" /> Advance
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Booth Health Heatmap ───────────────────────────────────────────────────

function healthColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

const HeatmapPanel: React.FC<{ booths: Booth[] }> = ({ booths }) => {
  const byDistrict = useMemo(() => {
    const map: Record<string, number[]> = {};
    booths.forEach(b => {
      const score = computeBoothHealth(b);
      map[b.district] = map[b.district] || [];
      map[b.district].push(score);
    });
    return Object.entries(map).map(([district, scores]) => ({
      district,
      avg: Math.round(scores.reduce((a, s) => a + s, 0) / scores.length),
      boothCount: scores.length,
    })).sort((a, b) => a.avg - b.avg);
  }, [booths]);

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-extrabold text-slate-800 mb-1 flex items-center gap-2"><Grid3x3 className="h-4 w-4 text-indigo-600" /> Regional Booth Health</h3>
      <p className="text-xs text-slate-400 mb-5">Each dot's colour is the average operational health score of booths in that district — derived from status, queue length, and open incidents.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {byDistrict.map(d => (
          <div key={d.district} className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full shrink-0 shadow-inner"
              style={{ backgroundColor: healthColor(d.avg), boxShadow: `0 0 0 4px ${healthColor(d.avg)}22` }}
            />
            <div>
              <p className="text-xs font-bold text-slate-800">{d.district}</p>
              <p className="text-[11px] text-slate-500">{d.avg} / 100 · {d.boothCount} booths</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-5 text-[11px] text-slate-500">
        <Legend color="#10b981" label="Healthy (80+)" />
        <Legend color="#84cc16" label="Stable (60-79)" />
        <Legend color="#f59e0b" label="Watch (40-59)" />
        <Legend color="#ef4444" label="Critical (<40)" />
      </div>
    </div>
  );
};

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    {label}
  </div>
);

// ─── Shared stat card ───────────────────────────────────────────────────────

type StatColor = 'indigo' | 'teal' | 'rose' | 'amber';
const STAT_COLOR_STYLE: Record<StatColor, { border: string; iconBg: string; iconText: string }> = {
  indigo: { border: 'border-indigo-500', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600' },
  teal: { border: 'border-teal-500', iconBg: 'bg-teal-50', iconText: 'text-teal-600' },
  rose: { border: 'border-rose-500', iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
  amber: { border: 'border-amber-500', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
};

const Stat: React.FC<{ icon: React.ComponentType<{ className?: string }>; color: StatColor; label: string; value: string }> = ({ icon: Icon, color, label, value }) => {
  const style = STAT_COLOR_STYLE[color];
  return (
    <div className={`bg-white p-4 rounded-2xl border-l-4 ${style.border} flex items-center justify-between shadow-sm border border-slate-200/60`}>
      <div className="space-y-1">
        <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">{label}</span>
        <h3 className="text-xl font-extrabold text-slate-800">{value}</h3>
      </div>
      <div className={`p-2 rounded-xl ${style.iconBg}`}>
        <Icon className={`h-4.5 w-4.5 ${style.iconText}`} />
      </div>
    </div>
  );
};
