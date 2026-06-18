import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { getStatusBadgeStyle, getPriorityBadgeStyle, formatDate } from '../utils/helper';
import { GraduationCap, BookOpen } from 'lucide-react';

export const EducationDept: React.FC = () => {
  const { complaints, updateComplaintStatus } = useStore();
  const [remarkInput, setRemarkInput] = useState<Record<string, string>>({});

  
  const educationComplaints = complaints.filter(c => c.department === 'Education Department');

  const handleStatusChange = (id: string, newStatus: any, text: string) => {
    updateComplaintStatus(id, newStatus, text || 'Action taken by Education Nodal Officer');
    setRemarkInput(prev => ({ ...prev, [id]: '' }));
  };

  
  const schoolUpgrades = [
    { school: 'SKV School, Shahdara', zone: 'Shahdara', boards: '15/15', progress: 100, status: 'Completed' },
    { school: 'GGSSS, Vikas Puri', zone: 'West Delhi', boards: '12/20', progress: 60, status: 'Active' },
    { school: 'Sarvodaya Vidyalaya, Dwarka', zone: 'South West Delhi', boards: '8/18', progress: 44, status: 'Active' },
    { school: 'MCD Model School, Lajpat Nagar', zone: 'South Delhi', boards: '0/10', progress: 0, status: 'Delayed' }
  ];

  return (
    <div className="space-y-6">
            <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          Education Department Command
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitoring smart school infrastructure, recruitment vacancy ratios, and education grievances.
        </p>
      </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-indigo-500 shadow-sm border border-slate-200/60">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Model Smart Schools</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-extrabold text-slate-800">49/100</h3>
            <span className="text-xs text-indigo-600 font-bold">49% Completed</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Campus digital classroom audits</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border-l-4 border-emerald-500 shadow-sm border border-slate-200/60">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Student-Teacher Ratio</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-extrabold text-slate-800">28 : 1</h3>
            <span className="text-xs text-emerald-600 font-bold">Target met</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Delhi state average (National: 30:1)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-rose-500 shadow-sm border border-slate-200/60">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Education Grievances</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-extrabold text-slate-800">
              {educationComplaints.filter(c => c.status !== 'Resolved').length}
            </h3>
            <span className="text-xs text-slate-550 font-medium">pending resolution</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">SLA average resolution time: 3.5 Days</p>
        </div>
      </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm animate-in fade-in duration-200">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <GraduationCap className="h-4.5 w-4.5 text-indigo-600" />
          Model Smart Board Deployments
        </h3>
        <div className="space-y-4">
          {schoolUpgrades.map((school, idx) => (
            <div key={idx} className="space-y-1 bg-slate-50/40 p-3 rounded-xl border border-slate-100/50">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700">{school.school}</span>
                <span className="text-slate-450 text-xs">
                  Smart boards: <strong className="text-slate-800">{school.boards}</strong> ({school.progress}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden border border-slate-300/30">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    school.progress === 100 ? 'bg-emerald-500' : school.progress > 0 ? 'bg-indigo-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${school.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-455 font-medium">
                <span>Zone: {school.zone}</span>
                <span className={`font-bold uppercase ${
                  school.status === 'Completed' ? 'text-emerald-500' : school.status === 'Delayed' ? 'text-rose-500' : 'text-indigo-600'
                }`}>{school.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Active Public Education Grievances</h3>
        <div className="space-y-4">
          {educationComplaints.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">No active education complaints.</div>
          ) : (
            educationComplaints.map(comp => (
              <div key={comp.id} className="bg-slate-50/40 border border-slate-200/60 p-4 rounded-xl space-y-3">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400 font-bold">{comp.id} | District: {comp.district}</span>
                    <h4 className="text-xs font-bold text-slate-800">{comp.title}</h4>
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

                <p className="text-xs text-slate-600 leading-relaxed">{comp.description}</p>
                
                <div className="flex justify-between items-center text-xs text-slate-550 pt-2 border-t border-slate-200/50">
                  <span>Filed: {formatDate(comp.dateFiled)} | Citizen: {comp.citizenName}</span>
                  {comp.status !== 'Resolved' && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Add action note..."
                        id={`rem-${comp.id}`}
                        value={remarkInput[comp.id] || ''}
                        onChange={(e) => setRemarkInput(prev => ({ ...prev, [comp.id]: e.target.value }))}
                        className="bg-white border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none focus:border-indigo-500 w-40"
                      />
                      <button
                        onClick={() => handleStatusChange(comp.id, 'Resolved', remarkInput[comp.id])}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-xs cursor-pointer"
                      >
                        Resolve Case
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
