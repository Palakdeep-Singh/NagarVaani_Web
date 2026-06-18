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
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Officer Accountability Directory
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Performance ratings, response time metrics, and grievance backlog tracking of Delhi administrative heads.
        </p>
      </div>

      {/* Directory Filter / Sort Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Search & Filter pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search officer, zone..."
              className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-850 placeholder-slate-400 focus:outline-none w-52"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterType === 'All' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Heads
            </button>
            <button
              onClick={() => setFilterType('DM')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterType === 'DM' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              District DMs
            </button>
            <button
              onClick={() => setFilterType('Dept')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterType === 'Dept' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
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
            className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none relative shadow-sm"
          >
            <option value="score">Accountability Score</option>
            <option value="time">Avg Response Time</option>
            <option value="backlog">Active Backlog</option>
          </select>
        </div>

      </div>

      {/* Officers Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
        {sortedOfficers.length === 0 ? (
          <div className="lg:col-span-3 bg-white p-8 text-center rounded-2xl border border-slate-200/80 text-slate-500 text-xs">
            No matching administrative officer found.
          </div>
        ) : (
          sortedOfficers.map((off) => {
            const hasGoodScore = off.resolutionRate >= 80;
            return (
              <div
                key={off.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-350 transition-all flex flex-col justify-between group hover:shadow-sm"
              >
                <div>
                  
                  {/* Badge Row */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-400 font-bold">{off.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider flex items-center gap-1 ${
                      hasGoodScore ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {hasGoodScore ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                      {hasGoodScore ? 'SLA Compliant' : 'SLA Breached'}
                    </span>
                  </div>

                  {/* Profile Detail */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 border border-slate-200 text-sm">
                      {off.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="leading-tight">
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {off.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                        {off.designation} {off.district ? `(${off.district})` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Stats list */}
                  <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 text-xs leading-tight">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Nodal Division:</span>
                      <span className="text-slate-700 font-semibold truncate max-w-[150px]">{off.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-455 flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5 text-teal-600" /> Avg Response Time:
                      </span>
                      <span className="text-slate-800 font-bold">{off.avgResolutionTime} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-455 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" /> Citizen Feedback:
                      </span>
                      <span className="text-slate-800 font-bold">{off.rating} / 5.0</span>
                    </div>
                  </div>

                </div>

                {/* Score section */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="leading-tight">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Accountability Score</div>
                    <div className="text-md font-extrabold text-slate-800 mt-0.5">{off.resolutionRate}%</div>
                  </div>
                  <div className="text-right leading-tight">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Queue</div>
                    <div className="text-xs font-bold text-slate-600 mt-0.5">
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
