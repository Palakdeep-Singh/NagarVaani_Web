import React, { useState } from 'react';
import { useStore } from '../context/Store';
import type { DistrictName } from '../types';
import { Activity } from 'lucide-react';

interface DistrictCardInfo {
  name: DistrictName;
  gridArea: string; 
  x: number;
  y: number;
}

const DELHI_DISTRICTS_MAP: DistrictCardInfo[] = [
  { name: 'North West Delhi', gridArea: 'row-1 col-1', x: 1, y: 1 },
  { name: 'North Delhi', gridArea: 'row-1 col-2', x: 2, y: 1 },
  { name: 'North East Delhi', gridArea: 'row-1 col-3', x: 3, y: 1 },
  { name: 'Shahdara', gridArea: 'row-1 col-4', x: 4, y: 1 },
  { name: 'West Delhi', gridArea: 'row-2 col-1', x: 1, y: 2 },
  { name: 'Central Delhi', gridArea: 'row-2 col-2', x: 2, y: 2 },
  { name: 'East Delhi', gridArea: 'row-2 col-3', x: 3, y: 2 },
  { name: 'South West Delhi', gridArea: 'row-3 col-1', x: 1, y: 3 },
  { name: 'New Delhi', gridArea: 'row-3 col-2', x: 2, y: 3 },
  { name: 'South East Delhi', gridArea: 'row-3 col-3', x: 3, y: 3 },
  { name: 'South Delhi', gridArea: 'row-4 col-2', x: 2, y: 4 }
];

export const Heatmap: React.FC = () => {
  const { complaints, setActiveDistrict, setActiveTab, setActiveRole } = useStore();
  const [metric, setMetric] = useState<'volume' | 'score'>('volume');

  const getDistrictStats = (districtName: DistrictName) => {
    const distComplaints = complaints.filter(c => c.district === districtName);
    const active = distComplaints.filter(c => c.status !== 'Resolved').length;
    const resolved = distComplaints.filter(c => c.status === 'Resolved').length;
    const total = distComplaints.length;
    const emergency = distComplaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;
    
    const activeRatio = total > 0 ? (active / total) * 100 : 0;
    const score = total > 0 ? Math.max(30, Math.round(100 - activeRatio * 0.8)) : 100;

    return { active, resolved, total, score, emergency };
  };

  const getHealthColors = (score: number) => {
    if (score >= 80) return { border: '#10B981', bg: '#ECFDF5', text: '#065F46', label: 'Healthy' };
    if (score >= 60) return { border: '#F59E0B', bg: '#FEF3C7', text: '#92400E', label: 'Moderate' };
    return { border: '#EF4444', bg: '#FEF2F2', text: '#991B1B', label: 'Critical' };
  };

  const handleDistrictClick = (districtName: DistrictName) => {
    setActiveDistrict(districtName);
    setActiveRole('District Magistrate');
    setActiveTab('DistrictMinistry');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Delhi State District Analyser & Grid Map
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Topological layout of Delhi's 11 administrative zones with weighted performance indicators. Click any card to drill down.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setMetric('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === 'volume' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Volume
          </button>
          <button
            onClick={() => setMetric('score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === 'score' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Resolution Score
          </button>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 mb-2 gap-2">
        <span className="font-bold">Analyser Parameters:</span>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-emerald-50 border border-emerald-200"></div>
            <span>Healthy (Score ≥ 80)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-amber-50 border border-amber-200"></div>
            <span>Moderate (Score 60 - 79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-rose-50 border border-rose-200"></div>
            <span>Critical (Score &lt; 60)</span>
          </div>
        </div>
      </div>

      {/* Main Grid Map Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200 relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(11,61,98,0.03),rgba(255,255,255,0))]" />

        {DELHI_DISTRICTS_MAP.map((card) => {
          const stats = getDistrictStats(card.name);
          const colors = getHealthColors(stats.score);
          const resPct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 100;
          
          return (
            <button
              key={card.name}
              onClick={() => handleDistrictClick(card.name)}
              className="relative flex flex-col justify-between p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] cursor-pointer hover:shadow-lg"
              style={{
                background: colors.bg,
                borderColor: colors.border,
                boxShadow: `0 2px 8px ${colors.border}15`,
              }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    Grid ({card.x}, {card.y})
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-800 truncate mt-0.5 group-hover:translate-x-0.5 transition-transform">
                    {card.name}
                  </h4>
                </div>
                {/* Score circle badge */}
                <div
                  className="w-11 h-11 rounded-full flex flex-col items-center justify-center flex-shrink-0"
                  style={{
                    background: colors.bg,
                    border: `2px solid ${colors.border}`
                  }}
                >
                  <span className="text-xs font-extrabold leading-none" style={{ color: colors.text }}>{stats.score}</span>
                  <span className="text-[6px] font-bold tracking-wider mt-0.5" style={{ color: colors.text }}>SCORE</span>
                </div>
              </div>

              {/* Compartment Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/70 rounded-lg p-1.5 text-center border border-white/50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Active</span>
                  <span className="text-xs font-extrabold text-slate-800">{stats.active}</span>
                </div>
                <div className="bg-white/70 rounded-lg p-1.5 text-center border border-white/50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">SLA Alert</span>
                  <span className={`text-xs font-extrabold ${stats.emergency > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{stats.emergency}</span>
                </div>
                <div className="bg-white/70 rounded-lg p-1.5 text-center border border-white/50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Resolved</span>
                  <span className="text-xs font-extrabold text-emerald-600">{stats.resolved}</span>
                </div>
                <div className="bg-white/70 rounded-lg p-1.5 text-center border border-white/50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Total</span>
                  <span className="text-xs font-extrabold text-indigo-600">{stats.total}</span>
                </div>
              </div>

              {/* Progress resolution bar */}
              <div className="space-y-1 mt-auto">
                <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${resPct}%`,
                      background: resPct >= 80 ? '#10B981' : resPct >= 60 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                  <span>Resolution: {resPct}%</span>
                  <span className="uppercase" style={{ color: colors.text }}>{colors.label}</span>
                </div>
              </div>

            </button>
          );
        })}
      </div>
    </div>
  );
};
