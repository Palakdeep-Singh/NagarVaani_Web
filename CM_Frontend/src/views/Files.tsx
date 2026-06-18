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
  const inboxFiles = files.filter(f => {
    if (activeRole === 'Chief Minister') {
      return f.currentOwner === 'Chief Minister' && f.status === 'Pending Approval';
    }
    if (activeRole === 'Department Head') {
      if (activeDepartment === 'Public Health') {
        return (f.currentOwner === 'Director Health Services' || f.currentOwner === 'Minister of Health' || f.currentOwner === 'Public Health') && f.status === 'Pending Approval';
      }
      if (activeDepartment === 'Education & Schools') {
        return (f.currentOwner === 'Director of Education' || f.currentOwner === 'Minister of Education' || f.currentOwner === 'Education & Schools') && f.status === 'Pending Approval';
      }
    }
    return false;
  });
  
  // All other files (Archived, Approved, owned by others)
  const otherFiles = files.filter(f => !inboxFiles.includes(f));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Actions & Create Proposal */}
      <div className="space-y-6">
        
        {/* Quick Folder Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <FolderLock className="h-5.5 w-5.5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">e-Office Approval Center</h3>
              <p className="text-[10px] text-slate-500 font-semibold">Active credentials: {activeRole}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/40">
              <span className="text-[9px] uppercase font-bold text-slate-400">Inbox Items</span>
              <div className="text-xl font-extrabold text-indigo-600 font-mono mt-1">{inboxFiles.length}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/40">
              <span className="text-[9px] uppercase font-bold text-slate-400">Others / Archives</span>
              <div className="text-xl font-extrabold text-slate-500 font-mono mt-1">{otherFiles.length}</div>
            </div>
          </div>
        </div>

        {/* Create File Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Initiate Official File</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-755 flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {showAddForm ? 'Cancel Proposal' : 'New Proposal'}
            </button>
          </div>

          {showAddForm ? (
            <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200/60 leading-relaxed space-y-3">
              <span className="font-bold text-slate-700 block mb-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500 inline mr-1" /> Dynamic File Creation Mode:</span>
              To create and route custom files, switch to corresponding departments. Creating files from other departments is locked for validation.
              <p className="mt-2 text-[10px] text-indigo-600 italic">
                * To initiate a file, toggle your active dashboard credentials using the profile switcher in the top navbar.
              </p>
            </div>
          ) : (
            <div className="text-[11px] leading-relaxed text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-700 block mb-1">e-Office Operations Manual:</span>
              Files are tracked using unique hash signatures. Approval triggers a digital signing certificate validation, passing ownership to the next administrative step automatically.
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: File Inbox & Archives */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* INBOX SECTION */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="h-4.5 w-4.5 text-indigo-600" />
            File Action Inbox (Pending Signature)
          </h3>

          {inboxFiles.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200/80 text-slate-500 text-xs shadow-sm">
              No files pending your signatures at this step. Good job!
            </div>
          ) : (
            inboxFiles.map(file => (
              <div
                key={file.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 relative overflow-hidden shadow-sm"
              >
                {/* Glowing border indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />

                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {file.id} | Department: {file.department}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800">
                      {file.title}
                    </h4>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getFilePriorityStyle(file.priority)}`}>
                    {file.priority} Priority
                  </span>
                </div>

                {/* Path indicator */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Routing Path:</div>
                  <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/40 text-xs">
                    {file.path.map((node, index) => {
                      const isCurrent = index === file.currentStep;
                      const isPassed = index < file.currentStep;
                      return (
                        <React.Fragment key={node}>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-md ${
                              isCurrent ? 'bg-indigo-600 text-white font-bold' : isPassed ? 'text-slate-400 line-through' : 'text-slate-500'
                            }`}
                          >
                            {node}
                          </span>
                          {index < file.totalSteps - 1 && <ArrowRight className="h-3 w-3 text-slate-400" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Remarks history */}
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Remarks & Approval Log:</div>
                  <div className="space-y-2">
                    {file.remarks.map((rem, idx) => (
                      <div key={idx} className="flex gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/40">
                        <CornerDownRight className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <span className="text-slate-700 font-bold">{rem.author}: </span>
                          <span className="text-[9px] text-slate-400">[{rem.action} - {formatDate(rem.date)}]</span>
                          <p className="text-slate-600 italic mt-1 font-medium">"{rem.text}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action forms */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Enter approval remark or note..."
                    value={approvalRemark[file.id] || ''}
                    onChange={(e) => setApprovalRemark(prev => ({ ...prev, [file.id]: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 flex-1 min-w-[200px]"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        rejectFile(file.id, approvalRemark[file.id] || 'Rejected by authorized nodal office');
                        setApprovalRemark(prev => ({ ...prev, [file.id]: '' }));
                      }}
                      className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3 py-2 rounded-xl text-[10px] cursor-pointer transition-colors flex items-center gap-1"
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
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="h-4.5 w-4.5 text-indigo-600" />
            File Archives & Approved Logs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherFiles.map(file => (
              <div key={file.id} className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-sm">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400 font-bold">{file.id}</span>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{file.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    file.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    file.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {file.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-2">
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
