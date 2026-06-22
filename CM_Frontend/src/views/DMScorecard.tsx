import React from 'react';
import { DM_SCORECARD_DATA } from '../data/mockData';
import { ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DMScorecard: React.FC = () => {
  const trendData = [
    { week: 'Week 1', breaches: 45 },
    { week: 'Week 2', breaches: 38 },
    { week: 'Week 3', breaches: 29 },
    { week: 'Week 4', breaches: 18 },
  ];

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><ClipboardList size={18} className="text-indigo-600" /> DM Performance Scorecard</div>
      <p className="text-sm text-slate-500 mb-6">Monthly KPI overview for Shahdara District.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ScoreCard 
          title="Resolution Rate" 
          value={`${DM_SCORECARD_DATA.resolutionRate}%`} 
          trend="up" trendVal="+2.4%" 
          color="emerald" 
        />
        <ScoreCard 
          title="Avg Resolution Time" 
          value={`${DM_SCORECARD_DATA.avgResolutionDays} days`} 
          trend="down" trendVal="-1.2 days" 
          color="indigo" 
        />
        <ScoreCard 
          title="SLA Breach Rate" 
          value={`${DM_SCORECARD_DATA.slaBreachPct}%`} 
          trend="up" trendVal="+0.8%" 
          color="rose" 
          inverseTrend
        />
        <ScoreCard 
          title="Citizen Satisfaction" 
          value={`${DM_SCORECARD_DATA.citizenSatisfactionScore} / 5`} 
          trend="up" trendVal="+0.2" 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">SLA Breach Trend (This Month)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="breaches" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">RTI Requests (Monthly)</h3>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">Filed this month</span>
            <span className="font-bold">{DM_SCORECARD_DATA.rtiRequestsFiled}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Disposed</span>
            <span className="font-bold text-emerald-600">{DM_SCORECARD_DATA.rtiDisposed}</span>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Other Metrics</h3>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">Escalations to Secretary</span>
            <span className="font-bold text-rose-600">{DM_SCORECARD_DATA.escalationsThisMonth}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Interim Replies Sent</span>
            <span className="font-bold text-indigo-600">{DM_SCORECARD_DATA.interimRepliesSent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function ScoreCard({ title, value, trend, trendVal, color, inverseTrend = false }: any) {
  const isPositiveTrend = (trend === 'up' && !inverseTrend) || (trend === 'down' && inverseTrend);
  const trendColor = isPositiveTrend ? 'text-emerald-600' : 'text-rose-600';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">{title}</div>
      <div className="text-3xl font-extrabold text-slate-800 mb-2">{value}</div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
        <TrendIcon size={14} />
        {trendVal} <span className="text-slate-400 font-normal ml-1">vs last month</span>
      </div>
    </div>
  );
}
