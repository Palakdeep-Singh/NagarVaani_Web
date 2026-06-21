import React from 'react';
import { useStore } from '../context/Store';
import { formatINR } from '../utils/helper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Info } from 'lucide-react';

export const Funds: React.FC = () => {
  const { projects } = useStore();

  
  const totalAllocated = projects.reduce((acc, curr) => acc + curr.budgetAllocated, 0);
  const totalSpent = projects.reduce((acc, curr) => acc + curr.budgetSpent, 0);
  const totalBalance = totalAllocated - totalSpent;

  
  const chartData = projects.map(p => ({
    name: p.title.substring(0, 15) + '...',
    Allocated: Math.round(p.budgetAllocated / 10000000), 
    Spent: Math.round(p.budgetSpent / 10000000) 
  }));

  return (
    <div className="space-y-6">
      
            <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-indigo-600" />
          Capital Fund Allocation & Utilization
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Audit reports of allocations vs actual project spending across divisions.
        </p>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-indigo-500 shadow-sm border border-slate-200/60">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Total Fund Allocation</span>
            <DollarSign className="h-5 w-5 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{formatINR(totalAllocated)}</h3>
          <p className="text-xs text-slate-500 mt-1">Authorized budget across all monitored sectors</p>
        </div>
 
        <div className="bg-white p-5 rounded-2xl border-l-4 border-teal-500 shadow-sm border border-slate-200/60">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Actual Expenditure</span>
            <TrendingUp className="h-5 w-5 text-teal-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-teal-600 mt-2">{formatINR(totalSpent)}</h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
            <span>Utilization Rate:</span>
            <span className="font-extrabold text-teal-600">{Math.round((totalSpent / totalAllocated) * 100)}%</span>
          </div>
        </div>
 
        <div className="bg-white p-5 rounded-2xl border-l-4 border-amber-500 shadow-sm border border-slate-200/60">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Unspent Reserves</span>
            <DollarSign className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-2">{formatINR(totalBalance)}</h3>
          <p className="text-xs text-slate-500 mt-1">Capital reserve for pending construction phases</p>
        </div>
      </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-96 animate-in fade-in duration-200">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            Project-wise Budget Status
          </h3>
          <p className="text-sm text-slate-500 mb-6">Comparing budgeted amounts vs actual money spent (in Crores INR).</p>
        </div>
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
          <div className="h-72 min-w-[550px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Allocated" fill="#4f46e5" name="Allocated (Cr)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#0d9488" name="Spent (Cr)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-800">
        <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Fiscal Audit:</span> Projects exceeding planned budget benchmarks are automatically marked as *Overspent* and require physical audits. Tenders and payment milestones are managed via the e-Procurement portal.
        </div>
      </div>
    </div>
  );
};
