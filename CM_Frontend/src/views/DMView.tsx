import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { getStatusBadgeStyle, getPriorityBadgeStyle, formatDate } from '../utils/helper';
import { FileSpreadsheet, PlusCircle, User } from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority } from '../types';

export const DMView: React.FC = () => {
  const {
    activeDistrict,
    complaints,
    officers,
    updateComplaintStatus,
    addComplaint
  } = useStore();

  
  const districtComplaints = complaints.filter(c => c.district === activeDistrict);

  
  const dmProfile = officers.find(o => o.district === activeDistrict);

  
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [remarkText, setRemarkText] = useState<Record<string, string>>({});

  
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

    
    setNewTitle('');
    setNewDesc('');
    setCitizenName('');
    setCitizenPhone('');
    setShowForm(false);
  };

  
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
      
            <div className="space-y-6">
        
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-teal-600">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-teal-600">
              <User className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">District Magistrate ({activeDistrict})</span>
              <h3 className="text-md font-extrabold text-slate-800 mt-0.5">{dmProfile?.name || 'No Officer Assigned'}</h3>
              <p className="text-xs text-slate-500 font-semibold">{dmProfile ? `${dmProfile.designation} • ` : ''}Revenue & Grievance</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 text-center">
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Resolution</div>
              <div className="text-md font-extrabold text-slate-800 mt-1">{performanceScore}%</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Pending</div>
              <div className="text-md font-extrabold text-amber-600 mt-1">{activeCount}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">SLA Rating</div>
              <div className="text-md font-extrabold text-indigo-600 mt-1">{dmProfile?.rating ? `★ ${dmProfile.rating}` : 'N/A'}</div>
            </div>
          </div>
        </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">DM Field Inspections</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {showForm ? 'Cancel Form' : 'Log Field Grievance'}
            </button>
          </div>

          {showForm ? (
            <form onSubmit={handleCreateFieldComplaint} className="space-y-4 pt-2 animate-in fade-in duration-200">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Grievance Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Broken water supply main line"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description Details</label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide precise location, landmarks, and issues detected..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none mt-1"
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none mt-1"
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Citizen Name</label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Amit Verma"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mobile No.</label>
                  <input
                    type="text"
                    required
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="9999XXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-teal-600/10 transition-all hover:scale-[1.02]"
              >
                Log Grievance & Route
              </button>
            </form>
          ) : (
            <div className="text-xs leading-relaxed text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
              <span className="font-bold text-slate-700 block mb-1">On-Spot Filing Protocol:</span>
              DMs can register grievances discovered during district field rounds. NagarVaani automatically routes field filings to respective departments with high priority tags.
            </div>
          )}
        </div>

      </div>

            <div className="lg:col-span-2 space-y-6">
        
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-600" />
            Grievance Intake (Total: {districtComplaints.length})
          </div>

          <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            {['All', 'Pending', 'Active', 'Escalated', 'Resolved'].map(state => (
              <button
                key={state}
                onClick={() => setStatusFilter(state)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === state ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

                <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200/80 text-slate-500 text-xs">
              No matching complaints registered in {activeDistrict} for this filter.
            </div>
          ) : (
            filteredComplaints.map(comp => (
              <div
                key={comp.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 hover:border-slate-350 transition-colors shadow-sm"
              >
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400 font-bold">
                      {comp.id} | Category: {comp.category} | Assigned: {comp.department}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 leading-snug">
                      {comp.title}
                    </h4>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadgeStyle(comp.status)}`}>
                      {comp.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityBadgeStyle(comp.priority)}`}>
                      {comp.priority}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/40">
                  {comp.description}
                </p>

                                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resolution Timeline:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                    {comp.timeline.map((step, idx) => (
                      <div key={idx} className="text-xs border-l-2 border-indigo-400 pl-2 py-0.5 leading-tight">
                        <div className="text-slate-700 font-bold">{step.action}</div>
                        <div className="text-xs text-slate-450 mt-0.5">By: {step.actor} | {formatDate(step.date)}</div>
                        {step.notes && <div className="text-xs text-indigo-600 italic mt-0.5">"{step.notes}"</div>}
                      </div>
                    ))}
                  </div>
                </div>

                                {comp.status !== 'Resolved' && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1 flex gap-2 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Log inspection notes or remarks..."
                        value={remarkText[comp.id] || ''}
                        onChange={(e) => setRemarkText(prev => ({ ...prev, [comp.id]: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 flex-1"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      {comp.status !== 'Escalated' && (
                        <button
                          onClick={() => {
                            updateComplaintStatus(comp.id, 'Escalated', remarkText[comp.id] || 'Escalated to Ministry Nodal Head due to SLA delays', `${activeDistrict} DM`);
                            setRemarkText(prev => ({ ...prev, [comp.id]: '' }));
                          }}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
                        >
                          Escalate Case
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          updateComplaintStatus(comp.id, 'Resolved', remarkText[comp.id] || 'Field inspection confirmed resolution.', `${activeDistrict} DM`);
                          setRemarkText(prev => ({ ...prev, [comp.id]: '' }));
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
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
