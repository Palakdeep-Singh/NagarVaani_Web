import React from 'react';
import { MOCK_ROOT_CLUSTERS } from '../data/mockData';
import { Network, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const RootCauseClusters: React.FC = () => {
  const pieData = [
    { name: 'Pipe Burst', value: 45 },
    { name: 'Contamination', value: 30 },
    { name: 'Low Pressure', value: 15 },
    { name: 'Billing', value: 10 },
  ];
  const COLORS = ['#0F766E', '#14B8A6', '#F59E0B', '#64748B'];

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><Network size={18} className="text-teal-600" /> Root Cause Clusters</div>
      <p className="text-sm text-slate-500 mb-6">AI-identified systemic issues causing recurring grievances in specific localities.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Issue Distribution</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {MOCK_ROOT_CLUSTERS.map(cluster => (
            <div key={cluster.clusterId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {cluster.isSystemic && <AlertCircle size={16} className="text-rose-500" />}
                  <span className="font-bold text-slate-800">{cluster.ward} — {cluster.category}</span>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${cluster.isSystemic ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {cluster.isSystemic ? 'Systemic Issue' : 'Isolated Event'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{cluster.description}</p>
              <div className="bg-slate-50 rounded p-3 text-xs border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="font-bold text-teal-600">{cluster.count}</span> linked grievances
                </div>
                <div className="text-slate-400 font-mono">Detected: {cluster.detectedOn}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
