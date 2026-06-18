import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { getStatusBadgeStyle, getPriorityBadgeStyle, formatDate } from '../utils/helper';
import {
  FileSpreadsheet, PlusCircle, User
} from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority } from '../types';

export const DMView: React.FC = () => {
  const {
    activeDistrict,
    complaints,
    officers,
    updateComplaintStatus,
    addComplaint
  } = useStore();

  // Filter complaints for this specific district
  const districtComplaints = complaints.filter(c => c.district === activeDistrict);

  // Find DM profile from officers list
  const dmProfile = officers.find(o => o.district === activeDistrict);

  // Filter selection state
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [remarkText, setRemarkText] = useState<Record<string, string>>({});

  // Form states for new field intake grievance
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ComplaintCategory>('Civic Infrastructure');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>('Medium');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  const getDepartmentForCategory = (cat: ComplaintCategory): string => {
    const mappings: Record<ComplaintCategory, string> = {
      'Civic Infrastructure': 'PWD & Infrastructure',
      'Water & Sewage': 'Delhi Jal Board',
      'Electricity & Power': 'Power Department',
      'Public Health': 'Health & Family Welfare',
      'Education & Schools': 'Education Department',
      'Law & Policing': 'Delhi Police',
      'Transport & Roads': 'Transport Department',
      'Social Welfare': 'Social Welfare Department'
    };
    return mappings[cat];
  };

  const handleCreateFieldComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !citizenName || !citizenPhone) return;

    addComplaint({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      priority: newPriority,
      district: activeDistrict,
      department: getDepartmentForCategory(newCategory),
      citizenName,
      citizenPhone,
      status: 'Pending'
    });

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setCitizenName('');
    setCitizenPhone('');
    setShowForm(false);
  };

  // Filtered grievances
  const filteredComplaints = districtComplaints.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  const activeCount = districtComplaints.filter(c => c.status !== 'Resolved').length;
  const resolvedCount = districtComplaints.filter(c => c.status === 'Resolved').length;
  const totalCount = districtComplaints.length;
  const performanceScore = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: District Info & New Intake form */}
      <div className="space-y-6">
        
        {/* DM Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-teal-500">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-teal-400">
              <User className="h-7 w-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">District Magistrate ({activeDistrict})</span>
              <h3 className="text-md font-extrabold text-white">{dmProfile?.name || 'DM Delhi'}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">{dmProfile?.designation} | Revenue & Grievance</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/60 text-center">
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-500">Resolution</div>
              <div className="text-md font-extrabold text-white font-mono mt-1">{performanceScore}%</div>
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-500">Pending</div>
              <div className="text-md font-extrabold text-amber-400 font-mono mt-1">{activeCount}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-500">SLA Rating</div>
              <div className="text-md font-extrabold text-indigo-400 font-mono mt-1">★ {dmProfile?.rating || '4.0'}</div>
            </div>
          </div>
        </div>

        {/* Field Intake Trigger */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">DM Field Inspection Logs</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {showForm ? 'Cancel Form' : 'Register Intake'}
            </button>
          </div>

          {showForm ? (
            <form onSubmit={handleCreateFieldComplaint} className="space-y-4 pt-2 animate-in fade-in duration-200">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Grievance Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Broken drainage cover block D"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description Details</label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide precise location landmarks and issues detected..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
                  >
                    <option value="Civic Infrastructure">Civic Infra</option>
                    <option value="Water & Sewage">Water & Sewer</option>
                    <option value="Electricity & Power">Electricity</option>
                    <option value="Public Health">Health</option>
                    <option value="Education & Schools">Education</option>
                    <option value="Transport & Roads">Roads/Transport</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Citizen Name</label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Amit Verma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile No.</label>
                  <input
                    type="text"
                    required
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="9999XXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.02]"
              >
                Log Grievance & Route
              </button>
            </form>
          ) : (
            <div className="text-[11px] leading-relaxed text-slate-400 bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
              <span className="font-bold text-slate-300 block mb-1">Standard Operating Protocol:</span>
              DMs can register on-the-spot complaints during district walkabouts. NagarVaani automatically routes field filings to respective departments with high priority tags.
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Grievances Queue & Administrative Actions */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-400" />
            Grievance Intake (Total: {districtComplaints.length})
          </div>

          <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/60 overflow-x-auto text-[10px] font-semibold">
            {['All', 'Pending', 'Active', 'Escalated', 'Resolved'].map(state => (
              <button
                key={state}
                onClick={() => setStatusFilter(state)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === state ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-500 text-xs">
              No matching complaints registered in {activeDistrict} for this filter.
            </div>
          ) : (
            filteredComplaints.map(comp => (
              <div
                key={comp.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800/60 space-y-4 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {comp.id} | Category: {comp.category} | Assigned: {comp.department}
                    </span>
                    <h4 className="text-sm font-extrabold text-white leading-snug">
                      {comp.title}
                    </h4>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBadgeStyle(comp.status)}`}>
                      {comp.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getPriorityBadgeStyle(comp.priority)}`}>
                      {comp.priority}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/35 p-3 rounded-xl border border-slate-900/50">
                  {comp.description}
                </p>

                {/* Timeline display */}
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Resolution Timeline:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/40">
                    {comp.timeline.map((step, idx) => (
                      <div key={idx} className="text-[10px] border-l-2 border-indigo-500/40 pl-2 py-0.5 leading-tight">
                        <div className="text-slate-400 font-semibold">{step.action}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">By: {step.actor} | {formatDate(step.date)}</div>
                        {step.notes && <div className="text-[9px] text-indigo-300 italic mt-0.5">"{step.notes}"</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action forms for DM */}
                {comp.status !== 'Resolved' && (
                  <div className="pt-3 border-t border-slate-900/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1 flex gap-2 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Log inspection notes or remarks..."
                        value={remarkText[comp.id] || ''}
                        onChange={(e) => setRemarkText(prev => ({ ...prev, [comp.id]: e.target.value }))}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      {comp.status !== 'Escalated' && (
                        <button
                          onClick={() => {
                            updateComplaintStatus(comp.id, 'Escalated', remarkText[comp.id] || 'Escalated to Ministry Nodal Head due to SLA delays', `${activeDistrict} DM`);
                            setRemarkText(prev => ({ ...prev, [comp.id]: '' }));
                          }}
                          className="bg-rose-950 hover:bg-rose-900 border border-rose-700/40 text-rose-400 font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer transition-colors"
                        >
                          Escalate Case
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          updateComplaintStatus(comp.id, 'Resolved', remarkText[comp.id] || 'Field inspection confirmed resolution.', `${activeDistrict} DM`);
                          setRemarkText(prev => ({ ...prev, [comp.id]: '' }));
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer transition-colors"
                      >
                        Resolve Grievance
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
