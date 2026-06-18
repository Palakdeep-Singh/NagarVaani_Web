import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { formatINR } from '../utils/helper';
import { PlusCircle, ListTodo } from 'lucide-react';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Completed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Delayed': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-indigo-600" />
            Major Projects Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical progress tracking and milestones of monitored Delhi capital projects.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <PlusCircle className="h-4.5 w-4.5" /> {showAddForm ? 'Cancel Form' : 'Launch New Project'}
        </button>
      </div>

      {/* Conditional Project Form */}
      {showAddForm && (
        <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Declare New Capital Infrastructure Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flyover construction Dwarka Sec 10"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nodal Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 mt-1"
              >
                <option value="PWD & Infrastructure">PWD Department</option>
                <option value="Health & Family Welfare">Health Department</option>
                <option value="Education Department">Education Department</option>
                <option value="Delhi Jal Board">Delhi Jal Board</option>
                <option value="Power Department">Power Department</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Capital Budget (Cr INR)</label>
              <input
                type="number"
                required
                value={budgetAllocated}
                onChange={(e) => setBudgetAllocated(e.target.value)}
                placeholder="e.g. 85"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Commence Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Completion Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nodal Project Manager</label>
              <input
                type="text"
                required
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="Er. R.K. Bhardwaj (PWD)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Brief Scope of Work</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short description of goals, structural plans, and locations..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 mt-1 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            Launch Project
          </button>
        </form>
      )}

      {/* Gantt Cards Roster */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in duration-200">
        <div className="space-y-6">
          {projects.map((proj) => {
            const isOverspent = proj.budgetSpent > proj.budgetAllocated;
            return (
              <div key={proj.id} className="bg-slate-50/40 p-4 rounded-xl border border-slate-200/60 space-y-3 relative group hover:border-slate-350 transition-colors">
                
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400 font-bold">
                      {proj.id} | Department: {proj.department}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {proj.title}
                    </h4>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${getStatusColor(proj.status)}`}>
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>Physical Milestone Progress</span>
                    <span className="text-slate-855 font-bold">{proj.physicalProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300/30 relative">
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

                {/* Financial stats */}
                <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-200/50">
                  <div className="flex gap-4">
                    <div>
                      Budget: <strong className="text-slate-700">{formatINR(proj.budgetAllocated)}</strong>
                    </div>
                    <div>
                      Spent: <strong className={`${isOverspent ? 'text-rose-600' : 'text-slate-700'}`}>{formatINR(proj.budgetSpent)}</strong>
                    </div>
                  </div>
                  <div>
                    Manager: <span className="text-slate-500 font-semibold">{proj.manager.split(' (')[0]}</span>
                  </div>
                </div>

                {/* Simulation progress slider */}
                {proj.status !== 'Completed' && (
                  <div className="pt-2 flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200/50">
                    <span className="text-xs text-indigo-600 font-bold uppercase shrink-0">Simulate Progress:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={proj.physicalProgress}
                      onChange={(e) => updateProjectProgress(proj.id, Number(e.target.value))}
                      className="flex-1 accent-indigo-600 h-1 cursor-pointer bg-slate-100 rounded-lg appearance-none border border-slate-200"
                    />
                    <button
                      onClick={() => updateProjectProgress(proj.id, 100, 'Completed')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer border border-emerald-200 px-2 py-0.5 rounded bg-emerald-50"
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
  );
};
