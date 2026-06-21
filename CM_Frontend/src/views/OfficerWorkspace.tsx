import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from '../utils/helper';
import { FileText, Phone, Video, Users, CheckSquare, Upload, AlertTriangle, Check, Layers, Clock, AlertOctagon } from 'lucide-react';
import { useCall } from '../context/CallContext';
import type { ComplaintStatus } from '../types';

const DISTRICTS = [
  'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi',
  'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
];

export const OfficerWorkspace: React.FC = () => {
  const { complaints, currentUser, updateComplaintStatus } = useStore();
  const { startCall, callState } = useCall();
  const [remarkInput, setRemarkInput] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority] = useState<string>('All');
  const [selectedBatchLocation, setSelectedBatchLocation] = useState<string>('All');

  // Ground level execution states & workloads
  const [inspectors, setInspectors] = useState([
    { name: 'Redressal Officer Amit Sharma', load: 5 },
    { name: 'Redressal Officer Suresh Kumar', load: 8 },
    { name: 'Redressal Officer Pooja Verma', load: 3 }
  ]);

  const [assignedInspectors, setAssignedInspectors] = useState<Record<string, string>>({});
  const [atrProof, setAtrProof] = useState<Record<string, string>>({});
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Audit PWD drainage clearance', checked: false },
    { id: 2, label: 'Review MCD ward sanitization logs', checked: true },
    { id: 3, label: 'Verify clean water supply complaints', checked: false },
    { id: 4, label: 'Upload ATR for CP road maintenance', checked: false }
  ]);

  const department = currentUser?.department || 'Public Health';
  const deptComplaints = complaints.filter(c => c.department === department);

  const getDaysOpen = (dateStr: string) => {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  };

  const filtered = deptComplaints.filter(c => {
    let pass = true;
    if (filterStatus !== 'All') pass = pass && c.status === filterStatus;
    if (filterPriority !== 'All') pass = pass && c.priority === filterPriority;
    return pass;
  });

  const total = deptComplaints.length;
  const pending = deptComplaints.filter(c => c.status === 'Pending').length;
  const active = deptComplaints.filter(c => c.status === 'Active').length;
  const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;
  const escalated = deptComplaints.filter(c => c.status === 'Escalated').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  // Pendency monitor brackets
  const p0_7 = deptComplaints.filter(c => c.status !== 'Resolved' && getDaysOpen(c.dateFiled) <= 7).length;
  const p8_14 = deptComplaints.filter(c => c.status !== 'Resolved' && getDaysOpen(c.dateFiled) > 7 && getDaysOpen(c.dateFiled) <= 14).length;
  const p15_21 = deptComplaints.filter(c => c.status !== 'Resolved' && getDaysOpen(c.dateFiled) > 14 && getDaysOpen(c.dateFiled) <= 21).length;
  const p21Plus = deptComplaints.filter(c => c.status !== 'Resolved' && getDaysOpen(c.dateFiled) > 21).length;

  const handleAction = (id: string, newStatus: ComplaintStatus, forceRemark?: string) => {
    let note = forceRemark || remarkInput[id] || `Action taken by ${department} Nodal Officer`;
    
    // Append inspector and ATR info to notes if resolved
    if (newStatus === 'Resolved') {
      const assigned = assignedInspectors[id] || 'Not Assigned';
      const proofFile = atrProof[id] || 'None (Self-Certified)';
      note = `[RESOLVED] ${note} | Assigned Officer: ${assigned} | ATR Proof File: ${proofFile}`;
    }

    updateComplaintStatus(id, newStatus, note, currentUser?.username || 'Nodal Officer');
    
    // Reset specific ticket fields
    setRemarkInput(prev => ({ ...prev, [id]: '' }));
    setAtrProof(prev => ({ ...prev, [id]: '' }));
  };

  const handleAssignInspector = (id: string, name: string) => {
    setAssignedInspectors(prev => ({ ...prev, [id]: name }));
    updateComplaintStatus(
      id, 
      'Active', 
      `Assigned to Redressal Officer: ${name}. Dispatched to field.`, 
      currentUser?.username || 'Nodal Officer'
    );
    // Increase inspector load
    setInspectors(prev => prev.map(ins => ins.name === name ? { ...ins, load: ins.load + 1 } : ins));
  };

  // Batch resolution triggers
  const handleBatchResolve = (locality: string) => {
    const targets = deptComplaints.filter(c => c.district === locality && c.status !== 'Resolved');
    if (targets.length === 0) {
      alert(`No active tickets found in district "${locality}" for batch resolution.`);
      return;
    }
    targets.forEach(c => {
      updateComplaintStatus(
        c.id,
        'Resolved',
        `🔒 [BATCH RESOLUTION]: Localized cluster resolved by joint department operations in ${locality}.`,
        currentUser?.username || 'Nodal Officer'
      );
    });
    alert(`Batch resolution completed. Closed ${targets.length} grievances in ${locality}.`);
  };

  const checkReopened = (comp: any) => {
    const lastRejection = [...comp.timeline]
      .reverse()
      .find(t => t.action.includes('Rejected') || t.action.includes('Reopened') || t.action.includes('Resolution Rejected'));
    return lastRejection ? lastRejection.notes : null;
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  // Mock Root Cause Clusters (PageRank groupings of tickets filed within 30 days)
  const rootCauseClusters = [
    { ward: 'Ward 1 - Connaught Place', count: 4, issue: 'Sewer pipeline cracking causing localized leakages', category: 'Water & Sewage' },
    { ward: 'Ward 2 - Karol Bagh', count: 6, issue: 'Transformer fluctuations overloading domestic breakers', category: 'Electricity & Power' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
          Nodal Operations Hub (Ground Level Execution)
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          {department} Officer Workspace
        </h2>
        <p className="text-xs text-slate-550 mt-0.5">
          Verify AI-suggested categories, dispatch redressal officers, execute batch resolutions, and monitor age brackets.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-indigo-600">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Department Tickets</span>
          <div className="text-xl font-extrabold text-slate-800 mt-1">{total}</div>
          <p className="text-[10px] text-slate-400 mt-1">Assigned to your department</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-amber-500">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending / Active</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{pending + active}</div>
          <p className="text-[10px] text-slate-400 mt-1">{pending} pending, {active} in progress</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-emerald-500">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SLA Resolution Rate</span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{resolutionRate}%</div>
          <p className="text-[10px] text-slate-400 mt-1">Target benchmark: {'>'}85%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-red-500">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Escalated cases</span>
          <div className="text-xl font-extrabold text-rose-600 mt-1">{escalated}</div>
          <p className="text-[10px] text-slate-400 mt-1">Requiring CM Review</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Complaint List & Smart Categorisation */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Smart Categorisation Queue Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Layers size={15} className="text-indigo-600" />
              Incoming Queue (Verify AI-Suggested Route)
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-655 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Ticket queue with SLA countdown per ticket */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No active complaints matching filters.
              </div>
            ) : (
              filtered.map(comp => {
                const rejectionReason = checkReopened(comp);
                const currentAssigned = assignedInspectors[comp.id] || '';
                const daysOpen = getDaysOpen(comp.dateFiled);
                const daysLeft = Math.max(0, 21 - daysOpen);
                const isAppeal = rejectionReason !== null;

                return (
                  <div key={comp.id} className={`bg-white p-5 rounded-2xl border ${isAppeal ? 'border-red-350 bg-red-50/10' : 'border-slate-200'} hover:border-slate-350 transition-colors shadow-sm space-y-4`}>
                    
                    {isAppeal && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-xs text-rose-950">
                        <AlertTriangle className="h-4.5 w-4.5 text-rose-650 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-extrabold uppercase text-[10px] tracking-wider block">Poor-Rating Appeal / DM Rejection</strong>
                          <p className="mt-0.5 italic">"{rejectionReason}"</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {comp.id} | District: {comp.district}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px]">
                            AI-Suggested Sub-Cat: Standard Route
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800 mt-1 leading-snug">
                          {comp.title}
                        </h4>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(comp.status)}`}>
                          {comp.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeStyle(comp.priority)}`}>
                          {comp.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-655 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {comp.description}
                    </p>

                    {/* SLA countdown timer per ticket */}
                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <Clock size={13} />
                        SLA Health Check:
                      </span>
                      <span className={`font-extrabold ${daysLeft <= 5 ? 'text-red-650' : daysLeft <= 12 ? 'text-amber-650' : 'text-emerald-650'}`}>
                        {daysLeft} days remaining (of 21-day CPGRAMS SLA)
                      </span>
                    </div>

                    {/* Shared cross department notice */}
                    <div className="text-[10px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-100">
                      <Layers size={12} className="text-indigo-500" />
                      <span><strong>Cross-Dept Shared Ticket:</strong> View visible to PWD & Infrastructure and Delhi Jal Board nodes.</span>
                    </div>

                    {/* Redressal officer assignment dropdown */}
                    {comp.status !== 'Resolved' && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex flex-wrap items-center gap-3 justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-700">Assign Redressal Officer:</span>
                          </div>
                          <select
                            value={currentAssigned}
                            onChange={e => handleAssignInspector(comp.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none"
                          >
                            <option value="">Select Officer to Dispatch...</option>
                            {inspectors.map(ins => (
                              <option key={ins.name} value={ins.name}>{ins.name} ({ins.load} active load)</option>
                            ))}
                          </select>
                        </div>

                        {/* Action Taken Report (ATR) Upload details */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">ATR Proof Document</span>
                            <select
                              value={atrProof[comp.id] || ''}
                              onChange={e => setAtrProof(prev => ({ ...prev, [comp.id]: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-750 outline-none mt-1"
                            >
                              <option value="">Attach Field Certificate...</option>
                              <option value="geotagged_reparation_image.png">geotagged_reparation_image.png</option>
                              <option value="resident_signoff_sheet.pdf">resident_signoff_sheet.pdf</option>
                              <option value="inspection_clearance_signoff.doc">inspection_clearance_signoff.doc</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Remarks</span>
                            <input
                              type="text"
                              placeholder="Write final ATR resolution report details..."
                              value={remarkInput[comp.id] || ''}
                              onChange={e => setRemarkInput(prev => ({ ...prev, [comp.id]: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-indigo-500 mt-1"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(comp.id, 'Resolved')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                          >
                            <Upload size={13} />
                            Submit ATR & Resolve
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Monitors & Hotlines */}
        <div className="space-y-6">
          
          {/* Pendency Monitor Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-rose-500" />
              Department Pendency Monitor
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600 font-medium">0 - 7 days (Fresh)</span>
                <span className="font-bold text-slate-800">{p0_7} tickets</span>
              </div>
              <div className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-655 font-medium">8 - 14 days (Actionable)</span>
                <span className="font-bold text-amber-600">{p8_14} tickets</span>
              </div>
              <div className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-655 font-medium">15 - 21 days (Urgent Alert)</span>
                <span className="font-bold text-orange-600">{p15_21} tickets</span>
              </div>
              <div className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-655 font-medium">21+ days (Critical SLA Breach)</span>
                <span className="font-extrabold text-rose-600">{p21Plus} tickets</span>
              </div>
            </div>
          </div>

          {/* Batch Resolution Tool */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-600" />
              Batch Resolution Tool
            </h3>
            <p className="text-xs text-slate-550">
              Select district to mass-resolve all pending tickets under PWD & Infrastructure / DJB in one single action.
            </p>
            <div className="space-y-3">
              <select
                value={selectedBatchLocation}
                onChange={e => setSelectedBatchLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none"
              >
                <option value="All">Select District Location...</option>
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button
                onClick={() => handleBatchResolve(selectedBatchLocation)}
                disabled={selectedBatchLocation === 'All'}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Execute Batch Closure
              </button>
            </div>
          </div>

          {/* Root Cause Clusters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="h-4 w-4 text-amber-500" />
              Root Cause Clusters (PageRank)
            </h3>
            <div className="space-y-3">
              {rootCauseClusters.map((cluster, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-extrabold text-[10px] text-amber-700 uppercase block">{cluster.ward}</span>
                  <div className="font-bold text-slate-800 mt-1">{cluster.count} similar tickets filed (30 days)</div>
                  <p className="text-[11px] text-slate-550 mt-0.5">"{cluster.issue}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Operations Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="h-4.5 w-4.5 text-indigo-600" />
              Daily Operations Checklist
            </h3>
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleTask(task.id)}>
                  <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-all shrink-0 ${task.checked ? 'bg-indigo-600 border-indigo-700 text-white' : 'border-slate-350 bg-white'}`}>
                    {task.checked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span className={`text-xs ${task.checked ? 'line-through text-slate-400' : 'text-slate-650'}`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Call Hotlines */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Phone className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
              Executive Calling Hotlines
            </h3>
            <p className="text-xs text-slate-500">
              Direct connection lines to District Magistrates and the Chief Minister's Office.
            </p>
            <div className="space-y-3">
              {[
                { id: 'Chief Minister', name: 'Chief Minister Office' },
                { id: 'New Delhi DM', name: 'New Delhi DM' },
                { id: 'West Delhi DM', name: 'West Delhi DM' }
              ].map(contact => (
                <div key={contact.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-850">{contact.name}</div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      Identity: {contact.id}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startCall(contact, 'audio')}
                      disabled={callState !== 'idle'}
                      className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Request Audio Call"
                    >
                      <Phone size={13} />
                    </button>
                    <button
                      onClick={() => startCall(contact, 'video')}
                      disabled={callState !== 'idle'}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Request Video Call"
                    >
                      <Video size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100 flex items-start gap-1.5 leading-normal">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Restricted Access:</strong> Lower-level officers require scheduling authorization to call DM or CM.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
