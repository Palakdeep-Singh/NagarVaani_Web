import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { getFilePriorityStyle, formatDate } from '../utils/helper';
import {
  FolderOpen, FolderLock, PlusCircle,
  UserCheck, AlertTriangle, ArrowRight, CornerDownRight, CheckSquare, XSquare
} from 'lucide-react';

export const Files: React.FC = () => {
  const { files, activeRole, activeDepartment, approveFile, rejectFile } = useStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [approvalRemark, setApprovalRemark] = useState<Record<string, string>>({});

  // Filter files based on who is logged in and owns the file
  const currentOwnerName = activeRole === 'Chief Minister' ? 'Chief Minister' : activeDepartment;
  
  // Pending inbox
  const inboxFiles = files.filter(f => f.currentOwner === currentOwnerName && f.status === 'Pending Approval');
  
  // All other files (Archived, Approved, owned by others)
  const otherFiles = files.filter(f => f.currentOwner !== currentOwnerName || f.status !== 'Pending Approval');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Actions & Create Proposal */}
      <div className="space-y-6">
        
        {/* Quick Folder Status */}
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/35">
              <FolderLock className="h-5.5 w-5.5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">e-Office Approval Center</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Active credentials: {activeRole}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800/60 text-center">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900">
              <span className="text-[9px] uppercase font-bold text-slate-500">Inbox Items</span>
              <div className="text-xl font-extrabold text-indigo-400 font-mono mt-1">{inboxFiles.length}</div>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900">
              <span className="text-[9px] uppercase font-bold text-slate-500">Others / Archives</span>
              <div className="text-xl font-extrabold text-slate-400 font-mono mt-1">{otherFiles.length}</div>
            </div>
          </div>
        </div>

        {/* Create File Form */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Initiate Official File</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {showAddForm ? 'Cancel Proposal' : 'New Proposal'}
            </button>
          </div>

          {showAddForm ? (
            <div className="text-xs text-slate-400 bg-slate-950/60 p-4 rounded-xl border border-slate-800/40 leading-relaxed space-y-3">
              <span className="font-bold text-slate-300 block mb-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500 inline mr-1" /> Dynamic File Creation Mode:</span>
              To create and route custom files, switch to corresponding departments. Creating files from other departments is locked for validation.
              <p className="mt-2 text-[10px] text-indigo-300 italic">
                * To initiate a file, toggle your active dashboard credentials using the profile switcher in the top navbar.
              </p>
            </div>
          ) : (
            <div className="text-[11px] leading-relaxed text-slate-400 bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
              <span className="font-bold text-slate-300 block mb-1">e-Office Operations Manual:</span>
              Files are tracked using unique hash signatures. Approval triggers a digital signing certificate validation, passing ownership to the next administrative step automatically.
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: File Inbox & Archives */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* INBOX SECTION */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-4.5 w-4.5 text-indigo-400" />
            File Action Inbox (Pending Signature)
          </h3>

          {inboxFiles.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-500 text-xs">
              No files pending your signatures at this step. Good job!
            </div>
          ) : (
            inboxFiles.map(file => (
              <div
                key={file.id}
                className="glass-panel p-5 rounded-2xl border border-indigo-500/25 space-y-4 relative overflow-hidden"
              >
                {/* Glowing border indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />

                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {file.id} | Department: {file.department}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">
                      {file.title}
                    </h4>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getFilePriorityStyle(file.priority)}`}>
                    {file.priority} Priority
                  </span>
                </div>

                {/* Path indicator */}
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Routing Path:</div>
                  <div className="flex flex-wrap items-center gap-2 bg-slate-950/30 p-2.5 rounded-xl border border-slate-900/40 text-[10px]">
                    {file.path.map((node, index) => {
                      const isCurrent = index === file.currentStep;
                      const isPassed = index < file.currentStep;
                      return (
                        <React.Fragment key={node}>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-md ${
                              isCurrent ? 'bg-indigo-600 text-white font-bold' : isPassed ? 'text-slate-500 line-through' : 'text-slate-400'
                            }`}
                          >
                            {node}
                          </span>
                          {index < file.totalSteps - 1 && <ArrowRight className="h-3 w-3 text-slate-600" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Remarks history */}
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Remarks & Approval Log:</div>
                  <div className="space-y-2">
                    {file.remarks.map((rem, idx) => (
                      <div key={idx} className="flex gap-2 text-[10px] bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/30">
                        <CornerDownRight className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <span className="text-slate-300 font-bold">{rem.author}: </span>
                          <span className="text-[9px] text-slate-500">[{rem.action} - {formatDate(rem.date)}]</span>
                          <p className="text-slate-400 italic mt-1 font-medium">"{rem.text}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action forms */}
                <div className="pt-3 border-t border-slate-900/60 flex flex-wrap items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Enter approval remark or note..."
                    value={approvalRemark[file.id] || ''}
                    onChange={(e) => setApprovalRemark(prev => ({ ...prev, [file.id]: e.target.value }))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1 min-w-[200px]"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        rejectFile(file.id, approvalRemark[file.id] || 'Rejected by authorized nodal office');
                        setApprovalRemark(prev => ({ ...prev, [file.id]: '' }));
                      }}
                      className="bg-rose-950 hover:bg-rose-900 border border-rose-700/40 text-rose-400 font-bold px-3 py-2 rounded-xl text-[10px] cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <XSquare className="h-4 w-4" /> Reject File
                    </button>
                    <button
                      onClick={() => {
                        approveFile(file.id, approvalRemark[file.id] || 'Approved and signed electronically.');
                        setApprovalRemark(prev => ({ ...prev, [file.id]: '' }));
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-[10px] cursor-pointer transition-colors flex items-center gap-1 shadow-lg shadow-indigo-600/10"
                    >
                      <UserCheck className="h-4 w-4" /> Approve & Sign
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* HISTORICAL ARCHIVES */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderOpen className="h-4.5 w-4.5 text-indigo-400" />
            File Archives & Approved Logs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherFiles.map(file => (
              <div key={file.id} className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/60 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-mono font-bold">{file.id}</span>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{file.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    file.status === 'Approved' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                    file.status === 'Rejected' ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30' :
                    'bg-slate-900 text-slate-400'
                  }`}>
                    {file.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-900 pt-2">
                  <span>Owner: {file.currentOwner.split(' ')[0]}</span>
                  <span>Steps: {file.currentStep + 1} / {file.totalSteps}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
