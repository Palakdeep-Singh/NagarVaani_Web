import React from 'react';
import { BrainCircuit, Sparkles, ArrowUpRight, Info } from 'lucide-react';

export const Suggestions: React.FC = () => {
  
  const aiInsights = [
    {
      topic: 'Monsoon Waterlogging Hotspots Identified',
      source: 'Auto-grouped from 12 PWD infrastructure complaints',
      summary: 'Recurring drainage choking detected at Ring Road (Lajpat Nagar) & Outer Ring Road (IIT Flyover). Machine models estimate a 92% flood risk probability for the next heavy rain cycle.',
      action: 'Direct PWD to initiate desilting verification and execute emergency pump deployment plans.',
      severity: 'High'
    },
    {
      topic: 'Contaminated Water Supplies Seepage Risk',
      source: 'Auto-grouped from 8 Delhi Jal Board complaints',
      summary: 'Multiple complaints in West Delhi (Vikas Puri) report blackish water supply. Sewage pipe line crossings are adjacent to drinking mains. Health risk index elevated in Block C/D.',
      action: 'Direct West Delhi DM to inspect site and schedule water quality testing within 12 hours.',
      severity: 'Emergency'
    },
    {
      topic: 'Health Center Pharmacy Shortages',
      source: 'Auto-grouped from 6 Mohalla Clinic reports',
      summary: 'Medicine stockout audits report high shortage rates of pediatric antibiotics and basic antipyretics in North East Delhi clinics. Citizen dissatisfaction increased by 30%.',
      action: 'Initiate digital file DF-2026-512 to authorize fast-track platelet and stock purchases.',
      severity: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-600 animate-pulse" />
            AI Suggestions Inbox
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            AI suggestions grouping raw complaints into administrative recommendations.
          </p>
        </div>
        <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm select-none">
          <Sparkles className="h-3.5 w-3.5 fill-teal-600 text-teal-600" /> AI Model Online
        </span>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
        {aiInsights.map((insight, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  insight.severity === 'Emergency' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                  insight.severity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-indigo-50 text-indigo-600 border-indigo-200'
                }`}>
                  {insight.severity} Priority
                </span>
                <span className="text-xs text-slate-400 font-semibold truncate max-w-[150px]">{insight.source}</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 mb-2 leading-snug">
                {insight.topic}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {insight.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5 text-teal-600" /> Recommended Executive Action:
              </div>
              <p className="text-xs leading-relaxed text-indigo-600 italic bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">
                "{insight.action}"
              </p>
            </div>
          </div>
        ))}
      </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-800">
        <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">AI System Overview:</span> NagarVaani crawls text data fields from SMS, web intakes, and mobile DM registers hourly, mapping semantic links to flag emerging infrastructure hot-spots.
        </div>
      </div>
    </div>
  );
};
