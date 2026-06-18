import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { getStatusBadgeStyle, getPriorityBadgeStyle, formatDate } from '../utils/helper';
import { Hospital, AlertOctagon, Stethoscope } from 'lucide-react';

export const HealthDept: React.FC = () => {
  const { complaints, updateComplaintStatus } = useStore();
  const [remarkInput, setRemarkInput] = useState<Record<string, string>>({});

  
  const healthComplaints = complaints.filter(c => c.department === 'Health & Family Welfare');

  const handleStatusChange = (id: string, newStatus: any, text: string) => {
    updateComplaintStatus(id, newStatus, text || 'Action taken by Health Nodal Officer');
    setRemarkInput(prev => ({ ...prev, [id]: '' }));
  };

  
  const icuBeds = [
    { hospital: 'Lok Nayak Hospital (LNJP)', total: 150, occupied: 122, status: 'Stable' },
    { hospital: 'GTB Hospital, Shahdara', total: 100, occupied: 88, status: 'Critical' },
    { hospital: 'Deen Dayal Upadhyay Hospital', total: 80, occupied: 52, status: 'Stable' },
    { hospital: 'Sanjay Gandhi Memorial Hospital', total: 60, occupied: 59, status: 'Emergency' },
    { hospital: 'Dr. BSA Hospital, Rohini', total: 75, occupied: 61, status: 'Stable' }
  ];

  
  const medicineStocks = [
    { item: 'Paracetamol 650mg', status: 'Safe', stockLevel: '88%', demand: 'High' },
    { item: 'Amoxicillin Antibiotic', status: 'Restocking', stockLevel: '42%', demand: 'High' },
    { item: 'Insulin Glargine', status: 'Critical Shortage', stockLevel: '8%', demand: 'Medium' },
    { item: 'Dengue Rapid Test Kits', status: 'Restocking', stockLevel: '35%', demand: 'Urgent' }
  ];

  return (
    <div className="space-y-6">
            <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-indigo-600" />
          Health & Family Welfare Command
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time audits of hospital beds, clinic inventories, and healthcare grievances.
        </p>
      </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-indigo-500 shadow-sm border border-slate-200/60">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">ICU Bed Occupancy</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-extrabold text-slate-800">382/465</h3>
            <span className="text-xs text-amber-600 font-bold">82% Occupied</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Occupancy audit across 5 core facilities</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border-l-4 border-emerald-500 shadow-sm border border-slate-200/60">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Mohalla Clinics Active</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-extrabold text-slate-800">518</h3>
            <span className="text-xs text-emerald-600 font-bold">98% Online</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Nodal practitioner biometric checks online</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-rose-500 shadow-sm border border-slate-200/60">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Health Grievances</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-extrabold text-slate-800">
              {healthComplaints.filter(c => c.status !== 'Resolved').length}
            </h3>
            <span className="text-xs text-slate-500 font-medium">pending resolution</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">SLA standard resolution: 4.1 Days</p>
        </div>
      </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
        
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Hospital className="h-4.5 w-4.5 text-indigo-600" />
            ICU & Emergency Bed Occupancy Audit
          </h3>
          <div className="space-y-4">
            {icuBeds.map((bed, idx) => {
              const occupiedPercent = Math.round((bed.occupied / bed.total) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">{bed.hospital}</span>
                    <span className="text-slate-400 text-xs">
                      <strong className="text-slate-800">{bed.occupied}</strong> / {bed.total} beds ({occupiedPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupiedPercent >= 95 ? 'bg-rose-500' : occupiedPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupiedPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-455 font-medium">
                    <span>Available: {bed.total - bed.occupied} beds</span>
                    <span className={`font-bold uppercase ${
                      bed.status === 'Emergency' ? 'text-rose-600' : bed.status === 'Critical' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>{bed.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertOctagon className="h-4.5 w-4.5 text-amber-600" />
            Monsoon Medical Supplies Inventory Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-xs tracking-wider">
                  <th className="py-2">Medicine / Kit</th>
                  <th>Safety Status</th>
                  <th>Stock Level</th>
                  <th>Monsoon Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {medicineStocks.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-700">{med.item}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        med.status === 'Safe' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        med.status === 'Restocking' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100 font-extrabold animate-pulse'
                      }`}>
                        {med.status}
                      </span>
                    </td>
                    <td className="font-bold text-slate-600">{med.stockLevel}</td>
                    <td className="text-slate-500 font-semibold">{med.demand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Active Public Health Grievances</h3>
        <div className="space-y-4">
          {healthComplaints.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">No active health complaints.</div>
          ) : (
            healthComplaints.map(comp => (
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
                
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200/50">
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
