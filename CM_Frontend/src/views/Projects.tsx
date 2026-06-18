import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { formatINR } from '../utils/helper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  DollarSign, PlusCircle, ListTodo, TrendingUp
} from 'lucide-react';

export const Projects: React.FC = () => {
  const { projects, updateProjectProgress, addNewProject } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for new project
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('PWD & Infrastructure');
  const [budgetAllocated, setBudgetAllocated] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manager, setManager] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budgetAllocated || !startDate || !endDate || !manager || !description) return;

    addNewProject({
      title,
      department,
      budgetAllocated: Number(budgetAllocated) * 10000000, // convert Cr to Rupees
      startDate,
      endDate,
      status: 'On Track',
      manager,
      description
    });

    // Reset Form
    setTitle('');
    setBudgetAllocated('');
    setStartDate('');
    setEndDate('');
    setManager('');
    setDescription('');
    setShowAddForm(false);
  };

  // Derive global budget figures
  const totalAllocated = projects.reduce((acc, curr) => acc + curr.budgetAllocated, 0);
  const totalSpent = projects.reduce((acc, curr) => acc + curr.budgetSpent, 0);
  const totalBalance = totalAllocated - totalSpent;

  // Chart data
  const chartData = projects.map(p => ({
    name: p.title.substring(0, 15) + '...',
    Allocated: Math.round(p.budgetAllocated / 10000000), // in Crores
    Spent: Math.round(p.budgetSpent / 10000000) // in Crores
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/20';
      case 'Completed': return 'bg-blue-950/60 text-blue-400 border-blue-500/20';
      case 'Delayed': return 'bg-amber-950/40 text-amber-400 border-amber-500/20';
      case 'Critical': return 'bg-rose-950/60 text-rose-400 border-rose-500/30 animate-pulse';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Delhi Infrastructure & Capital Fund Audits
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gantt project timelines and budget utilization mapping across municipal divisions.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <PlusCircle className="h-4.5 w-4.5" /> {showAddForm ? 'Cancel Project Form' : 'Launch New Project'}
        </button>
      </div>

      {/* Fund Utilization Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-indigo-500">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Fund Allocation</span>
            <DollarSign className="h-5 w-5 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-mono mt-2">{formatINR(totalAllocated)}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Authorized budget across all monitored sectors</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-teal-500">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Actual Fund Expenditure</span>
            <TrendingUp className="h-5 w-5 text-teal-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-teal-400 font-mono mt-2">{formatINR(totalSpent)}</h3>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
            <span>Utilization Efficiency:</span>
            <span className="font-extrabold text-teal-400 font-mono">{Math.round((totalSpent / totalAllocated) * 100)}%</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-amber-500">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unspent Balance</span>
            <DollarSign className="h-5 w-5 text-amber-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-amber-400 font-mono mt-2">{formatINR(totalBalance)}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Reserved capital for pending construction milestones</p>
        </div>
      </div>

      {/* Conditional Project Form */}
      {showAddForm && (
        <form onSubmit={handleCreateProject} className="glass-panel p-6 rounded-2xl border border-indigo-500/25 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-white">Declare New Capital Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flyover construction Dwarka Sec 10"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Allocating Nodal Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
              >
                <option value="PWD & Infrastructure">PWD Department</option>
                <option value="Health & Family Welfare">Health Department</option>
                <option value="Education Department">Education Department</option>
                <option value="Delhi Jal Board">Delhi Jal Board</option>
                <option value="Power Department">Power Department</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Capital Budget (in Crores INR)</label>
              <input
                type="number"
                required
                value={budgetAllocated}
                onChange={(e) => setBudgetAllocated(e.target.value)}
                placeholder="e.g. 85"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Commence Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Target Completion Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nodal Project Manager / Chief Engineer</label>
              <input
                type="text"
                required
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="Er. R.K. Bhardwaj (PWD)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Brief Scope of Work</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short description of goals, structural plans, and locations..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            Launch Project
          </button>
        </form>
      )}

      {/* Chart vs Gantt Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Budget comparisons (1 col) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-white mb-2 flex items-center gap-2">
              Budget Allocation vs Utilization
            </h3>
            <p className="text-xs text-slate-400 mb-6">Comparing budgeted amounts vs actual money spent (in Crores INR).</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Allocated" fill="#6366f1" name="Allocated (Cr)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#0d9488" name="Spent (Cr)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gantt Project Timeline tracking (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-indigo-400" />
            Active Capital Projects Progress (Gantt Monitor)
          </h3>
          <div className="space-y-6">
            {projects.map((proj) => {
              const isOverspent = proj.budgetSpent > proj.budgetAllocated;
              return (
                <div key={proj.id} className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-3 relative group">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-500 font-bold">
                        {proj.id} | Department: {proj.department}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {proj.title}
                      </h4>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getStatusColor(proj.status)}`}>
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">{proj.description}</p>

                  {/* Gantt Progress Slider bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                      <span>Physical Construction Progress</span>
                      <span className="font-mono text-white font-bold">{proj.physicalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800/60 relative">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          proj.status === 'Critical' ? 'bg-rose-500 animate-pulse' :
                          proj.status === 'Delayed' ? 'bg-amber-500' :
                          proj.status === 'Completed' ? 'bg-blue-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${proj.physicalProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial stats inside project card */}
                  <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                    <div className="flex gap-4">
                      <div>
                        Budget: <strong className="text-slate-300 font-mono">{formatINR(proj.budgetAllocated)}</strong>
                      </div>
                      <div>
                        Spent: <strong className={`font-mono ${isOverspent ? 'text-rose-500' : 'text-slate-300'}`}>{formatINR(proj.budgetSpent)}</strong>
                      </div>
                    </div>
                    <div>
                      Manager: <span className="text-slate-400 font-semibold">{proj.manager.split(' (')[0]}</span>
                    </div>
                  </div>

                  {/* Slider to interactively adjust progress (For testing MVP easily!) */}
                  {proj.status !== 'Completed' && (
                    <div className="pt-2 flex items-center gap-3 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/40">
                      <span className="text-[9px] text-indigo-300 font-bold uppercase shrink-0">Simulate Progress:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={proj.physicalProgress}
                        onChange={(e) => updateProjectProgress(proj.id, Number(e.target.value))}
                        className="flex-1 accent-indigo-500 h-1 cursor-pointer bg-slate-800 rounded-lg appearance-none"
                      />
                      <button
                        onClick={() => updateProjectProgress(proj.id, 100, 'Completed')}
                        className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-950/20"
                      >
                        Force Complete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
