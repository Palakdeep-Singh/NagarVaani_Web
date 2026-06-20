import React, { useEffect, useMemo, useState } from 'react';
import {
  Vote, ShieldAlert, Clock, Users, Search, Bot, Send, Sparkles,
  AlertTriangle, CheckCircle2, Eye, MapPin, RadioTower, X
} from 'lucide-react';
import { generateBooths } from '../data/boothSeed';
import { getBoothInsights, askAI, isLiveAIConnected, type AIInsight } from '../services/aiService';
import type { Booth, BoothStatus } from '../types';

const STATUS_STYLE: Record<BoothStatus, string> = {
  Normal: 'bg-[var(--color-resolved-bg)] text-[var(--color-resolved-text)] border border-[var(--color-resolved-border)]',
  Watch: 'bg-[var(--color-priority-high-bg)] text-[var(--color-priority-high-text)] border border-[var(--color-priority-high-border)]',
  Critical: 'bg-[var(--color-priority-emergency-bg)] text-[var(--color-priority-emergency-text)] border border-[var(--color-priority-emergency-border)] font-bold',
  Resolved: 'bg-[var(--color-active-bg)] text-[var(--color-active-text)] border border-[var(--color-active-border)]',
};

const SEVERITY_STYLE: Record<AIInsight['severity'], string> = {
  info: 'border-l-4 border-indigo-400 bg-indigo-50/60',
  watch: 'border-l-4 border-amber-400 bg-amber-50/60',
  critical: 'border-l-4 border-rose-500 bg-rose-50/60',
};

