import React, { useState } from 'react';
import { useStore } from '../context/Store';
import {
  ShieldAlert, Timer, Star, Search, ShieldCheck
} from 'lucide-react';

export const Officers: React.FC = () => {
  const { officers } = useStore();
  const [filterType, setFilterType] = useState<'All' | 'DM' | 'Dept'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'backlog'>('score');

  // Filter officers
  const filteredOfficers = officers.filter(off => {
    // Search query filter
    const matchesSearch = off.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          off.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (off.district && off.district.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Type filter
    if (!matchesSearch) return false;
    if (filterType === 'All') return true;
    if (filterType === 'DM') return !!off.district;
    return !off.district; // Department Heads
  });

  // Sort officers
  const sortedOfficers = [...filteredOfficers].sort((a, b) => {
    if (sortBy === 'score') {
      return b.resolutionRate - a.resolutionRate;
    }
    if (sortBy === 'time') {
      return a.avgResolutionTime - b.avgResolutionTime; // shorter time is better
    }
    return b.activeComplaints - a.activeComplaints; // higher backlog first
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          Officer SLA Accountability Directory
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Performance ratings, response time metrics, and grievance backlog tracking of Delhi administrative heads.
        </p>
      </div>

      {/* Directory Filter / Sort Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Search & Filter pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search officer, zone..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-52"
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/60 text-[10px] font-semibold">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterType === 'All' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Heads
            </button>
            <button
              onClick={() => setFilterType('DM')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterType === 'DM' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              District DMs
            </button>
            <button
              onClick={() => setFilterType('Dept')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterType === 'Dept' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Department Nodal
            </button>
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-855 text-slate-200 px-3 py-1.5 rounded-xl pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none relative"
          >
            <option value="score">Accountability Score</option>
            <option value="time">Avg Response Time</option>
            <option value="backlog">Active Backlog</option>
          </select>
        </div>

      </div>

      {/* Officers Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedOfficers.length === 0 ? (
          <div className="lg:col-span-3 glass-panel p-8 text-center rounded-2xl text-slate-500 text-xs">
            No matching administrative officer found.
          </div>
        ) : (
          sortedOfficers.map((off) => {
            const hasGoodScore = off.resolutionRate >= 80;
            return (
              <div
                key={off.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 transition-all flex flex-col justify-between group hover:scale-[1.01]"
              >
                <div>
                  
                  {/* Badge Row */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-mono text-slate-500 font-bold">{off.id}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider flex items-center gap-1 ${
                      hasGoodScore ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/10' : 'bg-rose-950/40 text-rose-400 border-rose-500/10'
                    }`}>
                      {hasGoodScore ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                      {hasGoodScore ? 'SLA Compliant' : 'SLA Breached'}
                    </span>
                  </div>

                  {/* Profile Detail */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-11 w-11 rounded-full bg-slate-850 flex items-center justify-center font-bold text-slate-400 border border-slate-700 text-sm">
                      {off.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="leading-tight">
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {off.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                        {off.designation} {off.district ? `(${off.district})` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Stats list */}
                  <div className="space-y-2.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50 text-[11px] leading-tight">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nodal Division:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[150px]">{off.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5 text-teal-400" /> Avg Response Time:
                      </span>
                      <span className="text-slate-200 font-bold font-mono">{off.avgResolutionTime} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" /> Citizen Feedback:
                      </span>
                      <span className="text-slate-200 font-bold font-mono">{off.rating} / 5.0</span>
                    </div>
                  </div>

                </div>

                {/* Score section */}
                <div className="mt-5 pt-4 border-t border-slate-900 flex justify-between items-center">
                  <div className="leading-tight">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Accountability Score</div>
                    <div className="text-md font-extrabold text-white font-mono mt-0.5">{off.resolutionRate}%</div>
                  </div>
                  <div className="text-right leading-tight">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Queue</div>
                    <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                      {off.activeComplaints} / {off.completedComplaints + off.activeComplaints}
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
