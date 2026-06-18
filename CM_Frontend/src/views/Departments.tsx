import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { getStatusBadgeStyle, getPriorityBadgeStyle, formatDate } from '../utils/helper';
import {
  GraduationCap, Hospital, AlertOctagon, BarChart2, BookOpen, Stethoscope
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Departments: React.FC = () => {
  const { complaints, updateComplaintStatus } = useStore();
  const [deptTab, setDeptTab] = useState<'Health' | 'Education'>('Health');
  const [remarkInput, setRemarkInput] = useState<Record<string, string>>({});

  // Filter complaints
  const healthComplaints = complaints.filter(c => c.department === 'Health & Family Welfare');
  const educationComplaints = complaints.filter(c => c.department === 'Education Department');

  const handleStatusChange = (id: string, newStatus: any, text: string) => {
    updateComplaintStatus(id, newStatus, text || 'Action taken by Department Nodal Officer');
    setRemarkInput(prev => ({ ...prev, [id]: '' }));
  };

  // Mock data for ICU bed audits in major hospitals
  const icuBeds = [
    { hospital: 'Lok Nayak Hospital (LNJP)', total: 150, occupied: 122, status: 'Stable' },
    { hospital: 'GTB Hospital, Shahdara', total: 100, occupied: 88, status: 'Critical' },
    { hospital: 'Deen Dayal Upadhyay Hospital', total: 80, occupied: 52, status: 'Stable' },
    { hospital: 'Sanjay Gandhi Memorial Hospital', total: 60, occupied: 59, status: 'Emergency' },
    { hospital: 'Dr. BSA Hospital, Rohini', total: 75, occupied: 61, status: 'Stable' }
  ];

  // Mock data for Mohalla Clinics pharmaceutical inventory alerts
  const medicineStocks = [
    { item: 'Paracetamol 650mg', status: 'Safe', stockLevel: '88%', demand: 'High' },
    { item: 'Amoxicillin Antibiotic', status: 'Restocking', stockLevel: '42%', demand: 'High' },
    { item: 'Insulin Glargine', status: 'Critical Shortage', stockLevel: '8%', demand: 'Medium' },
    { item: 'Dengue Rapid Test Kits', status: 'Restocking', stockLevel: '35%', demand: 'Urgent' }
  ];

  // Mock data for School Smart Boards & Upgrades
  const schoolUpgrades = [
    { school: 'SKV School, Shahdara', zone: 'Shahdara', boards: '15/15', progress: 100, status: 'Completed' },
    { school: 'GGSSS, Vikas Puri', zone: 'West Delhi', boards: '12/20', progress: 60, status: 'Active' },
    { school: 'Sarvodaya Vidyalaya, Dwarka', zone: 'South West Delhi', boards: '8/18', progress: 44, status: 'Active' },
    { school: 'MCD Model School, Lajpat Nagar', zone: 'South Delhi', boards: '0/10', progress: 0, status: 'Delayed' }
  ];

  // Mock Emergency Response Chart Data
  const emergencyTimeData = [
    { week: 'Wk 1', HealthRes: 24, EduRes: 18 },
    { week: 'Wk 2', HealthRes: 21, EduRes: 15 },
    { week: 'Wk 3', HealthRes: 28, EduRes: 14 },
    { week: 'Wk 4', HealthRes: 18, EduRes: 12 }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Select Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Nodal Department Dashboards
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Specialized command portals mapping real-time capacities, project monitoring, and grievance queues.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setDeptTab('Health')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              deptTab === 'Health' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="h-4 w-4" /> Health & Family Welfare
          </button>
          <button
            onClick={() => setDeptTab('Education')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              deptTab === 'Education' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" /> Education Department
          </button>
        </div>
      </div>

      {/* HEALTH DEPARTMENT VIEW */}
      {deptTab === 'Health' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-indigo-500">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ICU Bed Occupancy</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-white font-mono">392/465</h3>
                <span className="text-xs text-amber-400 font-bold">84% Occupied</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Real-time occupancy across 5 major hospitals</p>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-emerald-500">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mohalla Clinics Active</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-white font-mono">518</h3>
                <span className="text-xs text-emerald-400 font-bold">98% Online</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Daily average attendance tracking</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-l-4 border-rose-500">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stock Alerts</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-rose-400 font-mono">1 Item</h3>
                <span className="text-xs text-rose-500 font-bold">Critical Shortage</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Insulin Glargine stock below buffer threshold</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-l-4 border-teal-500">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Health Grievances</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-white font-mono">
                  {healthComplaints.filter(c => c.status !== 'Resolved').length}
                </h3>
                <span className="text-xs text-slate-400 font-medium">pending resolution</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Resolution SLA rating: 85%</p>
            </div>
          </div>

          {/* Bed Audit Widget & Stock Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ICU Beds Audit List */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                <Hospital className="h-5 w-5 text-indigo-400" />
                ICU & Emergency Bed Audit (Delhi Govt)
              </h3>
              <div className="space-y-4">
                {icuBeds.map((bed, idx) => {
                  const occupiedPercent = Math.round((bed.occupied / bed.total) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-300">{bed.hospital}</span>
                        <span className="font-mono text-slate-400">
                          <strong className="text-white">{bed.occupied}</strong> / {bed.total} beds ({occupiedPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/40">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            occupiedPercent >= 95 ? 'bg-rose-500' : occupiedPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupiedPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Available: {bed.total - bed.occupied} beds</span>
                        <span className={`font-bold uppercase ${
                          bed.status === 'Emergency' ? 'text-rose-500' : bed.status === 'Critical' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>{bed.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pharmacy Inventories */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-amber-500" />
                Monsoon Medical Supply & Drug Stock Levels
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2">Medicine / Kit</th>
                      <th>Safety Status</th>
                      <th>Stock Level</th>
                      <th>Monsoon Demand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {medicineStocks.map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/20">
                        <td className="py-3 font-semibold text-slate-200">{med.item}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            med.status === 'Safe' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                            med.status === 'Restocking' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' :
                            'bg-rose-950/60 text-rose-400 border border-rose-500/30 font-extrabold animate-pulse'
                          }`}>
                            {med.status}
                          </span>
                        </td>
                        <td className="font-mono font-bold text-slate-300">{med.stockLevel}</td>
                        <td className="text-slate-400 font-semibold">{med.demand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Health Grievances Queue */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-md font-bold text-white mb-4">Active Public Health Grievances</h3>
            <div className="space-y-4">
              {healthComplaints.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No active health complaints.</div>
              ) : (
                healthComplaints.map(comp => (
                  <div key={comp.id} className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono font-bold">{comp.id} | District: {comp.district}</span>
                        <h4 className="text-xs font-bold text-white">{comp.title}</h4>
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

                    <p className="text-[11px] leading-relaxed text-slate-400">{comp.description}</p>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-900/60">
                      <span>Filed: {formatDate(comp.dateFiled)} | Citizen: {comp.citizenName}</span>
                      {comp.status !== 'Resolved' && (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Add action note..."
                            id={`rem-${comp.id}`}
                            value={remarkInput[comp.id] || ''}
                            onChange={(e) => setRemarkInput(prev => ({ ...prev, [comp.id]: e.target.value }))}
                            className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-1 rounded focus:outline-none focus:border-indigo-500 w-40"
                          />
                          <button
                            onClick={() => handleStatusChange(comp.id, 'Resolved', remarkInput[comp.id])}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-[9px] cursor-pointer"
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
      )}

      {/* EDUCATION DEPARTMENT VIEW */}
      {deptTab === 'Education' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-indigo-500">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Model Smart Schools</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-white font-mono">49/100</h3>
                <span className="text-xs text-indigo-400 font-bold">49% Completed</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Campus construction dashboard</p>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-emerald-500">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student-Teacher Ratio</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-white font-mono">28 : 1</h3>
                <span className="text-xs text-emerald-400 font-bold">Target met</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">State average (National: 30:1)</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-l-4 border-rose-500">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teacher Vacancies</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-white font-mono">820</h3>
                <span className="text-xs text-rose-500 font-bold">Recruitment active</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Recruiting through DSSSB portal</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-l-4 border-teal-500">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Education Grievances</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-white font-mono">
                  {educationComplaints.filter(c => c.status !== 'Resolved').length}
                </h3>
                <span className="text-xs text-slate-400 font-medium">pending resolution</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">SLA average resolution time: 3.5 Days</p>
            </div>
          </div>

          {/* Smart upgrade meter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* School Upgrade Status */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                Model Smart Board Deployments
              </h3>
              <div className="space-y-4">
                {schoolUpgrades.map((school, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-300">{school.school}</span>
                      <span className="font-mono text-slate-400">
                        Smart boards: <strong className="text-white">{school.boards}</strong> ({school.progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/40">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          school.progress === 100 ? 'bg-emerald-500' : school.progress > 0 ? 'bg-indigo-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${school.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>Zone: {school.zone}</span>
                      <span className={`font-bold uppercase ${
                        school.status === 'Completed' ? 'text-emerald-500' : school.status === 'Delayed' ? 'text-rose-500' : 'text-indigo-400'
                      }`}>{school.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Response Chart */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-400" />
                Average Resolution Time Trend (Hours)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emergencyTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEdu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="EduRes" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorEdu)" name="Education Response" />
                    <Area type="monotone" dataKey="HealthRes" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorHea)" name="Health Response" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Education Grievances Queue */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-md font-bold text-white mb-4">Active Public Education Grievances</h3>
            <div className="space-y-4">
              {educationComplaints.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No active education complaints.</div>
              ) : (
                educationComplaints.map(comp => (
                  <div key={comp.id} className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono font-bold">{comp.id} | District: {comp.district}</span>
                        <h4 className="text-xs font-bold text-white">{comp.title}</h4>
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

                    <p className="text-[11px] leading-relaxed text-slate-400">{comp.description}</p>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-900/60">
                      <span>Filed: {formatDate(comp.dateFiled)} | Citizen: {comp.citizenName}</span>
                      {comp.status !== 'Resolved' && (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Add action note..."
                            id={`rem-${comp.id}`}
                            value={remarkInput[comp.id] || ''}
                            onChange={(e) => setRemarkInput(prev => ({ ...prev, [comp.id]: e.target.value }))}
                            className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-1 rounded focus:outline-none focus:border-indigo-500 w-40"
                          />
                          <button
                            onClick={() => handleStatusChange(comp.id, 'Resolved', remarkInput[comp.id])}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-[9px] cursor-pointer"
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
      )}
    </div>
  );
};
