import React, { useState } from 'react';
import { useStore } from '../context/Store';
import type { DistrictName } from '../types';
import { ShieldAlert, TrendingUp, Activity } from 'lucide-react';

interface DistrictCardInfo {
  name: DistrictName;
  gridArea: string; // CSS Grid location
  x: number;
  y: number;
}

// Map layout corresponding to actual geography of Delhi
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

  // Compute metrics for each district dynamically
  const getDistrictStats = (districtName: DistrictName) => {
    const distComplaints = complaints.filter(c => c.district === districtName);
    const active = distComplaints.filter(c => c.status !== 'Resolved').length;
    const resolved = distComplaints.filter(c => c.status === 'Resolved').length;
    const total = distComplaints.length;
    
    // Performance Score formula: 100 - (active ratio + pending weight)
    const activeRatio = total > 0 ? (active / total) * 100 : 0;
    const score = total > 0 ? Math.max(30, Math.round(100 - activeRatio * 0.8)) : 100;

    return { active, resolved, total, score };
  };

  // Get intensity color based on metric for premium light theme
  const getColorStyle = (districtName: DistrictName) => {
    const stats = getDistrictStats(districtName);
    if (metric === 'volume') {
      // High volume -> Redder, Low volume -> Greener
      if (stats.active > 8) return 'bg-rose-50/70 border-rose-200 hover:bg-rose-100 text-rose-800';
      if (stats.active > 4) return 'bg-amber-50/70 border-amber-200 hover:bg-amber-100 text-amber-800';
      return 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 text-emerald-800';
    } else {
      // High Score -> Green, Low Score -> Red
      if (stats.score >= 85) return 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 text-emerald-800';
      if (stats.score >= 70) return 'bg-amber-50/70 border-amber-200 hover:bg-amber-100 text-amber-800';
      return 'bg-rose-50/70 border-rose-200 hover:bg-rose-100 text-rose-800';
    }
  };

  const handleDistrictClick = (districtName: DistrictName) => {
    setActiveDistrict(districtName);
    setActiveRole('District Magistrate');
    setActiveTab('DM View');
  };

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Delhi State Heatmap & District Grid
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Topological layout of Delhi's 11 administrative zones. Click any district block to view its DM console.
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
      <div className="flex flex-wrap justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 mb-6 gap-2">
        <span className="font-bold">Heatmap Legend:</span>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-emerald-50 border border-emerald-200"></div>
            <span>{metric === 'volume' ? 'Low Intake (< 5)' : 'High Score (≥ 85%)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-amber-50 border border-amber-200"></div>
            <span>{metric === 'volume' ? 'Moderate Intake (5 - 8)' : 'Mid Score (70 - 84%)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-rose-50 border border-rose-200"></div>
            <span>{metric === 'volume' ? 'High Critical (> 8)' : 'Critical Score (< 70%)'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Map Container */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Decorative Grid BG lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.03),rgba(255,255,255,0))]" />

        {DELHI_DISTRICTS_MAP.map((card) => {
          const stats = getDistrictStats(card.name);
          const colorClass = getColorStyle(card.name);
          
          return (
            <button
              key={card.name}
              onClick={() => handleDistrictClick(card.name)}
              className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 text-left group hover:scale-[1.03] cursor-pointer shadow-sm hover:shadow-indigo-500/10 ${colorClass}`}
            >
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 transition-colors">
                  Grid ({card.x}, {card.y})
                </span>
                <h4 className="text-sm font-extrabold text-slate-800 mt-0.5 group-hover:translate-x-0.5 transition-transform">
                  {card.name}
                </h4>
              </div>
 
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
                  <div className="leading-none">
                    <div className="text-sm font-bold text-slate-800">{stats.active}</div>
                    <div className="text-xs text-slate-500">Active</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 shrink-0 text-indigo-600" />
                  <div className="leading-none">
                    <div className="text-sm font-bold text-slate-800">{stats.score}%</div>
                    <div className="text-xs text-slate-500">Score</div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