export const BoothManagement: React.FC = () => {
  const [booths, setBooths] = useState<Booth[]>(() => {
    const saved = localStorage.getItem('nagarvaani_booths');
    return saved ? JSON.parse(saved) : generateBooths();
  });
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    localStorage.setItem('nagarvaani_booths', JSON.stringify(booths));
  }, [booths]);

  useEffect(() => {
    setLoadingInsights(true);
    getBoothInsights(booths).then(res => {
      setInsights(res);
      setLoadingInsights(false);
    });
  }, [booths]);

  const districts = useMemo(() => ['All', ...Array.from(new Set(booths.map(b => b.district)))], [booths]);

  const filtered = useMemo(() => {
    return booths.filter(b => {
      if (districtFilter !== 'All' && b.district !== districtFilter) return false;
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (search && !`${b.boothNumber} ${b.name} ${b.ward}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [booths, districtFilter, statusFilter, search]);

  const totalRegistered = booths.reduce((a, b) => a + b.registeredVoters, 0);
  const totalCast = booths.reduce((a, b) => a + b.votesCast, 0);
  const avgTurnout = totalRegistered > 0 ? ((totalCast / totalRegistered) * 100).toFixed(1) : '0.0';
  const criticalCount = booths.filter(b => b.status === 'Critical').length;
  const openIncidents = booths.flatMap(b => b.incidents).filter(i => i.status !== 'Resolved').length;

  const refreshIncident = (boothId: string, status: BoothStatus) => {
    setBooths(prev => prev.map(b => (b.id === boothId ? { ...b, status } : b)));
    setSelectedBooth(prev => (prev && prev.id === boothId ? { ...prev, status } : prev));
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    const res = await askAI(question, { booths, complaints: [] });
    setAnswer(res);
    setAsking(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Vote className="h-5 w-5 text-indigo-600" /> AI Booth Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time monitoring, anomaly flagging, and AI-assisted operations across all polling booths.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isLiveAIConnected() ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
          <RadioTower className="h-3.5 w-3.5" />
          {isLiveAIConnected() ? 'Live AI Connected' : 'Local AI Engine (offline-capable)'}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Vote} color="indigo" label="Monitored Booths" value={booths.length.toString()} />
        <StatCard icon={Users} color="teal" label="Avg. Turnout" value={`${avgTurnout}%`} />
        <StatCard icon={ShieldAlert} color="rose" label="Critical Booths" value={criticalCount.toString()} />
        <StatCard icon={AlertTriangle} color="amber" label="Open Incidents" value={openIncidents.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search booth number, name, ward..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
              {['All', 'Normal', 'Watch', 'Critical', 'Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">No booths match the current filters.</div>
              )}
              {filtered.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBooth(b)}
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">Booth {b.boothNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {b.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <div className="text-xs text-slate-400">Turnout</div>
                      <div className="text-sm font-bold text-slate-700">{b.turnoutPct}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Queue</div>
                      <div className="text-sm font-bold text-slate-700">{b.queueLengthMins}m</div>
                    </div>
                    <Eye className="h-4 w-4 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-600" /> AI Insights
            </h3>
            {loadingInsights ? (
              <p className="text-xs text-slate-400">Analyzing booth data...</p>
            ) : (
              <div className="space-y-2">
                {insights.map(i => (
                  <div key={i.id} className={`rounded-lg p-3 ${SEVERITY_STYLE[i.severity]}`}>
                    <p className="text-xs font-bold text-slate-800">{i.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{i.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-teal-600" /> Ask AI
            </h3>
            <div className="flex gap-2">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                placeholder="e.g. Which booths are critical?"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
              <button
                onClick={handleAsk}
                disabled={asking}
                className="px-3 py-2 rounded-xl bg-teal-600 text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {asking && <p className="text-xs text-slate-400 mt-2">Thinking...</p>}
            {answer && (
              <div className="mt-3 text-xs text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-line">{answer}</div>
            )}
            {!isLiveAIConnected() && (
              <p className="text-[11px] text-slate-400 mt-2">
                Running on local heuristics. Add your key in <code className="bg-slate-100 px-1 rounded">src/services/aiService.ts</code> to enable live AI answers.
              </p>
            )}
          </div>
        </div>
      </div>

      {selectedBooth && (
        <BoothDetailModal booth={selectedBooth} onClose={() => setSelectedBooth(null)} onStatusChange={refreshIncident} />
      )}
    </div>
  );
};

type StatColor = 'indigo' | 'teal' | 'rose' | 'amber';

const STAT_COLOR_STYLE: Record<StatColor, { border: string; iconBg: string; iconText: string }> = {
  indigo: { border: 'border-indigo-500', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600' },
  teal: { border: 'border-teal-500', iconBg: 'bg-teal-50', iconText: 'text-teal-600' },
  rose: { border: 'border-rose-500', iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
  amber: { border: 'border-amber-500', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
};

const StatCard: React.FC<{ icon: React.ComponentType<{ className?: string }>; color: StatColor; label: string; value: string }> = ({ icon: Icon, color, label, value }) => {
  const style = STAT_COLOR_STYLE[color];
  return (
    <div className={`bg-white p-5 rounded-2xl border-l-4 ${style.border} flex items-center justify-between shadow-sm border border-slate-200/60`}>
      <div className="space-y-1">
        <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">{label}</span>
        <h3 className="text-2xl font-extrabold text-slate-800">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
        <Icon className={`h-5 w-5 ${style.iconText}`} />
      </div>
    </div>
  );
};

const BoothDetailModal: React.FC<{ booth: Booth; onClose: () => void; onStatusChange: (id: string, status: BoothStatus) => void }> = ({ booth, onClose, onStatusChange }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="p-5 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h3 className="font-extrabold text-slate-800">Booth {booth.boothNumber}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{booth.name}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail label="District" value={booth.district} />
          <Detail label="Ward" value={booth.ward} />
          <Detail label="Presiding Officer" value={booth.presidingOfficer} />
          <Detail label="Last Updated" value={booth.lastUpdated} />
          <Detail label="Registered Voters" value={booth.registeredVoters.toLocaleString('en-IN')} />
          <Detail label="Votes Cast" value={`${booth.votesCast.toLocaleString('en-IN')} (${booth.turnoutPct}%)`} />
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Status</p>
          <div className="flex gap-2">
            {(['Normal', 'Watch', 'Critical', 'Resolved'] as BoothStatus[]).map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(booth.id, s)}
                className={`px-3 py-1 rounded-full text-xs font-bold border ${booth.status === s ? STATUS_STYLE[s] : 'bg-white text-slate-400 border-slate-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Incident Log</p>
          {booth.incidents.length === 0 ? (
            <p className="text-xs text-slate-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No incidents reported.</p>
          ) : (
            <div className="space-y-2">
              {booth.incidents.map(inc => (
                <div key={inc.id} className="text-xs bg-slate-50 rounded-lg p-3 flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700">{inc.type} <span className="text-slate-400 font-normal">· {inc.time}</span></p>
                    <p className="text-slate-600 mt-0.5">{inc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{label}</p>
    <p className="text-slate-700 font-semibold">{value}</p>
  </div>
);
